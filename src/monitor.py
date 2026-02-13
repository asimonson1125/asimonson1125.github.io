"""
Service monitoring module
Checks service availability and tracks uptime statistics
"""
import os
import requests
import time
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta
from threading import Thread, Lock

import psycopg2

# Service configuration
SERVICES = [
    {
        'id': 'main',
        'name': 'asimonson.com',
        'url': 'https://asimonson.com',
        'timeout': 10
    },
    {
        'id': 'files',
        'name': 'files.asimonson.com',
        'url': 'https://files.asimonson.com',
        'timeout': 10
    },
    {
        'id': 'git',
        'name': 'git.asimonson.com',
        'url': 'https://git.asimonson.com',
        'timeout': 10
    }
]

# Check interval: 30 mins
CHECK_INTERVAL = 1800

DATABASE_URL = os.environ.get('DATABASE_URL')

# Expected columns (besides id) — name: SQL type
_EXPECTED_COLUMNS = {
    'service_id': 'VARCHAR(50) NOT NULL',
    'timestamp': 'TIMESTAMPTZ NOT NULL DEFAULT NOW()',
    'status': 'VARCHAR(20) NOT NULL',
    'response_time': 'INTEGER',
    'status_code': 'INTEGER',
    'error': 'TEXT',
}


class ServiceMonitor:
    def __init__(self):
        self.lock = Lock()
        # Lightweight in-memory cache of latest status per service
        self._current = {}
        for service in SERVICES:
            self._current[service['id']] = {
                'name': service['name'],
                'url': service['url'],
                'status': 'unknown',
                'response_time': None,
                'status_code': None,
                'last_online': None,
            }
        self._last_check = None
        self._ensure_schema()

    # ── database helpers ──────────────────────────────────────────

    @staticmethod
    def _get_conn():
        """Return a new psycopg2 connection, or None if DATABASE_URL is unset."""
        if not DATABASE_URL:
            return None
        return psycopg2.connect(DATABASE_URL)

    def _ensure_schema(self):
        """Create the service_checks table (and index) if needed, then
        reconcile columns with _EXPECTED_COLUMNS."""
        if not DATABASE_URL:
            print("DATABASE_URL not set — running without persistence")
            return

        # Retry connection in case DB is still starting (e.g. Docker)
        conn = None
        for attempt in range(5):
            try:
                conn = psycopg2.connect(DATABASE_URL)
                break
            except psycopg2.OperationalError:
                if attempt < 4:
                    print(f"Database not ready, retrying in 2s (attempt {attempt + 1}/5)...")
                    time.sleep(2)
                else:
                    print("Could not connect to database — running without persistence")
                    return
        try:
            with conn, conn.cursor() as cur:
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS service_checks (
                        id SERIAL PRIMARY KEY,
                        service_id VARCHAR(50) NOT NULL,
                        timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                        status VARCHAR(20) NOT NULL,
                        response_time INTEGER,
                        status_code INTEGER,
                        error TEXT
                    );
                """)
                cur.execute("""
                    CREATE INDEX IF NOT EXISTS idx_service_checks_service_timestamp
                        ON service_checks (service_id, timestamp DESC);
                """)

                # Introspect existing columns
                cur.execute("""
                    SELECT column_name
                    FROM information_schema.columns
                    WHERE table_name = 'service_checks'
                """)
                existing = {row[0] for row in cur.fetchall()}

                # Add missing columns
                for col, col_type in _EXPECTED_COLUMNS.items():
                    if col not in existing:
                        # Strip NOT NULL / DEFAULT for ALTER ADD (can't enforce
                        # NOT NULL on existing rows without a default)
                        bare_type = col_type.split('NOT NULL')[0].split('DEFAULT')[0].strip()
                        cur.execute(
                            f'ALTER TABLE service_checks ADD COLUMN {col} {bare_type}'
                        )
                        print(f"Added column {col} to service_checks")

                # Drop unexpected columns (besides 'id')
                expected_names = set(_EXPECTED_COLUMNS) | {'id'}
                for col in existing - expected_names:
                    cur.execute(
                        f'ALTER TABLE service_checks DROP COLUMN {col}'
                    )
                    print(f"Dropped column {col} from service_checks")

            print("Database schema OK")
        finally:
            conn.close()

    def _insert_check(self, service_id, result):
        """Insert a single check result into the database."""
        conn = self._get_conn()
        if conn is None:
            return
        try:
            with conn, conn.cursor() as cur:
                cur.execute(
                    """INSERT INTO service_checks
                           (service_id, timestamp, status, response_time, status_code, error)
                       VALUES (%s, %s, %s, %s, %s, %s)""",
                    (
                        service_id,
                        result['timestamp'],
                        result['status'],
                        result.get('response_time'),
                        result.get('status_code'),
                        result.get('error'),
                    ),
                )
        finally:
            conn.close()

    # ── service checks ────────────────────────────────────────────

    def check_service(self, service):
        """Check a single service and return status"""
        start_time = time.time()
        result = {
            'timestamp': datetime.now().isoformat(),
            'status': 'offline',
            'response_time': None,
            'status_code': None
        }

        try:
            response = requests.head(
                service['url'],
                timeout=service['timeout'],
                allow_redirects=True
            )

            elapsed = int((time.time() - start_time) * 1000)  # ms

            result['response_time'] = elapsed
            result['status_code'] = response.status_code

            # Consider 2xx and 3xx as online
            if 200 <= response.status_code < 400:
                result['status'] = 'online'
            elif 400 <= response.status_code < 500:
                # Client errors might still mean service is up
                result['status'] = 'online'
            else:
                result['status'] = 'degraded'

        except requests.exceptions.Timeout:
            result['status'] = 'timeout'
            result['response_time'] = service['timeout'] * 1000
        except Exception as e:
            result['status'] = 'offline'
            result['error'] = str(e)

        return result

    def check_all_services(self):
        """Check all services and update status data"""
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Checking all services...")

        # Perform all network checks concurrently and OUTSIDE the lock
        results = {}
        with ThreadPoolExecutor(max_workers=len(SERVICES)) as executor:
            futures = {executor.submit(self.check_service, s): s for s in SERVICES}
            for future in futures:
                service = futures[future]
                result = future.result()
                results[service['id']] = result
                print(f"  {service['name']}: {result['status']} ({result['response_time']}ms)")

        # Persist to database (outside lock — DB has its own concurrency)
        for service_id, result in results.items():
            self._insert_check(service_id, result)

        # Update lightweight in-memory cache under lock
        with self.lock:
            for service in SERVICES:
                result = results[service['id']]
                cached = self._current[service['id']]
                cached['status'] = result['status']
                cached['response_time'] = result['response_time']
                cached['status_code'] = result['status_code']
                if result['status'] == 'online':
                    cached['last_online'] = result['timestamp']
            self._last_check = datetime.now().isoformat()

    # ── uptime calculations ───────────────────────────────────────

    def _calculate_uptime_unlocked(self, service_id, hours=None):
        """Calculate uptime percentage for a service by querying the DB."""
        conn = self._get_conn()
        if conn is None:
            return None
        try:
            with conn.cursor() as cur:
                if hours:
                    cutoff = datetime.now() - timedelta(hours=hours)
                    cur.execute(
                        """SELECT
                               COUNT(*) FILTER (WHERE status = 'online'),
                               COUNT(*)
                           FROM service_checks
                           WHERE service_id = %s AND timestamp > %s""",
                        (service_id, cutoff),
                    )
                else:
                    cur.execute(
                        """SELECT
                               COUNT(*) FILTER (WHERE status = 'online'),
                               COUNT(*)
                           FROM service_checks
                           WHERE service_id = %s""",
                        (service_id,),
                    )

                online_count, total_count = cur.fetchone()

                if total_count == 0:
                    return None

                # Minimum-data thresholds
                if hours:
                    expected_checks = (hours * 3600) / CHECK_INTERVAL
                    minimum_checks = max(3, expected_checks * 0.5)
                    if total_count < minimum_checks:
                        return None
                else:
                    if total_count < 3:
                        return None

                return round((online_count / total_count) * 100, 2)
        finally:
            conn.close()

    def calculate_uptime(self, service_id, hours=None):
        """Calculate uptime percentage for a service"""
        return self._calculate_uptime_unlocked(service_id, hours)

    def get_status_summary(self):
        """Get current status summary with uptime statistics"""
        with self.lock:
            summary = {
                'last_check': self._last_check,
                'next_check': None,
                'services': []
            }

            if self._last_check:
                last_check = datetime.fromisoformat(self._last_check)
                next_check = last_check + timedelta(seconds=CHECK_INTERVAL)
                summary['next_check'] = next_check.isoformat()

            for service_id, cached in self._current.items():
                service_summary = {
                    'id': service_id,
                    'name': cached['name'],
                    'url': cached['url'],
                    'status': cached['status'],
                    'response_time': cached['response_time'],
                    'status_code': cached['status_code'],
                    'last_online': cached['last_online'],
                    'uptime': {
                        '24h': self._calculate_uptime_unlocked(service_id, 24),
                        '7d': self._calculate_uptime_unlocked(service_id, 24 * 7),
                        '30d': self._calculate_uptime_unlocked(service_id, 24 * 30),
                        'all_time': self._calculate_uptime_unlocked(service_id)
                    },
                    'total_checks': self._get_total_checks(service_id),
                }
                summary['services'].append(service_summary)

            return summary

    def _get_total_checks(self, service_id):
        """Return the total number of checks for a service."""
        conn = self._get_conn()
        if conn is None:
            return 0
        try:
            with conn.cursor() as cur:
                cur.execute(
                    'SELECT COUNT(*) FROM service_checks WHERE service_id = %s',
                    (service_id,),
                )
                return cur.fetchone()[0]
        finally:
            conn.close()

    def start_monitoring(self):
        """Start background monitoring thread"""
        def monitor_loop():
            # Initial check
            self.check_all_services()

            # Periodic checks
            while True:
                time.sleep(CHECK_INTERVAL)
                self.check_all_services()

        thread = Thread(target=monitor_loop, daemon=True)
        thread.start()
        print(f"Service monitoring started (checks every {CHECK_INTERVAL/3600} hours)")

# Global monitor instance
monitor = ServiceMonitor()

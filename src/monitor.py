"""
Service monitoring module.
Checks service availability and tracks uptime statistics in PostgreSQL.
"""
import os
import time
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta
from threading import Thread, Lock

import psycopg2
import requests

SERVICES = [
    {'id': 'main',  'name': 'asimonson.com',       'url': 'https://asimonson.com',       'timeout': 10},
    {'id': 'files', 'name': 'files.asimonson.com',  'url': 'https://files.asimonson.com',  'timeout': 10},
    {'id': 'git',   'name': 'git.asimonson.com',    'url': 'https://git.asimonson.com',    'timeout': 10},
]

CHECK_INTERVAL = 60           # seconds between checks
RETENTION_DAYS = 90           # how long to keep records
CLEANUP_INTERVAL = 86400      # seconds between purge runs

DATABASE_URL = os.environ.get('DATABASE_URL')

# Expected columns (besides id) -- name: SQL type
_EXPECTED_COLUMNS = {
    'service_id':    'VARCHAR(50) NOT NULL',
    'timestamp':     'TIMESTAMPTZ NOT NULL DEFAULT NOW()',
    'status':        'VARCHAR(20) NOT NULL',
    'response_time': 'INTEGER',
    'status_code':   'INTEGER',
    'error':         'TEXT',
}


class ServiceMonitor:
    def __init__(self):
        self.lock = Lock()
        self._current = {
            svc['id']: {
                'name': svc['name'],
                'url': svc['url'],
                'status': 'unknown',
                'response_time': None,
                'status_code': None,
                'last_online': None,
            }
            for svc in SERVICES
        }
        self._last_check = None
        self._ensure_schema()

    # ── Database helpers ──────────────────────────────────────────

    @staticmethod
    def _get_conn():
        """Return a new psycopg2 connection, or None if DATABASE_URL is unset."""
        if not DATABASE_URL:
            return None
        return psycopg2.connect(DATABASE_URL)

    def _ensure_schema(self):
        """Create or migrate the service_checks table to match _EXPECTED_COLUMNS."""
        if not DATABASE_URL:
            print("DATABASE_URL not set -- running without persistence")
            return

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
                    print("Could not connect to database -- running without persistence")
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

                for col, col_type in _EXPECTED_COLUMNS.items():
                    if col not in existing:
                        bare_type = col_type.split('NOT NULL')[0].split('DEFAULT')[0].strip()
                        cur.execute(f'ALTER TABLE service_checks ADD COLUMN {col} {bare_type}')
                        print(f"Added column {col} to service_checks")

                expected_names = set(_EXPECTED_COLUMNS) | {'id'}
                for col in existing - expected_names:
                    cur.execute(f'ALTER TABLE service_checks DROP COLUMN {col}')
                    print(f"Dropped column {col} from service_checks")

            print("Database schema OK")
        finally:
            conn.close()

    def _insert_check(self, service_id, result):
        """Persist a single check result to the database."""
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

    # ── Service checks ────────────────────────────────────────────

    def check_service(self, service):
        """Perform an HTTP HEAD against a service and return a status dict."""
        start_time = time.time()
        result = {
            'timestamp': datetime.now().isoformat(),
            'status': 'offline',
            'response_time': None,
            'status_code': None,
        }

        try:
            response = requests.head(
                service['url'],
                timeout=service['timeout'],
                allow_redirects=True,
            )
            result['response_time'] = int((time.time() - start_time) * 1000)
            result['status_code'] = response.status_code

            if response.status_code < 500:
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
        """Check every service concurrently, persist results, and update cache."""
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Checking all services...")

        results = {}
        with ThreadPoolExecutor(max_workers=len(SERVICES)) as executor:
            futures = {executor.submit(self.check_service, s): s for s in SERVICES}
            for future in futures:
                service = futures[future]
                result = future.result()
                results[service['id']] = result
                print(f"  {service['name']}: {result['status']} ({result['response_time']}ms)")

        for service_id, result in results.items():
            self._insert_check(service_id, result)

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

    # ── Uptime calculations ───────────────────────────────────────

    def _calculate_uptime(self, service_id, hours=None):
        """Return uptime percentage for a service, or None if insufficient data."""
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

                # Only report a time-windowed uptime if data exists beyond the window
                if hours:
                    cur.execute(
                        'SELECT EXISTS(SELECT 1 FROM service_checks WHERE service_id = %s AND timestamp <= %s)',
                        (service_id, cutoff),
                    )
                    if not cur.fetchone()[0]:
                        return None

                return round((online_count / total_count) * 100, 2)
        finally:
            conn.close()

    def _get_total_checks(self, service_id):
        """Return the total number of recorded checks for a service."""
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

    # ── Status summary ────────────────────────────────────────────

    def get_status_summary(self):
        """Build a JSON-serializable status summary with uptime statistics."""
        with self.lock:
            summary = {
                'last_check': self._last_check,
                'next_check': None,
                'services': [],
            }

            if self._last_check:
                last_check = datetime.fromisoformat(self._last_check)
                summary['next_check'] = (last_check + timedelta(seconds=CHECK_INTERVAL)).isoformat()

            for service_id, cached in self._current.items():
                summary['services'].append({
                    'id': service_id,
                    'name': cached['name'],
                    'url': cached['url'],
                    'status': cached['status'],
                    'response_time': cached['response_time'],
                    'status_code': cached['status_code'],
                    'last_online': cached['last_online'],
                    'uptime': {
                        '24h': self._calculate_uptime(service_id, 24),
                        '7d': self._calculate_uptime(service_id, 24 * 7),
                        '30d': self._calculate_uptime(service_id, 24 * 30),
                        'all_time': self._calculate_uptime(service_id),
                    },
                    'total_checks': self._get_total_checks(service_id),
                })

            return summary

    # ── Background loop ───────────────────────────────────────────

    def _purge_old_records(self):
        """Delete check records older than RETENTION_DAYS."""
        conn = self._get_conn()
        if conn is None:
            return
        try:
            cutoff = datetime.now() - timedelta(days=RETENTION_DAYS)
            with conn, conn.cursor() as cur:
                cur.execute('DELETE FROM service_checks WHERE timestamp < %s', (cutoff,))
                deleted = cur.rowcount
            if deleted:
                print(f"Purged {deleted} records older than {RETENTION_DAYS} days")
        finally:
            conn.close()

    def start_monitoring(self):
        """Start the background daemon thread for periodic checks and cleanup."""
        def monitor_loop():
            self.check_all_services()
            self._purge_old_records()

            checks_since_cleanup = 0
            checks_per_cleanup = CLEANUP_INTERVAL // CHECK_INTERVAL

            while True:
                time.sleep(CHECK_INTERVAL)
                self.check_all_services()
                checks_since_cleanup += 1
                if checks_since_cleanup >= checks_per_cleanup:
                    self._purge_old_records()
                    checks_since_cleanup = 0

        thread = Thread(target=monitor_loop, daemon=True)
        thread.start()
        print(f"Service monitoring started (checks every {CHECK_INTERVAL}s)")


monitor = ServiceMonitor()

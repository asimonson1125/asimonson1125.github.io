"""
Service monitoring module
Checks service availability and tracks uptime statistics
"""
import requests
import time
import json
from datetime import datetime, timedelta
from threading import Thread, Lock
from pathlib import Path

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

# File to store status history
STATUS_FILE = Path(__file__).parent / 'static' / 'json' / 'status_history.json'

class ServiceMonitor:
    def __init__(self):
        self.status_data = {}
        self.lock = Lock()
        self.load_history()

    def load_history(self):
        """Load status history from file"""
        if STATUS_FILE.exists():
            try:
                with open(STATUS_FILE, 'r') as f:
                    self.status_data = json.load(f)
            except Exception as e:
                print(f"Error loading status history: {e}")
                self.initialize_status_data()
        else:
            self.initialize_status_data()

    def initialize_status_data(self):
        """Initialize empty status data structure"""
        self.status_data = {
            'last_check': None,
            'services': {}
        }
        for service in SERVICES:
            self.status_data['services'][service['id']] = {
                'name': service['name'],
                'url': service['url'],
                'status': 'unknown',
                'response_time': None,
                'status_code': None,
                'last_online': None,
                'checks': []  # List of check results
            }

    def save_history(self):
        """Save status history to file"""
        try:
            STATUS_FILE.parent.mkdir(parents=True, exist_ok=True)
            with open(STATUS_FILE, 'w') as f:
                json.dump(self.status_data, f, indent=2)
        except Exception as e:
            print(f"Error saving status history: {e}")

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

        # Perform all network checks OUTSIDE the lock to avoid blocking API calls
        results = {}
        for service in SERVICES:
            result = self.check_service(service)
            results[service['id']] = result
            print(f"  {service['name']}: {result['status']} ({result['response_time']}ms)")

        # Only acquire lock when updating the shared data structure
        with self.lock:
            for service in SERVICES:
                result = results[service['id']]
                service_data = self.status_data['services'][service['id']]

                # Update current status
                service_data['status'] = result['status']
                service_data['response_time'] = result['response_time']
                service_data['status_code'] = result['status_code']

                if result['status'] == 'online':
                    service_data['last_online'] = result['timestamp']

                # Add to check history (keep last 2880 checks = 60 days at 2hr intervals)
                service_data['checks'].append(result)
                if len(service_data['checks']) > 2880:
                    service_data['checks'] = service_data['checks'][-2880:]

            self.status_data['last_check'] = datetime.now().isoformat()
            self.save_history()

    def _calculate_uptime_unlocked(self, service_id, hours=None):
        """Calculate uptime percentage for a service (assumes lock is held)"""
        service_data = self.status_data['services'].get(service_id)
        if not service_data or not service_data['checks']:
            return None

        checks = service_data['checks']

        # Filter by time period if specified
        if hours:
            cutoff = datetime.now() - timedelta(hours=hours)
            checks = [
                c for c in checks
                if datetime.fromisoformat(c['timestamp']) > cutoff
            ]

            if not checks:
                return None

            # Require minimum data coverage for the time period
            # Calculate expected number of checks for this period
            expected_checks = (hours * 3600) / CHECK_INTERVAL

            # Require at least 50% of expected checks to show this metric
            minimum_checks = max(3, expected_checks * 0.5)

            if len(checks) < minimum_checks:
                return None
        else:
            # For all-time, require at least 3 checks
            if len(checks) < 3:
                return None

        online_count = sum(1 for c in checks if c['status'] == 'online')
        uptime = (online_count / len(checks)) * 100

        return round(uptime, 2)

    def calculate_uptime(self, service_id, hours=None):
        """Calculate uptime percentage for a service"""
        with self.lock:
            return self._calculate_uptime_unlocked(service_id, hours)

    def get_status_summary(self):
        """Get current status summary with uptime statistics"""
        with self.lock:
            summary = {
                'last_check': self.status_data['last_check'],
                'next_check': None,
                'services': []
            }

            # Calculate next check time
            if self.status_data['last_check']:
                last_check = datetime.fromisoformat(self.status_data['last_check'])
                next_check = last_check + timedelta(seconds=CHECK_INTERVAL)
                summary['next_check'] = next_check.isoformat()

            for service_id, service_data in self.status_data['services'].items():
                service_summary = {
                    'id': service_id,
                    'name': service_data['name'],
                    'url': service_data['url'],
                    'status': service_data['status'],
                    'response_time': service_data['response_time'],
                    'status_code': service_data['status_code'],
                    'last_online': service_data['last_online'],
                    'uptime': {
                        '24h': self._calculate_uptime_unlocked(service_id, 24),
                        '7d': self._calculate_uptime_unlocked(service_id, 24 * 7),
                        '30d': self._calculate_uptime_unlocked(service_id, 24 * 30),
                        'all_time': self._calculate_uptime_unlocked(service_id)
                    },
                    'total_checks': len(service_data['checks'])
                }
                summary['services'].append(service_summary)

            return summary

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

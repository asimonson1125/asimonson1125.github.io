# Service Status Monitor

## Overview
Server-side monitoring system that checks the availability of asimonson.com services every 2 hours and provides uptime statistics.

## Architecture

### Backend Components

#### 1. `monitor.py` - Service Monitoring Module
- **Purpose**: Performs automated health checks on all services
- **Check Interval**: Every 2 hours (7200 seconds)
- **Services Monitored**:
  - asimonson.com
  - files.asimonson.com
  - git.asimonson.com
  - pass.asimonson.com
  - ssh.asimonson.com

**Features**:
- Tracks response times and HTTP status codes
- Calculates uptime percentages for multiple time periods (24h, 7d, 30d, all-time)
- Persists data to PostgreSQL (`service_checks` table) via `DATABASE_URL` env var
- Gracefully degrades when no database is configured (local dev)
- Runs in a background thread

#### 2. `app.py` - Flask Integration
- **New API Endpoint**: `/api/status`
  - Returns current status for all services
  - Includes uptime statistics
  - Provides last check and next check times
- **Auto-start**: Monitoring begins when the Flask app starts

### Frontend Components

#### 1. `templates/status.html` - Status Page Template
- Displays real-time service status
- Shows uptime percentages (24h, 7d, 30d, all-time)
- Displays response times and status codes
- Shows total number of checks performed
- Manual refresh button
- Auto-refreshes every 5 minutes

#### 2. `static/js/status.js` - Frontend Logic
- Fetches status data from `/api/status` API
- Updates UI with service status and uptime
- Handles error states gracefully
- Auto-refresh every 5 minutes

#### 3. `static/css/App.css` - Styling
- Color-coded status indicators:
  - Green: Operational
  - Yellow: Degraded/Timeout
  - Red: Offline
- Responsive grid layout
- Dark theme matching existing site design

## Data Storage

Check history is stored in a PostgreSQL `service_checks` table. The connection is configured via the `DATABASE_URL` environment variable (e.g. `postgresql://user:pass@host:5432/dbname`).

```sql
CREATE TABLE service_checks (
    id SERIAL PRIMARY KEY,
    service_id VARCHAR(50) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status VARCHAR(20) NOT NULL,
    response_time INTEGER,
    status_code INTEGER,
    error TEXT
);
```

The table and index are created automatically on startup. If `DATABASE_URL` is not set, the monitor runs without persistence (useful for local development).

## Status Types

- **online**: HTTP status 2xx-4xx, service responding
- **degraded**: HTTP status 5xx or slow response
- **timeout**: Request exceeded timeout limit (10 seconds)
- **offline**: Unable to reach service
- **unknown**: No checks performed yet

## Uptime Calculation

Uptime percentage = (number of online checks / total checks) × 100

Calculated for:
- Last 24 hours
- Last 7 days
- Last 30 days
- All-time (since monitoring began)

## Usage

### Starting the Server
```bash
cd src
python3 app.py
```

The monitoring will start automatically and perform an initial check immediately, then every 2 hours thereafter.

### Accessing the Status Page
Navigate to: `https://asimonson.com/status`

### API Access
Direct API access: `https://asimonson.com/api/status`

Returns JSON with current status and uptime statistics for all services.

## Configuration

To modify monitoring behavior, edit `src/monitor.py`:

```python
# Change check interval (in seconds)
CHECK_INTERVAL = 7200  # 2 hours

# Modify service list
SERVICES = [
    {
        'id': 'main',
        'name': 'asimonson.com',
        'url': 'https://asimonson.com',
        'timeout': 10  # seconds
    },
    # Add more services here
]
```

## Notes

- First deployment will show limited uptime data until enough checks accumulate
- Historical data is preserved across server restarts (stored in PostgreSQL)
- Page auto-refreshes every 5 minutes to show latest server data
- Manual refresh button available for immediate updates
- All checks performed server-side (no client-side CORS issues)

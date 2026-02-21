# Personal Portfolio & Service Monitor

A Flask-based website for my personal portfolio and a service monitoring dashboard. This project handles dynamic project showcases, automated service health tracking, and production-ready optimizations.

## Features

- **Content Management**: Pages like projects, books, and skills are managed via JSON files in the `static` directory.
- **Service Monitoring**: Background health checks for external services with uptime statistics stored in PostgreSQL.
- **Optimizations**: 
    - HTML, CSS, and JS minification via `Flask-Minify`.
    - MD5-based cache busting for static assets.
    - Configurable cache-control headers.
- **Security**: Pre-configured headers for XSS protection and frame security.
- **Deployment**: Ready for containerized deployment with Docker and Gunicorn.

## Tech Stack

- **Backend**: Python 3.12, Flask
- **Frontend**: Vanilla CSS/JS, Jinja2
- **Database**: PostgreSQL (optional, for monitoring history)
- **Infrastructure**: Docker, docker-compose

## Project Structure

```text
.
├── src/
│   ├── app.py              # Application entry point
│   ├── monitor.py          # Service monitoring logic
│   ├── config.py           # Environment configuration
│   ├── templates/          # HTML templates
│   ├── static/             # CSS, JS, and JSON data
│   └── requirements.txt    # Python dependencies
├── Dockerfile              # Container definition
├── docker-compose.yml      # Local stack orchestration
└── STATUS_MONITOR_README.md # Monitoring system documentation
```

## Getting Started

### Using Docker

To run the full stack (App + PostgreSQL):

1. **Clone the repository**:
   ```bash
   git clone https://github.com/asimonson1125/asimonson1125.github.io.git
   cd asimonson1125.github.io
   ```

2. **Start services**:
   ```bash
   docker-compose up --build
   ```

3. **Access the site**:
   Visit [http://localhost:8080](http://localhost:8080).

### Local Development

To run the Flask app without Docker:

1. **Set up a virtual environment**:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```

2. **Install dependencies**:
   ```bash
   pip install -r src/requirements.txt
   ```

3. **Run the application**:
   ```bash
   cd src
   python3 app.py
   ```
   *Note: status monitor is by default disabled outside of its container cluster*

## Service Monitoring

The monitoring system in `src/monitor.py` tracks service availability. It:
- Runs concurrent health checks every hour.
- Calculates uptime for various windows (24h, 7d, 30d).
- Provides a status UI at `/status` and a JSON API at `/api/status`.

See [STATUS_MONITOR_README.md](./STATUS_MONITOR_README.md) for more details.

## License

This project is personal property. All rights reserved.

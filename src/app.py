import hashlib
import json
import os

import flask
from flask_minify import Minify
import werkzeug.exceptions as HTTPerror

import config  # noqa: F401 — side-effect: loads dev env vars
from monitor import monitor, SERVICES

app = flask.Flask(__name__)

# ── Static file fingerprinting ────────────────────────────────────────

static_file_hashes = {}
for dirpath, _, filenames in os.walk(app.static_folder):
    for filename in filenames:
        filepath = os.path.join(dirpath, filename)
        relative = os.path.relpath(filepath, app.static_folder)
        with open(filepath, 'rb') as f:
            static_file_hashes[relative] = hashlib.md5(f.read()).hexdigest()[:8]


@app.context_processor
def override_url_for():
    def versioned_url_for(endpoint, **values):
        if endpoint == 'static':
            filename = values.get('filename')
            if filename and filename in static_file_hashes:
                values['v'] = static_file_hashes[filename]
        return flask.url_for(endpoint, **values)
    return dict(url_for=versioned_url_for)


# ── Security and caching headers ──────────────────────────────────────

@app.after_request
def add_headers(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'SAMEORIGIN'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'

    if flask.request.path.startswith('/static/'):
        response.headers['Cache-Control'] = 'public, max-age=31536000, immutable'
    elif flask.request.path in ['/sitemap.xml', '/robots.txt']:
        response.headers['Cache-Control'] = 'public, max-age=86400'
    else:
        response.headers['Cache-Control'] = 'no-cache, must-revalidate'

    return response


# ── Load page data ────────────────────────────────────────────────────

def load_json(path):
    with open(path, "r") as f:
        return json.load(f)


projects = load_json("./static/json/projects.json")
books = load_json("./static/json/books.json")
skills = load_json("./static/json/skills.json")
timeline = load_json("./static/json/timeline.json")
pages = load_json("./static/json/pages.json")

pages['projects']['skillList'] = skills
pages['projects']['projects'] = projects
pages['home']['books'] = books
pages['books']['books'] = books
pages['status']['services'] = SERVICES


# ── Error rendering ──────────────────────────────────────────────────

def render_error(code, message):
    pagevars = {
        "template": "error.html",
        "title": f"{code} - Simonson",
        "description": "Error on Andrew Simonson's Digital Portfolio",
        "canonical": f"/{code}",
    }
    return (
        flask.render_template(
            "header.html",
            var=pagevars,
            error=code,
            message=message,
            title=f"{code} - Simonson Portfolio",
        ),
        code,
    )


@app.errorhandler(HTTPerror.HTTPException)
def handle_http_error(e):
    return render_error(e.code, e.description)


@app.errorhandler(Exception)
def handle_generic_error(e):
    return render_error(500, "Internal Server Error")


# ── API routes ────────────────────────────────────────────────────────

@app.route('/api/status')
def api_status():
    return flask.jsonify(monitor.get_status_summary())


@app.route('/api/goto/')
@app.route('/api/goto/<location>')
def api_goto(location='home'):
    if location not in pages:
        flask.abort(404)
    pagevars = pages[location]
    try:
        page = flask.render_template(pagevars["template"], var=pagevars)
    except Exception:
        page = render_error(500, "Internal Server Error")
    return [pagevars, page]


# ── Dynamic page routes ──────────────────────────────────────────────

def make_page_handler(pagename):
    def handler():
        try:
            return flask.render_template('header.html', var=pages[pagename])
        except Exception:
            return render_error(500, "Internal Server Error")
    return handler


for name in pages:
    app.add_url_rule(pages[name]['canonical'], name, make_page_handler(name))


# ── Static file routes ───────────────────────────────────────────────

@app.route("/resume")
@app.route("/Resume.pdf")
@app.route("/Resume_Simonson_Andrew.pdf")
def resume():
    return flask.send_file("./static/Resume_Simonson_Andrew.pdf")


@app.route("/sitemap.xml")
@app.route("/robots.txt")
def static_from_root():
    return flask.send_from_directory(app.static_folder, flask.request.path[1:])


# ── Startup ───────────────────────────────────────────────────────────

if __name__ == "__main__":
    app.run(debug=False)
else:
    Minify(app=app, html=True, js=True, cssless=True)
    monitor.start_monitoring()

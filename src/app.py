import flask
from flask_minify import Minify
import json
import os
import hashlib
import werkzeug.exceptions as HTTPerror
from config import *
from monitor import monitor, SERVICES

app = flask.Flask(__name__)

# Compute content hashes for static file fingerprinting
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

# Add security and caching headers
@app.after_request
def add_security_headers(response):
    """Add security and performance headers to all responses"""
    # Security headers
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'SAMEORIGIN'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'

    # Cache control for static assets
    if flask.request.path.startswith('/static/'):
        response.headers['Cache-Control'] = 'public, max-age=31536000, immutable'
    elif flask.request.path in ['/sitemap.xml', '/robots.txt']:
        response.headers['Cache-Control'] = 'public, max-age=86400'
    else:
        response.headers['Cache-Control'] = 'no-cache, must-revalidate'

    return response



def load_json(path):
    with open(path, "r") as f:
        return json.load(f)

proj = load_json("./static/json/projects.json")
books = load_json("./static/json/books.json")
skillList = load_json("./static/json/skills.json")
timeline = load_json("./static/json/timeline.json")
pages = load_json("./static/json/pages.json")

pages['projects']['skillList'] = skillList
# pages['about']['timeline'] = timeline
pages['projects']['projects'] = proj
pages['home']['books'] = books
pages['books']['books'] = books
pages['status']['services'] = SERVICES

@app.route('/api/status')
def api_status():
    """API endpoint for service status"""
    return flask.jsonify(monitor.get_status_summary())

@app.route('/api/goto/')
@app.route('/api/goto/<location>')
def goto(location='home'):
    if location not in pages:
        flask.abort(404)
    pagevars = pages[location]
    page = None
    try:
        page = flask.render_template(pagevars["template"], var=pagevars)
    except Exception:
        e = HTTPerror.InternalServerError()
        page = handle_http_error(e)
    return [pagevars, page]

def funcGen(pagename, pages):
    def dynamicRule():
        try:
            return flask.render_template('header.html', var=pages[pagename])
        except Exception:
            e = HTTPerror.InternalServerError()
            print(e)
            return handle_http_error(e)
    return dynamicRule  

for i in pages:
    func = funcGen(i, pages)
    app.add_url_rule(pages[i]['canonical'], i, func)

@app.route("/resume")
@app.route("/Resume.pdf")
@app.route("/Resume_Simonson_Andrew.pdf")
def resume():
    return flask.send_file("./static/Resume_Simonson_Andrew.pdf")

@app.errorhandler(HTTPerror.HTTPException)
def handle_http_error(e):
    eCode = e.code
    message = e.description
    pagevars = {
        "template": "error.html",
        "title": f"{eCode} - Simonson",
        "description": "Error on Andrew Simonson's Digital Portfolio",
        "canonical": f"/{eCode}",
    }
    return (
        flask.render_template(
            "header.html",
            var=pagevars,
            error=eCode,
            message=message,
            title=f"{eCode} - Simonson Portfolio",
        ),
        eCode,
    )

@app.errorhandler(Exception)
def handle_generic_error(e):
    pagevars = {
        "template": "error.html",
        "title": "500 - Simonson",
        "description": "Error on Andrew Simonson's Digital Portfolio",
        "canonical": "/500",
    }
    return (
        flask.render_template(
            "header.html",
            var=pagevars,
            error=500,
            message="Internal Server Error",
            title="500 - Simonson Portfolio",
        ),
        500,
    )


@app.route("/sitemap.xml")
@app.route("/robots.txt")
def static_from_root():
    return flask.send_from_directory(app.static_folder, flask.request.path[1:])


if __name__ == "__main__":
    # import sass

    # sass.compile(dirname=("static/scss", "static/css"), output_style="compressed")
    app.run(debug=False)
else:
    Minify(app=app, html=True, js=True, cssless=True)
    monitor.start_monitoring()

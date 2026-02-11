import flask
from flask_minify import Minify
import json
import werkzeug.exceptions as HTTPerror
from config import *

app = flask.Flask(__name__)

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



proj = json.load(open("./static/json/projects.json", "r"))
books = json.load(open("./static/json/books.json", "r"))
skillList = json.load(open("./static/json/skills.json", "r"))
timeline = json.load(open("./static/json/timeline.json", "r"))
pages = json.load(open("./static/json/pages.json", "r"))

pages['projects']['skillList'] = skillList
# pages['about']['timeline'] = timeline
pages['projects']['projects'] = proj
pages['home']['books'] = books
pages['books']['books'] = books

@app.route('/api/goto/')
@app.route('/api/goto/<location>')
def goto(location='home'):
    pagevars = pages[location]
    page = None
    try:
        page = flask.render_template(pagevars["template"], var=pagevars)
    except Exception as e:
        # raise e
        e = HTTPerror.InternalServerError(None, e)
        page = page404(e)
    return [pagevars, page]

def funcGen(pagename, pages):
    def dynamicRule():
        try:
            return flask.render_template('header.html', var=pages[pagename])
        except Exception:
            e = HTTPerror.InternalServerError()
            print(e)
            return page404(e)
    return dynamicRule  

for i in pages:
    func = funcGen(i, pages)
    app.add_url_rule(pages[i]['canonical'], i, func)

@app.route("/resume")
@app.route("/Resume.pdf")
@app.route("/Resume_Simonson_Andrew.pdf")
def resume():
    return flask.send_file("./static/Resume_Simonson_Andrew.pdf")

@app.errorhandler(Exception)
def page404(e):
    eCode = e.code
    message = e.description
    try:
        message = e.length
    finally:
        pagevars = {
            "template": "error.html",
            "title": f"{eCode} - Simonson",
            "description": "Error on Andrew Simonson's Digital Portfolio",
            "canonical": "404",
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

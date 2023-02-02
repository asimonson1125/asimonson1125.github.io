import flask
from flask_minify import Minify
import json

proj = json.load(open("./static/json/projects.json", "r"))
timeline = json.load(open("./static/json/timeline.json", "r"))
pages = {
    "home": {
        "template": "home.html",
        "title": "Andrew Simonson - Portfolio Home",
        "description": "Andrew Simonson's Digital Portfolio home",
        "canonical": "/",
    },
    "projects": {
        "template": "projects.html",
        "projects": proj,
        "title": "Andrew Simonson - Projects",
        "description": "Recent projects by Andrew Simonson on his lovely portfolio website :)",
        "canonical": "/projects",
    },
    "about": {
        "template": "about.html",
        "timeline": timeline,
        "title": "Andrew Simonson - About Me",
        "description": "About Andrew Simonson",
        "canonical": "/about",
    },
}

app = flask.Flask(__name__)


@app.route('/api/goto/')
@app.route('/api/goto/<location>')
def goto(location='home'):
    pagevars = pages[location]
    return [pagevars, flask.render_template(pagevars["template"], var=pagevars)]

@app.route("/")
def home():
    pagevars = pages["home"]
    return flask.render_template("header.html", var=pagevars)


@app.route("/projects")
def projects():
    pagevars = pages["projects"]
    return flask.render_template("header.html", var=pagevars)


@app.route("/about")
def about():
    pagevars = pages["about"]
    return flask.render_template("header.html", var=pagevars)


@app.route("/resume")
@app.route("/Resume.pdf")
def resume():
    return flask.send_file("./static/Resume.pdf")


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
    app.run()
else:
    Minify(app=app, html=True, js=True, cssless=True)
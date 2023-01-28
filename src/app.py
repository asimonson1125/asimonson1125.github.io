import flask
from flask_minify import Minify
import json

proj = json.load(open('./static/json/projects.json', 'r'))
timeline = json.load(open('./static/json/timeline.json', 'r'))

app = flask.Flask(__name__)
Minify(app=app, html=True, js=True, cssless=True)


@app.route("/")
def home():
    return flask.render_template(
        "home.html",
        title="Andrew Simonson - Portfolio Home",
        description="Andrew Simonson's Digital portfolio home",
        canonical="",
    )


@app.route("/about")
def about():
    return flask.render_template(
        "about.html",
        timeline=timeline,
        title="Andrew Simonson - About Me",
        description="About Andrew Simonson",
        canonical="about",
    )


@app.route("/projects")
def projects():
    return flask.render_template(
        "projects.html",
        projects=proj,
        title="Andrew Simonson - Projects",
        description="Recent projects by Andrew Simonson on his lovely portfolio website :)",
        canonical="projects",
    )


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
        return (
            flask.render_template(
                "error.html",
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
    import sass

    sass.compile(dirname=("static/scss", "static/css"), output_style="compressed")
    app.run(debug=True)

import flask
from flask_minify import Minify
import json

proj = json.load(open("./static/json/projects.json", "r"))
books = json.load(open("./static/json/books.json", "r"))
timeline = json.load(open("./static/json/timeline.json", "r"))
pages = json.load(open("./static/json/pages.json", "r"))
pages['about']['timeline'] = timeline
pages['projects']['projects'] = proj
pages['home']['books'] = books
pages['books']['books'] = books

app = flask.Flask(__name__)


@app.route('/api/goto/')
@app.route('/api/goto/<location>')
def goto(location='home'):
    pagevars = pages[location]
    return [pagevars, flask.render_template(pagevars["template"], var=pagevars)]

# I am literally insane
# There was no reason for me to do this
# it saved some lines of code I guess
# infinite flaskless flask here we comes
for i in pages:
    exec(f"@app.route(pages['{i}']['canonical'])\ndef {i}(): return flask.render_template('header.html', var=pages['{i}'])")


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
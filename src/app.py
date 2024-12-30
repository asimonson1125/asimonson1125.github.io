import flask
from flask_minify import Minify
import json
import werkzeug.exceptions as HTTPerror
import requests
from config import *
import os

proj = json.load(open("./static/json/projects.json", "r"))
books = json.load(open("./static/json/books.json", "r"))
skillList = json.load(open("./static/json/skills.json", "r"))
timeline = json.load(open("./static/json/timeline.json", "r"))
pages = json.load(open("./static/json/pages.json", "r"))
pages['home']['skillList'] = skillList
# pages['about']['timeline'] = timeline
pages['projects']['projects'] = proj
pages['home']['books'] = books
pages['books']['books'] = books

app = flask.Flask(__name__)

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

@app.route('/files')
@app.route('/files/')
def no_hacking():
    return "lol nice try"

@app.route('/files/<path:fname>')
def filesystem_send(fname):
    fname = fname.strip('/')
    safe_path = os.path.abspath(os.path.join("/mnt/readonly/", fname))
    if not safe_path.startswith("/mnt/readonly/"):
        return "Invalid path", 400
    if os.path.isfile(safe_path):
        return flask.send_from_directory("/mnt/readonly/", fname)
    elif os.path.isdir(safe_path):
        dirContent = ""
        if not os.path.abspath("/mnt/readonly/") == os.path.abspath(os.path.join(safe_path, os.path.pardir)):
            pardir = "/files/" + os.path.abspath(os.path.join(safe_path, os.path.pardir))[len("/mnt/readonly/"):]
            dirContent += f"<a href='{pardir}'>Parent Directory</a>"
        dirContent += "<ul>"
        for i in os.listdir(safe_path):
            if os.path.isdir(os.path.join(safe_path, i)):
                dirContent += f"<li>DIR: <a href='/files/{fname}/{i}'>{i}</a></li>"
            else:
                dirContent += f"<li><a href='/files/{fname}/{i}'>{i}</a></li>"
        dirContent += "</ul>"
        return dirContent
    raise HTTPerror.NotFound("File or Directory Not Found")


if __name__ == "__main__":
    # import sass

    # sass.compile(dirname=("static/scss", "static/css"), output_style="compressed")
    app.run()
else:
    Minify(app=app, html=True, js=True, cssless=True)

import flask
import sass

app = flask.Flask(__name__)
sass.compile(dirname=('static/scss', 'static/css'), output_style='compressed')

@app.route('/')
def home():
    return flask.render_template('home.html', title='Andrew Simonson - Portfolio Home', description="Andrew Simonson's Digital portfolio home", canonical='')

@app.route('/about')
def about():
    return flask.render_template('about.html', title='Andrew Simonson - About Me', description="About Andrew Simonson", canonical='about')

@app.route('/resume')
@app.route('/Resume.pdf')
def resume():
    return flask.send_file('./static/resume.pdf')


@app.errorhandler(Exception)
def page404(e):
    eCode = e.code
    message = e.description
    try:
        message = e.length
    finally:
        return flask.render_template('error.html', error=eCode, message=message, title=f'{eCode} - Simonson Portfolio'), eCode

@app.route('/sitemap.xml')
@app.route('/robots.txt')
def static_from_root():
    return flask.send_from_directory(app.static_folder, flask.request.path[1:])

if __name__ == '__main__':
    app.run()

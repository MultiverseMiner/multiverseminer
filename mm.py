"""`main` is the top level module for this application."""

# Import the stuffs!
from flask import Flask, render_template, request
from flask.ext.assets import Environment, Bundle
import logging
import logging.config
import ConfigParser
import datetime
import json
import re
import os
import traceback

CONFIG = ConfigParser.RawConfigParser()
CONFIG.read('config.ini')

# We can use CONFIG.get() to pull DB credentials

app = Flask(__name__)
assets = Environment(app)


#########################################################################
# Using JS and CSS bundlers to minify code.

#TODO figure out why uglifyjs returns blank text
js = Bundle('../src/**/*.js',
#            filters='yui_js', 
            output='gen/packed.js')
assets.register('js_all', js)


css = Bundle('../src/**/*.css','css/*.css',
            filters='yui_css', output='gen/packed.css')
assets.register('css_all', css)

#########################################################################

@app.route('/')
def indexpage():
    """This is the first page anyone sees."""
    return render_template('index.html')

@app.route('/changelog')
def changelog():
    """Details from the changelog."""
    return render_template('changelog.html')

@app.route('/solar')
def solarpage():
    """Page for solar system travel."""
    return render_template('solar.html')


#########################################################################
# Error Handlers
@app.errorhandler(404)
def page_not_found(error):
    """Return a custom 404 error."""
    print " ======================="
    print "Exception:", error
    time = str(datetime.datetime.now())
    return render_template("400.html", request=request, time=time), 404

@app.errorhandler(500)
def page_borked(error):
    """Return a custom 500 error. Only hit when debugging is off."""
    print " ======================="
    print "problem with ", request.url
    time = str(datetime.datetime.now())
    print "on seed", app.seed, "at", time
    print "Exception:", error.args[0]
    traceback.print_exc()

    return render_template("500.html", seed=app.seed, request=request, e=error, time=time), 500



#########################################################################
# Error Handlers
if __name__ == '__main__':
    app.debug = True
    app.run()

if CONFIG.has_option('main', 'debug'):
    app.debug = CONFIG.getboolean('main', 'debug')



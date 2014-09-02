"""`main` is the top level module for this application."""

# Import the stuffs!
from flask import Flask, render_template, request, session, jsonify
from flask import make_response, send_from_directory, abort
from flask.ext.assets import Environment, Bundle
from flask.ext.sqlalchemy import SQLAlchemy
from logging.handlers import TimedRotatingFileHandler
import logging
import logging.config
import datetime
from chat import *
import os

app = Flask(__name__)
app.config.from_object('config.BaseConfiguration')
db = SQLAlchemy(app)

from mm.models import Account
from mm import login, craft, admin, account
from mm.login import login_required, character_required
###############################################################################
# Set up Logging

logdir = 'log'
if not os.path.exists(logdir):
    os.makedirs(logdir)

file_handler = TimedRotatingFileHandler(logdir+'/server.log',
                                        'midnight', 1, 30)
formatline = '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
file_handler.setFormatter(logging.Formatter(formatline))

app.logger.setLevel(logging.DEBUG)
file_handler.setLevel(logging.DEBUG)
app.logger.addHandler(file_handler)


#########################################################################
# Using JS and CSS bundlers to minify code.
assets = Environment(app)
chathandler = chathandler.ChatHandler()

# NOTE that these js files have to be loaded in a specific order.
js = Bundle(
    'js/vendor/*.js',
    'js/jquery/*.js',
    'js/foundation.min.js',
    'js/custom.js',
    filters='jsmin',
    output='gen/packed.js'
)
assets.register('js_all', js)

jsmine = Bundle(
    'js/minigame/mine.js',
    filters='jsmin',
    output='gen/minepacked.js'
)
assets.register('js_mine', jsmine)

css = Bundle('css/*.css',
             filters='yui_css', output='gen/packed.css')
assets.register('css_all', css)

#########################################################################


@app.route('/collect/<collectiontype>', methods=['GET', 'POST'])
@login_required
@character_required
def collect(collectiontype):
    """Place a request to collect data."""
    if 'oauth_id' in session:
        app.logger.debug('session oauth id:'+session['oauth_id'])
        account = Account.query.filter_by(oauth_id=session['oauth_id']).first()
        json = account.character.update_collection(collectiontype)
        app.logger.info(account.username+' is attempting to '+collectiontype)
        db.session.add(account)
        db.session.commit()
        return json
    else:
        return jsonify(collectiontype=collectiontype, result='failure',
                       message="User not logged in.")

    # if last_x +5 seconds is less than now()
    #   set new last_x
    #   calculate if anything is found
    #   return new last_x +5

#########################################################################


@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static/images'),
                               'favicon.ico')


@app.route('/')
def indexpage():
    """This is the first page anyone sees."""
    return render_template('index.html')


@app.route('/mining')
def miningpage():
    """This is the first page anyone sees."""
    return render_template('minegame.html')


@app.route('/chat/<message>')
def chatpage(message):
    if not session['oauth_id']:
        return "USER ERROR", 404
    player = Player.query.filter_by(oauth_id=session['oauth_id']).first()
    chathandler.chat(player.username, message)
    return ""

@app.route('/chat/join')
def join():
    if not 'oauth_id' in session.keys():
        return "USER ERROR", 404
    player = Player.query.filter_by(oauth_id=session['oauth_id']).first()
    chathandler.join(player.username)
    return ""

@app.route('/chat/poll/<channel>')
def poll(channel):
    player = Player.query.filter_by(oauth_id=session['oauth_id']).first()
    return jsonify(results = chathandler.get_new_messages(player.username, channel))

#########################################################################
# Error Handlers
@app.errorhandler(404)
def page_not_found(error):
    """Return a custom 404 error."""
    return render_template("404.html", request=request, e=error), 404


# Error Handlers
@app.errorhandler(403)
def page_forbidden(error):
    """Return a custom 403 error."""
    if 'logged_in' not in session:
        return render_template('require_login.html')
    else:
        return render_template('invalid_permissions.html')


@app.errorhandler(500)
def page_borked(error):
    """Return a custom 500 error. Only hit when debugging is off."""
    db.session.rollback()
    return render_template("500.html", request=request, e=error), 500

if __name__ == '__main__':
    app.debug = False
    app.run(debug=False, port=8000)

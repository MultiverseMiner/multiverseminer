"""Contains methods used for crafting."""

# Import the stuffs!
from authomatic.adapters import WerkzeugAdapter
from authomatic import Authomatic
from config import BaseConfiguration, CONFIG
from flask import render_template, request
from flask import make_response
from mm import app, db, session
from models import Player
import datetime

# TODO add login exceptions?
# from mm.exceptions import CraftingException

authomatic = Authomatic(CONFIG, BaseConfiguration.SECRET_KEY)


@app.route('/login')
def login():
    return render_template('require_login.html')

@app.route('/login/<provider>/', methods=['GET', 'POST'])
def loginProvider(provider):
    response = make_response()
    message = ""
    result = authomatic.login(WerkzeugAdapter(request, response), provider)
    if result:
        if result.user:
            app.logger.debug('valid user %s' % result.user.name)
            # ensure that the user is up to date....
            result.user.update()
            if (result.user.name and result.user.id):
                app.logger.debug('%s has logged in with an id of %s' %
                                 (result.user.name, result.user.id))
                player = Player.query.filter_by(oauth_id=result.user.id)
                if player.first():
                    player = player.first()
                    message = "Welcome back, %s." % player.username
                    app.logger.debug(message)
                else:
                    player = Player(oauth_id=result.user.id,
                                  email=result.user.email,
                                  username=result.user.name)
                    app.logger.debug("new account %s created" % player.username)
                    message = "Welcome to Multiverse Miner, %s." % player.username
                player.last_login = datetime.datetime.utcnow()
                session['logged_in'] = True
                session['oauth_id'] = player.oauth_id

                db.session.add(player)
                db.session.commit()
                return render_template('account.html', player=player,
                                       message=message)
            else:
                message = "There is an issue with your account. Contact us."
                app.logger.error(message)
                return render_template('account.html', message=message)
        else:
            message = "Your account was not found on %s" % provider
            app.logger.error(message)
            return render_template('account.html', message=message)
    else:
        # This should be a redirect to google set by WerkzeugAdapter
        return response

@app.route('/logout')
def logout():
    session.clear()
    return render_template('index.html')

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if session['logged_in']:
            return render_template('require_login.html')
        return f(*args, **kwargs)
    return decorated_function

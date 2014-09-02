"""Contains methods used for crafting."""

# Import the stuffs!
from authomatic.adapters import WerkzeugAdapter
from authomatic import Authomatic
from config import BaseConfiguration, CONFIG
from flask import render_template, request
from flask import make_response
from mm import app, db, session
from functools import wraps

from models import Account
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
                app.logger.debug('%s has logged in with an id of %s' % (result.user.name, result.user.id))
                account = Account.query.filter_by(oauth_id=result.user.id)
                print account
                if account.first():
                    account = account.first()
                    if account.character:
                        message = "Welcome back, %s." % account.realname
                    else:
                        session['oauth_id'] = result.user.id
                        session['logged_in'] = True
                        account.last_login = datetime.datetime.utcnow()
                        db.session.add(account)
                        db.session.commit()
                        return render_template('index.html', message='No character created', account=account)
                else: # If you attempt to log in without a valid account or character
                    account=Account(oauth_id=result.user.id, email=result.user.email, provider=result.provider.name,
                                    username=result.user.id,realname=result.user.name)
                session['oauth_id'] = result.user.id
                session['logged_in'] = True
                account.last_login = datetime.datetime.utcnow()
                db.session.add(account)
                db.session.commit()
                message="Welcome back, %s." % account.realname
                return render_template('index.html', account=account, message=message)
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
        if 'logged_in' not in session:
            return render_template('require_login.html')
        return f(*args, **kwargs)
    return decorated_function


def character_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'logged_in' not in session or 'oauth_id' not in session:
            return render_template('require_login.html')
        account = Account.query.filter_by(oauth_id=session['oauth_id']).first()
        if not account.character:
            return render_template('index.html', message='No character created', account=account)
        return f(*args, **kwargs)
    return decorated_function

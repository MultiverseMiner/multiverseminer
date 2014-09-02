"""Contains methods used for crafting."""

# Import the stuffs!

from mm import app, db, session, jsonify
from models import Account, Character
from mm.exceptions import CraftingException
from mm.login import login_required, character_required


@app.route('/craft/<itemid>/<int:count>', methods=['GET', 'POST'])
@login_required
@character_required
def craft_item(itemid, count=1):
    """Place a request to attempt to craft."""
    account = Account.query.filter_by(oauth_id=session['oauth_id']).first()

    try:
        app.logger.info("%s is attempting to craft %s %s" % (account.character.name, count, itemid))
        newitem = account.character.craft_item(itemid, count)
        db.session.add(account)
        db.session.commit()
        return jsonify(itemid=itemid, result='success',
                       message="%s %s crafted!" % (count, newitem.name))
    except CraftingException as e:
        db.session.rollback()
        return jsonify(itemid=itemid, count=count, result='failure',
                       message=e.message)
    except Exception as e:
        app.logger.exception('unknown exception while crating %s' % itemid)
        db.session.rollback()
        return jsonify(itemid=itemid, count=count, result='failure',
                       message="There was an unknown problem crafting: %s" % e)

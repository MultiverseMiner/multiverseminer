"""Contains methods used for crafting."""

# Import the stuffs!

from mm import app, db, session, jsonify
from models import Player
from mm.exceptions import CraftingException


@app.route('/craft/<itemid>/<int:count>', methods=['GET', 'POST'])
def craft_item(itemid, count=1):
    """Place a request to attempt to craft."""
    if 'oauth_id' in session:
        app.logger.debug('session oauth id:'+session['oauth_id'])
        player = Player.query.filter_by(oauth_id=session['oauth_id']).first()

        try:
            app.logger.info("%s is attempting to craft %s %s" % (player.username, count, itemid))
            newitem = player.craft_item(itemid, count)
            db.session.add(player)
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
    else:
        return jsonify(itemid=itemid, count=count, result='failure',
                       message="User not logged in.")

"""Contains methods specific to player functionality."""

# Import the stuffs!
from mm import app, db, session, jsonify
from models import Player
from mm.login import login_required

@app.route('/player/inventory')
@login_required
def playerProfile():
    """Request a player's inventory"""
    player = Player.query.filter_by(oauth_id=session['oauth_id']).first()
    inventorydump={}
    for inventory_item in player.inventory:
        item=inventory_item.item
        inventorydump[item.id]={'id':item.id, 'name':item.name, 'amount':inventory_item.amount}
    return jsonify(result='success', message="Current Inventory", data=inventorydump)

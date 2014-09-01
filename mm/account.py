"""Contains methods specific to character functionality."""

# Import the stuffs!
from mm import app, db, session, jsonify
from models import Character
from mm.login import login_required, character_required

@app.route('/character/inventory')
@login_required
@character_required
def characterProfile():
    """Request a character's's inventory"""
    character = Account.query.filter_by(oauth_id=session['oauth_id']).first().character
    inventorydump={}
    for inventory_item in character.inventory:
        item=inventory_item.item
        inventorydump[item.id]={'id':item.id, 'name':item.name, 'amount':inventory_item.amount}
    return jsonify(result='success', message="Current Inventory", data=inventorydump)


@app.route('/character/save', methods=['POST'])
@login_required
def save_character():
    account = Account.query.filter_by(oauth_id=session['oauth_id']).first()
    if account.character is None:
        acount.character=Character(name=request.form['name'],
                                   character_class=request.form['characterClass'],
                                   sex=request.form['sex'])
    db.session.add(account)
    db.session.commit()
    message="Character details saved."
    return render_template('index.html', account=account, message=message)


@app.route('/account/save', methods=['POST'])
@login_required
def save_account():
    account = Account.query.filter_by(oauth_id=session['oauth_id']).first()
    # only allow username to be changed if it's still the default.
    if 'username' in request.form and account.username == account.oauth_id:
        account.username=request.form['username']
    if 'realname' in request.form:
        account.realname=request.form['realname']
    message="Account details saved."
    return render_template('index.html', account=account, message=message)


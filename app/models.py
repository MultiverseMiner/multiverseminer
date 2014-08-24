from app import db
from flask import jsonify
import datetime

class Player(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    username = db.Column(db.String(64), index = True, unique = True)
    email = db.Column(db.String(120), index = True, unique = True)
    oauth_id = db.Column(db.String(120), index = True, unique = True)
    inventory = db.Column(db.Text)
    created = db.Column(db.DateTime, default=datetime.datetime.utcnow())
    lastLogin = db.Column(db.DateTime, default=datetime.datetime.utcnow())
    characters = db.relationship("Character", backref='player')

    # associated with player so the player can't create multiple chars and have them all running at the same time
    lastmine     = db.Column(db.DateTime, default=datetime.datetime.utcnow())
    lastscavenge = db.Column(db.DateTime, default=datetime.datetime.utcnow())
    lastgather   = db.Column(db.DateTime, default=datetime.datetime.utcnow())

    def update_collection(self,collectiontype):
        """ This method will verify the collectiontype is valid, then see if it's been long enough to update."""
        curtime=datetime.datetime.utcnow()
        waittime=datetime.timedelta(0,5)  # 5 seconds
        #FIXME ugly and inefficient.
        if collectiontype == 'mine':
            if self.lastmine + waittime < curtime:
                self.lastmine=curtime
                #calculate_gains
            return jsonify(collectiontype=collectiontype, lastrun=self.lastmine, result='success')
        elif collectiontype == 'scavenge':
            if self.lastscavenge + waittime < curtime:
                self.lastscavenge=curtime
                #calculate_gains
            return jsonify(collectiontype=collectiontype, lastrun=self.lastscavenge, result='success')
        elif collectiontype == 'gather':
            if self.lastgather + waittime < curtime:
                self.lastgather=curtime
                #calculate_gains
            return jsonify(collectiontype=collectiontype, lastrun=self.lastgather, result='success')
        else:
            return jsonify(collectiontype=collectiontype, message="invalid collection type", result='failure')

class Character(db.Model):

    name = db.Column(db.String(64), index = True, unique = True, primary_key = True)
    player_id = db.Column(db.Integer, db.ForeignKey('player.id'))

    #primary
    constitution = db.Column(db.Integer)
    dexterity = db.Column(db.Integer)
    luck = db.Column(db.Integer)
    perception = db.Column(db.Integer)
    strength = db.Column(db.Integer)

    #secondary
    accuracy = db.Column(db.Integer)
    attackSpeed = db.Column(db.Integer)
    counter = db.Column(db.Integer)
    critChance = db.Column(db.Integer)
    critPercentage = db.Column(db.Integer)
    defense = db.Column(db.Integer)
    evasion = db.Column(db.Integer)
    health = db.Column(db.Integer)
    lootLuck = db.Column(db.Integer)
    miningLuck = db.Column(db.Integer)
    parry = db.Column(db.Integer)
    regeneration = db.Column(db.Integer)
    resillience = db.Column(db.Integer)
    scavengeLuck = db.Column(db.Integer)
    shipSpeed = db.Column(db.Integer)

    #experience
    characterExperience = db.Column(db.Integer)
    craftingExperience = db.Column(db.Integer)
    lootExperience = db.Column(db.Integer)
    miningExperience = db.Column(db.Integer)
    scavengingExperience = db.Column(db.Integer)

    #tbd
    #inventory
    #skills
    #gear
    #weapon
    def __repr__(self):
        return '<Player %r>' % (self.username)

class Category(db.Model):
    id = db.Column(db.String(64), index = True, unique = True, primary_key = True)
    name = db.Column(db.String(64), index = True, unique = True)
    parent_id = db.Column(db.String(64), db.ForeignKey('category.id'))
    parent = db.relationship("Category")
    items = db.relationship("Item")


    def __repr__(self):
        return '<Category %r>' % (self.name)

class Recipe(db.Model):
    item_id         = db.Column(db.String(64), db.ForeignKey('item.id'), primary_key=True)
    ingredient_id   = db.Column(db.String(64), db.ForeignKey('item.id'), primary_key=True)
    amount = db.Column(db.Integer)

class Item(db.Model):
    id = db.Column(db.String(64), index = True, unique = True, primary_key = True)
    name = db.Column(db.String(64), index = True, unique = True)
    category_id = db.Column(db.String(64), db.ForeignKey('category.id'))
    category = db.relationship('Category', backref='item')

    accuracy= db.Column(db.Float)
    attack= db.Column(db.Float)
    attackSpeed= db.Column(db.Float)
    autoGather= db.Column(db.Float)
    autoMine= db.Column(db.Float)
    autoProduce= db.Column(db.String(64), db.ForeignKey('item.id'))
    autoRefine= db.Column(db.Float)
    autoScavenge= db.Column(db.Float)
    defense= db.Column(db.Float)
    description = db.Column(db.Text)
    droprate = db.Column(db.Float)
    evasion= db.Column(db.Float)
    experience= db.Column(db.Integer)
    gearType= db.Column(db.String(64))
    health= db.Column(db.Float)
    lootLuck= db.Column(db.Float)
    minimumMiningLevel= db.Column(db.Integer)
    miningLuck= db.Column(db.Float)
    perception= db.Column(db.Float)
    planetLimit= db.Column(db.Float)
    regeneration= db.Column(db.Float)
    resilience= db.Column(db.Float)
    scavengeLuck= db.Column(db.Float)
    shipSpeed= db.Column(db.Float)
    storagelimit= db.Column(db.Integer)
    strength= db.Column(db.Float)
    value = db.Column(db.Integer)

    ingredients = db.relationship("Item",
                        secondary='recipe',
                        primaryjoin="Item.id==recipe.c.item_id",
                        secondaryjoin="Item.id==recipe.c.ingredient_id"
    )

    def __repr__(self):
        return '<Item %r>' % (self.name)

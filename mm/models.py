""" This contains a list of all models used by Multiverse Miner"""

from mm import db
from flask import jsonify
from datetime import datetime, timedelta

from mm.exceptions import CraftingException


class Player(db.Model):
    """ Player object represents an individual user"""
    time = datetime.utcnow()

    oauth_id = db.Column(db.String(120), primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    created = db.Column(db.DateTime, default=time, nullable=False)
    last_login = db.Column(db.DateTime)
    access_level = db.Column(db.Integer, default='0', nullable=False)
    # In the future I can imagine more collection types.
    last_mine = db.Column(db.DateTime, default=time, nullable=False)
    last_scavenge = db.Column(db.DateTime, default=time, nullable=False)
    last_gather = db.Column(db.DateTime, default=time, nullable=False)

    # associated with player so the player can't create
    # multiple chars and have them all running at the same time.
    characters = db.relationship("Character", backref='player')

    def craft_item(self, itemid, count):

        newitem = Item.query.filter_by(id=itemid)
        if newitem.first():
            newitem = newitem.first()
            # verify all ingredients are in inventory.
            for ingredient in newitem.ingredients:
                amount_needed = count * ingredient.amount
                if not self.in_inventory(amount_needed):
                    raise CraftingException("cannot craft %s %s without %s %s" % (count, itemid, amount_needed, ingredient.item.id))
            # remove items from inventory now that we know all exist
            for ingredient in newitem.ingredients:
                amount_needed = count * ingredient.amount
                self.adjust_inventory(ingredient.item,-amount_needed)

            self.adjust_inventory(newitem, count)
            return newitem
        else:
            raise CraftingException("Item %s doesn't exist in DB" % itemid)

    def in_inventory(self, item):
        """placeholder"""
        return True

    def adjust_inventory(self, item, count):
        """placeholder"""
        return True

    def update_collection(self, collectiontype):
        """ This method will verify the collectiontype is valid,
            then see if it's been long enough to update."""
        curtime = datetime.utcnow()
        waittime = timedelta(0, 5)  # 5 seconds
        collectionlastfield = 'last_'+collectiontype
        if hasattr(self, collectionlastfield):
            oldtime = getattr(self, collectionlastfield)
            if oldtime + waittime < curtime:
                oldtime = curtime
                setattr(self, collectionlastfield, oldtime)
            return jsonify(collectiontype=collectiontype,
                           lastrun=oldtime, result='success')
        else:
            return jsonify(collectiontype=collectiontype, result='failure',
                           message="Invalid collection type.")

    def __repr__(self):
        """ return a tag for the player"""
        return '<Player %s>' % (self.username)

    def __unicode__(self):
        """ return the unicode name """
        return self.username


class Character(db.Model):
    """ Character is the actual in-game PC."""
    name = db.Column(db.String(64), primary_key=True, nullable=False)
    player_id = db.Column(db.ForeignKey('player.oauth_id'))

    # primary
    constitution = db.Column(db.Integer, default=1, nullable=False)
    dexterity = db.Column(db.Integer, default=1, nullable=False)
    luck = db.Column(db.Integer, default=1, nullable=False)
    perception = db.Column(db.Integer, default=1, nullable=False)
    strength = db.Column(db.Integer, default=1, nullable=False)

    # secondary
    accuracy = db.Column(db.Integer, default=1, nullable=False)
    attackSpeed = db.Column(db.Integer, default=1, nullable=False)
    counter = db.Column(db.Integer, default=1, nullable=False)
    crit_chance = db.Column(db.Integer, default=1, nullable=False)
    crit_percentage = db.Column(db.Integer, default=1, nullable=False)
    defense = db.Column(db.Integer, default=1, nullable=False)
    evasion = db.Column(db.Integer, default=1, nullable=False)
    health = db.Column(db.Integer, default=1, nullable=False)
    loot_luck = db.Column(db.Integer, default=1, nullable=False)
    mining_luck = db.Column(db.Integer, default=1, nullable=False)
    parry = db.Column(db.Integer, default=1, nullable=False)
    regeneration = db.Column(db.Integer, default=1, nullable=False)
    resillience = db.Column(db.Integer, default=1, nullable=False)
    scavenge_luck = db.Column(db.Integer, default=1, nullable=False)
    shipSpeed = db.Column(db.Integer, default=1, nullable=False)

    # experience
    character_experience = db.Column(db.Integer, default=1, nullable=False)
    crafting_experience = db.Column(db.Integer, default=1, nullable=False)
    loot_experience = db.Column(db.Integer, default=1, nullable=False)
    mining_experience = db.Column(db.Integer, default=1, nullable=False)
    scavenging_experience = db.Column(db.Integer, default=1, nullable=False)

    # tbd
    # inventory
    # skills
    # gear
    # weapon
    def __repr__(self):
        """ return a tag for the character"""
        return '<Character %r>' % (self.name)

    def __unicode__(self):
        """ return the unicode name """
        return self.name


class Category(db.Model):
    """ Category models the hierarchy of items."""
    id = db.Column(db.String(64), primary_key=True)
    name = db.Column(db.String(64), unique=True, nullable=False)
    parent_id = db.Column(db.ForeignKey('category.id'))
    parent = db.relationship("Category")

    def __repr__(self):
        """ return a tag for the category"""
        return '<Category %r>' % (self.name)

    def __unicode__(self):
        """ return the unicode name """
        return self.name


class Ingredient(db.Model):
    """ ingredient is an association table that crosses the
        recipe with the child items and their amounts. """
    __tablename__ = 'ingredient'

    recipe_id = db.Column(db.ForeignKey('item.id'), primary_key=True)
    item_id = db.Column(db.ForeignKey('item.id'), primary_key=True)
    amount = db.Column(db.Integer, default=1, nullable=False)

    recipe = db.relationship("Item", backref='ingredients',
                             foreign_keys=[recipe_id])
    item = db.relationship("Item", backref='usedIn', foreign_keys=[item_id])

    db.PrimaryKeyConstraint('recipe_id', 'item_id', name='ingredient_pk')

    def __repr__(self):
        """ return a tag for the player"""
        return '<Ingredient %s %s for %s>' % (self.amount,
                                              self.item_id, self.recipe_id)

    def __eq__(self, itm):
        return self.recipe_id == itm.recipe_id and self.item_id == itm.item_id

    def __unicode__(self):
        """ return the unicode name """
        return "Ingredient for %s " % self.recipe_id


class Item(db.Model):
    """ Primary table with all the goodies. """
    id = db.Column(db.String(64), primary_key=True)
    name = db.Column(db.String(64), unique=True, nullable=False)
    category_id = db.Column(db.ForeignKey('category.id'))

    accuracy = db.Column(db.Float, default=0, nullable=False)
    attack = db.Column(db.Float, default=0, nullable=False)
    attack_speed = db.Column(db.Float, default=0, nullable=False)
    auto_gather = db.Column(db.Float, default=0, nullable=False)
    auto_mine = db.Column(db.Float, default=0, nullable=False)
    auto_refine = db.Column(db.Float, default=0, nullable=False)
    auto_produce_id = db.Column(db.ForeignKey('item.id'))
    auto_scavenge = db.Column(db.Float, default=0, nullable=False)
    defense = db.Column(db.Float, default=0, nullable=False)
    description = db.Column(db.Text, default=0, nullable=False)
    droprate = db.Column(db.Float, default=0, nullable=False)
    evasion = db.Column(db.Float, default=0, nullable=False)
    experience = db.Column(db.Integer, default=0, nullable=False)
    gear_type = db.Column(db.String(64))
    health = db.Column(db.Float, default=0, nullable=False)
    lootLuck = db.Column(db.Float, default=0, nullable=False)
    minimum_miningLevel = db.Column(db.Integer, default=0, nullable=False)
    mining_luck = db.Column(db.Float, default=0, nullable=False)
    perception = db.Column(db.Float, default=0, nullable=False)
    planet_limit = db.Column(db.Float, default=0, nullable=False)
    regeneration = db.Column(db.Float, default=0, nullable=False)
    resilience = db.Column(db.Float, default=0, nullable=False)
    scavenge_luck = db.Column(db.Float, default=0, nullable=False)
    ship_speed = db.Column(db.Float, default=0, nullable=False)
    storagelimit = db.Column(db.Integer, default=0, nullable=False)
    strength = db.Column(db.Float, default=0, nullable=False)
    value = db.Column(db.Integer, default=0, nullable=False)

    category = db.relationship('Category', backref='items')
    autoproduce = db.relationship('Item', foreign_keys=[auto_produce_id])

    def contains(self, item):
        """ Check to see if an ingredient is in this item"""
        for ingredient in self.ingredients:
            if ingredient.item == item:
                return True
        return False

    def __eq__(self, other):
        return self.id == other.id

    def __repr__(self):
        """ return a tag for the item"""
        return '<Item %r>' % (self.name)

    def __unicode__(self):
        """ return the unicode name """
        return self.name

class ItemStack(db.Model):
    id=db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Integer, default=1, nullable=False)
    item = db.Column(db.ForeignKey('item.id'))

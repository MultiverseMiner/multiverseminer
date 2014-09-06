""" This contains a list of all models used by Multiverse Miner"""

from mm import app, db
from flask import jsonify
from datetime import datetime, timedelta
from random import randint
from mm.exceptions import CraftingException


class BetaSignup(db.Model):
    __tablename__ = "BetaSignup"
    time = datetime.utcnow()
    email = db.Column(db.String(120), unique=True, nullable=False, primary_key=True)  # this is for an error fix
    name = db.Column(db.String(120), nullable=False)


class Account(db.Model):
    """ Account object represents an individual user"""

    time = datetime.utcnow()
    id = db.Column(db.Integer, primary_key=True)
    oauth_id = db.Column(db.String(120), unique=True, nullable=False)
    username = db.Column(db.String(64), unique=True, nullable=False)
    realname = db.Column(db.String(64), nullable=False)
    provider = db.Column(db.String(64))
    email = db.Column(db.String(120), unique=True, nullable=False)
    created = db.Column(db.DateTime, default=time, nullable=False)
    last_login = db.Column(db.DateTime)
    access_level = db.Column(db.Integer, default='0', nullable=False)
    # In the future I can imagine more collection types.
    last_mine = db.Column(db.DateTime, default=time, nullable=False)
    last_scavenge = db.Column(db.DateTime, default=time, nullable=False)
    last_gather = db.Column(db.DateTime, default=time, nullable=False)

    character_id = db.Column(db.ForeignKey('character.name', name="fk_acc_id"))
    character = db.relationship("Character", uselist=False, remote_side=[character_id])

#    characters = db.relationship("Character", backref="account", uselist=True, remote_side=[Character.name] )

    planet_id = db.Column(db.ForeignKey('planet.id'))
    planet = db.relationship("Planet", backref='players')

    def __repr__(self):
        """ return a tag for the player"""
        return '<Account %s>' % (self.username)

    def __unicode__(self):
        """ return the unicode name """
        return self.username


class Planet(db.Model):
    """ """
    id = db.Column(db.String(64), primary_key=True, nullable=False)
    name = db.Column(db.String(64), nullable=False)

    mineable_max = db.Column(db.Integer, default=100000, nullable=False)
    mineable_remaining = db.Column(db.Integer, default=100000, nullable=False)
    mineable_replenish = db.Column(db.Float, default=1.1, nullable=False)

    gatherable_max = db.Column(db.Integer, default=100000, nullable=False)
    gatherable_remaining = db.Column(db.Integer, default=100000, nullable=False)
    gatherable_replenish = db.Column(db.Float, default=1.1, nullable=False)

    scavengable_max = db.Column(db.Integer, default=100000, nullable=False)
    scavengable_remaining = db.Column(db.Integer, default=100000, nullable=False)
    scavengable_replenish = db.Column(db.Float, default=1.1, nullable=False)

    def __repr__(self):
        """ return a tag for the planet"""
        return '<Planet %r>' % (self.name)

    def __unicode__(self):
        """ return the unicode name """
        return self.name


class PlanetLoot(db.Model):
    """ ingredient is an association table that crosses the
        recipe with the child items and their amounts. """
    __tablename__ = 'planetloot'

    planet_id = db.Column(db.ForeignKey('planet.id'), primary_key=True)
    item_id = db.Column(db.ForeignKey('item.id'), primary_key=True)

    droprate = db.Column(db.Float, default=0, nullable=False)

    planet = db.relationship("Planet", backref='loot', foreign_keys=[planet_id])

    item = db.relationship("Item", backref='found_on', foreign_keys=[item_id])

    db.PrimaryKeyConstraint('planet_id', 'item_id', name='loot_pk')

    def __repr__(self):
        """ return a tag for the planet items"""
        return '<PlanetLoot %s %s on %s>' % (self.droprate, self.item_id, self.planet_id)

    def __eq__(self, itm):
        return self.planet_id == itm.planet_id and self.item_id == itm.item_id

    def __unicode__(self):
        """ return the unicode name """
        return "%s on %s " % (self.item_id, self.planet_id)


class Character(db.Model):
    """ Character is the actual in-game PC."""
    name = db.Column(db.String(64), primary_key=True, nullable=False)
    account = db.relationship("Account", backref="characters", uselist=False, remote_side=[name])

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

    def update_collection(self, collectiontype):
        """ This method will verify the collectiontype is valid,
            then see if it's been long enough to update."""
        curtime = datetime.utcnow()
        waittime = timedelta(0, 5)  # 5 seconds
        collectionlastfield = 'last_'+collectiontype
        successlist = {}
        if hasattr(self.account, collectionlastfield):
            oldtime = getattr(self.account, collectionlastfield)
            if oldtime + waittime < curtime:
                oldtime = curtime
                setattr(self.account, collectionlastfield, oldtime)
                for loot in self.planet.loot:
                    chance = loot.droprate * 100000
                    x = randint(0, 10000)
                    app.logger.debug('is %s less than %s for %s?' % (x, chance, loot.item.name))
                    if x <= chance:
                        amount = randint(1, 5)
                        self.character.adjust_inventory(loot.item, amount)
                        successlist[loot.item.id] = amount
                if successlist:
                    return jsonify(collectiontype=collectiontype,
                                   message="You found something.",
                                   data=successlist,
                                   lastrun=oldtime, result='success')
                else:
                    return jsonify(collectiontype=collectiontype,
                                   message="nothing found.",
                                   data=successlist,
                                   lastrun=oldtime, result='success')
            else:
                return jsonify(collectiontype=collectiontype, message="too soon",
                               lastrun=oldtime, result='success')
        else:
            return jsonify(collectiontype=collectiontype, result='failure',
                           message="Invalid collection type.")

    def craft_item(self, itemid, count):
        newitem = Item.query.filter_by(id=itemid)
        # verify it's a valid item
        if newitem.first():
            newitem = newitem.first()
            # verify all ingredients are in inventory.
            if not newitem.ingredients:
                raise CraftingException("%s is a base material and non-craftable." % itemid)

            if not self.has_recipe(itemid):
                raise CraftingException("You don't have the %s recipe!" % itemid)
            for ingredient in newitem.ingredients:
                amount_needed = count * ingredient.amount
                if not self.in_inventory(ingredient.item.id, amount_needed):
                    raise CraftingException("cannot craft %s %s without %s %s"
                                            % (count, itemid, amount_needed, ingredient.item.id))
            # remove items from inventory now that we know all exist
            app.logger.debug("Crafting %s %s " % (count, itemid))
            for ingredient in newitem.ingredients:
                amount_needed = count * ingredient.amount
                self.adjust_inventory(ingredient.item, -amount_needed)

            self.adjust_inventory(newitem, count)
            return newitem
        else:
            raise CraftingException("Item %s doesn't exist in DB" % itemid)

    def has_recipe(self, itemid):
        """placeholder"""
        for recipe in self.recipebook:
            if recipe.item.id == itemid:
                return True
        return False

    def in_inventory(self, itemid, amount):
        """placeholder"""
        for inventory_item in self.inventory:
            if inventory_item.item.id == itemid and inventory_item.amount > amount:
                return True
        return False

    def adjust_inventory(self, item, amount):
        """placeholder"""
        for inventory_item in self.inventory:
            if inventory_item.item.id == item.id:
                if inventory_item.amount + amount >= 0:
                    inventory_item.amount = inventory_item.amount + amount
                    return inventory_item.amount
                else:
                    raise CraftingException("You have %s %s, but need %s"
                                            % (amount, inventory_item.item.id, inventory_item.amount))
        if amount > 0:
            self.inventory.append(Inventory(character=self, item=item, amount=amount))
            return amount

        raise CraftingException("Item %s not found in inventory??" % item.id)

    # tbd
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
        """ return a tag for the ingredient"""
        return '<Ingredient %s %s for %s>' % (self.amount,
                                              self.item_id, self.recipe_id)

    def __eq__(self, itm):
        return (hasattr(itm, 'recipe_id') and
                hasattr(itm, 'item_id') and
                self.recipe_id == itm.recipe_id and
                self.item_id == itm.item_id)

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
    evasion = db.Column(db.Float, default=0, nullable=False)
    experience = db.Column(db.Integer, default=0, nullable=False)
    # NOTE gear_type may not be needed- we could just query the category.
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
        return hasattr(other, 'id') and self.id == other.id

    def __repr__(self):
        """ return a tag for the item"""
        return '<Item %r>' % (self.name)

    def __unicode__(self):
        """ return the unicode name """
        return self.name


class Inventory(db.Model):
    # This table is personal inventory only.
    __tablename__ = 'inventory'
    character_name = db.Column(db.ForeignKey('character.name'), primary_key=True)
    item_id = db.Column(db.ForeignKey('item.id'), primary_key=True)
    amount = db.Column(db.Integer, default=1, nullable=False)

    character = db.relationship("Character", backref='inventory', foreign_keys=[character_name])
    item = db.relationship("Item", foreign_keys=[item_id])

    db.PrimaryKeyConstraint('item_id', 'character_name', name='inventory_pk')

    def __repr__(self):
        """ return a tag for the inventory"""
        return '<Inventory %s %s for %s>' % (self.amount, self.item_id, self.character_name)

    def __unicode__(self):
        """ return the unicode name """
        return '<Inventory %s %s for %s>' % (self.amount, self.item_id, self.character_name)


class Warehouse(db.Model):
    # This table is planetary inventory only.
    __tablename__ = 'warehouse'
    character_name = db.Column(db.ForeignKey('character.name'), primary_key=True)
    planet_id = db.Column(db.ForeignKey('planet.id'), primary_key=True)
    item_id = db.Column(db.ForeignKey('item.id'), primary_key=True)
    amount = db.Column(db.Integer, default=1, nullable=False)

    character = db.relationship("Character", backref='warehouse', foreign_keys=[character_name])
    planet = db.relationship("Planet", backref='warehouse', foreign_keys=[planet_id])
    item = db.relationship("Item",  foreign_keys=[item_id])

    db.PrimaryKeyConstraint('item_id', 'character_name', 'planet_id', name='warehouse_pk')

    def __repr__(self):
        """ return a tag for the warehouse"""
        return '<Warehouse %s %s for %s on %s>' % (self.amount, self.item_id, self.character_name, self.planet_id)

    def __unicode__(self):
        """ return the unicode name """
        return '<Warehouse %s %s for %s on %s>' % (self.amount, self.item_id, self.character_name, self.planet_id)


class RecipeBook(db.Model):
    # This table represents which recipes a character knows
    __tablename__ = 'recipebook'
    character_name = db.Column(db.ForeignKey('character.name'), primary_key=True)
    item_id = db.Column(db.ForeignKey('item.id'), primary_key=True)
    mastered = db.Column(db.Integer, default=1, nullable=False)

    character = db.relationship("Character", backref='recipebook', foreign_keys=[character_name])
    item = db.relationship("Item", foreign_keys=[item_id])

    db.PrimaryKeyConstraint('item_id', 'character_name', name='recipebook_pk')

    def __repr__(self):
        """ return a tag for the recipe"""
        return '<Recipe for %s owned by %s>' % (self.item_id, self.character_name)

    def __unicode__(self):
        """ return the unicode name """
        return '<Recipe for %s owned by %s>' % (self.item_id, self.character_name)

from app import db

ROLE_USER = 0
ROLE_ADMIN = 1

class Player(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    username = db.Column(db.String(64), index = True, unique = True)
    email = db.Column(db.String(120), index = True, unique = True)
    oauth_id = db.Column(db.String(120), index = True, unique = True)
    inventory = db.Column(db.Text)
    created = db.Column(db.DateTime)
    lastLogin = db.Column(db.DateTime)

    def __repr__(self):
        return '<Player %r>' % (self.username)

class Category(db.Model):
    id = db.Column(db.String(64), index = True, unique = True, primary_key = True)
    name = db.Column(db.String(64), index = True, unique = True)
    parent_id = db.Column(db.Integer, db.ForeignKey('category.id'))
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
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'))
    category = db.relationship('Category', backref='item')
    description = db.Column(db.Text)
    value = db.Column(db.Integer)
    droprate = db.Column(db.Float)
    autoMine= db.Column(db.Float)
    autoGather= db.Column(db.Float)
    autoScavenge= db.Column(db.Float)
    autoRefine= db.Column(db.Float)
    planetLimit= db.Column(db.Float)
    ingredients = db.relationship("Item",
                        secondary='recipe',
                        primaryjoin="Item.id==recipe.c.item_id",
                        secondaryjoin="Item.id==recipe.c.ingredient_id"
    )

    def __repr__(self):
        return '<Item %r>' % (self.name)

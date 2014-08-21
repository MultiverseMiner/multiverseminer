from app import db

ROLE_USER = 0
ROLE_ADMIN = 1

class Player(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    username = db.Column(db.String(64), index = True, unique = True)
    email = db.Column(db.String(120), index = True, unique = True)
    inventory = db.Column(db.Text)
    created = db.Column(db.DateTime)

    def __repr__(self):
        return '<Player %r>' % (self.username)

class Category(db.Model):
    id = db.Column(db.String(64), index = True, unique = True, primary_key = True)
    name = db.Column(db.String(64), index = True, unique = True)
    parent = db.relationship('Category', backref='category', lazy='dynamic')
    def __repr__(self):
        return '<Category %r>' % (self.name)

class Recipe(db.Model):
    __tablename__ = 'association'
    item_id         = db.Column(db.String(64), db.ForeignKey('item.id'), primary_key=True)
    ingredient_id   = db.Column(db.String(64), db.ForeignKey('item.id'), primary_key=True)
    extra_data = db.Column(db.Integer)
    child = db.relationship("Child")

class Item(db.Model):
    id = db.Column(db.String(64), index = True, unique = True, primary_key = True)
    name = db.Column(db.String(64), index = True, unique = True)
    category = db.relationship('Category', backref='item', lazy='dynamic')
    description = db.Column(db.Text)
    value = db.Column(db.Integer)
    droprate = db.Column(db.Float)
    autoMine= db.Column(db.Float)
    autoGather= db.Column(db.Float)
    autoScavenge= db.Column(db.Float)
    autoRefine= db.Column(db.Float)
    planetLimit= db.Column(db.Float)
    ingredients = db.relationship("Recipe")
    decompose   = db.relationship("Recipe")

    def __repr__(self):
        return '<Item %r>' % (self.name)

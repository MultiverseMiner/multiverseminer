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
        
class Item(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    name = db.Column(db.String(64), index = True, unique = True)
    rarity = db.Column(db.String(140))

    def __repr__(self):
        return '<Item %r>' % (self.name)

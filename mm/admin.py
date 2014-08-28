"""`main` is the top level module for this application."""

# Import the stuffs!


from mm import app, db
from flask.ext import admin
from flask.ext.admin.contrib import sqla

from models import Player, Item, Category, Ingredient, Character, Inventory, Warehouse


class ItemAdmin(sqla.ModelView):

    # If we only want certain fields visible, use this
    # column_list=('name', 'category')

    # If we want to add unique templates (we do), use this.
    # list_template = 'listItem.html'
    # create_template = 'create.html'
    # edit_template = 'edit.html'

    # Make columns sortable
    column_sortable_list = (('name', Item.name), ('category', Category.name))

    # Give them pretty names
    column_labels = dict(name='Item Name')

    # Add filtering
    column_filters = ('name', 'category')

    def __init__(self, session):
        # Just call parent class with predefined model.
        super(ItemAdmin, self).__init__(Item, session)


class PlayerAdmin(sqla.ModelView):
    """ Nothing fancy yet... """


class CharacterAdmin(sqla.ModelView):
    """ Nothing fancy yet... """


class CategoryView(sqla.ModelView):
    """ Nothing Fancy here yet... """


# Create admin
admin = admin.Admin(app, 'Admin Interface')

# Add views
admin.add_view(PlayerAdmin(Player, db.session))
admin.add_view(CharacterAdmin(Character, db.session))
admin.add_view(sqla.ModelView(Ingredient, db.session))
admin.add_view(ItemAdmin(db.session))
admin.add_view(CategoryView(Category, db.session))

admin.add_view(sqla.ModelView(Inventory, db.session))
admin.add_view(sqla.ModelView(Warehouse, db.session))



"""`main` is the top level module for this application."""

# Import the stuffs!

from flask import render_template, redirect
from mm import app, db, session
from flask.ext import admin
from flask.ext.admin.contrib import sqla
from mm.login import login_required
from models import Account, Item, Category, Ingredient, Character, Inventory, Warehouse, Planet, PlanetLoot


class BaseAdmin(sqla.ModelView):
    def is_accessible(self):
        app.logger.debug('is accessable %s' % session )
        if 'logged_in' in session and 'oauth_id' in session:
            account = Account.query.filter_by(oauth_id=session['oauth_id']).first()
            if account.access_level > 0:
                return True
            return False
        return False


class ItemAdmin(BaseAdmin):

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


# Create admin
admin = admin.Admin(app, 'Admin Interface')

# Add views
admin.add_view(BaseAdmin(Account, db.session))
admin.add_view(BaseAdmin(Character, db.session))
admin.add_view(BaseAdmin(Ingredient, db.session))
admin.add_view(BaseAdmin(Category, db.session))
admin.add_view(BaseAdmin(Inventory, db.session))
admin.add_view(BaseAdmin(Warehouse, db.session))
admin.add_view(BaseAdmin(Planet, db.session))
admin.add_view(BaseAdmin(PlanetLoot, db.session))

admin.add_view(ItemAdmin(db.session))


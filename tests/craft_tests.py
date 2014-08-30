
from mock import MagicMock, Mock
from authomatic import Authomatic
from flask.ext.testing import TestCase

from mm import app, db, craft, login
import mm
from mm.models import Item, Player, Ingredient, Inventory, RecipeBook


class CraftTestCase(TestCase):

    def create_app(self):
        """ This app config will be overlayed on the normal config
            allowing us to use a sqlite db for unit tests. """
        app.config.from_object('config.TestConfiguration')
        return app

    def setUp(self):
        """ Since the DB is stored in memory for the duration,
            we need to repopulate it and add it to self. """
        db.create_all()
        app.testing = True

        # create items and recipes
        gold = Item(id='gold', name='Gold')
        ironore = Item(id='ironOre', name='Iron Ore')
        ironbar = Item(id='ironBar', name='Iron Bar')
        refinery = Item(id='refinery', name='Refinery')

        # create player and inventory
        self.oldauth = mm.login.authomatic
        result = Mock()
        result.user = Mock()
        result.user.update = MagicMock()
        result.user.name = 'bob dole'
        result.user.id = '123123123'
        result.user.email = 'foo@bar.com'
        bob = Player(oauth_id=result.user.id, username=result.user.name, email=result.user.email)
        db.session.add(gold)
        db.session.add(ironore)
        db.session.add(ironbar)
        db.session.add(refinery)
        db.session.add(Ingredient(item=ironore, recipe=ironbar, amount=5))
        db.session.add(Ingredient(item=ironbar, recipe=refinery, amount=1))
        db.session.add(RecipeBook(player=bob, item=ironbar))
        db.session.add(bob)
        db.session.add(Inventory(player=bob, item=ironore, amount=200))
        db.session.add(Inventory(player=bob, item=ironbar, amount=1))
        db.session.add(Inventory(player=bob, item=gold, amount=200))
        db.session.commit()
        mm.login.authomatic = Mock(Authomatic)
        mm.login.authomatic.login = MagicMock(return_value=result)
        self.app = app.test_client()
        response = self.app.get("/login/google/")
        self.assertTemplateUsed('account.html')
        self.assertIn('Welcome back, bob dole.', response.data)

    def tearDown(self):
        """ clean up after ourselves. """
        # remove the cookie
        db.session.remove()
        # remove the DB.
        db.drop_all()
        mm.login.authomatic = self.oldauth

    def test_craft_one_valid_item(self):
        """ successfully craft one valid item """
        response = self.app.get("/craft/ironBar/1")
        self.assertIn('success', response.data)
        self.assertIn('1 Iron Bar crafted!', response.data)

    def test_craft_with_no_recipe(self):
        """ successfully craft one valid item """
        response = self.app.get("/craft/refinery/1")
        self.assertIn('failure', response.data)
        self.assertIn("You don't have the refinery recipe!", response.data)

    def test_craft_one_invalid_item(self):
        """ fail to craft one invalid item """
        response = self.app.get("/craft/gold/1")
        self.assertIn('failure', response.data)
        self.assertIn("gold is a base material and non-craftable.", response.data)

    def test_craft_one_nonexistant_item(self):
        """ fail to craft one non-existent item """

        response = self.app.get("/craft/fakeitem/1")
        self.assertIn('failure', response.data)
        self.assertIn("Item fakeitem doesn't exist in DB", response.data)

    def test_not_enough_resources(self):
        """ fail to have enough resources """

        response = self.app.get("/craft/ironBar/100")
        self.assertIn('failure', response.data)
        self.assertIn('cannot craft 100 ironBar without 500 ironOre', response.data)

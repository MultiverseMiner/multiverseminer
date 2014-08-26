
from mock import MagicMock, Mock
from authomatic import Authomatic
from flask.ext.testing import TestCase

from mm import app, db
import mm
from mm.models import Player, Category, Ingredient, Item


class ModelsTestCase(TestCase):

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
        self.app = app.test_client()

    def tearDown(self):
        """ clean up after ourselves. """
        # remove the cookie
        db.session.remove()
        # remove the DB.
        db.drop_all()


    def test_player_creation(self):
        """ Make sure player can be created and saved to the DB """
        user = Player(oauth_id='12345',
                        email='garbage@example.com',
                        username='garbage')
        db.session.add(user)
        db.session.commit()
        user = Player(oauth_id='12345',
                        email='garbage@example.com',
                        username='garbage')

        newuser = Player.query.filter_by(oauth_id='12345').first()

        self.assertEqual(user.email,newuser.email)




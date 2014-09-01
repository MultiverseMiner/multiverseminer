
from flask.ext.testing import TestCase

from mm import app, db
from mm.models import Account


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


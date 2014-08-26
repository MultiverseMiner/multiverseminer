
from mock import MagicMock, Mock
from authomatic import Authomatic
from flask.ext.testing import TestCase

from mm import app, db
import mm


class AppTestCase(TestCase):

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

        self.oldauth = mm.authomatic
        result = Mock()
        result.user = Mock()
        result.user.update = MagicMock()
        result.user.name = 'bob dole'
        result.user.id = '123123123'
        result.user.email = 'foo@bar.com'

        mm.authomatic = Mock(Authomatic)
        mm.authomatic.login = MagicMock(return_value=result)
        self.app = app.test_client()

    def tearDown(self):
        """ clean up after ourselves. """
        # remove the cookie
        db.session.remove()
        # remove the DB.
        db.drop_all()
        mm.authomatic = self.oldauth

    def test_index_route(self):
        """ test the primary route """
        response = self.app.get("/")
        self.assertTemplateUsed('index.html')
        self.assertIn('text/javascript', response.data)
        self.assert200(response)

    def test_logout_route(self):
        """ test the logout route """
        response = self.app.get("/logout")
        self.assertTemplateUsed('index.html')
        self.assertIn('Log in', response.data, "Verify logged out.")
        self.assert200(response)

    def test_favicon_route(self):
        """ make sure our favicon is being returned """
        response = self.app.get("/favicon.ico")
        self.assert200(response)

    def test_404_route(self):
        """ check the 404 page """
        response = self.app.get("/404shouldbehere")
        self.assert404(response)

    def test_provider_newaccount_route(self):
        """ create an account"""
        response = self.app.get("/login/google/")
        self.assertTemplateUsed('account.html')
        self.assertIn('Welcome to Multiverse Miner, bob dole.', response.data)

        response = self.app.get("/login/google/")
        self.assertTemplateUsed('account.html')
        self.assertIn('Welcome back, bob dole.', response.data)

    def test_provider_bad_return_user_route(self):
        """ Test a bad user object from provider results."""
        result = Mock()
        result.user = False

        mm.authomatic.login = MagicMock(return_value=result)
        response = self.app.get("/login/google/")
        self.assertTemplateUsed('account.html')
        self.assertIn('', response.data)

    def test_provider_no_user_name_route(self):
        """ test a bad user.name from provider results. """
        result = Mock()
        result.user = Mock()
        result.user.update = MagicMock()
        result.user.name = False

        mm.authomatic.login = MagicMock(return_value=result)
        response = self.app.get("/login/google/")
        self.assertTemplateUsed('account.html')
        self.assertIn('There is an issue with your account. Contact us.',
                      response.data)
        self.assertStatus(response, 200)

    def test_provider_redirect_google_route(self):
        """ Ensure that the redirect to google is happening. """
        mm.authomatic = self.oldauth
        response = self.app.get("/login/google/")
        self.assertStatus(response, 302)
        self.assertIn('accounts.google.com', response.headers[1][1])

    def test_collect_valid_type(self):
        """ collect a valid mine type """
        response = self.app.get("/login/google/")
        self.assertTemplateUsed('account.html')
        self.assertIn('Welcome to Multiverse Miner, bob dole.', response.data)

        response = self.app.get("/collect/mine")
        self.assertIn('success', response.data)
        newresponse = self.app.get("/collect/mine")
        self.assertEquals(newresponse.data, response.data)

    def test_collect_invalid_type(self):
        """ collect a valid mine type """
        response = self.app.get("/login/google/")
        self.assertTemplateUsed('account.html')
        self.assertIn('Welcome to Multiverse Miner, bob dole.', response.data)

        response = self.app.get("/collect/mined")
        self.assertIn('failure', response.data)
        self.assertIn("Invalid collection type.", response.data)

    def test_collect_w_no_acct(self):
        """ collect a valid mine type """

        response = self.app.get("/collect/mine")
        self.assertIn('failure', response.data)
        self.assertIn('User not logged in.', response.data)

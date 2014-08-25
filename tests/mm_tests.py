
import flask.ext.testing
from flask.ext.sqlalchemy import SQLAlchemy
from flask import Flask
from mock import MagicMock, patch, Mock
from authomatic import Authomatic

import os
from flask.ext.testing import TestCase

from mm import app, db
import mm

class AppTestCase(TestCase):


    def create_app(self):
        """ This app config will be overlayed on the normal config """
        """ allowing us to use a sqlite db for unit tests. """
        app.config.from_object('config.TestConfiguration')
        return app


    def setUp(self):
        """ Since the DB is stored in memory for the duration, """
        """ we need to repopulate it and add it to self. """
        db.create_all()
        app.testing = True
        self.app = app.test_client()


    def tearDown(self):
        """ clean up after ourselves. """
        # remove the cookie
        db.session.remove()
        # remove the DB.
        db.drop_all()

    def test_index_route(self):
        """ test the primary route """
        response = self.app.get("/")
        self.assertTemplateUsed('index.html')
        self.assertIn( 'text/javascript', response.data, "Verify layout was used by index")
        self.assert200(response)


    def test_favicon_route(self):
        """ make sure our favicon is being returned """
        response = self.app.get("/favicon.ico")
        self.assert200(response)


    def test_provider_redirect_route(self):
        """ """
        response = self.app.get("/login/google/")
        self.assertStatus(response, 302)

        result=Mock()
        result.user=Mock()
        result.user.update=MagicMock()
        result.user.name='bob dole'
        result.user.id='123123123'
        result.user.email='foo@bar.com'

        authmock= Mock(Authomatic)
        authmock.login=MagicMock(return_value=result)

        mm.authomatic=authmock
        response = self.app.get("/login/google/")



import app as mm
import unittest2 as unittest
import flask.ext.testing
from flask import Flask

from flask.ext.testing import TestCase



 
class AppTestCase(TestCase):

    SQLALCHEMY_DATABASE_URI = "sqlite://"
    TESTING = True

    def create_app(self):
        mm.app.config['TESTING'] = True
        return mm.app


    def setUp(self):
        """ """
        
        mm.app=self.create_app()
        mm.db.create_all()

    def tearDown(self):
        """ """
        mm.db.session.remove()
        mm.db.drop_all()
        self.app = None
    def test_index_route(self):
        """ """
#        response =self.mm.get("/")
#        self.assertTemplateUsed('index.html')
#        self.assert200(response)


    def test_favicon_route(self):
        """ """
#        response = self.app.get("/favicon.ico")
#        self.assert200(response)


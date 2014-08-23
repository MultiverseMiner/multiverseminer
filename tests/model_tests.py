

from sqlalchemy.engine import create_engine
from sqlalchemy.orm.session import Session
import unittest2 as unittest
from mock import MagicMock
from config import CONFIG,SQLALCHEMY_DATABASE_URI
import app  # This is your declarative base class


def setup_module():
    global transaction, connection, engine

    # Connect to the database and create the schema within a transaction
    engine = create_engine(SQLALCHEMY_DATABASE_URI)
    connection = engine.connect()
    transaction = connection.begin()

    # If you want to insert fixtures to the DB, do it here

def teardown_module():
    # Roll back the top level transaction and disconnect from the database
    transaction.rollback()
    connection.close()
    engine.dispose()


class DatabaseTest(unittest.TestCase):
    def setup(self):
        self.__transaction = connection.begin_nested()
        self.session = Session(connection)

    def test_dbstuff(self):
        """  """
        self.assertEqual('foo','fail')


    def teardown(self):
        self.session.close()
        self.__transaction.rollback()


#!/usr/bin/env python

import app
from app import db

from flask import Flask
from flask.ext.sqlalchemy import SQLAlchemy
from flask.ext.script import Manager
from flask.ext.migrate import Migrate, MigrateCommand



migrate = Migrate(app.app, db)

manager = Manager(app.app)
manager.add_command('db', MigrateCommand)


if __name__ == '__main__':
    manager.run()

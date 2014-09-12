# -*- coding: utf-8 -*-
import datetime as dt

from multiverseminer.database import (
    Column,
    db,
    Model,
)


class BetaSignup(Model):
    __tablename__ = 'beta'
    id = Column(db.Integer, primary_key=True)
    time = Column(db.DateTime, nullable=False, default=dt.datetime.utcnow)
    name = Column(db.String(80), unique=False, nullable=True)
    email = Column(db.String(80), unique=True, nullable=False)

    def __init__(self, name, **kwargs):
        db.Model.__init__(self, name=name, **kwargs)

    def __repr__(self):
        return '<Signup ({name})>'.format(name=self.name)
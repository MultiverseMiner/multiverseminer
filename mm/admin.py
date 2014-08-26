"""`main` is the top level module for this application."""

# Import the stuffs!


from mm import app, db

from flask import Flask, render_template, request, session, jsonify
from flask import make_response, send_from_directory
from flask.ext.assets import Environment, Bundle
from flask.ext.sqlalchemy import SQLAlchemy
from authomatic.adapters import WerkzeugAdapter
from authomatic import Authomatic
from logging.handlers import TimedRotatingFileHandler
import logging
import logging.config
import datetime
import os
from flask.ext.paginate import Pagination

from models import Player, Item, Category, Ingredient

# TODO find out more about @login_required -morgajel
@app.route('/admin/players')
@app.route('/admin/players/')
@app.route('/admin/players/<int:page>')
def list_players(page = 1):
    players = Player.query.all()
    pagination = Pagination(page=page, total=len(players), search=False, record_name='players', ss_framework='foundation')
    return render_template('list.html', displaylist=players, pagination=pagination)


@app.route('/admin/items')
@app.route('/admin/items/')
@app.route('/admin/items/<int:page>')
def list_items(page = 1):
    items = Item.query.all()
    pagination = Pagination(page=page, total=len(items), search=False, record_name='item', css_framework='foundation')
    return render_template('list.html', displaylist=items, pagination=pagination)


@app.route('/admin/categories')
@app.route('/admin/categories/')
@app.route('/admin/categories/<int:page>')
def list_categories(page = 1):
    categories = Category.query.all()
    pagination = Pagination(page=page, total=len(categories), search=False, record_name='category', css_framework='foundation')
    return render_template('list.html', displaylist=categories, pagination=pagination)


@app.route('/admin/ingredients')
@app.route('/admin/ingredients/')
@app.route('/admin/ingredients/<int:page>')
def list_ingredients(page = 1):
    ingredients = Ingredient.query.all()
    pagination = Pagination(page=page, total=len(ingredients), search=False, record_name='ingredient', css_framework='foundation')
    return render_template('list.html', displaylist=ingredients, pagination=pagination)

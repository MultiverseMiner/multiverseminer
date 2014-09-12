# -*- coding: utf-8 -*-
'''Beta section'''
from flask import (Blueprint, request, render_template)

from .forms import SignupForm
from .models import BetaSignup


blueprint = Blueprint('beta', __name__, static_folder="../static")


@blueprint.route("/", methods=["GET", "POST"])
def home():
    form = SignupForm(request.form, csrf_enabled=False)
    signedup = False
    if request.method == 'POST':
        if form.validate_on_submit():
            new_signup = BetaSignup.create(name=form.name.data,
                                           email=form.email.data)
            signedup = True

    return render_template("login.html", signedup=signedup, form=form)
from flask_wtf import Form
from wtforms import StringField
from wtforms.validators import DataRequired, Email, Length

from .models import BetaSignup


class SignupForm(Form):
    name = StringField('Name',
                       validators=[DataRequired(), Length(min=3, max=25)])
    email = StringField('Email',
                        validators=[DataRequired(), Email(), Length(min=6, max=40)])

    def __init__(self, *args, **kwargs):
        super(SignupForm, self).__init__(*args, **kwargs)
        self.user = None

    def validate(self):
        initial_validation = super(SignupForm, self).validate()
        if not initial_validation:
            return False

        user = BetaSignup.query.filter_by(email=self.email.data).first()
        if user:
            self.email.errors.append("Email already registered")
            return False
        return True
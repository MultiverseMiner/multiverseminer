# -*- coding: utf-8 -*-
from flask.ext.assets import Bundle, Environment

css = Bundle(
    "css/foundation.css",
    "css/main.css",
    "css/third_party.css",
    filters="cssmin",
    output="public/css/common.css"
)

js = Bundle(
    "js/base.min.js",
    filters='jsmin',
    output="public/js/common.js"
)

assets = Environment()

assets.register("js_all", js)
assets.register("css_all", css)
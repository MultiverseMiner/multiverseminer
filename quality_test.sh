#!/bin/bash

pylint -r n app test
flake8 app test

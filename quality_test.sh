#!/bin/bash

pylint -r n mm/ test/
flake8 mm/ test/

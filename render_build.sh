#!/usr/bin/env bash
# exit on error
set -o errexit

npm install
npm run build

# Instalar pipenv antes de usarlo
pip install pipenv

pipenv install

pipenv run upgrade

#!/bin/sh

echo "Creating the python virtualenv..."
python3 -m venv ../.env
. ../.env/bin/activate
echo "Installing required package for python..."
pip install -r requirement.txt --quiet
echo "Creating Database..."
python3 create_database.py
echo "Installing node package..."
npm install --silent

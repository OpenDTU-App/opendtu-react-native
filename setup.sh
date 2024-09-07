#!/bin/bash

# ensure that the script is run inside git root
if [ ! -d .git ]; then
    echo "Please run this script inside the git root"
    exit 1
fi

# Copy default.env to .env if .env does not exist
if [ ! -f .env ]; then
    cp default.env .env
fi

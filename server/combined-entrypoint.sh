#!/usr/bin/env bash

# Run node server in the background.
echo "starting node server"
npm start &

# start the Kurento media server in the foreground.
echo "starting kurento server"
/entrypoint.sh


#!/usr/bin/env bash

# Run node server in the background.
node server.js &

# start the Kurento media server in the foreground.
/entrypoint.sh


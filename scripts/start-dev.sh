#! /bin/sh

node_modules/.bin/ts-node-dev --exit-child --transpile-only --watch data,static/groups ./src/index.ts &
pid=$!

trap "echo 'Caught signal; killing watcher'; kill ${pid}; exit 1" INT QUIT TERM
wait

#!/bin/sh
set -e

mkdir -p /app/data
chown -R node:node /app/data
chmod 775 /app/data
if [ -f /app/data/cv_builder.db ]; then
  chown node:node /app/data/cv_builder.db
  chmod 664 /app/data/cv_builder.db
fi

exec su-exec node "$@"

#!/bin/bash
# Aurora (hello-obnd) Application - Startup Wrapper Script
# This script loads environment variables from .env.production before starting PM2
set -e

# Load environment variables
set -a
source /var/www/aurora/.env.production
set +a

# Start PM2 in runtime mode (foreground)
exec /home/nodejs/node_modules/.bin/pm2-runtime start /var/www/aurora/ecosystem.config.cjs --env production


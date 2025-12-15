#!/bin/bash

# Export correct environment variables to match Docker services
export DB_HOST=localhost
export DB_PORT=5433
export DB_USER=airmass
export DB_PASSWORD=secure_password
export DB_NAME=airmass_db
export REDIS_HOST=localhost
export REDIS_PORT=6379

echo "Starting backend with local configuration..."
echo "DB: $DB_HOST:$DB_PORT (User: $DB_USER)"

# Run the backend
go run cmd/server/main.go

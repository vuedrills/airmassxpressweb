#!/bin/bash

# Script to run backend without Docker
# Requires: PostgreSQL 15+ and Redis installed locally

echo "🚀 Starting AirMassXpress Backend (without Docker)"
echo ""

# Check if PostgreSQL is running
if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo "❌ PostgreSQL is not running on port 5432"
    echo "Please start PostgreSQL first:"
    echo "  brew services start postgresql@15"
    exit 1
fi

# Check if Redis is running
if ! redis-cli ping > /dev/null 2>&1; then
    echo "❌ Redis is not running"
    echo "Please start Redis first:"
    echo "  brew services start redis"
    exit 1
fi

# Check if database exists
if ! psql -lqt -h localhost -U $USER | cut -d \| -f 1 | grep -qw airmass_db; then
    echo "📦 Creating database 'airmass_db'..."
    createdb airmass_db
fi

echo "✅ PostgreSQL is running"
echo "✅ Redis is running"
echo "✅ Database ready"
echo ""
echo "🔧 Starting Go server..."

# Run the server
go run cmd/server/main.go

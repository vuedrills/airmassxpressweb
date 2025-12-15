#!/bin/bash
set -e

echo "🚀 Starting AirMass Xpress Development Environment..."

# Function to kill process on port
kill_port() {
    local port=$1
    local pid=$(lsof -t -i:$port)
    if [ ! -z "$pid" ]; then
        echo "Killing process on port $port (PID: $pid)..."
        kill -9 $pid
    fi
}

# Cleanup existing ports
kill_port 3000

echo "📦 Starting Backend (Docker)..."
cd backend
docker compose up -d
cd ..

echo "🎨 Starting Frontend (Next.js)..."
cd web_app
npm run dev

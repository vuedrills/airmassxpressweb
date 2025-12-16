#!/bin/bash
# One-time batch geocoding script for existing tasks
# Uses LocationIQ (FREE 5K/day limit)
# Run from backend directory: ./scripts/geocode_tasks.sh

LOCATIONIQ_KEY="pk.44dc2f26f81291e2966a56ad7b0894c0"
DB_HOST="localhost"
DB_PORT="5433"
DB_USER="airmass"
DB_PASSWORD="secure_password"
DB_NAME="airmass_db"

echo "🌍 Batch Geocoding Existing Tasks"
echo "=================================="

# Get tasks without coordinates
TASKS=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "
  SELECT id, location FROM tasks 
  WHERE (lat IS NULL OR lat = 0) 
  AND location IS NOT NULL 
  AND location != ''
  LIMIT 100;
")

COUNT=0
SUCCESS=0
FAILED=0

echo "$TASKS" | while IFS='|' read -r task_id location; do
  # Trim whitespace
  task_id=$(echo "$task_id" | xargs)
  location=$(echo "$location" | xargs)
  
  if [ -z "$task_id" ] || [ -z "$location" ]; then
    continue
  fi
  
  COUNT=$((COUNT + 1))
  echo ""
  echo "[$COUNT] Geocoding: $location"
  
  # URL encode the location
  encoded_location=$(echo "$location" | jq -sRr @uri)
  
  # Call LocationIQ
  response=$(curl -s "https://us1.locationiq.com/v1/search?key=$LOCATIONIQ_KEY&q=$encoded_location&format=json&limit=1")
  
  # Extract lat/lng
  lat=$(echo "$response" | jq -r '.[0].lat // empty')
  lng=$(echo "$response" | jq -r '.[0].lon // empty')
  
  if [ -n "$lat" ] && [ -n "$lng" ]; then
    echo "   ✅ Found: $lat, $lng"
    
    # Update database
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
      UPDATE tasks SET lat = $lat, lng = $lng WHERE id = '$task_id';
    " > /dev/null 2>&1
    
    SUCCESS=$((SUCCESS + 1))
  else
    echo "   ❌ Failed to geocode"
    FAILED=$((FAILED + 1))
  fi
  
  # Rate limiting: 1 request per second to be safe
  sleep 1
done

echo ""
echo "=================================="
echo "✅ Geocoded: $SUCCESS tasks"
echo "❌ Failed: $FAILED tasks"
echo "Done!"

#!/bin/bash

echo "🌱 Running database seeder..."
echo ""

# Run the seed command
go run cmd/seed/main.go

echo ""
echo "✅ Seeding complete!"
echo ""
echo "📊 Check your database in TablePlus to see the data"
echo "   - 6 users (all with password: password123)"
echo "   - 6 tasks with descriptions and images"
echo "   - 10 offers"
echo "   - 6 offer replies/questions"
echo "   - 3 reviews"
echo "   - 5 notifications"

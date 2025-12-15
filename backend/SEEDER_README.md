# Database Seeder - Quick Reference

A comprehensive SQL seeder has been created to populate your database with realistic test data.

## 📁 Files Created

- `seed.sql` - SQL script with all test data
- `cmd/seed/main.go` - Go seeder (alternative method)
- `seed.sh` - Shell script runner

## 🚀 How to Run the Seeder

**Method 1: Using SQL (Recommended)**
```bash
cd /Users/taps/Development/play/backend
docker cp seed.sql backend-postgres-1:/tmp/seed.sql
docker exec backend-postgres-1 psql -U airmass -d airmass_db -f /tmp/seed.sql
```

**Method 2: Quick Command**
```bash
cd /Users/taps/Development/play/backend
docker exec backend-postgres-1 psql -U airmass -d airmass_db -c "$(cat seed.sql)"
```

## 📊 What Gets Created

✅ **6 Users** (all with password: `password123`)
- john.doe@example.com - Handyman
- sarah.wilson@example.com - Cleaner
- mike.brown@example.com - Electrician
- emma.davis@example.com - Plumber
- david.smith@example.com - Gardener
- lisa.johnson@example.com - Painter

✅ **6 Tasks** across different categories
- Plumbing (Fix leaking pipe)
- Painting (3 bedrooms)
- Electrical (Install ceiling fan)
- Cleaning (Deep clean house)
- Gardening (Lawn mowing)
- Carpentry (Assemble furniture)

✅ **8 Offers** on various tasks
- Multiple offers per task
- Realistic descriptions and pricing
- Different availability times

✅ **6 Task Images** - placeholder images for each task

✅ **3 Notifications** - Offer notifications and replies

## 🔑 Test Login Credentials

You can log in as any of these users:

| Email | Password | Role |
|-------|----------|------|
| john.doe@example.com | password123 | Handyman |
| sarah.wilson@example.com | password123 | Cleaner |
| mike.brown@example.com | password123 | Electrician |
| emma.davis@example.com | password123 | Plumber |
| david.smith@example.com | password123 | Gardener |
| lisa.johnson@example.com | password123 | Painter |

## 📍 View in TablePlus

After seeding, connect to your database and explore:
- **Users** table - 6 professionals
- **Tasks** table - 6 open tasks
- **Offers** table - 8 offers with varying prices
- **Task_images** table - Image URLs for tasks
- **Notifications** table - Sample notifications

## 🔄 Re-running the Seeder

The seeder **clears all existing data** before inserting new records. You can run it multiple times safely. It will:
1. Truncate all tables
2. Insert fresh test data
3. Update offer counts automatically

## ✅ Verification

Check if data was seeded successfully:
```sql
SELECT COUNT(*) as users FROM users;
SELECT COUNT(*) as tasks FROM tasks;
SELECT COUNT(*) as offers FROM offers;
```

Or via command line:
```bash
docker exec backend-postgres-1 psql -U airmass -d airmass_db -c "SELECT title, offer_count FROM tasks;"
```

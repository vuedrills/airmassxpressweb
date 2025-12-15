# PostgreSQL Password Setup Instructions

Your PostgreSQL requires password authentication. Follow these steps:

## Step 1: Find pg_hba.conf
```bash
brew --prefix postgresql
# Note the path, then:
ls $(brew --prefix postgresql)/share/postgresql*/pg_hba.conf
```

## Step 2: Edit pg_hba.conf
```bash
# Open with nano or your preferred editor
nano /opt/homebrew/share/postgresql@15/pg_hba.conf
# OR wherever the file is from Step 1

# Find lines like:
# local   all   all   md5
# OR
# local   all   all   scram-sha-256

# Change to:
# local   all   all   trust
```

## Step 3: Restart PostgreSQL
```bash
brew services restart postgresql
```

## Step 4: Set Password
```bash
psql postgres -c "ALTER USER taps WITH PASSWORD 'airmass123';"
```

## Step 5: Change back to password auth  
```bash
# Edit pg_hba.conf again, change "trust" back to "md5" or "scram-sha-256"
nano /opt/homebrew/share/postgresql@15/pg_hba.conf
brew services restart postgresql
```

## Step 6: Run Backend
```bash
cd /Users/taps/Development/play/backend
# .env already updated with DB_PASSWORD=airmass123
go run cmd/server/main.go
```

The backend will then start successfully!

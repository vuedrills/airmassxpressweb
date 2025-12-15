# AirMassXpress Backend API

Production-ready Golang backend for the task marketplace platform.

## Tech Stack

- **Go 1.21+** - Backend language
- **Gin** - Web framework  
- **PostgreSQL 15** - Database
- **Redis** - Caching and sessions
- **GORM** - ORM
- **JWT** - Authentication
- **Argon2** - Password hashing

## Quick Start

### Prerequisites

- Go 1.21+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose (optional)

### Option 1: Docker (Recommended)

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down
```

Backend will be available at `http://localhost:8080`

### Option 2: Local Development

1. **Install PostgreSQL and Redis**
   ```bash
   # macOS
   brew install postgresql@15 redis
   brew services start postgresql@15
   brew services start redis
   ```

2. **Create Database**
   ```bash
   createdb airmass_db
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Install Dependencies**
   ```bash
   go mod download
   ```

5. **Run Server**
   ```bash
   go run cmd/server/main.go
   ```

Server starts on `http://localhost:8080`

## API Endpoints

### Authentication
```
POST   /api/v1/auth/register     - Register new user
POST   /api/v1/auth/login        - Login
POST   /api/v1/auth/refresh      - Refresh token
GET    /api/v1/auth/me           - Get current user (auth required)
POST   /api/v1/auth/logout       - Logout (auth required)
```

### Tasks
```
GET    /api/v1/tasks             - List tasks (filters: category, status, location, sort)
GET    /api/v1/tasks/:id         - Get task details
POST   /api/v1/tasks             - Create task (auth required)
PATCH  /api/v1/tasks/:id         - Update task (auth required)
DELETE /api/v1/tasks/:id         - Delete task (auth required)
```

### Offers
```
POST   /api/v1/offers             - Create offer (auth required)
GET    /api/v1/offers/:id         - Get offer details (auth required)
PATCH  /api/v1/offers/:id         - Update offer (auth required)
DELETE /api/v1/offers/:id         - Withdraw offer (auth required)
POST   /api/v1/offers/:id/accept  - Accept offer (auth required, task owner only)
POST   /api/v1/offers/:id/replies - Add reply to offer (auth required)
GET    /api/v1/offers/:id/replies - Get offer replies (auth required)
```

### Users
```
GET    /api/v1/users/:id          - Get user profile
PATCH  /api/v1/users/:id          - Update user (auth required)
```

### Notifications
```
GET    /api/v1/notifications           - List notifications (auth required)
PATCH  /api/v1/notifications/:id/read  - Mark as read (auth required)
PATCH  /api/v1/notifications/read-all  - Mark all as read (auth required)
```

## Testing with cURL

### Register
```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "location": "Harare, Zimbabwe"
  }'
```

### Login
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Create Task (with auth token)
```bash
curl -X POST http://localhost:8080/api/v1/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "title": "Fix leaking pipe",
    "description": "Emergency plumbing needed",
    "category": "Plumbing",
    "budget": 100,
    "location": "Harare"
  }'
```

### List Tasks
```bash
curl http://localhost:8080/api/v1/tasks
```

## Project Structure

```
backend/
├── cmd/server/          - Application entry point
├── internal/
│   ├── api/
│   │   ├── handlers/    - HTTP request handlers
│   │   ├── middleware/  - Auth, CORS, etc.
│   │   └── router.go    - Route definitions
│   ├── models/          - Database models
│   ├── config/          - Configuration
│   └── utils/           - Helpers (JWT, password)
├── migrations/          - SQL migrations
├── docker-compose.yml
└── Dockerfile
```

## Environment Variables

See `.env.example` for all configuration options.

Key variables:
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` - Database config
- `JWT_SECRET` - Change in production!
- `ALLOWED_ORIGINS` - Frontend URL for CORS

## Database Migrations

Auto-migrations run on server start using GORM.

Manual migration:
```bash
psql -U airmass -d airmass_db -f migrations/001_initial_schema.sql
```

## Next Steps

1. ✅ Backend API is ready
2. ⏳ Connect frontend to backend
3. ⏳ Add WebSocket for real-time notifications
4. ⏳ Implement file upload service
5. ⏳ Deploy to production

## Support

For issues or questions, check the implementation plan at:
`/Users/taps/.gemini/antigravity/brain/270560a7-b73e-4d30-9dd3-1c42932d659c/implementation_plan.md`

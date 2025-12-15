# Frontend-Backend Integration Setup

## Quick Start

### 1. Create Environment File

Create `/web_app/.env.local` with:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:8080/api/v1/ws
```

### 2. Start the Backend

```bash
cd /Users/taps/Development/play/backend

# Option A: With Docker (recommended)
docker-compose up -d

# Option B: Without Docker (requires PostgreSQL + Redis)
go run cmd/server/main.go
```

Backend will run on `http://localhost:8080`

### 3. Start the Frontend

```bash
cd /Users/taps/Development/play/web_app
npm run dev
```

Frontend will run on `http://localhost:3000`

### 4. Test the Integration

1. **Register a new account:**
   - Go to http://localhost:3000
   - Click "Get Started" or "Log In"
   - Create a new account

2. **Login:**
   - Use your registered email/password
   - Or use any existing mock user email (integration will create account)

3. **Create a task:**
   - Click "Post a Task"
   - Fill out the form
   - Submit - this will call the real API!

4. **Browse tasks:**
   - Go to "Browse"
   - Filter/sort - calls real API
   - Click on a task to see details

## What Changed

✅ **API Client** (`lib/api/index.ts`)
   - Now calls real backend instead of mock JSON
   - JWT authentication with automatic token refresh
   - Token storage in localStorage

✅ **Store** (`store/useStore.ts`)
   - Logout clears JWT tokens

✅ **Endpoints Working:**
   - `POST /auth/register` - User registration
   - `POST /auth/login` - Login
   - `GET /auth/me` - Get current user
   - `GET /tasks` - List tasks (with filters)
   - `GET /tasks/:id` - Get task details  
   - `POST /tasks` - Create task
   - `POST /offers` - Create offer
   - `POST /offers/:id/accept` - Accept offer
   - `GET /users/:id` - User profiles
   - `GET /notifications` - List notifications

## Known Limitations

- **Messages**: Still using mock data (backend endpoint not implemented yet)
- **File Uploads**: Not implemented yet (avatars, task images)
- **Real-time Notifications**: WebSocket not implemented yet

## Troubleshooting

**Backend not running?**
```bash
cd backend
docker-compose up -d
# OR
go run cmd/server/main.go
```

**Can't connect to database?**
- Ensure PostgreSQL is running on port 5432
- Check `backend/.env` credentials

**CORS errors?**
- Backend CORS is configured for `http://localhost:3000`
- Check browser console for specific errors

**401 Unauthorized?**
- Login again to get fresh tokens
- Check localStorage for `access_token`

## Next Steps

1. Test creating tasks and offers end-to-end
2. Implement WebSocket for real-time notifications
3. Add file upload service
4. Deploy to production

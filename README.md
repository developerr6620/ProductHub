# ProductHub - Product Catalog Application

A full-stack product catalog application with Next.js frontend and Node.js/Express backend.

## � Tech Stack

- **Frontend:** Next.js 14, TypeScript, Redux Toolkit, RTK Query, SASS
- **Backend:** Node.js, Express, TypeScript, MongoDB, JWT
- **DevOps:** Docker, Docker Compose

---

## � Quick Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Docker)
- Docker (optional)

### Option 1: Using Docker (Recommended)

```bash
# Start all services
docker-compose up -d

# Seed database
docker-compose exec backend npm run seed
docker-compose exec backend npm run seed:admin
```

### Option 2: Manual Setup

```bash
# 1. Install dependencies
cd backend && npm install
cd ../frontend && npm install

# 2. Create backend/.env file
PORT=5000
MONGODB_URI=mongodb://localhost:27017/product_catalog
JWT_SECRET=your-secret-key

# 3. Create frontend/.env.local file
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# 4. Start MongoDB (if not running)
mongod

# 5. Seed database
cd backend
npm run seed
npm run seed:admin

# 6. Start servers (in separate terminals)
cd backend && npm run dev    # http://localhost:5000
cd frontend && npm run dev   # http://localhost:3000
```

---

## � Admin Login

| Field | Value |
|-------|-------|
| **URL** | http://localhost:3000/admin/login |
| **Email** | `admin@producthub.com` |
| **Password** | `admin123` |

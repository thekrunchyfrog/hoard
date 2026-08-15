# Hoard - Toy Collection App

A web application built with React, Express, and MariaDB for managing toy collections.

## Project Structure

```
hoard/
├── backend/          # Express API server
│   ├── src/
│   │   └── server.js
│   ├── Dockerfile
│   └── package.json
├── frontend/         # React application
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.html
│   ├── Dockerfile
│   └── package.json
└── docker-compose.yml
```

## Prerequisites

- Docker and Docker Compose installed
- MariaDB server running

## Running the App

### Using Docker Compose (Recommended)

```bash
cd /Users/rich/Repos/hoard
docker-compose up --build
```

This will:
1. Build both the frontend and backend Docker images
2. Start the backend server on port 5000
3. Start the React frontend on port 3000

### Development Mode (Separately)

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/collections` - Get all collections
- `GET /api/collections/:id/items` - Get items for a specific collection
- `POST /api/collections/:id/items` - Create a new item in a collection (admin only, requires `X-Admin-Token` header)
- `PUT /api/collections/:id/items/:itemId` - Update an item in a collection (admin only, requires `X-Admin-Token` header)

## Usage

1. Open your browser to `http://localhost:3000`
2. Select a collection from the dropdown on the landing page
3. View the items in that collection in the table below

## Admin Page

A basic admin UI lives at `http://localhost:3000/admin` for adding and
editing collection items.

1. Set `ADMIN_TOKEN` in `backend/.env` (see `backend/.env.example` -
   generate one with `openssl rand -hex 32`) and restart the backend.
2. Open `/admin` in the browser and enter that same token when prompted.
   It's stored in `sessionStorage` for the current tab/session only.
3. Pick a collection, then "Add New Item" or click "Edit" on a row.
   Form fields are generated from the same per-collection config used by
   the main table (`frontend/src/assets/config/*.json`).

Notes:
- Only collections with a config file registered in
  `frontend/src/admin/adminConfig.js` support add/edit for now
  (`lunchbox`, `skipper_fashion`). Adding a new collection there is a
  small, self-contained change.
- Write endpoints return `503` if `ADMIN_TOKEN` isn't set on the backend,
  and `401` if the token header is missing or wrong.
- This is a shared-secret token, not a full user/auth system - reasonable
  for a personal, localhost-first app, but don't expose the backend
  publicly without something stronger in front of it.

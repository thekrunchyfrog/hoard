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

## Usage

1. Open your browser to `http://localhost:3000`
2. Select a collection from the dropdown on the landing page
3. View the items in that collection in the table below

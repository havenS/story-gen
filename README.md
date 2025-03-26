# Story Generator

A full-stack application for generating stories, built with NestJS (backend) and Vite (frontend).

## Project Structure

```
.
├── backend/         # NestJS backend application
├── frontend/        # Vite frontend application
├── gen_api/         # API generation utilities
└── docker-compose.yml
```

## Prerequisites

- Node.js 22
- Docker and Docker Compose
- PostgreSQL 13 (if running locally)
- Conda

## Getting Started

### Using Docker (Recommended)

1. Clone the repository
2. Start the containers:
   ```bash
   docker-compose up -d
   ```
   This will start:
   - Backend service on port 3001
   - Frontend service on port 5173
   - PostgreSQL database on port 5431

### Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development servers:
   ```bash
   # Start both frontend and backend
   npm run dev
   
   # Or start them separately
   npm run frontend
   npm run backend
   ```

## Development Scripts

- `npm run dev`: Start both frontend and backend in development mode
- `npm run frontend`: Start only the frontend development server
- `npm run backend`: Start only the backend development server

## Environment Setup

The project uses Docker containers with the following configurations:

- Backend (NestJS):
  - Node.js 22
  - Port: 3001
  - Includes additional dependencies for Puppeteer and other utilities

- Frontend (Vite):
  - Node.js 22 (ARM64)
  - Port: 5173

- Database (PostgreSQL):
  - Version: 13
  - Port: 5431
  - Default credentials:
    - User: user
    - Password: password
    - Database: mydb

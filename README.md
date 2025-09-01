# Project Management System

A comprehensive full-stack project management web application built for IT companies.

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite (Build tool)
- Tailwind CSS (Styling)
- Shadcn/ui (UI Components)
- Zustand (State Management)

### Backend
- NestJS + TypeScript
- Prisma ORM
- PostgreSQL Database
- Passport.js (Authentication)
- JWT (Token-based Auth)
- class-validator (Validation)

## Project Structure

```
project-management/
├── frontend/          # React + TypeScript + Vite
├── backend/           # NestJS + TypeScript + Prisma
├── shared/            # Shared types and utilities
├── docs/              # Documentation
└── README.md
```

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Option 1: Docker (Recommended)

1. Clone the repository:
```bash
git clone <repository-url>
cd project-management
```

2. Start with Docker Compose:
```bash
# For development
docker-compose -f docker-compose.dev.yml up

# For production
docker-compose up
```

3. Access the applications:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Documentation: http://localhost:3001/api/docs

### Option 2: Manual Setup

1. Clone and install dependencies:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

2. Configure environment variables:
```bash
# Backend (.env)
cd backend
cp .env.example .env
# Edit .env with your database credentials

# Frontend (.env)
cd ../frontend
cp .env.example .env
```

3. Set up the database:
```bash
cd backend
npx prisma migrate dev
npx prisma generate
npx prisma db seed
```

4. Start the development servers:
```bash
# Terminal 1 - Backend (Port 3001)
cd backend
npm run start:dev

# Terminal 2 - Frontend (Port 3000)
cd frontend
npm run dev
```

### Demo Accounts

- **Admin**: admin@intersmart.com / password123
- **Project Manager**: pm@intersmart.com / password123
- **Developer**: arjun@intersmart.com / password123
- **Designer**: designer@intersmart.com / password123
- **Client**: client@example.com / password123

## Features

- 🔐 JWT Authentication with role-based access
- 📊 Project dashboard with analytics
- 📋 Task management with Kanban board
- 👥 Team management and assignments
- 💬 Comments and collaboration
- 📈 Progress tracking and reporting
- 📱 Responsive design
- 🔄 Real-time updates

## Database Schema

The system includes the following entities:
- Users (with roles: Admin, Project Manager, Developer, Designer, Client)
- Projects (with categories, status tracking, custom fields)
- Tasks (with priorities, assignments, dependencies)
- Comments (for projects and tasks)
- Custom Fields (flexible project metadata)

## API Documentation

Once the backend is running, visit `http://localhost:3001/api/docs` for Swagger documentation.

## License

Private - Intersmart Office Management System
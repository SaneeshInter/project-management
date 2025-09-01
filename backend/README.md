# Project Management Backend

NestJS-based REST API for the project management system.

## Tech Stack

- **NestJS** - Node.js framework
- **TypeScript** - Type safety
- **Prisma** - Database ORM
- **PostgreSQL** - Database
- **Passport.js** - Authentication
- **JWT** - Token-based auth
- **Swagger** - API documentation

## Features

- 🔐 JWT Authentication with role-based access control
- 📊 Complete CRUD operations for Projects, Tasks, Users, Comments
- 🔒 Role-based permissions (Admin, Project Manager, Developer, Designer, Client)
- 📝 Input validation with class-validator
- 📚 Auto-generated API documentation with Swagger
- 🎯 Custom fields for projects
- 💬 Comment system for projects and tasks

## Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Configure your `.env` file:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/project_management"
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
```

4. Run database migrations:
```bash
npx prisma migrate dev
```

5. Generate Prisma client:
```bash
npx prisma generate
```

6. Seed the database:
```bash
npm run db:seed
```

### Development

Start the development server:
```bash
npm run start:dev
```

The API will be available at http://localhost:3001

### API Documentation

Visit http://localhost:3001/api/docs for Swagger documentation.

## Database Schema

### Users
- Roles: Admin, Project Manager, Developer, Designer, Client
- Authentication with JWT tokens
- Profile management

### Projects
- Full project lifecycle management
- Custom fields support
- Status tracking (Active, Hold, Completed, Cancelled)
- Categories (Mobile App, React/Node.js, PHP, etc.)
- Owner assignment and client information

### Tasks
- Task assignment and priority management
- Status tracking (Todo, In Progress, In Review, Done)
- Due date management
- Project association

### Comments
- Comments on projects and tasks
- Author tracking
- Threaded discussions

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project by ID
- `PATCH /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/custom-fields` - Add custom field

### Tasks
- `GET /api/tasks` - Get all tasks (with filters)
- `POST /api/tasks` - Create task
- `GET /api/tasks/:id` - Get task by ID
- `PATCH /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Comments
- `GET /api/comments` - Get all comments (with filters)
- `POST /api/comments` - Create comment
- `GET /api/comments/:id` - Get comment by ID
- `PATCH /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment

## Sample Data

The seed script creates sample users with the following credentials:

- **Admin**: admin@intersmart.com / password123
- **Project Manager**: pm@intersmart.com / password123
- **Developer**: arjun@intersmart.com / password123
- **Designer**: designer@intersmart.com / password123
- **Client**: client@example.com / password123

Sample projects include:
- Room App (Mobile App, Dubai)
- Shayan Royal (React/Node.js, Dubai)
- Rastena General Trading (Advanced PHP, Abu Dhabi)
- NextJS E-commerce Platform (Next.js, Dubai)

## Security Features

- JWT token authentication
- Role-based access control
- Input validation and sanitization
- CORS configuration
- Rate limiting
- Password hashing with bcrypt

## Scripts

- `npm run start` - Start production server
- `npm run start:dev` - Start development server with watch mode
- `npm run build` - Build the application
- `npm run lint` - Lint the code
- `npm run test` - Run tests
- `npm run db:migrate` - Run database migrations
- `npm run db:generate` - Generate Prisma client
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio

## Production Deployment

1. Build the application:
```bash
npm run build
```

2. Run migrations:
```bash
npx prisma migrate deploy
```

3. Start the server:
```bash
npm run start:prod
```

## Docker

Build and run with Docker:
```bash
docker build -t pm-backend .
docker run -p 3001:3001 pm-backend
```

Or use Docker Compose:
```bash
docker-compose up backend
```
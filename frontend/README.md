# Project Management Frontend

React-based frontend application for the project management system.

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - UI component library
- **Zustand** - State management
- **React Router** - Client-side routing
- **React Hook Form** - Form management
- **Axios** - HTTP client

## Features

- 🔐 Authentication with JWT tokens
- 📊 Interactive dashboard with project statistics
- 📋 Project management with filtering and search
- ✅ Task management and assignment
- 👥 User management and role-based access
- 📱 Fully responsive design
- 🎨 Modern UI with Tailwind CSS and Shadcn/ui
- 🔄 Real-time state management with Zustand
- 📝 Form validation with React Hook Form and Zod

## Setup

### Prerequisites
- Node.js 18+
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
VITE_API_URL=http://localhost:3001/api
```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at http://localhost:3000

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI components (Button, Input, etc.)
│   ├── layout/         # Layout components (Sidebar, Header)
│   └── projects/       # Project-specific components
├── pages/              # Page components
├── stores/             # Zustand state stores
├── lib/                # Utilities and API client
├── types/              # TypeScript type definitions
└── hooks/              # Custom React hooks
```

## Key Components

### Authentication
- Login and registration pages
- Protected route wrapper
- JWT token management
- Role-based access control

### Dashboard
- Project statistics and overview
- Recent projects and tasks
- Quick actions and navigation

### Projects
- Project listing with search and filters
- Project creation modal
- Project detail view with tasks and comments
- Status and category management

### Tasks
- Task assignment and management
- Priority and status tracking
- Due date management
- Project association

### Users
- User listing and management
- Role assignment
- User profile display

## State Management

The application uses Zustand for state management with the following stores:

- **Auth Store**: User authentication state
- **Projects Store**: Project data and operations
- **Tasks Store**: Task data and operations

## API Integration

The frontend communicates with the backend through a centralized API client (`lib/api.ts`) that handles:

- HTTP requests with Axios
- Authentication token management
- Error handling and response interceptors
- Type-safe API calls

## UI Components

Built with Shadcn/ui and Tailwind CSS:

- Consistent design system
- Accessible components
- Dark mode support
- Responsive layouts
- Loading states and animations

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint the code

## Environment Variables

- `VITE_API_URL` - Backend API URL (default: http://localhost:3001/api)

## Authentication Flow

1. User logs in with email and password
2. Backend returns JWT token and user data
3. Token is stored in localStorage and Zustand store
4. All subsequent API requests include the token
5. Protected routes check authentication status
6. Automatic logout on token expiration

## Sample Users

Use these credentials to test the application:

- **Admin**: admin@intersmart.com / password123
- **Project Manager**: pm@intersmart.com / password123
- **Developer**: arjun@intersmart.com / password123
- **Designer**: designer@intersmart.com / password123
- **Client**: client@example.com / password123

## Production Build

1. Build the application:
```bash
npm run build
```

2. The `dist/` folder contains the production-ready files

## Docker

Build and run with Docker:
```bash
docker build -t pm-frontend .
docker run -p 3000:80 pm-frontend
```

Or use Docker Compose:
```bash
docker-compose up frontend
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Follow the existing code style
2. Use TypeScript for type safety
3. Write meaningful commit messages
4. Test your changes thoroughly
5. Ensure responsive design works on all screen sizes
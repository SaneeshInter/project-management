# 🚀 Quick Start Guide

Get the Project Management System running in minutes!

## Option 1: One-Command Start (Recommended)

```bash
# Clone and start with Docker (recommended)
./start.sh docker-dev

# Or choose interactively
./start.sh
```

## Option 2: First-Time Setup

```bash
# Run initial setup
./scripts/setup.sh

# Then start the project
./start.sh docker-dev
```

## Available Scripts

### Main Scripts
- `./start.sh` - Interactive menu to start the project
- `./start.sh docker-dev` - Start with Docker (development mode)
- `./start.sh docker` - Start with Docker (production mode)  
- `./start.sh manual` - Start manually (requires Node.js + PostgreSQL)

### Setup & Maintenance
- `./scripts/setup.sh` - Initial project setup
- `./scripts/reset.sh` - Reset project to clean state

### NPM Scripts (from root)
- `npm run start` - Same as `./start.sh`
- `npm run setup` - Run setup script
- `npm run docker:dev` - Docker development mode
- `npm run docker:up` - Docker production mode
- `npm run install:all` - Install all dependencies
- `npm run build:all` - Build all packages

## Access Points

Once running, access:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api/docs

## Demo Accounts

- **Admin**: admin@intersmart.com / password123
- **Project Manager**: pm@intersmart.com / password123  
- **Developer**: arjun@intersmart.com / password123
- **Designer**: designer@intersmart.com / password123
- **Client**: client@example.com / password123

## System Requirements

### Docker Mode (Recommended)
- Docker & Docker Compose
- 4GB RAM minimum

### Manual Mode  
- Node.js 18+
- PostgreSQL 14+
- 8GB RAM recommended

## Troubleshooting

### Common Issues

1. **Permission denied on scripts**:
```bash
chmod +x start.sh
chmod +x scripts/*.sh
```

2. **Docker not running**:
```bash
# Start Docker Desktop or daemon
sudo systemctl start docker  # Linux
```

3. **Port conflicts**:
```bash
# Stop conflicting services
sudo lsof -i :3000  # Find what's using port 3000
sudo lsof -i :3001  # Find what's using port 3001
```

4. **Database connection issues**:
```bash
# Reset database
./scripts/reset.sh
./scripts/setup.sh
```

### Get Help

```bash
./start.sh help           # Show all options
./scripts/setup.sh --help # Setup help
```

## File Structure

```
project-management/
├── start.sh              # Main start script
├── start.bat             # Windows start script
├── scripts/
│   ├── setup.sh          # Initial setup
│   └── reset.sh          # Reset project
├── backend/              # NestJS API
├── frontend/             # React app
├── shared/               # Shared types
└── docs/                 # Documentation
```

## Next Steps

1. **Customize**: Edit environment files in `backend/.env` and `frontend/.env`
2. **Develop**: Start coding! The system supports hot reload
3. **Deploy**: Use `./start.sh docker` for production
4. **Learn**: Check `/docs` for detailed documentation

---

**Need help?** Check the full documentation in the `/docs` folder or run `./start.sh help`
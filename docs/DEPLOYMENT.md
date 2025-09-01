# Deployment Guide

This guide covers deploying the Project Management System to production environments.

## Docker Deployment (Recommended)

### Prerequisites
- Docker and Docker Compose installed
- PostgreSQL database (can use included Docker service)

### Quick Deployment

1. Clone the repository:
```bash
git clone <repository-url>
cd project-management
```

2. Create production environment files:
```bash
# Backend environment
cp backend/.env.example backend/.env

# Frontend environment  
cp frontend/.env.example frontend/.env
```

3. Configure production environment variables:

**backend/.env**:
```env
DATABASE_URL="postgresql://postgres:your-secure-password@postgres:5432/project_management"
JWT_SECRET="your-super-secure-jwt-secret-here"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV="production"
FRONTEND_URL="https://your-domain.com"
```

**frontend/.env**:
```env
VITE_API_URL=https://your-api-domain.com/api
```

4. Deploy with Docker Compose:
```bash
docker-compose up -d
```

5. Check logs:
```bash
docker-compose logs -f
```

### Custom Docker Network

For advanced setups with reverse proxy:

```bash
# Create custom network
docker network create project-management-network

# Deploy with custom network
docker-compose up -d
```

## Manual Deployment

### Backend Deployment

1. **Prepare the server**:
```bash
# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt-get install postgresql postgresql-contrib
```

2. **Setup the application**:
```bash
# Clone and install
git clone <repository-url>
cd project-management/backend
npm ci --only=production

# Generate Prisma client
npx prisma generate
```

3. **Configure environment**:
```bash
cp .env.example .env
# Edit .env with production values
```

4. **Setup database**:
```bash
npx prisma migrate deploy
npx prisma db seed
```

5. **Build and start**:
```bash
npm run build
npm run start:prod
```

### Frontend Deployment

1. **Build the application**:
```bash
cd frontend
npm ci
npm run build
```

2. **Serve with Nginx**:

Create `/etc/nginx/sites-available/project-management`:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/project-management/frontend/dist;
    index index.html;

    # Handle client-side routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, no-transform";
    }
}
```

3. **Enable the site**:
```bash
sudo ln -s /etc/nginx/sites-available/project-management /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Process Management

### Using PM2 (Recommended)

1. **Install PM2**:
```bash
npm install -g pm2
```

2. **Create PM2 configuration** (`ecosystem.config.js`):
```javascript
module.exports = {
  apps: [
    {
      name: 'project-management-api',
      script: 'dist/main.js',
      cwd: '/path/to/project-management/backend',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
    }
  ]
};
```

3. **Start with PM2**:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Using systemd

1. **Create service file** (`/etc/systemd/system/project-management-api.service`):
```ini
[Unit]
Description=Project Management API
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/project-management/backend
ExecStart=/usr/bin/node dist/main.js
Restart=on-failure
Environment=NODE_ENV=production
Environment=PORT=3001

[Install]
WantedBy=multi-user.target
```

2. **Enable and start**:
```bash
sudo systemctl enable project-management-api
sudo systemctl start project-management-api
sudo systemctl status project-management-api
```

## SSL/HTTPS Setup

### Using Certbot (Let's Encrypt)

1. **Install Certbot**:
```bash
sudo apt install certbot python3-certbot-nginx
```

2. **Obtain certificate**:
```bash
sudo certbot --nginx -d your-domain.com
```

3. **Auto-renewal**:
```bash
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Database Backup

### Automated Backup Script

Create `/opt/backup-db.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/opt/backups"
DB_NAME="project_management"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
pg_dump $DB_NAME > $BACKUP_DIR/db_backup_$DATE.sql
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
```

Make executable and add to cron:
```bash
sudo chmod +x /opt/backup-db.sh
sudo crontab -e
# Add: 0 2 * * * /opt/backup-db.sh
```

## Monitoring

### Health Check Endpoints

The API provides health check endpoints:
- `GET /api/health` - Basic health check
- `GET /api/health/database` - Database connectivity check

### Log Management

1. **Application Logs**:
```bash
# PM2 logs
pm2 logs

# Direct logs
tail -f backend/logs/combined.log
```

2. **Nginx Logs**:
```bash
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

3. **System Logs**:
```bash
journalctl -u project-management-api -f
```

## Environment-Specific Configuration

### Staging Environment
```bash
# Use staging database
DATABASE_URL="postgresql://user:pass@staging-db:5432/project_management_staging"
NODE_ENV="staging"
FRONTEND_URL="https://staging.your-domain.com"
```

### Production Environment
```bash
# Use production database with connection pooling
DATABASE_URL="postgresql://user:pass@prod-db:5432/project_management?connection_limit=20"
NODE_ENV="production"
FRONTEND_URL="https://your-domain.com"
```

## Security Checklist

- [ ] Use strong JWT secrets
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Use environment variables for secrets
- [ ] Regular database backups
- [ ] Monitor application logs
- [ ] Update dependencies regularly
- [ ] Use strong database passwords
- [ ] Configure firewall rules
- [ ] Enable fail2ban for SSH protection
- [ ] Regular security updates

## Troubleshooting

### Common Issues

1. **Database Connection Failed**:
   - Check DATABASE_URL format
   - Verify PostgreSQL is running
   - Check network connectivity

2. **JWT Token Issues**:
   - Verify JWT_SECRET is set
   - Check token expiration time
   - Validate token format

3. **CORS Errors**:
   - Update FRONTEND_URL in backend .env
   - Check nginx proxy configuration
   - Verify domain configuration

4. **Build Failures**:
   - Clear node_modules and reinstall
   - Check Node.js version compatibility
   - Verify all environment variables

### Log Analysis

```bash
# Check API errors
grep "ERROR" backend/logs/combined.log

# Check failed requests
grep "40[0-9]" /var/log/nginx/access.log

# Monitor real-time logs
tail -f backend/logs/combined.log | grep ERROR
```
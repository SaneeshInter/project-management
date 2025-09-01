#!/bin/bash

# Database Setup Script
# Creates the database if it doesn't exist

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Database configuration from your settings
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="project_management"
DB_USER="postgres"
DB_PASS="root"

print_status "🗄️  Setting up PostgreSQL database..."

# Check if PostgreSQL is running
if ! pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER &>/dev/null; then
    print_error "PostgreSQL is not running or not accessible"
    print_error "Please make sure PostgreSQL is running on $DB_HOST:$DB_PORT"
    echo ""
    echo "To start PostgreSQL:"
    echo "  macOS (Homebrew): brew services start postgresql"
    echo "  Linux: sudo systemctl start postgresql"
    echo "  Windows: Start PostgreSQL service from Services panel"
    exit 1
fi

print_status "✅ PostgreSQL is running"

# Check if database exists
if PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
    print_status "✅ Database '$DB_NAME' already exists"
else
    print_status "Creating database '$DB_NAME'..."
    if PGPASSWORD=$DB_PASS createdb -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME; then
        print_status "✅ Database '$DB_NAME' created successfully"
    else
        print_error "Failed to create database '$DB_NAME'"
        print_error "Make sure the PostgreSQL user '$DB_USER' has CREATE DATABASE privileges"
        exit 1
    fi
fi

# Test database connection
print_status "Testing database connection..."
if PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT version();" &>/dev/null; then
    print_status "✅ Database connection successful"
    echo ""
    print_status "🎉 Database setup completed!"
    echo ""
    echo "Database Details:"
    echo "  Host: $DB_HOST"
    echo "  Port: $DB_PORT"
    echo "  Database: $DB_NAME"
    echo "  Username: $DB_USER"
    echo ""
    echo "You can now run:"
    echo "  cd backend && npx prisma migrate dev"
    echo "  ./start.sh manual"
else
    print_error "Failed to connect to database"
    exit 1
fi
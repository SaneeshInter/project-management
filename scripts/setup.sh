#!/bin/bash

# Project Management System - Initial Setup Script
# This script sets up the project for the first time

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  Project Setup Script${NC}"
    echo -e "${BLUE}================================${NC}"
    echo ""
}

# Function to check system requirements
check_requirements() {
    print_status "Checking system requirements..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d 'v' -f 2 | cut -d '.' -f 1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node --version)"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed."
        exit 1
    fi
    
    # Check PostgreSQL (optional for Docker setup)
    if command -v psql &> /dev/null; then
        print_status "PostgreSQL found: $(psql --version)"
    else
        print_warning "PostgreSQL not found. Make sure you have PostgreSQL 14+ or use Docker."
    fi
    
    print_status "✅ Requirements check completed"
}

# Function to setup environment files
setup_env_files() {
    print_status "Setting up environment files..."
    
    # Backend .env
    if [ ! -f "backend/.env" ]; then
        print_status "Creating backend .env file..."
        cp backend/.env.example backend/.env
        
        # Generate a random JWT secret
        JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "your-super-secret-jwt-key-$(date +%s)")
        
        # Update the .env file with generated secret
        if command -v sed &> /dev/null; then
            sed -i.bak "s/your-super-secret-jwt-key-here/$JWT_SECRET/g" backend/.env
            rm backend/.env.bak 2>/dev/null || true
        fi
        
        print_warning "Backend .env created. Please review and update database settings if needed."
    else
        print_status "Backend .env already exists."
    fi
    
    # Frontend .env
    if [ ! -f "frontend/.env" ]; then
        print_status "Creating frontend .env file..."
        cp frontend/.env.example frontend/.env
        print_status "Frontend .env created."
    else
        print_status "Frontend .env already exists."
    fi
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing project dependencies..."
    
    # Backend dependencies
    print_status "Installing backend dependencies..."
    cd backend
    npm install
    print_status "✅ Backend dependencies installed"
    
    # Frontend dependencies
    cd ../frontend
    print_status "Installing frontend dependencies..."
    npm install
    print_status "✅ Frontend dependencies installed"
    
    cd ..
}

# Function to setup database
setup_database() {
    print_status "Setting up database..."
    cd backend
    
    # Generate Prisma client
    print_status "Generating Prisma client..."
    npx prisma generate
    
    # Run migrations
    print_status "Running database migrations..."
    if npx prisma migrate dev --name init; then
        print_status "✅ Database migrations completed"
    else
        print_warning "Migration failed. You may need to set up PostgreSQL first."
        print_warning "For Docker setup, run: ./start.sh docker-dev"
        return 1
    fi
    
    # Seed database
    print_status "Seeding database with sample data..."
    if npm run db:seed; then
        print_status "✅ Database seeded successfully"
    else
        print_warning "Database seeding failed. You can run it later with: npm run db:seed"
    fi
    
    cd ..
}

# Function to verify setup
verify_setup() {
    print_status "Verifying setup..."
    
    # Check if files exist
    local files=(
        "backend/.env"
        "frontend/.env"
        "backend/node_modules"
        "frontend/node_modules"
        "backend/prisma/schema.prisma"
    )
    
    for file in "${files[@]}"; do
        if [ -e "$file" ]; then
            print_status "✅ $file exists"
        else
            print_error "❌ $file missing"
        fi
    done
}

# Main setup function
main() {
    print_header
    
    check_requirements
    echo ""
    
    setup_env_files
    echo ""
    
    install_dependencies
    echo ""
    
    if setup_database; then
        echo ""
        verify_setup
        echo ""
        
        print_status "🎉 Setup completed successfully!"
        echo ""
        echo -e "${GREEN}Next steps:${NC}"
        echo "1. Review and update environment files if needed:"
        echo "   - backend/.env (database settings)"
        echo "   - frontend/.env (API URL)"
        echo ""
        echo "2. Start the development servers:"
        echo "   ./start.sh docker-dev    # With Docker (recommended)"
        echo "   ./start.sh manual        # Manual startup"
        echo ""
        echo "3. Access the application:"
        echo "   - Frontend: http://localhost:3000"
        echo "   - Backend API: http://localhost:3001"
        echo "   - API Docs: http://localhost:3001/api/docs"
        echo ""
        echo -e "${GREEN}Demo accounts:${NC}"
        echo "  Admin: admin@intersmart.com / password123"
        echo "  PM: pm@intersmart.com / password123"
        echo "  Developer: arjun@intersmart.com / password123"
        echo "  Client: client@example.com / password123"
    else
        echo ""
        print_warning "Setup completed with warnings."
        print_warning "Database setup failed. You can:"
        print_warning "1. Use Docker: ./start.sh docker-dev"
        print_warning "2. Install PostgreSQL and run this script again"
        print_warning "3. Manually set up the database later"
    fi
}

# Check if running from correct directory
if [ ! -f "package.json" ] && [ ! -f "backend/package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Run main function
main
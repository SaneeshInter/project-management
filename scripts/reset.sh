#!/bin/bash

# Project Management System - Reset Script
# This script resets the project to initial state

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
    echo -e "${BLUE}  Project Reset Script${NC}"
    echo -e "${BLUE}================================${NC}"
    echo ""
}

# Function to confirm action
confirm_reset() {
    echo -e "${YELLOW}WARNING: This will:${NC}"
    echo "  - Delete all node_modules folders"
    echo "  - Remove build/dist folders"
    echo "  - Reset database (drop and recreate)"
    echo "  - Keep environment files"
    echo ""
    
    read -p "Are you sure you want to reset the project? (y/N): " confirm
    if [[ $confirm != [yY] && $confirm != [yY][eE][sS] ]]; then
        print_status "Reset cancelled."
        exit 0
    fi
}

# Function to stop running services
stop_services() {
    print_status "Stopping running services..."
    
    # Stop Docker containers if running
    if command -v docker-compose &> /dev/null; then
        docker-compose down 2>/dev/null || true
        docker-compose -f docker-compose.dev.yml down 2>/dev/null || true
    fi
    
    # Stop Node.js processes (be careful with this)
    if command -v pkill &> /dev/null; then
        pkill -f "npm run start:dev" 2>/dev/null || true
        pkill -f "npm run dev" 2>/dev/null || true
    fi
    
    print_status "✅ Services stopped"
}

# Function to clean dependencies
clean_dependencies() {
    print_status "Cleaning dependencies..."
    
    # Remove node_modules
    if [ -d "backend/node_modules" ]; then
        print_status "Removing backend/node_modules..."
        rm -rf backend/node_modules
    fi
    
    if [ -d "frontend/node_modules" ]; then
        print_status "Removing frontend/node_modules..."
        rm -rf frontend/node_modules
    fi
    
    # Remove package-lock files
    rm -f backend/package-lock.json
    rm -f frontend/package-lock.json
    
    print_status "✅ Dependencies cleaned"
}

# Function to clean build files
clean_builds() {
    print_status "Cleaning build files..."
    
    # Remove backend build
    if [ -d "backend/dist" ]; then
        print_status "Removing backend/dist..."
        rm -rf backend/dist
    fi
    
    # Remove frontend build
    if [ -d "frontend/dist" ]; then
        print_status "Removing frontend/dist..."
        rm -rf frontend/dist
    fi
    
    # Remove logs
    if [ -d "backend/logs" ]; then
        print_status "Removing backend/logs..."
        rm -rf backend/logs
    fi
    
    print_status "✅ Build files cleaned"
}

# Function to reset database
reset_database() {
    print_status "Resetting database..."
    
    if [ -f "backend/.env" ]; then
        cd backend
        
        # Reset Prisma
        if [ -d "prisma/migrations" ]; then
            print_status "Removing existing migrations..."
            rm -rf prisma/migrations
        fi
        
        # Try to reset database
        print_status "Resetting database schema..."
        npx prisma migrate reset --force 2>/dev/null || {
            print_warning "Database reset failed. This is normal if database doesn't exist yet."
        }
        
        cd ..
        print_status "✅ Database reset completed"
    else
        print_warning "Backend .env not found. Skipping database reset."
    fi
}

# Function to clean Docker
clean_docker() {
    if command -v docker &> /dev/null; then
        print_status "Cleaning Docker resources..."
        
        # Remove project containers
        docker-compose down --volumes --remove-orphans 2>/dev/null || true
        docker-compose -f docker-compose.dev.yml down --volumes --remove-orphans 2>/dev/null || true
        
        # Remove project images
        docker images | grep "project-management\|pm-" | awk '{print $3}' | xargs -r docker rmi 2>/dev/null || true
        
        # Clean up unused volumes (optional)
        read -p "Do you want to remove Docker volumes? This will delete database data (y/N): " cleanup_volumes
        if [[ $cleanup_volumes == [yY] || $cleanup_volumes == [yY][eE][sS] ]]; then
            docker volume prune -f
        fi
        
        print_status "✅ Docker resources cleaned"
    fi
}

# Function to reinstall dependencies
reinstall_dependencies() {
    read -p "Do you want to reinstall dependencies now? (y/N): " reinstall
    if [[ $reinstall == [yY] || $reinstall == [yY][eE][sS] ]]; then
        print_status "Reinstalling dependencies..."
        
        # Backend
        cd backend
        npm install
        cd ../frontend
        npm install
        cd ..
        
        print_status "✅ Dependencies reinstalled"
    fi
}

# Main reset function
main() {
    print_header
    
    confirm_reset
    echo ""
    
    stop_services
    echo ""
    
    clean_dependencies
    echo ""
    
    clean_builds
    echo ""
    
    reset_database
    echo ""
    
    read -p "Do you want to clean Docker resources too? (y/N): " clean_docker_prompt
    if [[ $clean_docker_prompt == [yY] || $clean_docker_prompt == [yY][eE][sS] ]]; then
        clean_docker
        echo ""
    fi
    
    reinstall_dependencies
    echo ""
    
    print_status "🎉 Project reset completed!"
    echo ""
    echo -e "${GREEN}Next steps:${NC}"
    echo "1. Run setup script: ./scripts/setup.sh"
    echo "2. Or start directly: ./start.sh docker-dev"
    echo ""
    echo "Note: Your environment files (.env) were preserved."
}

# Check if running from correct directory
if [ ! -f "backend/package.json" ] && [ ! -f "frontend/package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Run main function
main
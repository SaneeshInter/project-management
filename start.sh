#!/bin/bash

# Project Management System - Start Script
# This script provides options to start the project in different modes

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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
    echo -e "${BLUE}  Project Management System${NC}"
    echo -e "${BLUE}================================${NC}"
    echo ""
}

# Function to check if Docker is installed and running
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
}

# Function to check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d 'v' -f 2 | cut -d '.' -f 1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node --version)"
        exit 1
    fi
}

# Function to start with Docker
start_docker() {
    print_status "Starting with Docker..."
    check_docker
    
    if [ "$1" = "dev" ]; then
        print_status "Starting in development mode..."
        docker-compose -f docker-compose.dev.yml up --build
    else
        print_status "Starting in production mode..."
        docker-compose up --build
    fi
}

# Function to start manually
start_manual() {
    print_status "Starting manually..."
    check_node
    
    # Check if .env files exist
    if [ ! -f "backend/.env" ]; then
        print_warning "Backend .env file not found. Creating from example..."
        cp backend/.env.example backend/.env
        print_warning "Please edit backend/.env with your database configuration"
    fi
    
    if [ ! -f "frontend/.env" ]; then
        print_warning "Frontend .env file not found. Creating from example..."
        cp frontend/.env.example frontend/.env
    fi
    
    # Install dependencies
    print_status "Installing backend dependencies..."
    cd backend
    npm install
    
    # Setup database
    print_status "Setting up database..."
    if ! npx prisma migrate deploy --preview-feature &> /dev/null; then
        print_status "Running database migrations..."
        npx prisma migrate dev
    fi
    
    print_status "Generating Prisma client..."
    npx prisma generate
    
    print_status "Seeding database..."
    npm run db:seed
    
    # Start backend
    print_status "Starting backend server..."
    npm run start:dev &
    BACKEND_PID=$!
    
    cd ../frontend
    print_status "Installing frontend dependencies..."
    npm install
    
    # Start frontend
    print_status "Starting frontend server..."
    npm run dev &
    FRONTEND_PID=$!
    
    # Wait for servers to start
    sleep 5
    
    print_status "✅ Services started successfully!"
    echo ""
    echo -e "${GREEN}Frontend:${NC} http://localhost:3000"
    echo -e "${GREEN}Backend API:${NC} http://localhost:3001"
    echo -e "${GREEN}API Docs:${NC} http://localhost:3001/api/docs"
    echo ""
    print_status "Demo accounts:"
    echo "  Admin: admin@intersmart.com / password123"
    echo "  PM: pm@intersmart.com / password123"
    echo "  Developer: arjun@intersmart.com / password123"
    echo "  Client: client@example.com / password123"
    echo ""
    print_status "Press Ctrl+C to stop all services"
    
    # Function to handle script termination
    cleanup() {
        print_status "Stopping services..."
        kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
        exit 0
    }
    
    trap cleanup INT
    wait
}

# Function to show help
show_help() {
    print_header
    echo "Usage: ./start.sh [option]"
    echo ""
    echo "Options:"
    echo "  docker-dev    Start with Docker in development mode"
    echo "  docker        Start with Docker in production mode"
    echo "  manual        Start manually (requires Node.js 18+)"
    echo "  help          Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./start.sh docker-dev    # Recommended for development"
    echo "  ./start.sh docker        # For production"
    echo "  ./start.sh manual        # Manual setup"
    echo ""
    echo "Requirements:"
    echo "  Docker mode: Docker & Docker Compose"
    echo "  Manual mode: Node.js 18+, PostgreSQL 14+"
}

# Main script logic
print_header

case "${1:-}" in
    "docker-dev")
        start_docker "dev"
        ;;
    "docker")
        start_docker "prod"
        ;;
    "manual")
        start_manual
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    "")
        echo "Choose how to start the project:"
        echo ""
        echo "1) Docker Development (Recommended)"
        echo "2) Docker Production"
        echo "3) Manual Setup"
        echo "4) Show Help"
        echo ""
        read -p "Enter your choice (1-4): " choice
        
        case $choice in
            1) start_docker "dev" ;;
            2) start_docker "prod" ;;
            3) start_manual ;;
            4) show_help ;;
            *) print_error "Invalid choice. Use './start.sh help' for options." ;;
        esac
        ;;
    *)
        print_error "Unknown option: $1"
        echo "Use './start.sh help' for available options."
        exit 1
        ;;
esac
#!/bin/bash

# Quick Fix Script for Package Installation Issues

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

print_status "🔧 Fixing package installation issues..."

# Clean up any existing node_modules and lock files
print_status "Cleaning up existing installations..."

if [ -d "frontend/node_modules" ]; then
    rm -rf frontend/node_modules
fi

if [ -d "backend/node_modules" ]; then
    rm -rf backend/node_modules
fi

rm -f frontend/package-lock.json
rm -f backend/package-lock.json

# Install backend first (it's cleaner)
print_status "Installing backend dependencies..."
cd backend

if npm install; then
    print_status "✅ Backend dependencies installed successfully"
else
    print_error "Failed to install backend dependencies"
    exit 1
fi

cd ../frontend

print_status "Installing frontend dependencies..."
if npm install; then
    print_status "✅ Frontend dependencies installed successfully"
else
    print_warning "Some frontend packages failed. Trying with --legacy-peer-deps..."
    if npm install --legacy-peer-deps; then
        print_status "✅ Frontend dependencies installed with legacy peer deps"
    else
        print_error "Frontend installation failed"
        exit 1
    fi
fi

cd ..

print_status "🎉 Package installation fixed!"
echo ""
echo "Now you can run:"
echo "  ./start.sh manual    # To start manually"
echo "  ./start.sh docker    # To use Docker (if installed)"
echo ""
echo "Or run the setup to continue:"
echo "  ./scripts/setup.sh"
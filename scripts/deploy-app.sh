#!/bin/bash

# FinTrack Pro - Application Deployment Script
# Run this after server setup

set -e

echo "🚀 FinTrack Pro - Application Deployment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in FinTrack Pro directory"
    echo "Please run this script from /var/www/fintrack-pro"
    exit 1
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found"
    echo "Creating from template..."
    cp .env.production .env
    echo "⚠️  IMPORTANT: Edit .env and set all secrets!"
    echo "nano .env"
    read -p "Press Enter after editing .env..."
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

# Build application
echo "🔨 Building application..."
pnpm build

# Start database services
echo "💾 Starting PostgreSQL and Redis..."
docker-compose -f docker-compose.prod.yml up -d postgres redis

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 15

# Run migrations
echo "📊 Running database migrations..."
cd backend
npm run migration:run
cd ..

# Start application services
echo "🚀 Starting application services..."
docker-compose -f docker-compose.prod.yml up -d backend frontend

# Wait for services to start
sleep 10

# Check health
echo ""
echo "🏥 Health checks..."
echo ""

# Backend health
BACKEND_HEALTH=$(curl -s http://localhost:3001/api/v1/health | jq -r '.status' 2>/dev/null || echo "error")
echo "  Backend: $BACKEND_HEALTH"

# Frontend health
FRONTEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
echo "  Frontend: HTTP $FRONTEND_HEALTH"

# Database health
DB_HEALTH=$(docker exec fintrack-postgres-prod pg_isready -U fintrack_prod 2>/dev/null && echo "healthy" || echo "error")
echo "  Database: $DB_HEALTH"

# Redis health
REDIS_HEALTH=$(docker exec fintrack-redis-prod redis-cli ping 2>/dev/null || echo "error")
echo "  Redis: $REDIS_HEALTH"

echo ""

# Display service status
echo "📊 Docker services:"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Your application is running at:"
echo "  Backend: http://localhost:3001/api/v1"
echo "  Frontend: http://localhost:3000"
echo ""
echo "🌐 Next steps:"
echo "1. Configure Nginx reverse proxy (see docs/DEPLOYMENT.md)"
echo "2. Setup SSL with certbot"
echo "3. Configure your domain DNS"
echo "4. Test the application"
echo ""
echo "📚 Documentation:"
echo "  - Deployment guide: docs/DEPLOYMENT.md"
echo "  - API docs: docs/API.md"
echo "  - Security: docs/SECURITY.md"
echo ""

#!/bin/bash

echo "🚀 FinTrack Pro - Starting Application"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Kill old processes
pkill -9 -f "nest start" 2>/dev/null
pkill -9 -f "next dev" 2>/dev/null
sleep 2

# Check Docker
echo "🐳 Checking Docker services..."
docker-compose ps

echo ""
echo "🔨 Starting Backend on port 4001..."
cd /home/nod/money/backend
pnpm dev > /tmp/fintrack-backend.log 2>&1 &
BACKEND_PID=$!

sleep 10

echo "🎨 Starting Frontend on port 4000..."
cd /home/nod/money/frontend  
PORT=4000 pnpm dev > /tmp/fintrack-frontend.log 2>&1 &
FRONTEND_PID=$!

sleep 15

echo ""
echo "✅ FinTrack Pro запущен!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 Frontend:  http://localhost:4000"
echo "🔌 Backend:   http://localhost:4001/api/v1"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 PIDs:"
echo "  Backend:  $BACKEND_PID"
echo "  Frontend: $FRONTEND_PID"
echo ""
echo "📝 Логи:"
echo "  Backend:  tail -f /tmp/fintrack-backend.log"
echo "  Frontend: tail -f /tmp/fintrack-frontend.log"
echo ""
echo "🛑 Остановить:"
echo "  kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "🎉 Открой браузер: http://localhost:4000"
echo ""

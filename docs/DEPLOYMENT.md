# Production Deployment Guide

## Current Production

- **Server:** DigitalOcean Droplet (Ubuntu 22.04)
- **IP:** 104.248.254.226
- **App path:** `/root/money`
- **Process manager:** PM2
- **Reverse proxy:** Nginx

## Architecture

```
Client :80 -> Nginx
               ├── /api/v1/*       -> NestJS backend (:3001)
               ├── /api/docs*      -> Swagger UI (:3001)
               ├── /socket.io/*    -> WebSocket (:3001)
               └── /*              -> Next.js frontend (:3000)
```

## Deploy Procedure

```bash
ssh root@104.248.254.226
cd /root/money
git pull
cd backend && pnpm build
cd ../frontend && pnpm build
pm2 restart all
```

Verify:
```bash
pm2 list
curl -s -o /dev/null -w '%{http_code}' http://localhost:3001/api/docs  # Should be 200
curl -s -o /dev/null -w '%{http_code}' http://localhost:3000            # Should be 200
```

## Initial Server Setup

### 1. Provision & install

```bash
apt update && apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs nginx
npm install -g pnpm pm2
```

### 2. Database (Docker)

```bash
apt install docker.io docker-compose -y
cd /root/money
docker-compose up -d db redis
```

### 3. Environment

```bash
cp .env.example .env
nano .env
```

Required variables:
```env
NODE_ENV=production
BACKEND_PORT=3001
BACKEND_HOST=0.0.0.0
CORS_ORIGIN=http://104.248.254.226

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=<password>
DB_DATABASE=fintrack_pro
DB_SYNCHRONIZE=false

REDIS_HOST=localhost
REDIS_PORT=6379

JWT_SECRET=<64-char-secret>
JWT_REFRESH_SECRET=<64-char-secret>
ENCRYPTION_KEY=<32-byte-hex>
```

### 4. Build & migrate

```bash
pnpm install
cd backend && pnpm build && pnpm migration:run
cd ../frontend && pnpm build
```

### 5. Nginx config

File: `/etc/nginx/sites-enabled/fintrack`

```nginx
upstream frontend {
    server 127.0.0.1:3000;
}

upstream backend {
    server 127.0.0.1:3001;
}

map $http_upgrade $connection_upgrade {
    default upgrade;
    '' close;
}

server {
    listen 80 default_server;
    server_name _;
    client_max_body_size 10M;

    # Swagger API docs
    location /api/docs {
        proxy_pass http://backend/api/docs;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/docs-json {
        proxy_pass http://backend/api/docs-json;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Backend API
    location /api/v1/ {
        proxy_pass http://backend/api/v1/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
    }

    # WebSocket
    location /socket.io/ {
        proxy_pass http://backend/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }

    # Frontend (catch-all)
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    add_header X-Frame-Options SAMEORIGIN always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy strict-origin-when-cross-origin always;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml;
}
```

```bash
nginx -t && nginx -s reload
```

### 6. PM2

```bash
pm2 start "node dist/main.js" --name fintrack-backend --cwd /root/money/backend
pm2 start "npx next start -p 3000" --name fintrack-frontend --cwd /root/money/frontend
pm2 save
pm2 startup
```

## Database Maintenance

```bash
# Backup
cd /root/money/backend
./scripts/backup-db.sh

# Rollback last migration
./scripts/rollback-last.sh

# Validate data integrity
./scripts/validate-migration.sh
```

## Monitoring

```bash
pm2 status          # Service status
pm2 logs            # All logs
pm2 monit           # Real-time monitoring
pm2 logs --err      # Error logs only
```

## SSL (when domain is configured)

```bash
apt install certbot python3-certbot-nginx -y
certbot --nginx -d yourdomain.com
```

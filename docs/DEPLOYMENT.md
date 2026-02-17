# Production Deployment Guide

## 📋 Pre-Deployment Checklist

### Code Quality
- [ ] All tests passing (unit + e2e + integration)
- [ ] Code coverage > 80%
- [ ] Linting passed
- [ ] Type checking passed
- [ ] Security scan passed (Snyk)
- [ ] Bundle size < 150KB gzip
- [ ] Lighthouse score > 90

### Security
- [ ] All environment variables set
- [ ] Secrets rotated for production
- [ ] HTTPS certificates ready
- [ ] CORS whitelist configured
- [ ] Rate limiting enabled
- [ ] Helmet.js configured
- [ ] 2FA tested
- [ ] Admin panel secured

### Database
- [ ] Migration scripts tested
- [ ] Backup strategy configured
- [ ] Connection pooling set
- [ ] Indexes optimized
- [ ] Test data cleared

### Infrastructure
- [ ] VPS provisioned
- [ ] Docker installed
- [ ] PostgreSQL 16+ ready
- [ ] Redis 7+ ready
- [ ] Nginx configured
- [ ] SSL/TLS configured
- [ ] Firewall rules set

## 🚀 Deployment Steps

### 1. Server Setup (DigitalOcean Droplet)

```bash
# Create droplet (4 vCPU, 8GB RAM - $40/month)
# Ubuntu 22.04 LTS
# SSH key authentication

# Connect to server
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install docker-compose-plugin -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install pnpm
npm install -g pnpm

# Install nginx
apt install nginx -y

# Enable firewall
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
```

### 2. Clone Repository

```bash
cd /var/www
git clone <your-repo-url> fintrack-pro
cd fintrack-pro

# Create .env file
cp .env.example .env
nano .env
# Set production values
```

### 3. Configure Environment

```bash
# Production .env
NODE_ENV=production
APP_URL=https://fintrack.pro
API_URL=https://api.fintrack.pro

# Strong secrets (generate with: openssl rand -base64 64)
JWT_ACCESS_SECRET=<64-char-secret>
JWT_REFRESH_SECRET=<64-char-secret>
ENCRYPTION_KEY=<32-char-key>
COOKIE_SECRET=<32-char-secret>

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=fintrack_prod
DB_PASSWORD=<strong-password>
DB_DATABASE=fintrack_prod
DB_SYNCHRONIZE=false
DB_LOGGING=false

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=<strong-password>

# Rate limiting
THROTTLE_TTL=60
THROTTLE_LIMIT_AUTH=100
THROTTLE_LIMIT_API=300

# CORS
CORS_ORIGIN=https://fintrack.pro
```

### 4. Database Setup

```bash
# Start PostgreSQL with Docker
docker-compose -f docker-compose.prod.yml up -d postgres

# Wait for postgres to be ready
sleep 10

# Run migrations
cd backend
pnpm install
npm run migration:run
cd ..
```

### 5. Build Application

```bash
# Install dependencies
pnpm install

# Build all
pnpm build

# Verify builds
ls backend/dist
ls frontend/.next
```

### 6. Configure Nginx

```bash
# Create nginx config
nano /etc/nginx/sites-available/fintrack

# Add configuration:
```

```nginx
# Backend API
server {
    listen 80;
    server_name api.fintrack.pro;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Frontend
server {
    listen 80;
    server_name fintrack.pro www.fintrack.pro;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
ln -s /etc/nginx/sites-available/fintrack /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### 7. SSL/TLS Setup (Let's Encrypt)

```bash
# Install certbot
apt install certbot python3-certbot-nginx -y

# Get certificates
certbot --nginx -d fintrack.pro -d www.fintrack.pro -d api.fintrack.pro

# Auto-renewal is configured automatically
```

### 8. Process Management (PM2)

```bash
# Install PM2
npm install -g pm2

# Create ecosystem file
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [
    {
      name: 'fintrack-backend',
      cwd: '/var/www/fintrack-pro/backend',
      script: 'dist/main.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'fintrack-frontend',
      cwd: '/var/www/fintrack-pro/frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
```

```bash
# Start services
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Auto-start on reboot
pm2 startup
```

### 9. Database Backups

```bash
# Create backup script
nano /usr/local/bin/backup-fintrack.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/fintrack"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup PostgreSQL
docker exec fintrack-postgres pg_dump -U fintrack_prod fintrack_prod | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Keep last 30 days
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +30 -delete

# Upload to S3 (optional)
# aws s3 cp $BACKUP_DIR/db_$DATE.sql.gz s3://fintrack-backups/
```

```bash
chmod +x /usr/local/bin/backup-fintrack.sh

# Add to crontab (every 6 hours)
crontab -e
0 */6 * * * /usr/local/bin/backup-fintrack.sh
```

### 10. Monitoring Setup

```bash
# PM2 monitoring
pm2 install pm2-logrotate

# Setup log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

## 🔄 Update Procedure

```bash
# Connect to server
ssh user@your-server-ip

# Navigate to project
cd /var/www/fintrack-pro

# Pull latest changes
git pull origin main

# Install dependencies
pnpm install

# Run migrations
cd backend && npm run migration:run && cd ..

# Build
pnpm build

# Restart services
pm2 restart all

# Check status
pm2 status
pm2 logs
```

## 📊 Monitoring

### PM2 Commands

```bash
# Status
pm2 status

# Logs
pm2 logs
pm2 logs fintrack-backend
pm2 logs fintrack-frontend

# Monitoring
pm2 monit

# Restart
pm2 restart all
pm2 restart fintrack-backend
pm2 restart fintrack-frontend

# Stop
pm2 stop all
pm2 delete all
```

### Health Checks

```bash
# Backend health
curl https://api.fintrack.pro/api/v1/health

# Frontend
curl https://fintrack.pro

# Database
docker exec fintrack-postgres pg_isready -U fintrack_prod

# Redis
docker exec fintrack-redis redis-cli ping
```

## 🚨 Troubleshooting

### Application won't start

```bash
# Check logs
pm2 logs --err

# Check environment
cat .env

# Check database connection
docker-compose ps
```

### High memory usage

```bash
# Check PM2
pm2 status
pm2 monit

# Restart services
pm2 restart all

# Check Docker
docker stats
```

### Database issues

```bash
# Access database
docker exec -it fintrack-postgres psql -U fintrack_prod -d fintrack_prod

# Check connections
SELECT count(*) FROM pg_stat_activity;

# Vacuum database
VACUUM ANALYZE;
```

## 💰 Cost Estimation

**Monthly Costs:**
- VPS (4 vCPU, 8GB): $40/month (DigitalOcean)
- Backups: $5/month
- Domain: $1.25/month ($15/year)
- SSL: Free (Let's Encrypt)
- CDN (optional): $10/month
- **Total: ~$55-65/month**

## 🎯 Performance Targets

- Response time: < 200ms (p95)
- Uptime: > 99.9%
- Concurrent users: 1000+
- Database queries: < 50ms
- Cache hit ratio: > 70%
- Error rate: < 0.1%

## 🔐 Security Hardening

1. **Disable root SSH**
2. **Use SSH keys only**
3. **Enable fail2ban**
4. **Configure firewall (ufw)**
5. **Regular security updates**
6. **Backup encryption**
7. **Database access restrictions**
8. **API rate limiting**
9. **HTTPS only**
10. **Security headers**

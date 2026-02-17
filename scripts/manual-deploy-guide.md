# Manual DigitalOcean Deployment Guide

## 📋 Prerequisites

1. **DigitalOcean Account**
2. **Valid API Token** (get from: https://cloud.digitalocean.com/account/api/tokens)
3. **Domain name** (optional but recommended)

## 🚀 Step-by-Step Deployment

### Step 1: Create Droplet

**Option A: Via DigitalOcean Dashboard**
1. Go to https://cloud.digitalocean.com/droplets/new
2. Choose:
   - **Image:** Ubuntu 22.04 LTS
   - **Plan:** Basic ($24/month - 2 vCPU, 4GB RAM) or Premium ($48/month - 4 vCPU, 8GB RAM)
   - **Region:** Choose closest to your users (NYC, SFO, London, etc.)
   - **Authentication:** SSH Key (create new or use existing)
   - **Hostname:** fintrack-pro-production
3. Click "Create Droplet"
4. Wait 1-2 minutes for creation
5. Note the IP address

**Option B: Via API**
```bash
# Set your API token
export DO_API_TOKEN='your_token_here'

# Run deployment script
chmod +x scripts/deploy-digitalocean.sh
./scripts/deploy-digitalocean.sh
```

### Step 2: Connect to Server

```bash
# SSH into your droplet
ssh root@YOUR_DROPLET_IP

# Update system
apt update && apt upgrade -y
```

### Step 3: Run Server Setup

**Option A: Automated**
```bash
# Copy setup script to server
scp scripts/setup-server.sh root@YOUR_DROPLET_IP:/root/

# SSH and run
ssh root@YOUR_DROPLET_IP
chmod +x /root/setup-server.sh
./setup-server.sh
```

**Option B: Manual**
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install pnpm
npm install -g pnpm

# Install nginx
apt install -y nginx

# Install certbot for SSL
apt install -y certbot python3-certbot-nginx

# Configure firewall
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
```

### Step 4: Clone Repository

```bash
# Create directory
mkdir -p /var/www/fintrack-pro
cd /var/www/fintrack-pro

# Clone repository
git clone <YOUR_REPO_URL> .

# Or upload files
# From your local machine:
# rsync -avz --exclude 'node_modules' --exclude '.git' \
#   ./ root@YOUR_DROPLET_IP:/var/www/fintrack-pro/
```

### Step 5: Configure Environment

```bash
cd /var/www/fintrack-pro

# Copy production env template
cp .env.production .env

# Edit environment variables
nano .env

# IMPORTANT: Set these values:
# - JWT_ACCESS_SECRET (generate: openssl rand -base64 64)
# - JWT_REFRESH_SECRET (generate: openssl rand -base64 64)
# - DB_PASSWORD (strong password)
# - REDIS_PASSWORD (strong password)
# - ENCRYPTION_KEY (generate: openssl rand -base64 32)
# - COOKIE_SECRET (generate: openssl rand -base64 32)
```

### Step 6: Deploy Application

```bash
# Run deployment script
chmod +x scripts/deploy-app.sh
./scripts/deploy-app.sh

# Or manually:
pnpm install
pnpm build
docker-compose -f docker-compose.prod.yml up -d postgres redis
sleep 15
cd backend && npm run migration:run && cd ..
docker-compose -f docker-compose.prod.yml up -d backend frontend
```

### Step 7: Configure Nginx

```bash
# Create nginx config
nano /etc/nginx/sites-available/fintrack
```

Paste this configuration:

```nginx
# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;

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
    server_name yourdomain.com www.yourdomain.com;

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

### Step 8: Setup SSL (Let's Encrypt)

```bash
# Get SSL certificates
certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com

# Follow prompts
# Certificates auto-renew
```

### Step 9: Configure DNS

In your domain registrar (Namecheap, GoDaddy, etc.):

**A Records:**
- `@` → `YOUR_DROPLET_IP`
- `www` → `YOUR_DROPLET_IP`
- `api` → `YOUR_DROPLET_IP`

Wait 5-10 minutes for DNS propagation.

### Step 10: Setup Backups

```bash
# Create backup script
nano /usr/local/bin/backup-fintrack.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/fintrack"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup database
docker exec fintrack-postgres-prod pg_dump -U fintrack_prod fintrack_prod | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Keep last 30 days
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +30 -delete

echo "Backup complete: $BACKUP_DIR/db_$DATE.sql.gz"
```

```bash
chmod +x /usr/local/bin/backup-fintrack.sh

# Schedule backups (every 6 hours)
crontab -e
# Add line:
0 */6 * * * /usr/local/bin/backup-fintrack.sh
```

### Step 11: Setup Monitoring

```bash
# Install PM2 for process management (alternative to Docker)
npm install -g pm2

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Check status
docker-compose -f docker-compose.prod.yml ps
```

## ✅ Verification

### Test Endpoints

```bash
# Backend health
curl https://api.yourdomain.com/api/v1/health

# Frontend
curl https://yourdomain.com

# Register test user
curl -X POST https://api.yourdomain.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "Test123!@#"
  }'
```

### Monitor Services

```bash
# Docker status
docker ps

# Resource usage
docker stats

# Logs
docker logs fintrack-backend-prod
docker logs fintrack-frontend-prod

# Database
docker exec -it fintrack-postgres-prod psql -U fintrack_prod
```

## 🔧 Maintenance

### Update Application

```bash
cd /var/www/fintrack-pro
git pull origin main
pnpm install
pnpm build
docker-compose -f docker-compose.prod.yml restart backend frontend
```

### View Logs

```bash
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
```

### Restart Services

```bash
docker-compose -f docker-compose.prod.yml restart
```

### Backup Now

```bash
/usr/local/bin/backup-fintrack.sh
```

## 🆘 Troubleshooting

### Services won't start

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs

# Check environment
cat .env

# Restart
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```

### Can't connect to database

```bash
# Check database
docker exec fintrack-postgres-prod pg_isready -U fintrack_prod

# View logs
docker logs fintrack-postgres-prod
```

### High CPU/Memory

```bash
# Check resource usage
docker stats

# Check processes
htop

# Restart services
docker-compose -f docker-compose.prod.yml restart
```

## 💰 Cost Summary

**Monthly:**
- Droplet (2 vCPU, 4GB): $24/month
- OR Droplet (4 vCPU, 8GB): $48/month
- Backups (optional): $5/month
- Domain: ~$1/month
- **Total: $25-54/month**

## 🎉 Success!

Your application should now be live at:
- **Frontend:** https://yourdomain.com
- **Backend API:** https://api.yourdomain.com/api/v1

Congratulations! 🎊

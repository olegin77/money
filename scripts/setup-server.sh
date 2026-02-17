#!/bin/bash

# FinTrack Pro - Server Setup Script
# Run this on your DigitalOcean droplet

set -e

echo "🚀 FinTrack Pro - Server Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Update system
echo "📦 Updating system packages..."
apt-get update
DEBIAN_FRONTEND=noninteractive apt-get upgrade -y

# Install Docker
echo "🐳 Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
rm get-docker.sh

# Install Docker Compose
echo "🐳 Installing Docker Compose..."
apt-get install -y docker-compose-plugin

# Install Node.js 20
echo "📦 Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Install pnpm
echo "📦 Installing pnpm..."
npm install -g pnpm

# Install nginx
echo "🌐 Installing nginx..."
apt-get install -y nginx

# Install additional tools
echo "🛠️  Installing additional tools..."
apt-get install -y git curl wget htop ufw certbot python3-certbot-nginx jq

# Configure firewall
echo "🔥 Configuring firewall..."
ufw --force enable
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw allow 80/tcp
ufw allow 443/tcp
ufw status

# Create project directory
echo "📁 Creating project directory..."
mkdir -p /var/www/fintrack-pro
cd /var/www/fintrack-pro

# Install PM2 globally
echo "⚙️  Installing PM2..."
npm install -g pm2

# Configure automatic security updates
echo "🔐 Configuring automatic security updates..."
apt-get install -y unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades

# Create swap file (if needed)
if [ ! -f /swapfile ]; then
    echo "💾 Creating swap file (2GB)..."
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

# Optimize system limits
echo "⚙️  Optimizing system limits..."
cat >> /etc/security/limits.conf <<EOL
* soft nofile 65535
* hard nofile 65535
* soft nproc 65535
* hard nproc 65535
EOL

# Configure sysctl
cat >> /etc/sysctl.conf <<EOL
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 65535
fs.file-max = 2097152
EOL
sysctl -p

echo ""
echo "✅ Server setup complete!"
echo ""
echo "📊 System Info:"
echo "  OS: $(lsb_release -d | cut -f2)"
echo "  Docker: $(docker --version)"
echo "  Node.js: $(node --version)"
echo "  pnpm: $(pnpm --version)"
echo "  Nginx: $(nginx -v 2>&1)"
echo ""
echo "📝 Next steps:"
echo "1. Clone your repository to /var/www/fintrack-pro"
echo "2. Configure environment variables"
echo "3. Run deployment script"
echo ""

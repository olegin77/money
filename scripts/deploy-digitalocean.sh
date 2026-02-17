#!/bin/bash

# FinTrack Pro - DigitalOcean Deployment Script
# This script creates a droplet and deploys the application

set -e

echo "🚀 FinTrack Pro - DigitalOcean Deployment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if API token is provided
if [ -z "$DO_API_TOKEN" ]; then
    echo "❌ Error: DigitalOcean API token not found"
    echo "Please set DO_API_TOKEN environment variable:"
    echo "export DO_API_TOKEN='your_token_here'"
    exit 1
fi

# Configuration
DROPLET_NAME="fintrack-pro-production"
REGION="nyc3"
SIZE="s-2vcpu-4gb"
IMAGE="ubuntu-22-04-x64"
SSH_KEY_NAME="fintrack-deploy-key"

echo "📋 Configuration:"
echo "  Droplet Name: $DROPLET_NAME"
echo "  Region: $REGION"
echo "  Size: $SIZE (2 vCPU, 4GB RAM - $24/month)"
echo "  Image: $IMAGE"
echo ""

# Generate SSH key if not exists
if [ ! -f ~/.ssh/fintrack_deploy ]; then
    echo "🔑 Generating SSH key..."
    ssh-keygen -t ed25519 -f ~/.ssh/fintrack_deploy -N "" -C "fintrack-deploy"
fi

# Upload SSH key to DigitalOcean
echo "📤 Uploading SSH key to DigitalOcean..."
SSH_KEY_ID=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $DO_API_TOKEN" \
  -d "{\"name\":\"$SSH_KEY_NAME\",\"public_key\":\"$(cat ~/.ssh/fintrack_deploy.pub)\"}" \
  "https://api.digitalocean.com/v2/account/keys" | jq -r '.ssh_key.id')

if [ -z "$SSH_KEY_ID" ] || [ "$SSH_KEY_ID" = "null" ]; then
    echo "⚠️  SSH key upload failed or key already exists, trying to get existing key..."
    SSH_KEY_ID=$(curl -s -X GET \
      -H "Authorization: Bearer $DO_API_TOKEN" \
      "https://api.digitalocean.com/v2/account/keys" | jq -r ".ssh_keys[] | select(.name==\"$SSH_KEY_NAME\") | .id")
fi

echo "✅ SSH Key ID: $SSH_KEY_ID"
echo ""

# Create droplet
echo "🌐 Creating droplet..."
DROPLET_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $DO_API_TOKEN" \
  -d "{
    \"name\":\"$DROPLET_NAME\",
    \"region\":\"$REGION\",
    \"size\":\"$SIZE\",
    \"image\":\"$IMAGE\",
    \"ssh_keys\":[\"$SSH_KEY_ID\"],
    \"backups\":false,
    \"ipv6\":true,
    \"monitoring\":true,
    \"tags\":[\"fintrack\",\"production\"]
  }" \
  "https://api.digitalocean.com/v2/droplets")

DROPLET_ID=$(echo $DROPLET_RESPONSE | jq -r '.droplet.id')

if [ -z "$DROPLET_ID" ] || [ "$DROPLET_ID" = "null" ]; then
    echo "❌ Failed to create droplet"
    echo $DROPLET_RESPONSE | jq .
    exit 1
fi

echo "✅ Droplet created with ID: $DROPLET_ID"
echo ""

# Wait for droplet to be ready
echo "⏳ Waiting for droplet to be ready (this may take 1-2 minutes)..."
while true; do
    DROPLET_STATUS=$(curl -s -X GET \
      -H "Authorization: Bearer $DO_API_TOKEN" \
      "https://api.digitalocean.com/v2/droplets/$DROPLET_ID" | jq -r '.droplet.status')

    if [ "$DROPLET_STATUS" = "active" ]; then
        break
    fi
    echo "  Status: $DROPLET_STATUS... waiting"
    sleep 10
done

# Get droplet IP
DROPLET_IP=$(curl -s -X GET \
  -H "Authorization: Bearer $DO_API_TOKEN" \
  "https://api.digitalocean.com/v2/droplets/$DROPLET_ID" | jq -r '.droplet.networks.v4[0].ip_address')

echo ""
echo "✅ Droplet is ready!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ID: $DROPLET_ID"
echo "  IP: $DROPLET_IP"
echo "  SSH: ssh -i ~/.ssh/fintrack_deploy root@$DROPLET_IP"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Save droplet info
cat > droplet-info.txt <<EOL
Droplet Information:
ID: $DROPLET_ID
IP: $DROPLET_IP
SSH Key: ~/.ssh/fintrack_deploy
SSH Command: ssh -i ~/.ssh/fintrack_deploy root@$DROPLET_IP
Created: $(date)
EOL

echo "💾 Droplet info saved to droplet-info.txt"
echo ""

# Wait for SSH to be ready
echo "⏳ Waiting for SSH to be ready..."
sleep 30

# Test SSH connection
echo "🔌 Testing SSH connection..."
ssh-keyscan -H $DROPLET_IP >> ~/.ssh/known_hosts 2>/dev/null

# Deploy application
echo ""
echo "📦 Deploying application..."
echo ""

# Create deployment script
cat > /tmp/deploy-fintrack.sh <<'DEPLOY_SCRIPT'
#!/bin/bash
set -e

echo "🔧 Setting up server..."

# Update system
apt-get update
apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
rm get-docker.sh

# Install Docker Compose
apt-get install docker-compose-plugin -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Install pnpm
npm install -g pnpm

# Install nginx
apt-get install -y nginx

# Install git
apt-get install -y git

echo "✅ Server setup complete!"
DEPLOY_SCRIPT

# Copy and execute deployment script
scp -i ~/.ssh/fintrack_deploy /tmp/deploy-fintrack.sh root@$DROPLET_IP:/root/
ssh -i ~/.ssh/fintrack_deploy root@$DROPLET_IP 'bash /root/deploy-fintrack.sh'

echo ""
echo "✅ Server setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. SSH into server: ssh -i ~/.ssh/fintrack_deploy root@$DROPLET_IP"
echo "2. Clone repository: git clone <your-repo-url> /var/www/fintrack-pro"
echo "3. Configure .env: cd /var/www/fintrack-pro && cp .env.production .env"
echo "4. Start services: docker-compose -f docker-compose.prod.yml up -d"
echo "5. Run migrations: docker exec fintrack-backend-prod npm run migration:run"
echo ""
echo "🎉 Deployment script complete!"
echo ""
echo "Your droplet is ready at: $DROPLET_IP"

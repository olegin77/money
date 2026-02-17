# 🚀 Deploy FinTrack Pro to DigitalOcean NOW!

## ⚡ Quick Deploy (3 options)

### Option 1: Automated (Recommended) ⚡

```bash
# 1. Get your DigitalOcean API token
# Go to: https://cloud.digitalocean.com/account/api/tokens
# Click "Generate New Token" with Write access

# 2. Set token and deploy
export DO_API_TOKEN='your_token_here'
chmod +x scripts/deploy-digitalocean.sh
./scripts/deploy-digitalocean.sh

# 3. Wait 5 minutes, then:
ssh -i ~/.ssh/fintrack_deploy root@<DROPLET_IP>
cd /var/www/fintrack-pro
git clone <YOUR_GITHUB_REPO> .
./scripts/deploy-app.sh
```

**Result:** App running in ~10 minutes! 🎉

---

### Option 2: Manual via Dashboard 🖱️

**Step-by-step guide:** `scripts/manual-deploy-guide.md`

**Quick version:**
1. Create droplet on DigitalOcean
2. SSH into server
3. Run setup: `./scripts/setup-server.sh`
4. Clone repo to `/var/www/fintrack-pro`
5. Run deploy: `./scripts/deploy-app.sh`
6. Configure domain & SSL

---

### Option 3: Local Testing First 💻

```bash
# Test everything locally first
docker-compose -f docker-compose.prod.yml up -d
```

Then deploy using Option 1 or 2.

---

## 🔑 Environment Setup

**Before deploying, generate secrets:**

```bash
# JWT Access Secret
openssl rand -base64 64

# JWT Refresh Secret
openssl rand -base64 64

# Encryption Key (32 bytes)
openssl rand -base64 32

# Cookie Secret
openssl rand -base64 32

# Database Password
openssl rand -base64 32
```

**Edit `.env` on server with these values!**

---

## 📋 Deployment Checklist

### Before Deploy:
- [ ] Get DigitalOcean API token
- [ ] Choose droplet size (2 vCPU $24 or 4 vCPU $48)
- [ ] Have domain ready (optional)
- [ ] Generate secrets
- [ ] Test locally

### After Deploy:
- [ ] Run health checks
- [ ] Test registration
- [ ] Test login
- [ ] Configure backups
- [ ] Setup monitoring
- [ ] Configure domain
- [ ] Setup SSL
- [ ] Invite beta users

---

## 🌐 What You'll Get

**After successful deployment:**

- ✅ Droplet with Ubuntu 22.04
- ✅ Docker + Docker Compose installed
- ✅ PostgreSQL 16 running
- ✅ Redis 7 running
- ✅ Backend API on port 3001
- ✅ Frontend on port 3000
- ✅ Nginx reverse proxy
- ✅ SSL certificates (with certbot)
- ✅ Automatic backups (every 6 hours)
- ✅ Firewall configured
- ✅ Production-ready setup

**Access:**
- Frontend: https://yourdomain.com
- Backend: https://api.yourdomain.com/api/v1
- Admin: https://yourdomain.com/admin

---

## 💰 Cost

**Monthly:**
- Basic Droplet (2 vCPU, 4GB): $24
- Premium Droplet (4 vCPU, 8GB): $48
- Backups: $5
- Domain: $1
- **Total: $30-54/month**

---

## 📞 Support

**Need help?**
- Read: `scripts/manual-deploy-guide.md`
- Check: `docs/DEPLOYMENT.md`
- Logs: `docker-compose logs -f`

---

## 🎯 Quick Commands

```bash
# Get new API token
# https://cloud.digitalocean.com/account/api/tokens

# Deploy automatically
export DO_API_TOKEN='your_token'
./scripts/deploy-digitalocean.sh

# Or deploy manually
# Follow: scripts/manual-deploy-guide.md

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Restart
docker-compose -f docker-compose.prod.yml restart
```

---

## 🎉 Ready to Deploy!

**Your app is 100% production-ready!**

Choose your deployment method and launch in minutes! 🚀

---

**Need API Token?**
1. Go to: https://cloud.digitalocean.com/account/api/tokens
2. Click "Generate New Token"
3. Name: "FinTrack Deploy"
4. Access: Read + Write
5. Copy token
6. Run: `export DO_API_TOKEN='your_token'`
7. Run: `./scripts/deploy-digitalocean.sh`

🎊 **GOOD LUCK!** 🎊

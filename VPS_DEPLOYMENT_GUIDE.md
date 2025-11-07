# Complete VPS Deployment Guide for TaskFlow

## 🎯 Overview

This guide will help you deploy your TaskFlow application to a VPS (Virtual Private Server) like DigitalOcean, Linode, or Vultr.

---

## 📋 Prerequisites

### What You Need:
1. **VPS Server** (Ubuntu 20.04 or 22.04 recommended)
   - Minimum: 1GB RAM, 1 CPU, 25GB Storage
   - Recommended: 2GB RAM, 2 CPU, 50GB Storage
   - Providers: DigitalOcean ($5/month), Linode ($5/month), Vultr ($5/month)

2. **Domain Name** (Optional but recommended)
   - Buy from: Namecheap, GoDaddy, Google Domains
   - Point A record to your VPS IP address

3. **SSH Access**
   - Terminal on Mac/Linux
   - PuTTY on Windows
   - VS Code Remote SSH extension

---

## 🚀 STEP 1: Initial Server Setup

### Connect to Your VPS

```bash
# SSH into your server
ssh root@your-server-ip

# Example:
ssh root@142.93.123.456
```

### Create Non-Root User

```bash
# Create new user
adduser taskflow

# Add to sudo group
usermod -aG sudo taskflow

# Switch to new user
su - taskflow
```

### Update System

```bash
# Update package lists
sudo apt update

# Upgrade packages
sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl git build-essential
```

---

## 🚀 STEP 2: Install Node.js

### Install Node.js 18.x (LTS)

```bash
# Download Node.js setup script
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Install Node.js
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v18.x.x
npm --version   # Should show 9.x.x or higher
```

---

## 🚀 STEP 3: Install MongoDB

### Option A: Install Locally on VPS

```bash
# Import MongoDB public GPG key
curl -fsSL https://pgp.mongodb.com/server-6.0.asc | sudo gpg --dearmor -o /usr/share/keyrings/mongodb-server-6.0.gpg

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update packages
sudo apt update

# Install MongoDB
sudo apt install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod

# Enable MongoDB to start on boot
sudo systemctl enable mongod

# Check status
sudo systemctl status mongod
```

### Option B: Use MongoDB Atlas (Cloud - Recommended)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create cluster (Free tier available)
4. Create database user
5. Whitelist your VPS IP address
6. Get connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/taskflow
   ```
7. Use this in your `.env` file

---

## 🚀 STEP 4: Install PM2 (Process Manager)

```bash
# Install PM2 globally
sudo npm install -g pm2

# Verify installation
pm2 --version
```

**What is PM2?**
- Keeps your Node.js app running 24/7
- Auto-restarts if app crashes
- Manages logs
- Starts on server reboot

---

## 🚀 STEP 5: Upload Your Code to VPS

### Method A: Git Clone (Recommended)

```bash
# Navigate to home directory
cd ~

# Clone your repository (after pushing to GitHub - see below)
git clone https://github.com/yourusername/taskflow.git

# Navigate to project
cd taskflow
```

### Method B: Direct Upload (SCP/SFTP)

```bash
# From your local machine
scp -r /path/to/taskflow taskflow@your-server-ip:~/taskflow

# Or use FileZilla/WinSCP for GUI upload
```

---

## 🚀 STEP 6: Configure Environment

### Create `.env` File

```bash
# In your project directory
cd ~/taskflow
nano .env
```

**Add this configuration:**
```env
# Server
PORT=3000
NODE_ENV=production

# MongoDB
MONGODB_URI=mongodb://localhost:27017/taskflow
# OR if using MongoDB Atlas:
# MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/taskflow

# JWT
JWT_SECRET=your-super-secret-random-string-change-this-now
JWT_EXPIRE=7d

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Admin
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=ChangeThisSecurePassword@123

# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=15

# CORS
CORS_ORIGIN=https://yourdomain.com
```

**Press Ctrl+X, then Y, then Enter to save**

### Install Dependencies

```bash
# Install backend dependencies
npm install

# If you have React frontend
cd client
npm install
npm run build
cd ..
```

---

## 🚀 STEP 7: Start Application with PM2

### Start Your App

```bash
# From project root
pm2 start server.js --name "taskflow-api"

# Check if running
pm2 status

# View logs
pm2 logs taskflow-api

# Stop app
pm2 stop taskflow-api

# Restart app
pm2 restart taskflow-api
```

### Make PM2 Start on Server Reboot

```bash
# Generate startup script
pm2 startup

# Copy and run the command it outputs (will be something like:)
# sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u taskflow --hp /home/taskflow

# Save current PM2 process list
pm2 save
```

---

## 🚀 STEP 8: Install and Configure Nginx

### Install Nginx

```bash
# Install Nginx
sudo apt install -y nginx

# Start Nginx
sudo systemctl start nginx

# Enable on boot
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx
```

### Configure Nginx as Reverse Proxy

```bash
# Create Nginx configuration (Don't do this step please, we'll use nano instead)
sudo nano /etc/nginx/sites-available/taskflow
```

**Add this configuration:**
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;  # Change this!

    # Serve React build files
    location / {
        root /home/taskflow/taskflow/client/dist;
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Socket.io proxy
    location /socket.io {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Uploads
    location /uploads {
        proxy_pass http://localhost:3000;
    }
}
```

**Save: Ctrl+X → Y → Enter**

### Enable Nginx Configuration

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/taskflow /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# If test passes, reload Nginx
sudo systemctl reload nginx
```

---

## 🚀 STEP 9: Setup SSL Certificate (HTTPS)

### Install Certbot

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx
```

### Get SSL Certificate

```bash
# Replace with your domain
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow prompts:
# - Enter email address
# - Agree to terms
# - Choose to redirect HTTP to HTTPS (recommended: Yes)
```

**Certbot will:**
- Get free SSL certificate from Let's Encrypt
- Auto-configure Nginx for HTTPS
- Set up auto-renewal (90-day certificates)

### Test Auto-Renewal

```bash
# Dry run renewal
sudo certbot renew --dry-run

# If successful, auto-renewal is configured!
```

---

## 🚀 STEP 10: Configure Firewall

### Setup UFW (Uncomplicated Firewall)

```bash
# Allow SSH
sudo ufw allow OpenSSH

# Allow HTTP
sudo ufw allow 80/tcp

# Allow HTTPS
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

---

## 🚀 STEP 11: Build React Frontend (If Using)

### Build for Production

```bash
# Navigate to client folder
cd ~/taskflow/client

# Build React app
npm run build

# This creates client/dist folder with optimized files
```

### Update Nginx to Serve React Build

The Nginx config in Step 8 already serves from `client/dist`.

---

## 🚀 STEP 12: Environment Variables for Production

### Update .env for Production

```bash
nano ~/taskflow/.env
```

**Critical changes:**
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://... (if using Atlas)
JWT_SECRET=very-long-random-secret-minimum-64-characters
CORS_ORIGIN=https://yourdomain.com
```

### Restart Application

```bash
pm2 restart taskflow-api

# Or reload with new env
pm2 reload taskflow-api --update-env
```

---

## 🚀 STEP 13: Verify Deployment

### Check Everything Works

1. **Visit your domain:** https://yourdomain.com
2. **Test login:** Register new account
3. **Create task:** Add a task
4. **Real-time:** Open in two browsers, verify live updates
5. **API:** https://yourdomain.com/api/auth/me
6. **Socket.io:** Check browser console for "Socket connected"

### Monitor Application

```bash
# View logs
pm2 logs taskflow-api

# Monitor resources
pm2 monit

# Show process info
pm2 show taskflow-api
```

---

## 🔍 STEP 14: Troubleshooting

### Common Issues

**502 Bad Gateway**
```bash
# Check if app is running
pm2 status

# Restart app
pm2 restart taskflow-api

# Check logs
pm2 logs taskflow-api --lines 50
```

**MongoDB Connection Error**
```bash
# If local MongoDB
sudo systemctl status mongod
sudo systemctl start mongod

# If Atlas, check:
# - Connection string in .env
# - VPS IP whitelisted in Atlas
# - Username/password correct
```

**Permission Errors**
```bash
# Give ownership of uploads folder
sudo chown -R taskflow:taskflow ~/taskflow/uploads
sudo chmod -R 755 ~/taskflow/uploads
```

**SSL Renewal Issues**
```bash
# Manually renew
sudo certbot renew

# Check certificate status
sudo certbot certificates
```

### Useful Commands

```bash
# Restart Nginx
sudo systemctl restart nginx

# Restart PM2 apps
pm2 restart all

# Update code from Git
cd ~/taskflow
git pull
npm install
pm2 restart taskflow-api

# View Nginx error logs
sudo tail -f /var/log/nginx/error.log

# View Nginx access logs
sudo tail -f /var/log/nginx/access.log
```

---

## 🔐 STEP 15: Security Best Practices

### 1. Change Default Passwords

```bash
# Change admin password in app after first login
# Change sudo password
passwd

# Change root password (if applicable)
sudo passwd root
```

### 2. Setup SSH Key Authentication

```bash
# On your local machine
ssh-keygen -t rsa -b 4096

# Copy public key to server
ssh-copy-id taskflow@your-server-ip

# Disable password login (optional)
sudo nano /etc/ssh/sshd_config
# Set: PasswordAuthentication no
sudo systemctl restart sshd
```

### 3. Regular Updates

```bash
# Update system monthly
sudo apt update && sudo apt upgrade -y

# Update Node.js packages
cd ~/taskflow
npm update
pm2 restart taskflow-api
```

### 4. Backup Strategy

```bash
# Backup MongoDB
mongodump --out ~/backups/$(date +%Y%m%d)

# Or if using Atlas, backups are automatic

# Backup uploads folder
tar -czf ~/backups/uploads-$(date +%Y%m%d).tar.gz ~/taskflow/uploads

# Setup automated backups with cron
crontab -e
# Add: 0 2 * * * mongodump --out ~/backups/$(date +\%Y\%m\%d)
```

---

## 📊 STEP 16: Monitoring & Maintenance

### Setup PM2 Monitoring

```bash
# Install PM2 monitoring
pm2 install pm2-logrotate

# Configure log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### Monitor Server Resources

```bash
# Install htop
sudo apt install -y htop

# View resource usage
htop

# Check disk space
df -h

# Check memory
free -h
```

### Setup Alerts (Optional)

```bash
# PM2 can send alerts via email
pm2 install pm2-slack  # If using Slack
pm2 set pm2-slack:slack_url https://hooks.slack.com/...
```

---

## 🌐 STEP 17: Domain Configuration

### Point Domain to VPS

In your domain registrar (Namecheap, GoDaddy, etc.):

1. **A Record:**
   - Type: A
   - Host: @
   - Value: your-vps-ip
   - TTL: 300 (5 minutes)

2. **WWW Subdomain:**
   - Type: A
   - Host: www
   - Value: your-vps-ip
   - TTL: 300

### Wait for DNS Propagation

```bash
# Check if domain points to your IP (may take 5-30 minutes)
ping yourdomain.com

# Should show your VPS IP address
```

---

## 🔄 STEP 18: Updating Your Application

### Update Code from Git

```bash
# SSH into server
ssh taskflow@your-server-ip

# Navigate to project
cd ~/taskflow

# Pull latest changes
git pull origin main

# Install any new dependencies
npm install

# If React frontend changed
cd client
npm install
npm run build
cd ..

# Restart application
pm2 restart taskflow-api

# Clear Nginx cache (if issues)
sudo systemctl reload nginx
```

### Zero-Downtime Deployments

```bash
# Use PM2 cluster mode (optional)
pm2 start server.js -i max --name taskflow-api

# Reload without downtime
pm2 reload taskflow-api
```

---

## 📈 STEP 19: Performance Optimization

### Enable Gzip Compression in Nginx

```bash
sudo nano /etc/nginx/nginx.conf
```

**Add in http block:**
```nginx
# Gzip Settings
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript 
           application/x-javascript application/xml+rss 
           application/javascript application/json;
```

### Configure Node.js for Production

```bash
# Set Node.js to production mode
export NODE_ENV=production

# Or add to PM2 start
pm2 start server.js --name taskflow-api --env production
```

### Serve Static Files Efficiently

Already configured in Nginx to serve React build from `client/dist`.

---

## 🚨 STEP 20: Backup & Recovery

### Automated Backup Script

```bash
# Create backup script
nano ~/backup.sh
```

**Add:**
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=~/backups/$DATE

mkdir -p $BACKUP_DIR

# Backup MongoDB
mongodump --out $BACKUP_DIR/mongodb

# Backup uploads
cp -r ~/taskflow/uploads $BACKUP_DIR/

# Backup .env
cp ~/taskflow/.env $BACKUP_DIR/

# Compress
tar -czf ~/backups/taskflow-$DATE.tar.gz $BACKUP_DIR
rm -rf $BACKUP_DIR

# Keep only last 7 backups
ls -t ~/backups/taskflow-*.tar.gz | tail -n +8 | xargs rm -f

echo "Backup completed: $DATE"
```

**Make executable:**
```bash
chmod +x ~/backup.sh
```

**Schedule daily backups:**
```bash
crontab -e

# Add line (runs at 2 AM daily):
0 2 * * * /home/taskflow/backup.sh >> /home/taskflow/backup.log 2>&1
```

### Restore from Backup

```bash
# Extract backup
tar -xzf taskflow-YYYYMMDD_HHMMSS.tar.gz

# Restore MongoDB
mongorestore backup/mongodb

# Restore uploads
cp -r backup/uploads ~/taskflow/
```

---

## 📊 STEP 21: Health Checks

### Setup Health Check Endpoint

Already available at: `http://your-domain.com/api/settings`

### Monitor Uptime

Use services like:
- UptimeRobot (Free)
- Pingdom
- StatusCake

Configure to ping: `https://yourdomain.com/api/settings` every 5 minutes

---

## 🎯 Complete Deployment Checklist

### Pre-Deployment
- [ ] Code pushed to GitHub
- [ ] Dependencies listed in package.json
- [ ] .env.example file created
- [ ] README updated

### Server Setup
- [ ] VPS created and accessible
- [ ] Non-root user created
- [ ] Node.js installed
- [ ] MongoDB installed or Atlas configured
- [ ] PM2 installed

### Application Setup
- [ ] Code uploaded to server
- [ ] .env file configured
- [ ] Dependencies installed (`npm install`)
- [ ] Application started with PM2
- [ ] PM2 startup script configured

### Web Server
- [ ] Nginx installed
- [ ] Nginx configured as reverse proxy
- [ ] Nginx config tested (`nginx -t`)
- [ ] SSL certificate obtained
- [ ] HTTPS working

### Security
- [ ] Firewall configured (UFW)
- [ ] SSH key authentication (recommended)
- [ ] Default passwords changed
- [ ] CORS configured
- [ ] Rate limiting enabled

### Monitoring
- [ ] PM2 logs accessible
- [ ] Backup script created
- [ ] Cron jobs scheduled
- [ ] Uptime monitoring setup

### Testing
- [ ] Application accessible via domain
- [ ] HTTPS working (green padlock)
- [ ] Can register new user
- [ ] Can create tasks
- [ ] Real-time updates working
- [ ] File uploads working

---

## 🚀 Quick Deploy Script

Save time with this automated script:

```bash
#!/bin/bash
# TaskFlow Quick Deploy Script

echo "🚀 Starting TaskFlow deployment..."

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install MongoDB (or skip if using Atlas)
# ... MongoDB installation commands ...

# Clone repository
git clone https://github.com/yourusername/taskflow.git
cd taskflow

# Install dependencies
npm install

# Setup environment
cp .env.example .env
echo "⚠️  Edit .env file with your configuration"
nano .env

# Start app
pm2 start server.js --name taskflow-api
pm2 startup
pm2 save

# Install Nginx
sudo apt install -y nginx

echo "✅ Basic deployment complete!"
echo "Next steps:"
echo "1. Configure Nginx (see guide)"
echo "2. Setup SSL certificate"
echo "3. Configure domain DNS"
```

---

## 💡 Pro Tips

### 1. Use Environment Variables
Never hardcode secrets!  Always use `.env`

### 2. Monitor Logs Regularly
```bash
pm2 logs taskflow-api --lines 100
```

### 3. Keep Backups
Automate with cron, keep multiple versions

### 4. Test Before Deploying
Always test locally first

### 5. Use Git Tags for Versions
```bash
git tag v1.0.0
git push --tags
```

### 6. Document Changes
Keep a CHANGELOG.md file

### 7. Monitor Performance
```bash
pm2 monit  # Real-time monitoring
```

---

## 🆘 Emergency Procedures

### If App Crashes

```bash
pm2 restart taskflow-api
pm2 logs taskflow-api
```

### If Server is Slow

```bash
# Check resources
htop

# Restart services
pm2 restart all
sudo systemctl restart nginx
```

### If Database Issues

```bash
# Check MongoDB status
sudo systemctl status mongod

# Restart MongoDB
sudo systemctl restart mongod

# Check logs
sudo tail -f /var/log/mongodb/mongod.log
```

---

## 📚 Additional Resources

- **DigitalOcean Tutorials:** https://www.digitalocean.com/community/tutorials
- **Nginx Docs:** https://nginx.org/en/docs/
- **PM2 Docs:** https://pm2.keymetrics.io/docs/
- **MongoDB Docs:** https://docs.mongodb.com/
- **Let's Encrypt:** https://letsencrypt.org/

---

## ✅ Post-Deployment

### Your App is Live! 🎉

**URLs:**
- Website: https://yourdomain.com
- API: https://yourdomain.com/api
- Admin: Login with your admin credentials

### Ongoing Maintenance:

**Weekly:**
- [ ] Check PM2 logs for errors
- [ ] Monitor disk space
- [ ] Review activity logs

**Monthly:**
- [ ] Update system packages
- [ ] Update Node.js packages
- [ ] Review backups
- [ ] Check SSL certificate expiry

**As Needed:**
- [ ] Deploy code updates
- [ ] Scale server resources
- [ ] Add features
- [ ] Optimize performance

---

**Congratulations! Your TaskFlow app is deployed! 🚀**
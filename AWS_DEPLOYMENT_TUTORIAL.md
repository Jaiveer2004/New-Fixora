# Fixora AWS EC2 Deployment Tutorial

Complete step-by-step guide for deploying the Fixora application (Next.js + Express.js) on AWS EC2 with Ubuntu.

---

## Table of Contents
- [Prerequisites](#prerequisites)
- [Part 1: Initial Server Setup](#part-1-initial-server-setup)
- [Part 2: Backend Deployment](#part-2-backend-deployment)
- [Part 3: Frontend Deployment with Nginx](#part-3-frontend-deployment-with-nginx)
- [Part 4: Security Configuration](#part-4-security-configuration)
- [Part 5: Update & Maintenance](#part-5-update--maintenance)
- [Part 6: Troubleshooting](#part-6-troubleshooting)

---

## Prerequisites

Before starting, ensure you have:
- AWS account with EC2 access
- Domain name (optional, but recommended)
- GitHub repository with your Fixora code
- Local terminal/SSH client
- Basic knowledge of Linux commands

### Required Information
- **GitHub Repository URL**: `https://github.com/YOUR_USERNAME/YOUR_REPO.git`
- **Backend Port**: 8000 (from server.js)
- **Frontend Port**: 3000 (Next.js default)
- **EC2 Instance IP**: You'll get this from AWS

---

## Part 1: Initial Server Setup

### Step 1.1: Launch EC2 Instance

1. **Login to AWS Console**
   - Go to EC2 Dashboard
   - Click "Launch Instance"

2. **Configure Instance**
   - **Name**: `Fixora-Production`
   - **OS**: Ubuntu Server 22.04 LTS (Free tier eligible)
   - **Instance Type**: t2.medium or higher (t2.micro may struggle with build)
   - **Key Pair**: Create new or use existing (Download .pem file securely)
   - **Storage**: 20-30 GB minimum

3. **Configure Security Group**
   - Create new security group: `fixora-security-group`
   - Add these inbound rules:
     - SSH (22) - Your IP only
     - HTTP (80) - Anywhere IPv4 (0.0.0.0/0)
     - HTTPS (443) - Anywhere IPv4 (0.0.0.0/0)
     - Custom TCP (8000) - Anywhere IPv4 (for backend API)
     - Custom TCP (3000) - Anywhere IPv4 (for Next.js in production)

4. **Launch Instance**
   - Click "Launch Instance"
   - Wait for instance state to be "Running"
   - Note down the **Public IPv4 Address**

### Step 1.2: Connect to EC2 Instance

**For Windows (using Git Bash or PowerShell):**
```bash
# Navigate to folder containing your .pem key
cd path/to/your/key

# Set correct permissions (Git Bash)
chmod 400 your-key.pem

# Connect to EC2
ssh -i your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

**For Mac/Linux:**
```bash
chmod 400 /path/to/your-key.pem
ssh -i /path/to/your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

### Step 1.3: Update System & Install Dependencies

Once connected to your EC2 instance:

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Git
sudo apt install git -y

# Verify Git installation
git --version
```

### Step 1.4: Install Node.js & npm

```bash
# Download and install Node.js 20.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Install Node.js
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x
```

### Step 1.5: Install PM2 (Process Manager)

```bash
# Install PM2 globally
sudo npm install -g pm2

# Verify installation
pm2 --version

# Setup PM2 to start on system boot
pm2 startup systemd
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu

# Save PM2 configuration
pm2 save
```

---

## Part 2: Backend Deployment

### Step 2.1: Clone Repository

```bash
# Navigate to home directory
cd ~

# Clone your repository
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Navigate to project
cd YOUR_REPO_NAME
```

### Step 2.2: Setup Backend

```bash
# Navigate to backend directory
cd fixora-backend

# Install dependencies
npm install

# This may take 3-5 minutes depending on instance size
```

### Step 2.3: Configure Environment Variables

Create the `.env` file:

```bash
# Open nano editor
nano .env
```

**Paste the following environment variables** (customize with your actual values):

```env
# Server Configuration
NODE_ENV=production
PORT=8000

# Database
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/fixora?retryWrites=true&w=majority

# JWT Secrets
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
SESSION_SECRET=your-super-secret-session-key-min-32-characters-long

# Frontend URL (IMPORTANT FOR CORS)
FRONTEND_URL=http://YOUR_EC2_PUBLIC_IP

# Email Configuration (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
EMAIL_FROM=Fixora <noreply@fixora.com>

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://YOUR_EC2_PUBLIC_IP:8000/api/auth/google/callback

# Razorpay (Payment Gateway)
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret

# OpenAI API (for AI features)
OPENAI_API_KEY=your-openai-api-key

# Encryption
ENCRYPTION_KEY=your-32-character-encryption-key
IV_LENGTH=16

# OTP Configuration
OTP_EXPIRY=300000
MAX_OTP_ATTEMPTS=3

# Session
SESSION_MAX_AGE=86400000
```

**Save and exit:**
- Press `Ctrl + X`
- Press `Y` to confirm
- Press `Enter` to save

### Step 2.4: Test Backend

```bash
# Test if backend runs without errors
node server.js

# You should see:
# Server running on port 8000
# Websocket server is ready.
# MongoDB Connected Successfully

# If it works, stop it with Ctrl+C
```

### Step 2.5: Start Backend with PM2

```bash
# Start server with PM2
pm2 start server.js --name fixora-backend

# Check status
pm2 status

# View logs
pm2 logs fixora-backend

# Save PM2 configuration
pm2 save

# If you need to stop/restart
# pm2 stop fixora-backend
# pm2 restart fixora-backend
```

### Step 2.6: Test Backend API

From your local machine or browser:
```
http://YOUR_EC2_PUBLIC_IP:8000/api-docs
```
You should see the Swagger API documentation.

---

## Part 3: Frontend Deployment with Nginx

### Step 3.1: Install Nginx

```bash
# Install Nginx
sudo apt install nginx -y

# Check Nginx status
sudo systemctl status nginx

# You should see "active (running)"
# Press 'q' to exit

# Enable Nginx to start on boot
sudo systemctl enable nginx
```

### Step 3.2: Setup Frontend

```bash
# Navigate to frontend directory
cd ~/YOUR_REPO_NAME/fixora-frontend

# Install dependencies
npm install

# This will take 5-10 minutes
```

### Step 3.3: Configure Frontend Environment Variables

```bash
# Create .env.local file
nano .env.local
```

**Paste the following:**

```env
# Backend API URL (IMPORTANT)
NEXT_PUBLIC_BACKEND_URL=http://YOUR_EC2_PUBLIC_IP:8000/api

# Google OAuth Client ID (for frontend)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id

# Other public environment variables
NEXT_PUBLIC_APP_NAME=Fixora
```

**Save and exit:**
- `Ctrl + X`, then `Y`, then `Enter`

### Step 3.4: Build Frontend

```bash
# Build Next.js application
npm run build

# This will take 5-15 minutes
# You should see "Compiled successfully"
```

### Step 3.5: Configure Nginx for Next.js

**Option: Nginx as Reverse Proxy (Recommended for Next.js)**

Since Next.js needs to run as a Node.js server, we'll configure Nginx as a reverse proxy:

```bash
# Edit Nginx default configuration
sudo nano /etc/nginx/sites-available/default
```

**Delete all existing content and paste:**

```nginx
server {
    listen 80;
    server_name _;

    # Frontend - Proxy to Next.js server
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API - Proxy to Express server
    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket support for Socket.io
    location /socket.io {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

**Save and exit:**
- `Ctrl + X`, then `Y`, then `Enter`

### Step 3.6: Test & Restart Nginx

```bash
# Test Nginx configuration for syntax errors
sudo nginx -t

# You should see:
# nginx: configuration file /etc/nginx/nginx.conf test is successful

# Restart Nginx
sudo systemctl restart nginx

# Check status
sudo systemctl status nginx
```

### Step 3.7: Start Frontend with PM2

```bash
# Make sure you're in frontend directory
cd ~/YOUR_REPO_NAME/fixora-frontend

# Start Next.js with PM2
pm2 start npm --name "fixora-frontend" -- start

# Check status
pm2 status

# Save configuration
pm2 save

# View logs if needed
# pm2 logs fixora-frontend
```

### Step 3.8: Verify Deployment

Open your browser and visit:
```
http://YOUR_EC2_PUBLIC_IP
```

You should see your Fixora application running! 🎉

---

## Part 4: Security Configuration

### Step 4.1: Configure Firewall (UFW)

```bash
# Enable UFW
sudo ufw enable

# Allow SSH (IMPORTANT - do this first!)
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Check status
sudo ufw status

# After Nginx is properly configured, you can block direct access
# to backend and frontend ports for better security
# sudo ufw deny 8000/tcp
# sudo ufw deny 3000/tcp
```

### Step 4.2: Secure EC2 Security Group

Once Nginx is working properly:

1. Go to AWS EC2 Console
2. Select your instance
3. Click on Security Group
4. **Remove** these rules (since Nginx proxies them):
   - Custom TCP (8000)
   - Custom TCP (3000)
5. Keep only:
   - SSH (22) - Your IP only
   - HTTP (80) - Anywhere
   - HTTPS (443) - Anywhere

### Step 4.3: Setup SSL (HTTPS) with Let's Encrypt

**Only do this if you have a domain name:**

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow the prompts
# Certbot will automatically configure Nginx for HTTPS

# Test automatic renewal
sudo certbot renew --dry-run
```

**Update environment variables after setting up domain:**
- Backend `.env`: Change `FRONTEND_URL` to `https://yourdomain.com`
- Frontend `.env.local`: Change `NEXT_PUBLIC_BACKEND_URL` to `https://yourdomain.com/api`
- Restart services: `pm2 restart all`

---

## Part 5: Update & Maintenance

### 5.1: Fix CORS Error

**Backend Configuration** ([fixora-backend/src/app.js](fixora-backend/src/app.js)):

```javascript
// Update CORS configuration to use environment variable
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}))
```

**Add to `.env`:**
```env
FRONTEND_URL=http://YOUR_EC2_PUBLIC_IP
# Or after setting up domain:
# FRONTEND_URL=https://yourdomain.com
```

### 5.2: Update API Calls in Frontend

Ensure all API calls use the environment variable:

```typescript
// Example: src/services/authService.ts
const response = await api.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/register`, userData);
```

Create a base API configuration file if not exists:

```typescript
// src/lib/api.ts or similar
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000/api';

export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    credentials: 'include'
  });
  return response;
};
```

### 5.3: Deploy Code Updates

**On your local machine:**

```bash
# Make your changes
git add .
git commit -m "Your update message"
git push origin main
```

**On EC2 instance:**

```bash
# Navigate to project directory
cd ~/YOUR_REPO_NAME

# Pull latest changes
git pull origin main

# Update Backend
cd fixora-backend
npm install  # If package.json changed
pm2 restart fixora-backend

# Update Frontend
cd ~/YOUR_REPO_NAME/fixora-frontend
npm install  # If package.json changed
npm run build  # Rebuild
pm2 restart fixora-frontend

# Check if everything is running
pm2 status
pm2 logs
```

### 5.4: Update Environment Variables

**Backend:**
```bash
cd ~/YOUR_REPO_NAME/fixora-backend
nano .env
# Make your changes
# Ctrl+X, Y, Enter

pm2 restart fixora-backend
```

**Frontend:**
```bash
cd ~/YOUR_REPO_NAME/fixora-frontend
nano .env.local
# Make your changes
# Ctrl+X, Y, Enter

npm run build  # Must rebuild for Next.js
pm2 restart fixora-frontend
```

---

## Part 6: Troubleshooting

### 6.1: Check Service Status

```bash
# Check PM2 processes
pm2 status
pm2 logs

# Check specific service logs
pm2 logs fixora-backend --lines 100
pm2 logs fixora-frontend --lines 100

# Check Nginx status
sudo systemctl status nginx

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Check Nginx access logs
sudo tail -f /var/log/nginx/access.log
```

### 6.2: Common Issues & Solutions

#### Issue: "Cannot connect to MongoDB"
**Solution:**
```bash
# Check MongoDB URI in backend .env
cd ~/YOUR_REPO_NAME/fixora-backend
nano .env

# Ensure MongoDB Atlas allows EC2 IP
# Go to MongoDB Atlas -> Network Access -> Add IP Address
# Add your EC2 Public IP or 0.0.0.0/0 (allows all - less secure)
```

#### Issue: "CORS Error"
**Solution:**
```bash
# Update FRONTEND_URL in backend .env
cd ~/YOUR_REPO_NAME/fixora-backend
nano .env
# Set: FRONTEND_URL=http://YOUR_EC2_PUBLIC_IP (or your domain)

pm2 restart fixora-backend
```

#### Issue: "API calls returning 404"
**Solution:**
```bash
# Check NEXT_PUBLIC_BACKEND_URL in frontend
cd ~/YOUR_REPO_NAME/fixora-frontend
nano .env.local
# Set: NEXT_PUBLIC_BACKEND_URL=http://YOUR_EC2_PUBLIC_IP:8000/api

npm run build
pm2 restart fixora-frontend
```

#### Issue: "502 Bad Gateway"
**Solution:**
```bash
# Check if backend/frontend are running
pm2 status

# If not running, start them
cd ~/YOUR_REPO_NAME/fixora-backend
pm2 start server.js --name fixora-backend

cd ~/YOUR_REPO_NAME/fixora-frontend
pm2 start npm --name "fixora-frontend" -- start

# Check Nginx configuration
sudo nginx -t
sudo systemctl restart nginx
```

#### Issue: "Out of Memory / Build Failed"
**Solution:**
```bash
# Increase swap space
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make it permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Try build again
cd ~/YOUR_REPO_NAME/fixora-frontend
npm run build
```

### 6.3: Restart Everything

```bash
# Restart all services
pm2 restart all
sudo systemctl restart nginx

# Check status
pm2 status
sudo systemctl status nginx
```

### 6.4: View Real-time Logs

```bash
# Backend logs
pm2 logs fixora-backend --lines 50

# Frontend logs
pm2 logs fixora-frontend --lines 50

# Nginx error logs
sudo tail -f /var/log/nginx/error.log

# System logs
journalctl -xe
```

---

## Useful PM2 Commands Reference

```bash
# List all processes
pm2 list
pm2 status

# Start a process
pm2 start server.js --name app-name

# Stop a process
pm2 stop app-name
pm2 stop all

# Restart a process
pm2 restart app-name
pm2 restart all

# Delete a process
pm2 delete app-name
pm2 delete all

# View logs
pm2 logs
pm2 logs app-name
pm2 logs --lines 100

# Monitor
pm2 monit

# Save current process list
pm2 save

# Resurrect saved processes
pm2 resurrect

# Update PM2
npm install pm2@latest -g
pm2 update
```

---

## Nginx Commands Reference

```bash
# Test configuration
sudo nginx -t

# Start Nginx
sudo systemctl start nginx

# Stop Nginx
sudo systemctl stop nginx

# Restart Nginx
sudo systemctl restart nginx

# Reload configuration (no downtime)
sudo systemctl reload nginx

# Check status
sudo systemctl status nginx

# View error logs
sudo tail -f /var/log/nginx/error.log

# View access logs
sudo tail -f /var/log/nginx/access.log
```

---

## Production Checklist

- [ ] EC2 instance launched with proper size (t2.medium+)
- [ ] Security group configured (SSH, HTTP, HTTPS)
- [ ] Node.js and PM2 installed
- [ ] Repository cloned
- [ ] Backend .env configured with all variables
- [ ] Backend running with PM2
- [ ] Frontend .env.local configured
- [ ] Frontend built successfully
- [ ] Nginx installed and configured
- [ ] Frontend running with PM2
- [ ] Application accessible via browser
- [ ] CORS configured properly
- [ ] MongoDB Atlas allows EC2 IP
- [ ] PM2 configured to start on boot
- [ ] SSL certificate installed (if using domain)
- [ ] Firewall (UFW) configured
- [ ] Monitoring setup (optional: CloudWatch, PM2 Plus)

---

## Next Steps

1. **Setup Domain**: Point your domain to EC2 IP and setup SSL
2. **Setup Monitoring**: Use PM2 Plus or CloudWatch for monitoring
3. **Setup Backups**: Configure automated database backups
4. **CI/CD Pipeline**: Setup GitHub Actions for automated deployment
5. **Load Balancer**: Add AWS Load Balancer for high availability
6. **Auto Scaling**: Configure Auto Scaling Group for traffic spikes

---

## Support Resources

- **AWS Documentation**: https://docs.aws.amazon.com/ec2/
- **PM2 Documentation**: https://pm2.keymetrics.io/docs/
- **Nginx Documentation**: https://nginx.org/en/docs/
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **MongoDB Atlas**: https://docs.atlas.mongodb.com/

---

**Deployment completed! Your Fixora application should now be live on AWS EC2.** 🚀

For issues or questions, refer to the troubleshooting section or check the service logs.

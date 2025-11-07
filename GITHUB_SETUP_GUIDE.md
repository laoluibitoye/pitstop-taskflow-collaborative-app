# GitHub Setup Guide for TaskFlow

## 🎯 Overview

This guide will help you push your TaskFlow project to GitHub for version control, collaboration, and deployment.

---

## 📋 STEP 1: Prerequisites

### Install Git (if not already installed)

**Windows:**
- Download from: https://git-scm.com/download/win
- Run installer with default options

**Mac:**
```bash
# Using Homebrew
brew install git

# Or install Xcode Command Line Tools
xcode-select --install
```

**Linux:**
```bash
sudo apt install git  # Ubuntu/Debian
```

### Verify Installation

```bash
git --version
# Should show: git version 2.x.x
```

### Configure Git

```bash
# Set your name (will appear in commits)
git config --global user.name "Your Name"

# Set your email
git config --global user.email "your.email@example.com"

# Verify configuration
git config --list
```

---

## 📋 STEP 2: Create GitHub Account

1. Go to https://github.com
2. Click "Sign up"
3. Create account with email/password
4. Verify email address
5. Complete profile setup

---

## 📋 STEP 3: Create New Repository on GitHub

### Via GitHub Website:

1. Click the `+` icon in top-right corner
2. Select "New repository"
3. Fill in details:
   - **Repository name:** `taskflow` (or any name)
   - **Description:** "Real-time collaborative task management application"
   - **Visibility:** 
     - **Public** - Anyone can see (free)
     - **Private** - Only you and collaborators (free for individuals)
   - **Initialize:** 
     - ❌ DON'T check "Add README" (we have one)
     - ❌ DON'T add .gitignore (we have one)
     - ❌ DON'T choose license yet
4. Click "Create repository"

### You'll see a screen with instructions - **don't follow them yet!**

---

## 📋 STEP 4: Initialize Git in Your Project

### Open Terminal in Project Directory

```bash
# Navigate to your project
cd C:\Users\Laolu Ibitoye\Desktop\Kilo-Code-Playground

# Or if you're already there, just run:
pwd  # Should show your project path
```

### Initialize Git Repository

```bash
# Initialize git
git init

# Verify initialization
git status
# Should show many untracked files
```

---

## 📋 STEP 5: Stage and Commit Files

### Add All Files to Git

```bash
# Add all files (respects .gitignore automatically)
git add .

# Check what will be committed
git status

# You should see files in green (staged) but NOT:
# - node_modules/
# - .env
# - uploads/
# These are ignored by .gitignore
```

### Create First Commit

```bash
# Commit with descriptive message
git commit -m "Initial commit: Complete backend with React foundation"

# Verify commit
git log --oneline
```

---

## 📋 STEP 6: Connect to GitHub

### Add Remote Repository

```bash
# Replace with YOUR repository URL from GitHub
git remote add origin https://github.com/YOUR_USERNAME/taskflow.git

# Verify remote
git remote -v
# Should show:
# origin  https://github.com/YOUR_USERNAME/taskflow.git (fetch)
# origin  https://github.com/YOUR_USERNAME/taskflow.git (push)
```

---

## 📋 STEP 7: Push to GitHub

### Push Your Code

```bash
# Push to GitHub (first time)
git push -u origin main

# OR if your default branch is "master"
git push -u origin master

# Enter GitHub username and password when prompted
```

### If Using GitHub Personal Access Token (Recommended):

GitHub now requires Personal Access Tokens instead of passwords for HTTPS.

**Create Token:**
1. Go to: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a name: "TaskFlow Development"
4. Select scopes:
   - ✅ `repo` (full control of private repositories)
5. Click "Generate token"
6. **COPY THE TOKEN IMMEDIATELY** (you won't see it again!)

**Use Token as Password:**
```bash
git push -u origin main

# Username: your-github-username
# Password: paste-your-token-here
```

### Alternative: SSH Key (More Secure)

**Generate SSH Key:**
```bash
# Generate key
ssh-keygen -t ed25519 -C "your.email@example.com"

# Press Enter for default location
# Enter passphrase (optional but recommended)

# Copy public key
cat ~/.ssh/id_ed25519.pub
# Copy the output
```

**Add to GitHub:**
1. Go to: https://github.com/settings/keys
2. Click "New SSH key"
3. Title: "My Development Machine"
4. Paste your public key
5. Click "Add SSH key"

**Change Remote to SSH:**
```bash
# Remove HTTPS remote
git remote remove origin

# Add SSH remote
git remote add origin git@github.com:YOUR_USERNAME/taskflow.git

# Push
git push -u origin main
```

---

## 📋 STEP 8: Verify Upload

### Check GitHub Repository

1. Go to: https://github.com/YOUR_USERNAME/taskflow
2. You should see all your files!
3. Check that `.env` is NOT there (security!)
4. Verify README.md displays properly

---

## 📋 STEP 9: Make Updates

### After Making Code Changes

```bash
# Check what changed
git status

# Add changed files
git add .

# Or add specific files
git add src/components/NewComponent.jsx

# Commit changes
git commit -m "Add new feature: task sharing UI"

# Push to GitHub
git push

# Your changes are now on GitHub!
```

### Good Commit Message Format

```bash
git commit -m "Add user authentication system"
git commit -m "Fix: Progress bar not updating"
git commit -m "Update: Improve real-time sync performance"
git commit -m "Docs: Add deployment guide"
```

---

## 📋 STEP 10: Working with Branches

### Create Feature Branch

```bash
# Create and switch to new branch
git checkout -b feature/task-sharing

# Make your changes
# ... code changes ...

# Commit changes
git add .
git commit -m "Add task sharing feature"

# Push branch to GitHub
git push -u origin feature/task-sharing

# Switch back to main
git checkout main

# Merge feature when ready
git merge feature/task-sharing

# Push updated main
git push
```

---

## 📋 STEP 11: Collaborate with Others

### Give Access to Repository

**For Private Repo:**
1. Go to repo on GitHub
2. Click "Settings"
3. Click "Collaborators"
4. Click "Add people"
5. Enter GitHub username or email
6. They'll receive invitation

### Clone Repository (for teammates)

```bash
# They clone your repository
git clone https://github.com/YOUR_USERNAME/taskflow.git
cd taskflow

# Install dependencies
npm install
cd client
npm install
cd ..

# Create .env file (they need to create their own)
cp .env.example .env
# Edit .env with their configuration

# Run application
npm start
```

---

## 📋 STEP 12: Important Files to Include

### Verify These Files are Committed:

✅ **Code Files:**
- `server.js`
- `package.json`
- All `/models`, `/routes`, `/middleware` folders
- `.gitignore`

✅ **Documentation:**
- `README.md`
- `DEPLOYMENT_GUIDE.md`
- `API_REFERENCE.md`
- All guide files

✅ **Configuration Templates:**
- `.env.example` (NOT `.env`)
- `package.json`

❌ **Never Commit:**
- `.env` (contains secrets!)
- `node_modules/` (too large, auto-installed)
- `uploads/` (user data, should be backed up separately)
- Personal credentials

---

## 📋 STEP 13: Create README Badge (Optional)

Add status badges to your README:

```markdown
![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Status](https://img.shields.io/badge/status-production-success)
```

---

## 📋 STEP 14: Use GitHub for Deployment

### Deploy to Render from GitHub

1. **Connect GitHub to Render:**
   - Sign up at https://render.com
   - Click "New +" → "Web Service"
   - Select "Git Provider" → "GitHub"
   - Authorize Render to access your repos
   - Select your `taskflow` repository

2. **Configure Service:**
   - Name: `taskflow-api`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Add Environment Variables (from your `.env` file)

3. **Deploy:**
   - Click "Create Web Service"
   - Render auto-deploys on every GitHub push!

### Deploy to Railway from GitHub

Similar process:
1. Connect GitHub
2. Select repository
3. Configure environment variables
4. Railway auto-detects Node.js
5. Deploys automatically

---

## 📋 STEP 15: GitHub Actions (CI/CD - Advanced)

### Auto-Deploy on Push

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to VPS

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to VPS
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd ~/taskflow
            git pull
            npm install
            pm2 restart taskflow-api
```

**Setup Secrets:**
1. Go to repo Settings → Secrets → Actions
2. Add `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`

---

## 🔍 STEP 16: Useful Git Commands

### Check Status
```bash
git status  # See what changed
```

### View Commit History
```bash
git log  # View all commits
git log --oneline  # Compact view
git log --graph --all  # Visual graph
```

### Undo Changes
```bash
# Discard changes to a file
git checkout -- filename

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1
```

### Update from GitHub
```bash
# Pull latest changes
git pull

# If you have local changes
git stash  # Save changes temporarily
git pull
git stash pop  # Restore changes
```

### View Differences
```bash
# See what changed
git diff

# See what's staged
git diff --staged
```

---

## 📋 STEP 17: GitHub for Team Collaboration

### Pull Requests

1. **Create feature branch**
2. **Make changes and push**
3. **On GitHub:** Click "New Pull Request"
4. **Describe changes**
5. **Request review from team**
6. **Merge when approved**

### Issues

Track bugs and features:
1. Go to "Issues" tab
2. Click "New Issue"
3. Describe the issue
4. Assign to person
5. Label appropriately (bug, feature, etc.)

### Projects

Organize work:
1. Click "Projects" tab
2. Create new project
3. Add issues and pull requests
4. Track progress visually

---

## 📋 STEP 18: Repository Settings

### Recommended Settings:

**Settings → General:**
- ✅ Restrict editing to collaborators
- ✅ Automatically delete head branches

**Settings → Branches:**
- Add branch protection rule for `main`:
  - ✅ Require pull request before merging
  - ✅ Require status checks to pass

**Settings → Security:**
- ✅ Enable Dependabot alerts
- ✅ Enable secret scanning

---

## 📋 STEP 19: README Enhancements for GitHub

Add to your README.md:

```markdown
## 🚀 Quick Start

\`\`\`bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/taskflow.git
cd taskflow

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Start MongoDB
mongod

# Run application
npm start
\`\`\`

## 📚 Documentation

- [API Reference](API_REFERENCE.md)
- [Deployment Guide](DEPLOYMENT_GUIDE.md)
- [Features Documentation](FEATURES_DOCUMENTATION.md)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open Pull Request
```

---

## ✅ Final GitHub Checklist

Before pushing to GitHub:

- [ ] `.gitignore` file created
- [ ] `.env.example` exists (template)
- [ ] `.env` file NOT in git (check: `git status`)
- [ ] README.md is complete
- [ ] All secrets removed from code
- [ ] Dependencies in package.json
- [ ] Code tested locally
- [ ] Commit messages are descriptive

---

## 🚀 Quick Push Commands (Summary)

```bash
# First time setup
git init
git add .
git commit -m "Initial commit: TaskFlow backend + React foundation"
git remote add origin https://github.com/YOUR_USERNAME/taskflow.git
git push -u origin main

# Future updates
git add .
git commit -m "Your commit message"
git push
```

---

## 📊 Repository Structure on GitHub

```
taskflow/  (Your repository)
├── README.md
├── package.json
├── server.js
├── .gitignore
├── .env.example
│
├── models/
├── routes/
├── middleware/
│
├── client/  (React frontend)
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│
├── public/
│   ├── manifest.json
│   └── sw.js
│
└── Documentation files
    ├── DEPLOYMENT_GUIDE.md
    ├── API_REFERENCE.md
    ├── BEGINNER_REACT_GUIDE.md
    ├── VPS_DEPLOYMENT_GUIDE.md
    └── GITHUB_SETUP_GUIDE.md
```

---

## 🔒 Security Notes

### Never Commit These:
- `.env` file (contains secrets!)
- `node_modules/` (dependencies)
- Database files
- Personal API keys
- Passwords
- JWT secrets

### Always Commit:
- `.env.example` (template without secrets)
- Source code files
- Documentation
- `.gitignore`
- `package.json`
- Configuration templates

---

## 💡 Pro Tips

### 1. Write Good Commit Messages
```bash
# Good
git commit -m "Add user authentication with JWT"
git commit -m "Fix: Progress bar animation issue"
git commit -m "Update: Improve error handling in task API"

# Bad
git commit -m "update"
git commit -m "fixes"
git commit -m "changes"
```

### 2. Commit Often
Commit small, logical changes frequently rather than large dumps.

### 3. Use Branches for Features
```bash
git checkout -b feature/task-sharing
# Make changes
git commit -m "Add task sharing"
git checkout main
git merge feature/task-sharing
```

### 4. Pull Before Push
```bash
git pull  # Get latest changes
git push  # Then push yours
```

### 5. Use .gitignore Properly
Already created for you! It excludes:
- Environment files (.env)
- Dependencies (node_modules)
- Build outputs
- Uploads folder
- Logs

---

## 🌟 Making Repository Professional

### Add These Files (Optional):

**1. LICENSE**
```text
MIT License

Copyright (c) 2025 Your Name

Permission is hereby granted...
```

**2. CONTRIBUTING.md**
Guidelines for contributors

**3. CODE_OF_CONDUCT.md**
Community standards

**4. CHANGELOG.md**
Version history and changes

**5. .github/ISSUE_TEMPLATE/**
Issue templates for bugs/features

---

## 🎯 After Pushing to GitHub

### Your Repository will have:

1. **Code Tab:** All your files visible
2. **Issues Tab:** Track bugs and features
3. **Pull Requests:** Review code changes
4. **Actions Tab:** CI/CD workflows
5. **Projects Tab:** Project management
6. **Wiki Tab:** Additional documentation
7. **Insights Tab:** Analytics and graphs

### Share Your Repository:

**Repository URL:**
```
https://github.com/YOUR_USERNAME/taskflow
```

**Clone URL (for others):**
```bash
git clone https://github.com/YOUR_USERNAME/taskflow.git
```

---

## 🔄 Keeping Repository Updated

### Regular Updates

```bash
# After making changes
git add .
git commit -m "Description of changes"
git push

# That's it! Changes are on GitHub
```

### Tagging Releases

```bash
# Create tag for version
git tag -a v1.0.0 -m "Version 1.0.0 - Initial release"

# Push tags to GitHub
git push --tags

# Create release on GitHub from tag
# Go to Releases → Draft new release → Select tag
```

---

## 🎓 Learning Git

### Essential Commands to Learn:

1. `git init` - Start new repository
2. `git add` - Stage files for commit
3. `git commit` - Save changes
4. `git push` - Upload to GitHub
5. `git pull` - Download from GitHub
6. `git status` - See current state
7. `git log` - View history
8. `git branch` - Manage branches
9. `git checkout` - Switch branches
10. `git merge` - Combine branches

### Resources:
- Git Tutorial: https://git-scm.com/docs/gittutorial
- GitHub Guides: https://guides.github.com
- Interactive Learning: https://learngitbranching.js.org

---

## ✅ Success Checklist

After following this guide:

- [ ] Git installed and configured
- [ ] GitHub account created
- [ ] Repository created on GitHub
- [ ] Local git initialized
- [ ] Files staged and committed
- [ ] Remote origin added
- [ ] Code pushed to GitHub
- [ ] Repository visible on GitHub
- [ ] `.env` not in repository (security check!)
- [ ] README displays properly on GitHub

---

## 🎉 Congratulations!

Your TaskFlow project is now on GitHub! You can:
- ✅ Version control your code
- ✅ Collaborate with teammates
- ✅ Deploy from GitHub to hosting services
- ✅ Track issues and features
- ✅ Showcase your work
- ✅ Back up your code safely

**Repository Example:**
https://github.com/YOUR_USERNAME/taskflow

**Next Steps:**
1. Add collaborators if working with a team
2. Set up continuous deployment
3. Keep pushing updates regularly
4. Use issues to track work

---

**Happy Coding! 🚀**
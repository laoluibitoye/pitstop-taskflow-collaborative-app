# TaskFlow - Complete Deployment Guide

## 🚀 Quick Start

### Prerequisites
- Node.js v14 or higher
- MongoDB installed and running
- Git (optional)

### Installation Steps

#### 1. Install Dependencies
```bash
npm install
```

#### 2. Set Up Environment Variables
Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/taskflow

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Admin Configuration (for initial admin user)
ADMIN_EMAIL=admin@taskflow.com
ADMIN_PASSWORD=Admin@123

# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=15

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

#### 3. Start MongoDB
```bash
# Windows
mongod

# Linux/Mac
sudo systemctl start mongod
# or
brew services start mongodb-community
```

#### 4. Run the Application
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

#### 5. Access the Application
Open your browser and navigate to:
```
http://localhost:3000
```

#### 6. Login as Admin
First-time setup creates a default admin user:
- **Email:** admin@taskflow.com
- **Password:** Admin@123

**⚠️ IMPORTANT:** Change the admin password immediately after first login!

---

## 📋 Features Overview

### 🔐 Authentication System
- **User Registration** with email validation and strong password requirements
- **Login System** with JWT tokens
- **Guest Mode** with limitations (1 task, 1 comment)
- **Guest Conversion** - seamlessly convert guests to registered users
- **Session Management** with 7-day token expiration

### 👥 User Roles
- **Admin:** Full access to dashboard, user management, settings
- **User:** Create tasks, comments, upload files
- **Guest:** Limited access (1 task, 1 comment before registration required)

### 📊 Admin Dashboard
Access at: `http://localhost:3000` → Login as admin → Click "Admin Dashboard"

**Dashboard Features:**
- **User Management**
  - View all users with search and filters
  - Change user roles (user ↔ admin)
  - Suspend/activate accounts
  - View user activity
  
- **Task Management**
  - View all tasks across all dates
  - Archive tasks
  - Delete tasks
  - View task history
  
- **Activity Logs**
  - Track all user actions
  - Filter by user, action type, date range
  - Export logs for auditing
  
- **App Settings**
  - Customize app title and branding
  - Modify theme colors
  - Configure welcome messages
  - Set file upload limits
  - Toggle features on/off
  
- **Statistics Dashboard**
  - Total users, active users, guests
  - Task completion rates
  - File upload statistics
  - Activity trends

### 📁 File Management
- **Upload Files** to tasks or comments
- **Supported Types:** Images (JPEG, PNG, GIF), PDFs, Documents (Word, Excel)
- **File Size Limit:** 5MB (configurable)
- **Features:**
  - Drag-and-drop upload
  - Progress indicators
  - Image thumbnails
  - File preview
  - Download files
  - Delete own files (admins can delete any)

### 🔔 Real-Time Features
- **Live Task Updates** - See changes instantly
- **Active Users Tracking** - Know who's online
- **Real-time Comments** - Collaborative discussions
- **Progress Updates** - Live progress bars
- **Notifications** - Guest limit warnings, errors

### 📝 Activity Logging
Every action is logged:
- User registrations and logins
- Task creation, updates, deletion
- Comment posts
- File uploads/downloads
- Role changes
- Settings updates

---

## 🔧 Configuration

### File Upload Settings
Edit in Admin Dashboard → Settings:
- `maxFileSize`: Maximum file size in bytes (default: 5MB)
- `allowedFileTypes`: Array of MIME types
- `allowFileUploads`: Enable/disable file uploads

### Guest Mode Settings
- `allowGuestUsers`: Enable/disable guest access
- `guestTaskLimit`: Max tasks per guest (default: 1)
- `guestCommentLimit`: Max comments per guest (default: 1)

### Theme Customization
Admin can customize colors:
- Primary Color (buttons, links)
- Secondary Color (accents)
- Success Color (completed tasks)
- Warning Color (alerts)
- Danger Color (errors, delete buttons)

---

## 🗄️ Database Schema

### Collections
- **users** - User accounts and authentication
- **tasks** - Task data with progress tracking
- **comments** - Threaded comments on tasks
- **files** - File uploads metadata
- **activitylogs** - All user actions (90-day retention)
- **appsettings** - Application configuration

### Indexes
Optimized queries with indexes on:
- `users.email`
- `tasks.date`, `tasks.createdBy`
- `comments.taskId`, `comments.author`
- `files.taskId`, `files.uploadedBy`
- `activitylogs.user`, `activitylogs.createdAt`

---

## 🔒 Security Features

### Authentication
- **JWT Tokens** with 7-day expiration
- **Bcrypt Password Hashing** (10 rounds)
- **Password Requirements:**
  - Minimum 8 characters
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 number
  - At least 1 special character

### Authorization
- **Role-based access control**
- **Route protection** with middleware
- **Resource ownership verification**
- **Admin-only endpoints**

### Security Headers
- **Helmet.js** - Secure HTTP headers
- **CORS** - Configured origin control
- **Rate Limiting** - 100 requests per 15 minutes
- **Input Validation** - Express-validator
- **XSS Protection** - HTML escaping

### File Upload Security
- **File type validation** (whitelist)
- **File size limits**
- **Unique file naming** (prevents overwrites)
- **Path traversal prevention**

---

## 📡 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - User login
- `POST /guest` - Create guest user
- `POST /convert-guest` - Convert guest to user
- `GET /me` - Get current user
- `POST /logout` - Logout user

### Tasks (`/api/tasks`)
- `GET /` - Get tasks for date
- `POST /` - Create task
- `PATCH /:id/progress` - Update progress
- `DELETE /:id` - Delete task
- `POST /:id/comments` - Add comment
- `DELETE /:taskId/comments/:commentId` - Delete comment

### Files (`/api/files`)
- `POST /upload` - Upload file
- `GET /:id` - Download file
- `GET /task/:taskId` - Get task files
- `DELETE /:id` - Delete file

### Admin (`/api/admin`) - Admin Only
- `GET /users` - List all users
- `PATCH /users/:id/role` - Change user role
- `PATCH /users/:id/suspend` - Suspend user
- `PATCH /users/:id/activate` - Activate user
- `GET /tasks` - List all tasks
- `PATCH /tasks/:id/archive` - Archive task
- `GET /activity-logs` - Get activity logs
- `GET /settings` - Get app settings
- `PUT /settings` - Update app settings
- `GET /stats` - Get dashboard statistics

---

## 🧪 Testing

### Test User Accounts
Create test users via the interface or API:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test@123456"
  }'
```

### Test Guest Mode
1. Open app in incognito window
2. Enter guest name
3. Try creating 2 tasks (2nd should trigger registration prompt)
4. Convert guest to user

### Test File Upload
1. Login as user
2. Open a task
3. Click file upload button
4. Select file (under 5MB)
5. Verify file appears in task

### Test Admin Features
1. Login as admin
2. Navigate to Admin Dashboard
3. Test user management operations
4. Update app settings
5. View activity logs

---

## 🚀 Production Deployment

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/taskflow
JWT_SECRET=very-long-random-secret-key-change-this
CORS_ORIGIN=https://yourdomain.com
```

### PM2 Process Manager
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start server.js --name taskflow

# View logs
pm2 logs taskflow

# Monitor
pm2 monit

# Restart
pm2 restart taskflow

# Auto-start on reboot
pm2 startup
pm2 save
```

### Nginx Reverse Proxy
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### SSL Certificate (Let's Encrypt)
```bash
sudo certbot --nginx -d yourdomain.com
```

### MongoDB Atlas (Cloud Database)
1. Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

---

## 🔍 Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Start MongoDB service
```bash
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # Mac
```

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Solution:** Change port in `.env` or kill process using port 3000

### File Upload Error
```
Error: LIMIT_FILE_SIZE
```
**Solution:** File exceeds size limit. Increase `MAX_FILE_SIZE` in `.env`

### JWT Token Issues
```
Error: jwt expired / jwt malformed
```
**Solution:** Token expired or invalid. Re-login to get new token

### Permission Denied
```
Error: Not authorized to access this route
```
**Solution:** User doesn't have required role. Login as admin or check permissions

---

## 📚 Additional Resources

### Project Structure
```
taskflow/
├── models/              # Database models
│   ├── User.js
│   ├── Task.js
│   ├── Comment.js
│   ├── File.js
│   ├── ActivityLog.js
│   └── AppSettings.js
├── routes/              # API routes
│   ├── auth.js
│   ├── tasks.js
│   ├── files.js
│   └── admin.js
├── middleware/          # Custom middleware
│   ├── auth.js
│   ├── activityLogger.js
│   └── upload.js
├── public/              # Frontend files
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── uploads/             # Uploaded files (created automatically)
├── .env                 # Environment variables
├── .env.example         # Example environment file
├── server.js            # Main server file
└── package.json         # Dependencies

```

### Default Admin Credentials
- Email: `admin@taskflow.com`
- Password: `Admin@123`

**Change immediately after first login!**

---

## 🆘 Support

For issues or questions:
1. Check this documentation
2. Review error logs: `pm2 logs taskflow`
3. Check MongoDB logs
4. Review browser console for frontend errors

---

## 📄 License

This project is open source and available for personal and commercial use.
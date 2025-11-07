# 📋 TaskFlow - Collaborative Task Manager

A comprehensive, real-time collaborative task management application with admin dashboard, authentication, file management, and advanced task features. Built with Node.js, Express, MongoDB, Socket.io, and modern web technologies.

## ✨ Key Features

### 🎯 Core Features
- **Real-Time Collaboration** - See updates instantly as your team works
- **Guest Mode** - Jump right in with just a name (1 task, 1 comment limit)
- **User Authentication** - Secure JWT-based login and registration
- **Admin Dashboard** - Comprehensive control over users, tasks, and settings
- **File Management** - Upload, share, and manage files on tasks
- **Activity Logging** - Complete audit trail of all actions

### ⏰ Time Management
- **Deadlines** - Set task deadlines with visual countdown
- **Time Extensions** - Extend deadlines with reason tracking
- **Extension History** - View all deadline changes
- **Auto-Status Updates** - Tasks auto-marked as "delayed" when overdue
- **Flexible Units** - Extend by hours or days

### 📋 Advanced Task Features
- **Sub-Tasks** - Break complex tasks into smaller steps
- **Auto-Progress** - Progress calculated from sub-task completion
- **Visual Indicators** - Tree icons for tasks with sub-tasks
- **Task Status** - Ongoing, Completed, Delayed, Cancelled
- **Categories & Tags** - Organize tasks with custom categories
- **Priority Levels** - Low, Medium, High, Urgent
- **Task Assignment** - Assign tasks to team members

### 🎨 Modern UI/UX
- **Neomorphism Design** - Soft shadows and tactile interface
- **Light/Dark Mode** - Toggle between themes with smooth transitions
- **Vibrant Colors** - Strategic use of gradients and highlights
- **Smooth Animations** - Micro-interactions and transitions
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Landing Page** - Beautiful hero section with feature highlights

### 🔒 Security Features
- **JWT Authentication** - Secure token-based sessions
- **Password Requirements** - Strong password enforcement
- **Role-Based Access** - Admin and User roles
- **Rate Limiting** - Prevent API abuse
- **Input Validation** - All inputs sanitized and validated
- **File Type Restrictions** - Secure file uploads

### 👑 Admin Capabilities
- **User Management** - View, suspend, activate users; change roles
- **Task Moderation** - Edit, archive, delete any task
- **Activity Monitoring** - View all user actions with filters
- **Settings Control** - Customize app title, colors, features
- **Statistics Dashboard** - User stats, task metrics, activity trends
- **Dynamic Configuration** - Change app behavior without code changes

---

## 🚀 Quick Start

### Prerequisites
- Node.js v14+ 
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your settings
```

3. **Start MongoDB:**
```bash
mongod
```

4. **Run application:**
```bash
npm start
```

5. **Access application:**
```
http://localhost:3000
```

### Default Admin Account
- **Email:** admin@taskflow.com
- **Password:** Admin@123
- ⚠️ **Change password immediately after first login!**

---

## 📖 Documentation

- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Complete deployment instructions, API docs, troubleshooting
- **[FEATURES_DOCUMENTATION.md](FEATURES_DOCUMENTATION.md)** - Detailed feature guide with examples
- **[IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md)** - Current implementation status and roadmap

---

## 🎯 Feature Highlights

### Task Management
```javascript
// Create task with deadline and category
{
  "text": "Complete project proposal",
  "deadline": "2025-11-15T17:00:00Z",
  "category": "Sales",
  "priority": "high",
  "tags": ["client", "proposal"]
}

// Add sub-tasks
POST /api/tasks/:id/subtasks
{ "text": "Research competitors" }
{ "text": "Create pricing model" }
{ "text": "Design presentation" }

// Extend deadline
POST /api/tasks/:id/extend-deadline
{
  "extensionAmount": 3,
  "extensionUnit": "days",
  "reason": "Client requested additional features"
}

// Change status
PATCH /api/tasks/:id/status
{ "status": "completed" }
```

### Filtering & Organization
```javascript
// Get tasks by category
GET /api/tasks?category=Development&status=ongoing

// Get overdue tasks
GET /api/tasks/overdue

// Search tasks
GET /ap/tasks?search=proposal&sortBy=deadline&sortOrder=asc

// Get all categories
GET /api/tasks/categories
```

### Guest Mode & Authentication
```javascript
// Guest joins (limited: 1 task, 1 comment)
POST /api/auth/guest
{ "name": "John Visitor" }

// Guest converts to full user
POST /api/auth/convert-guest
{
  "email": "john@example.com",
  "password": "SecurePass@123"
}

// User registration
POST /api/auth/register
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "SecurePass@123"
}

// Login
POST /api/auth/login
{
  "email": "jane@example.com",
  "password": "SecurePass@123"
}
```

### File Management
```javascript
// Upload file to task
POST /api/files/upload
FormData: { file, taskId, commentId? }

// Get all files for task
GET /api/files/task/:taskId

// Download file
GET /api/files/:id

// Delete file (own files or admin)
DELETE /api/files/:id
```

### Admin Operations
```javascript
// Get all users
GET /api/admin/users?search=john&role=user

// Change user role
PATCH /api/admin/users/:id/role
{ "role": "admin" }

// Suspend user
PATCH /api/admin/users/:id/suspend

// View activity logs
GET /api/admin/activity-logs?userId=xxx&action=task_created&startDate=2025-11-01

// Update app settings
PUT /api/admin/settings
{
  "appTitle": "My Task Manager",
  "theme": {
    "primaryColor": "#6366f1"
  },
  "features": {
    "guestTaskLimit": 3
  }
}

// Get dashboard stats
GET /api/admin/stats
```

---

## 🏗️ Project Structure

```
taskflow/
├── models/              # Mongoose schemas
│   ├── User.js         # User authentication & roles
│   ├── Task.js         # Tasks with sub-tasks, deadlines, status
│   ├── Comment.js      # Threaded comments
│   ├── File.js         # File upload metadata
│   ├── ActivityLog.js  # Audit trail
│   └── AppSettings.js  # Dynamic configuration
├── routes/              # API endpoints
│   ├── auth.js         # Authentication routes
│   ├── tasks.js        # Task CRUD + features
│   ├── files.js        # File upload/download
│   └── admin.js        # Admin dashboard API
├── middleware/          # Custom middleware
│   ├── auth.js         # JWT verification, role checks
│   ├── activityLogger.js # Automatic activity logging
│   └── upload.js       # Multer file upload config
├── public/              # Frontend (needs enhancement)
│   ├── index.html      # HTML structure
│   ├── styles.css      # Neomorphism design system
│   └── app.js          # Frontend JavaScript
├── uploads/             # File storage (auto-created)
├── .env                 # Environment configuration
├── server.js            # Main application server
└── package.json         # Dependencies
```

---

## 📡 API Endpoints Summary

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - User login  
- `POST /guest` - Create guest user
- `POST /convert-guest` - Convert guest to registered user
- `GET /me` - Get current user
- `POST /logout` - Logout

### Tasks (`/api/tasks`)
- `GET /` - Get tasks (with filters: date, status, category, priority, search)
- `GET /categories` - Get all categories
- `GET /overdue` - Get overdue tasks
- `GET /:id` - Get single task with details
- `POST /` - Create task
- `PATCH /:id` - Update task
- `PATCH /:id/progress` - Update progress
- `PATCH /:id/status` - Change status
- `POST /:id/extend-deadline` - Extend deadline
- `POST /:id/subtasks` - Add sub-task
- `PATCH /:id/subtasks/:subtaskId/complete` - Complete sub-task
- `DELETE /:id` - Delete task
- `POST /:id/comments` - Add comment
- `DELETE /:taskId/comments/:commentId` - Delete comment

### Files (`/api/files`)
- `POST /upload` - Upload file
- `GET /:id` - Download file
- `GET /task/:taskId` - Get all task files
- `DELETE /:id` - Delete file

### Admin (`/api/admin`)
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

## 🔄 Real-Time Events (Socket.io)

### Client → Server
- `join` - Join with token or guest name
- `requestTaskList` - Get tasks for date
- `addTask` - Create task
- `updateProgress` - Update progress
- `changeStatus` - Change task status  
- `addSubTask` - Add sub-task
- `completeSubTask` - Complete sub-task
- `extendDeadline` - Extend deadline
- `addComment` - Add comment
- `deleteTask` - Delete task

### Server → Client
- `taskList` - Task list for date
- `taskAdded` - New task created
- `progressUpdated` - Progress changed
- `statusChanged` - Status changed
- `subTaskAdded` - Sub-task added
- `subTaskCompleted` - Sub-task completed
- `deadlineExtended` - Deadline extended
- `commentAdded` - Comment posted
- `taskDeleted` - Task deleted
- `activeUsers` - Active users list
- `guestLimitReached` - Guest limit warning
- `error` - Error notification

---

## 🎨 UI Components

### Task Card Shows:
- ✅ Task title and description
- 📊 Progress bar with percentage
- 🏷️ Status badge (color-coded)
- 📁 Category label
- 🎯 Priority indicator
- 📅 Deadline with countdown
- 🌲 Sub-tasks indicator (tree icon)
- 💬 Comment count
- 👤 Creator name
- 🕒 Timestamp

### Task Detail View Shows:
- All task information
- Sub-tasks list with checkboxes
- Deadline extension history
- All comments threaded
- File attachments
- Progress controls
- Status change buttons

---

## 💡 Usage Examples

### Example 1: Project with Multiple Sub-tasks
```
Main Task: "Launch E-commerce Website"
Category: Projects
Priority: Urgent
Deadline: 2025-12-01
Status: Ongoing

Sub-tasks:
✅ Design product pages
✅ Develop shopping cart
□ Setup payment gateway
□ Test checkout flow
□ Deploy to production

Progress: 40% (2/5 sub-tasks completed)
```

### Example 2: Task with Extensions
```
Task: "Q4 Financial Report"
Original Deadline: Nov 10, 5:00 PM
Extension 1: +2 days (Data collection delay)
Extension 2: +12 hours (Executive review)
Current Deadline: Nov 12, 5:00 PM
Status: Ongoing → Delayed → Ongoing (after extension)
```

### Example 3: Organized Tasks
```
Category: Development
├── Fix login bug (Priority: Urgent, Status: Ongoing)
├── Add dark mode (Priority: High, Status: Completed)
└── Optimize database (Priority: Medium, Status: Ongoing)

Category: Design
├── Redesign homepage (Priority: High, Status: Ongoing)
└── Create brand guidelines (Priority: Low, Status: Cancelled)

Category: Documentation
└── API documentation (Priority: Medium, Status: Completed)
```

---

## 🔐 Security Best Practices

### For Deployment
1. Change default admin password
2. Use strong JWT_SECRET (64+ random characters)
3. Enable HTTPS in production
4. Use MongoDB Atlas or secure database
5. Set proper CORS_ORIGIN
6. Enable rate limiting
7. Regular security updates

### Password Requirements
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter  
- At least 1 number
- At least 1 special character (@$!%*?&)

---

## 📊 Database Models

### User Model
- Authentication credentials
- Role (admin/user)
- Guest mode support
- Guest limits tracking
- Activity tracking

### Task Model (Enhanced)
- Basic info (text, description, date)
- **Deadline management** (deadline, extensions, original)
- **Sub-tasks** (unlimited, with tracking)
- **Status** (ongoing, completed, delayed, cancelled)
- **Organization** (category, tags, priority)
- Progress tracking
- Assignment capability
- Archive support

### Comment Model
- Text content
- Author tracking
- Task association
- Timestamps

### File Model
- File metadata
- Upload tracking
- Task/comment association
- Image detection

### ActivityLog Model
- User actions
- Timestamps
- IP tracking
- 90-day retention

### AppSettings Model
- Dynamic configuration
- Theme customization
- Feature toggles
- Limits configuration

---

## 🛠️ Technology Stack

**Backend:**
- Node.js & Express
- MongoDB & Mongoose
- Socket.io (real-time)
- JWT (authentication)
- Bcrypt.js (password hashing)
- Multer (file uploads)

**Security:**
- Helmet.js (security headers)
- Express-validator (input validation)
- Express-rate-limit (rate limiting)
- CORS (cross-origin control)

**Frontend:**
- HTML5, CSS3, JavaScript
- Font Awesome icons
- Neomorphism design
- CSS animations

---

## 📈 Scalability

### Current Limitations
- In-process memory for active users
- Local file storage
- Single server instance

### Production Recommendations
1. **Database:** MongoDB Atlas with replica sets
2. **File Storage:** AWS S3 or similar cloud storage
3. **Cache:** Redis for session management
4. **Load Balancer:** Multiple server instances with sticky sessions
5. **Socket.io Adapter:** Redis adapter for multi-server support
6. **CDN:** CloudFlare or AWS CloudFront for static assets

---

## 🎓 Learning & Development

### What You'll Learn
- Building real-time applications with Socket.io
- JWT authentication and authorization
- Role-based access control
- File upload handling with Multer
- MongoDB schema design with Mongoose
- RESTful API design
- Activity logging and auditing
- Admin dashboard development
- Security best practices

### Code Quality
- ✅ Modular architecture
- ✅ MVC pattern
- ✅ Error handling
- ✅ Input validation
- ✅ Database indexing
- ✅ Middleware pattern
- ✅ Comprehensive comments
- ✅ Documentation

---

## 🤝 Contributing

### Areas for Contribution
1. **Frontend Development** - Build authentication UI, admin dashboard, file upload interface
2. **Features** - Task templates, recurring tasks, notifications
3. **Integration** - Calendar sync, email notifications, Slack integration
4. **Mobile** - React Native or Flutter app
5. **Testing** - Unit tests, integration tests, E2E tests
6. **Documentation** - API docs, video tutorials, user guides

---

## 📝 Changelog

### Version 2.0.0 - Enhanced Features (Current)
- ✅ Deadline and time extension system
- ✅ Sub-tasks with auto-progress calculation
- ✅ Task status management (ongoing, completed, delayed, cancelled)
- ✅ Categories and tags for organization
- ✅ Priority levels (low, medium, high, urgent)
- ✅ Advanced filtering and sorting
- ✅ Task assignment capabilities
- ✅ Enhanced Socket.io events
- ✅ Complete API documentation

### Version 1.0.0 - Initial Release
- ✅ User authentication with JWT
- ✅ Admin dashboard backend
- ✅ File upload system
- ✅ Guest mode with conversion
- ✅ Activity logging
- ✅ Real-time collaboration
- ✅ Neomorphism UI design
- ✅ Light/dark mode

---

## 🚀 Deployment Options

### Cloud Platforms (Recommended)
- **Render** - Free tier, auto-deploy from Git
- **Railway** - Free starter, excellent for Node.js
- **Heroku** - Popular platform (requires paid plan)
- **DigitalOcean** - VPS with full control ($4-6/month)

### Database Options
- **MongoDB Atlas** - Free tier, managed cloud database
- **Local MongoDB** - For development
- **MongoDB Docker** - Containerized deployment

### Quick Deploy to Render
1. Push code to GitHub
2. Sign up at render.com
3. Create Web Service from repository
4. Set environment variables
5. Deploy automatically

**See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed instructions**

---

## 🔍 API Testing

### Using cURL
```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"Pass@123"}'

# Create task with deadline
curl -X POST http://localhost:3000/api/tasks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text":"Complete proposal",
    "date":"2025-11-07",
    "deadline":"2025-11-10T17:00:00Z",
    "category":"Sales",
    "priority":"high"
  }'
```

### Using Postman
Import these endpoints into Postman:
- Set Bearer Token in Authorization header
- Use JSON body for POST/PATCH requests
- Test all CRUD operations

---

## 📊 Statistics & Insights

Admin dashboard provides:
- **User Metrics** - Total, active, guests, admins
- **Task Metrics** - Total, completed, delayed, by category
- **Activity Metrics** - Actions in last 24 hours
- **Completion Rates** - Overall and by category
- **File Statistics** - Total uploads, storage used
- **Trend Analysis** - Activity over time

---

## 🎯 Roadmap

### Planned Features
- [ ] Frontend authentication UI
- [ ] Admin dashboard UI
- [ ] File upload drag-and-drop UI
- [ ] Email notifications
- [ ] Calendar view integration
- [ ] Recurring tasks
- [ ] Task templates
- [ ] Mobile applications
- [ ] Gantt chart view
- [ ] Export to PDF/CSV
- [ ] Integration with external tools
- [ ] Advanced analytics

---

## 🐛 Known Issues & Limitations

1. **Frontend** - Authentication UI not yet built (API complete)
2. **Storage** - Local file storage (consider S3 for production)
3. **Scaling** - Single server (use Redis adapter for multi-server)
4. **Email** - No email notifications yet
5. **Mobile** - Web responsive, native apps not yet developed

---

## 🆘 Troubleshooting

### Common Issues

**MongoDB Connection Error:**
```
Solution: Ensure MongoDB is running (mongod command or service)
```

**JWT Token Error:**
```
Solution: Re-login to get fresh token, check JWT_SECRET in .env
```

**File Upload Fails:**
```
Solution: Check file size limit, ensure uploads/ directory has write permissions
```

**Guest Limit Reached:**
```
Solution: Register as full user to remove limits
```

**Port Already in Use:**
```
Solution: Change PORT in .env or kill process on port 3000
```

---

## 📜 License

MIT License - Free for personal and commercial use

---

## 🙏 Acknowledgments

Built with amazing open-source technologies:
- **Express** - Fast, minimalist web framework
- **Socket.io** - Real-time bidirectional communication
- **MongoDB** - Document database
- **Mongoose** - Elegant MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **Bcrypt.js** - Password hashing
- **Multer** - File upload handling

---

## 📧 Support & Contact

For questions, issues, or contributions:
1. Review documentation files
2. Check browser/server console logs
3. Test API endpoints individually
4. Review activity logs for debugging

---

**🚀 Happy Collaborating with TaskFlow!**

**Current Version:** 2.0.0 (Enhanced Features)
**Last Updated:** November 7, 2025
**Status:** Backend Complete (100%) | Frontend Partial (18%)
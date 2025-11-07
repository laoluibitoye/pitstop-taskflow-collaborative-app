# TaskFlow API Reference

Complete REST API and Socket.io event documentation for TaskFlow v2.0.0

---

## 🔐 Authentication

All authenticated endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 📡 REST API Endpoints

### Authentication Endpoints (`/api/auth`)

#### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass@123"
}
```

**Password Requirements:**
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character (@$!%*?&)

**Response (201):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "user-id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "isGuest": false
  }
}
```

---

#### POST /api/auth/login
Login to existing account.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass@123"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "user-id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "isGuest": false
  }
}
```

---

#### POST /api/auth/guest
Create a guest user (limited: 1 task, 1 comment).

**Request Body:**
```json
{
  "name": "Guest User"  // optional
}
```

**Response (201):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "guest-id",
    "name": "Guest User",
    "email": "guest_timestamp@temporary.com",
    "role": "user",
    "isGuest": true,
    "guestLimits": {
      "tasksCreated": 0,
      "commentsPosted": 0
    }
  }
}
```

---

#### POST /api/auth/convert-guest
Convert guest to registered user. Requires authentication as guest.

**Headers:**
```
Authorization: Bearer GUEST_JWT_TOKEN
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass@123"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "new-jwt-token",
  "user": {
    "_id": "same-user-id",
    "name": "Guest User",
    "email": "john@example.com",
    "role": "user",
    "isGuest": false
  }
}
```

---

#### GET /api/auth/me
Get current authenticated user information.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "_id": "user-id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "isGuest": false,
    "guestLimits": {
      "tasksCreated": 0,
      "commentsPosted": 0
    }
  }
}
```

---

### Task Endpoints (`/api/tasks`)

#### GET /api/tasks
Get tasks with advanced filtering and sorting.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query Parameters:**
- `date` - Filter by date (YYYY-MM-DD)
- `status` - Filter by status (ongoing/completed/delayed/cancelled)
- `category` - Filter by category
- `priority` - Filter by priority (low/medium/high/urgent)
- `search` - Search in text and description
- `sortBy` - Sort field (createdAt/deadline/priority/progress)
- `sortOrder` - asc or desc (default: desc)
- `includeArchived` - true/false (default: false)

**Example Request:**
```
GET /api/tasks?date=2025-11-07&status=ongoing&category=Development&sortBy=deadline&sortOrder=asc
```

**Response (200):**
```json
{
  "success": true,
  "tasks": [
    {
      "id": "task-id",
      "text": "Implement feature X",
      "description": "Detailed description",
      "date": "2025-11-07",
      "deadline": "2025-11-10T17:00:00Z",
      "hasDeadline": true,
      "originalDeadline": "2025-11-08T17:00:00Z",
      "timeExtensions": [...],
      "progress": 45,
      "status": "ongoing",
      "category": "Development",
      "tags": ["frontend", "urgent"],
      "priority": "high",
      "hasSubTasks": true,
      "subTasks": [...],
      "isOverdue": false,
      "assignedTo": [...],
      "createdBy": "John Doe",
      "createdById": "user-id",
      "createdAt": "2025-11-07T09:00:00Z",
      "completedAt": null,
      "statusChangedAt": "2025-11-07T09:00:00Z",
      "comments": [...],
      "files": [...]
    }
  ],
  "count": 1
}
```

---

#### GET /api/tasks/categories
Get all unique category names.

**Response (200):**
```json
{
  "success": true,
  "categories": ["Development", "Design", "Sales", "Marketing"]
}
```

---

#### GET /api/tasks/overdue
Get all overdue tasks.

**Response (200):**
```json
{
  "success": true,
  "tasks": [...],
  "count": 3
}
```

---

#### GET /api/tasks/:id
Get single task with complete details.

**Response (200):**
```json
{
  "success": true,
  "task": {
    // Complete task object with all fields
    "id": "task-id",
    "text": "...",
    // ... all task fields
    "subTasks": [
      {
        "id": "subtask-id",
        "text": "Design mockups",
        "isCompleted": true,
        "completedAt": "2025-11-07T12:00:00Z",
        "completedBy": "user-id",
        "createdBy": "user-id",
        "createdAt": "2025-11-07T09:00:00Z"
      }
    ],
    "timeExtensions": [...],
    "comments": [...],
    "files": [...]
  }
}
```

---

#### POST /api/tasks
Create a new task.

**Request Body:**
```json
{
  "text": "Task title",  // required
  "date": "2025-11-07",  // required
  "description": "Optional detailed description",
  "deadline": "2025-11-10T17:00:00Z",
  "category": "Development",
  "priority": "high",
  "tags": ["frontend", "urgent"],
  "assignedTo": ["user-id-1", "user-id-2"]
}
```

**Response (201):**
```json
{
  "success": true,
  "task": {
    // Created task object
  }
}
```

---

#### PATCH /api/tasks/:id
Update task fields.

**Request Body (all optional):**
```json
{
  "text": "Updated title",
  "description": "Updated description",
  "deadline": "2025-11-12T17:00:00Z",
  "category": "Design",
  "priority": "urgent",
  "tags": ["ui", "ux"],
  "assignedTo": ["user-id-3"]
}
```

**Response (200):**
```json
{
  "success": true,
  "task": {
    // Updated task object
  }
}
```

---

#### PATCH /api/tasks/:id/progress
Update task progress (0-100).

**Request Body:**
```json
{
  "progress": 75
}
```

**Response (200):**
```json
{
  "success": true,
  "task": {
    "id": "task-id",
    "progress": 75,
    "status": "ongoing"
  }
}
```

**Note:** Progress of 100 automatically sets status to "completed"

---

#### PATCH /api/tasks/:id/status
Change task status.

**Request Body:**
```json
{
  "status": "completed"  // ongoing, completed, delayed, cancelled
}
```

**Response (200):**
```json
{
  "success": true,
  "task": {
    "id": "task-id",
    "status": "completed",
    "statusChangedAt": "2025-11-07T14:30:00Z",
    "completedAt": "2025-11-07T14:30:00Z"
  }
}
```

---

#### POST /api/tasks/:id/extend-deadline
Extend task deadline with tracking.

**Request Body:**
```json
{
  "extensionAmount": 2,  // required
  "extensionUnit": "days",  // required: "hours" or "days"
  "reason": "Client requested additional features"  // optional
}
```

**Response (200):**
```json
{
  "success": true,
  "task": {
    "id": "task-id",
    "deadline": "2025-11-12T17:00:00Z",
    "timeExtensions": [
      {
        "extensionAmount": 2,
        "extensionUnit": "days",
        "reason": "Client requested additional features",
        "requestedBy": "user-id",
        "previousDeadline": "2025-11-10T17:00:00Z",
        "newDeadline": "2025-11-12T17:00:00Z",
        "createdAt": "2025-11-10T10:00:00Z"
      }
    ],
    "status": "ongoing"
  }
}
```

---

#### POST /api/tasks/:id/subtasks
Add a sub-task to a task.

**Request Body:**
```json
{
  "text": "Design wireframes"
}
```

**Response (201):**
```json
{
  "success": true,
  "subTask": {
    "id": "subtask-id",
    "text": "Design wireframes",
    "isCompleted": false,
    "createdBy": "user-id",
    "createdAt": "2025-11-07T10:00:00Z"
  },
  "task": {
    "id": "task-id",
    "hasSubTasks": true,
    "subTasks": [...],
    "progress": 33  // auto-calculated
  }
}
```

---

#### PATCH /api/tasks/:id/subtasks/:subtaskId/complete
Mark sub-task as complete.

**Response (200):**
```json
{
  "success": true,
  "subTask": {
    "id": "subtask-id",
    "isCompleted": true,
    "completedAt": "2025-11-07T12:00:00Z",
    "completedBy": "user-id"
  },
  "task": {
    "id": "task-id",
    "progress": 66,  // auto-updated
    "subTasks": [...]
  }
}
```

---

#### DELETE /api/tasks/:id
Delete a task (admin or creator only).

**Response (200):**
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

---

#### POST /api/tasks/:id/comments
Add comment to task.

**Request Body:**
```json
{
  "text": "This is my comment"
}
```

**Response (201):**
```json
{
  "success": true,
  "comment": {
    "id": "comment-id",
    "text": "This is my comment",
    "author": "John Doe",
    "authorId": "user-id",
    "timestamp": "2025-11-07T10:00:00Z"
  }
}
```

---

#### DELETE /api/tasks/:taskId/comments/:commentId
Delete a comment (admin or author only).

**Response (200):**
```json
{
  "success": true,
  "message": "Comment deleted successfully"
}
```

---

### File Endpoints (`/api/files`)

#### POST /api/files/upload
Upload file to task or comment.

**Request:** multipart/form-data
```
file: [Binary file data]
taskId: "task-id"
commentId: "comment-id"  // optional
```

**Supported File Types:**
- Images: JPEG, PNG, GIF, WebP
- Documents: PDF, Word, Excel
- Text: Plain text files

**Max File Size:** 5MB (configurable)

**Response (201):**
```json
{
  "success": true,
  "file": {
    "id": "file-id",
    "originalName": "document.pdf",
    "filename": "document-1699999999999.pdf",
    "mimetype": "application/pdf",
    "size": 1024000,
    "uploadedBy": "John Doe",
    "uploadedById": "user-id",
    "isImage": false,
    "createdAt": "2025-11-07T10:00:00Z"
  }
}
```

---

#### GET /api/files/:id
Download a file.

**Response:** File download stream

---

#### GET /api/files/task/:taskId
Get all files for a task.

**Response (200):**
```json
{
  "success": true,
  "files": [
    {
      "id": "file-id",
      "originalName": "screenshot.png",
      "filename": "screenshot-1699999999999.png",
      "mimetype": "image/png",
      "size": 512000,
      "uploadedBy": "Jane Smith",
      "uploadedById": "user-id-2",
      "isImage": true,
      "commentId": null,
      "createdAt": "2025-11-07T11:00:00Z"
    }
  ]
}
```

---

#### DELETE /api/files/:id
Delete a file (admin or uploader only).

**Response (200):**
```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

---

### Admin Endpoints (`/api/admin`)

**All admin endpoints require admin role.**

#### GET /api/admin/users
Get all users with pagination and filters.

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 20)
- `search` - Search name or email
- `role` - Filter by role (user/admin)
- `status` - Filter by status (active/suspended/inactive)

**Example:**
```
GET /api/admin/users?page=1&limit=20&search=john&role=user
```

**Response (200):**
```json
{
  "success": true,
  "users": [...],
  "totalPages": 5,
  "currentPage": 1,
  "totalUsers": 95
}
```

---

#### PATCH /api/admin/users/:id/role
Change user role.

**Request Body:**
```json
{
  "role": "admin"  // or "user"
}
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "_id": "user-id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "admin"
  }
}
```

---

#### PATCH /api/admin/users/:id/suspend
Suspend user account.

**Response (200):**
```json
{
  "success": true,
  "message": "User suspended successfully"
}
```

---

#### PATCH /api/admin/users/:id/activate
Reactivate suspended user.

**Response (200):**
```json
{
  "success": true,
  "message": "User activated successfully"
}
```

---

#### GET /api/admin/tasks
Get all tasks including archived.

**Query Parameters:**
- `page` - Page number
- `limit` - Results per page (default: 50)
- `date` - Filter by date
- `userId` - Filter by creator
- `includeArchived` - true/false

**Response (200):**
```json
{
  "success": true,
  "tasks": [...],
  "totalPages": 10,
  "currentPage": 1,
  "totalTasks": 487
}
```

---

#### PATCH /api/admin/tasks/:id/archive
Archive a task.

**Response (200):**
```json
{
  "success": true,
  "message": "Task archived successfully"
}
```

---

#### GET /api/admin/activity-logs
Get activity logs with filters.

**Query Parameters:**
- `page` - Page number
- `limit` - Results per page (default: 50)
- `userId` - Filter by user
- `action` - Filter by action type
- `startDate` - Start date (ISO 8601)
- `endDate` - End date (ISO 8601)

**Example:**
```
GET /api/admin/activity-logs?userId=xxx&action=task_created&startDate=2025-11-01&endDate=2025-11-07
```

**Response (200):**
```json
{
  "success": true,
  "logs": [
    {
      "_id": "log-id",
      "user": {
        "_id": "user-id",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "action": "task_created",
      "targetType": "Task",
      "targetId": "task-id",
      "details": {
        "text": "New task",
        "date": "2025-11-07"
      },
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "createdAt": "2025-11-07T10:00:00Z"
    }
  ],
  "totalPages": 25,
  "currentPage": 1,
  "totalLogs": 1234
}
```

---

#### GET /api/admin/settings
Get app settings.

**Response (200):**
```json
{
  "success": true,
  "settings": {
    "appTitle": "TaskFlow",
    "welcomeMessage": "Welcome to TaskFlow!",
    "heroTitle": "Collaborate in Real-Time",
    "heroTagline": "Manage tasks together...",
    "theme": {
      "primaryColor": "#6366f1",
      "secondaryColor": "#ec4899",
      "successColor": "#10b981",
      "warningColor": "#f59e0b",
      "dangerColor": "#ef4444"
    },
    "features": {
      "allowGuestUsers": true,
      "allowFileUploads": true,
      "maxFileSize": 5242880,
      "guestTaskLimit": 1,
      "guestCommentLimit": 1,
      "enableRealTimeSync": true,
      "enableActivityLogs": true
    }
  }
}
```

---

#### PUT /api/admin/settings
Update app settings.

**Request Body (all fields optional):**
```json
{
  "appTitle": "My Task Manager",
  "welcomeMessage": "Welcome back!",
  "theme": {
    "primaryColor": "#0066cc"
  },
  "features": {
    "guestTaskLimit": 3,
    "maxFileSize": 10485760
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "settings": {
    // Updated settings object
  }
}
```

---

#### GET /api/admin/stats
Get dashboard statistics.

**Response (200):**
```json
{
  "success": true,
  "stats": {
    "users": {
      "total": 150,
      "active": 142,
      "guests": 25,
      "admins": 3
    },
    "tasks": {
      "total": 487,
      "archived": 123,
      "completed": 245
    },
    "content": {
      "comments": 1842,
      "files": 356
    },
    "activity": {
      "last24Hours": 287
    }
  }
}
```

---

## 🔄 Socket.io Events

### Client → Server Events

#### join
Join the real-time session.

**Emit:**
```javascript
socket.emit('join', {
  token: 'jwt-token',  // for authenticated users
  guestName: 'Guest Name'  // for guest users
});
```

---

#### requestTaskList
Request tasks for a specific date.

**Emit:**
```javascript
socket.emit('requestTaskList', {
  date: '2025-11-07',
  token: 'jwt-token'
});
```

**Receive:**
```javascript
socket.on('taskList', ({ date, tasks }) => {
  // tasks array with complete task objects
});
```

---

#### addTask
Create a new task in real-time.

**Emit:**
```javascript
socket.emit('addTask', {
  date: '2025-11-07',
  task: {
    text: 'Task title',
    description: 'Description',
    deadline: '2025-11-10T17:00:00Z',
    category: 'Development',
    priority: 'high',
    tags: ['frontend']
  },
  token: 'jwt-token'
});
```

**Broadcast to All:**
```javascript
socket.on('taskAdded', ({ date, task }) => {
  // task object with all fields
});
```

---

#### updateProgress
Update task progress.

**Emit:**
```javascript
socket.emit('updateProgress', {
  date: '2025-11-07',
  taskId: 'task-id',
  progress: 75,
  token: 'jwt-token'
});
```

**Broadcast to All:**
```javascript
socket.on('progressUpdated', ({ date, taskId, progress, status, completedAt }) => {
  // Update UI
});
```

---

#### changeStatus
Change task status.

**Emit:**
```javascript
socket.emit('changeStatus', {
  date: '2025-11-07',
  taskId: 'task-id',
  status: 'completed',
  token: 'jwt-token'
});
```

**Broadcast to All:**
```javascript
socket.on('statusChanged', ({ date, taskId, status, statusChangedAt, completedAt, progress }) => {
  // Update status badge
});
```

---

#### addSubTask
Add sub-task to a task.

**Emit:**
```javascript
socket.emit('addSubTask', {
  date: '2025-11-07',
  taskId: 'task-id',
  subTaskText: 'Design mockups',
  token: 'jwt-token'
});
```

**Broadcast to All:**
```javascript
socket.on('subTaskAdded', ({ date, taskId, subTask, hasSubTasks, progress }) => {
  // Add sub-task to list, show tree icon
});
```

---

#### completeSubTask
Mark sub-task as complete.

**Emit:**
```javascript
socket.emit('completeSubTask', {
  date: '2025-11-07',
  taskId: 'task-id',
  subTaskId: 'subtask-id',
  token: 'jwt-token'
});
```

**Broadcast to All:**
```javascript
socket.on('subTaskCompleted', ({ date, taskId, subTaskId, progress, subTasks }) => {
  // Update sub-task checkbox, progress bar
});
```

---

#### extendDeadline
Extend task deadline.

**Emit:**
```javascript
socket.emit('extendDeadline', {
  date: '2025-11-07',
  taskId: 'task-id',
  extensionAmount: 24,
  extensionUnit: 'hours',
  reason: 'Additional research needed',
  token: 'jwt-token'
});
```

**Broadcast to All:**
```javascript
socket.on('deadlineExtended', ({ date, taskId, deadline, timeExtensions, status }) => {
  // Update deadline display
});
```

---

#### addComment
Add comment to task.

**Emit:**
```javascript
socket.emit('addComment', {
  date: '2025-11-07',
  taskId: 'task-id',
  commentText: 'Great progress!',
  token: 'jwt-token'
});
```

**Broadcast to All:**
```javascript
socket.on('commentAdded', ({ date, taskId, comment }) => {
  // Add comment to list
});
```

---

#### deleteTask
Delete a task.

**Emit:**
```javascript
socket.emit('deleteTask', {
  date: '2025-11-07',
  taskId: 'task-id',
  token: 'jwt-token'
});
```

**Broadcast to All:**
```javascript
socket.on('taskDeleted', ({ date, taskId }) => {
  // Remove task from UI
});
```

---

### Server → Client Events

#### activeUsers
Receive list of active users.

```javascript
socket.on('activeUsers', (users) => {
  // users: [{ userId, name, email, role, isGuest, joinedAt }]
});
```

---

#### guestLimitReached
Guest user reached their limit.

```javascript
socket.on('guestLimitReached', ({ type, message }) => {
  // type: 'task' or 'comment'
  // Show registration prompt
});
```

---

#### error
Error occurred during Socket.io operation.

```javascript
socket.on('error', ({ message }) => {
  // Show error notification
});
```

---

## 📊 Error Responses

### Standard Error Format
```json
{
  "success": false,
  "message": "Error description",
  "errors": [  // for validation errors
    {
      "field": "email",
      "message": "Email is invalid"
    }
  ]
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (not authorized)
- `404` - Not Found
- `500` - Server Error

---

## 🧪 Testing Examples

### Using cURL

**Register User:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Pass@123"
  }'
```

**Create Task with Deadline:**
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Complete Q4 report",
    "date": "2025-11-07",
    "deadline": "2025-11-15T17:00:00Z",
    "category": "Reports",
    "priority": "high",
    "tags": ["finance", "quarterly"]
  }'
```

**Add Sub-task:**
```bash
curl -X POST http://localhost:3000/api/tasks/TASK_ID/subtasks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text": "Gather data"}'
```

**Extend Deadline:**
```bash
curl -X POST http://localhost:3000/api/tasks/TASK_ID/extend-deadline \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "extensionAmount": 3,
    "extensionUnit": "days",
    "reason": "Waiting for client approval"
  }'
```

**Change Status:**
```bash
curl -X PATCH http://localhost:3000/api/tasks/TASK_ID/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "completed"}'
```

**Upload File:**
```bash
curl -X POST http://localhost:3000/api/files/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@document.pdf" \
  -F "taskId=TASK_ID"
```

---

## 📚 Additional Resources

- **[README.md](README.md)** - Project overview and quick start
- **[FEATURES_DOCUMENTATION.md](FEATURES_DOCUMENTATION.md)** - Detailed feature guide
- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Deployment instructions
- **[IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md)** - Development status

---

**Version:** 2.0.0  
**Last Updated:** November 7, 2025  
**Status:** Production Ready (Backend Complete)
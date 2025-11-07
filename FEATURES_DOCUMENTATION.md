# TaskFlow - Complete Features Documentation

## 🎯 New Features Added

### 1. ⏰ Deadline & Time Management

#### Deadline Setting
Tasks can now have deadlines with the following capabilities:
- Set deadline when creating or editing a task
- Visual indicators for upcoming and overdue tasks
- Automatic status change to "delayed" when deadline passes
- Original deadline preservation for tracking

#### Time Extensions
Extend deadlines with proper tracking:
- **Extension in Hours or Days** - Flexible time units
- **Extension Reasoning** - Document why deadline was extended
- **Extension History** - View all extensions with timestamps
- **Auto-status Update** - Delayed tasks return to "ongoing" when deadline extended to future

**API Example:**
```javascript
POST /api/tasks/:id/extend-deadline
{
  "extensionAmount": 2,
  "extensionUnit": "days",  // or "hours"
  "reason": "Waiting for client approval"
}
```

**Socket.io Example:**
```javascript
socket.emit('extendDeadline', {
  date: '2025-11-07',
  taskId: 'task-id-here',
  extensionAmount: 24,
  extensionUnit: 'hours',
  reason: 'Additional research needed',
  token: 'jwt-token'
});
```

---

### 2. 📋 Sub-Tasks System

Break down complex tasks into manageable sub-tasks:
- **Unlimited Sub-tasks** per main task
- **Independent Tracking** - Each sub-task can be marked complete
- **Auto-Progress Calculation** - Main task progress updates based on completed sub-tasks
- **Visual Tree Indicator** - Tree icon shows tasks with sub-tasks
- **User Attribution** - Track who created and completed each sub-task
- **Timestamps** - Know when sub-tasks were created and completed

**Features:**
- Add sub-task to any task
- Mark sub-task complete (immutable once completed)
- View all sub-tasks with completion status
- Progress bar auto-updates as sub-tasks complete
- Tracks creator and completer for each sub-task

**API Example:**
```javascript
// Add sub-task
POST /api/tasks/:id/subtasks
{
  "text": "Research competitor pricing"
}

// Complete sub-task
PATCH /api/tasks/:id/subtasks/:subtaskId/complete
```

**Socket.io Example:**
```javascript
// Add sub-task
socket.emit('addSubTask', {
  date: '2025-11-07',
  taskId: 'task-id',
  subTaskText: 'Design mockups',
  token: 'jwt-token'
});

// Complete sub-task
socket.emit('completeSubTask', {
  date: '2025-11-07',
  taskId: 'task-id',
  subTaskId: 'subtask-id',
  token: 'jwt-token'
});
```

---

### 3. 🏷️ Status Management

Four distinct status states for comprehensive task tracking:

#### Status Types
1. **Ongoing** (default)
   - Task is actively being worked on
   - Not yet completed
   - Within deadline (if set)

2. **Completed**
   - Task is finished
   - Automatically set when progress reaches 100%
   - Records completion timestamp
   - Can be manually set earlier if task is done

3. **Delayed**
   - Task has passed its deadline
   - Automatically marked when deadline expires
   - Still can be worked on
   - Returns to "ongoing" if deadline extended to future

4. **Cancelled**
   - Task is no longer needed
   - Manually set by team members
   - Preserves task data for records
   - Does not affect progress tracking

#### Status Features
- **Auto-Updates** - Delayed status set automatically when deadline passes
- **Manual Changes** - Users can change status at any time
- **History Tracking** - Records who changed status and when
- **Visual Indicators** - Color-coded badges for each status
- **Filter & Sort** - Find tasks by status

**API Example:**
```javascript
PATCH /api/tasks/:id/status
{
  "status": "completed"  // or "ongoing", "delayed", "cancelled"
}
```

**Socket.io Example:**
```javascript
socket.emit('changeStatus', {
  date: '2025-11-07',
  taskId: 'task-id',
  status: 'completed',
  token: 'jwt-token'
});
```

---

### 4. 📁 Categories & Organization

Organize tasks with flexible categorization:

#### Category System
- **Custom Categories** - Create any category name
- **Auto-Suggestions** - Shows existing categories
- **Category Filtering** - Find all tasks in a category
- **Visual Grouping** - Tasks grouped by category in views
- **Category Stats** - See task count per category

#### Tag System
- **Multiple Tags** - Add multiple tags per task
- **Tag Search** - Find tasks by tags
- **Tag Cloud** - Visual representation of popular tags
- **Custom Tags** - Create any tag on the fly

#### Priority Levels
Four priority levels for task importance:
1. **Low** - Nice to have, no urgency
2. **Medium** - Normal priority (default)
3. **High** - Important, needs attention soon
4. **Urgent** - Critical, immediate attention required

**Features:**
- Visual priority indicators (colors and icons)
- Sort by priority
- Filter by priority level
- Deadline + Priority combinations for smart sorting

**API Example:**
```javascript
POST /api/tasks
{
  "text": "Implement new feature",
  "date": "2025-11-07",
  "category": "Development",
  "priority": "high",
  "tags": ["frontend", "ui", "urgent"]
}
```

---

### 5. 🔍 Advanced Filtering & Sorting

Powerful query capabilities for finding tasks:

#### Filter Options
- **By Date** - View tasks for specific date
- **By Status** - Filter: ongoing, completed, delayed, cancelled
- **By Category** - Show only tasks in specific category
- **By Priority** - Filter by importance level
- **By Text Search** - Search task text and descriptions
- **Include Archived** - Toggle archived task visibility

#### Sort Options
- **By Created Date** - Newest or oldest first
- **By Deadline** - Upcoming deadlines first
- **By Priority** - Most urgent first
- **By Progress** - Least or most complete first
- **By Status** - Group by status

#### Special Queries
- **Overdue Tasks** - Find all tasks past deadline
- **Today's Tasks** - Quick access to current work
- **Upcoming Deadlines** - Tasks due soon
- **My Tasks** - Filter by creator
- **Assigned to Me** - Filter by assignee

**API Example:**
```javascript
GET /api/tasks?date=2025-11-07&status=ongoing&category=Development&sortBy=deadline&sortOrder=asc

GET /api/tasks/overdue

GET /api/tasks/categories  // Get all unique categories
```

---

## 📊 Task Data Structure

### Complete Task Object
```javascript
{
  "id": "task-id",
  "text": "Task title",
  "description": "Detailed description",
  "date": "2025-11-07",
  
  // Deadline Management
  "deadline": "2025-11-10T15:00:00Z",
  "hasDeadline": true,
  "originalDeadline": "2025-11-08T15:00:00Z",
  "timeExtensions": [
    {
      "extensionAmount": 2,
      "extensionUnit": "days",
      "reason": "Client requested changes",
      "requestedBy": "user-id",
      "previousDeadline": "2025-11-08T15:00:00Z",
      "newDeadline": "2025-11-10T15:00:00Z",
      "createdAt": "2025-11-08T10:00:00Z"
    }
  ],
  
  // Progress & Status
  "progress": 65,
  "status": "ongoing",  // ongoing, completed, delayed, cancelled
  "statusChangedAt": "2025-11-07T10:00:00Z",
  "statusChangedBy": "user-id",
  "completedAt": null,
  
  // Organization
  "category": "Development",
  "tags": ["frontend", "ui", "urgent"],
  "priority": "high",  // low, medium, high, urgent
  
  // Sub-tasks
  "hasSubTasks": true,
  "subTasks": [
    {
      "id": "subtask-id",
      "text": "Design wireframes",
      "isCompleted": true,
      "completedAt": "2025-11-07T12:00:00Z",
      "completedBy": "user-id",
      "createdBy": "user-id",
      "createdAt": "2025-11-07T09:00:00Z"
    }
  ],
  
  // User Data
  "createdBy": "John Doe",
  "createdById": "user-id",
  "assignedTo": ["user-id-1", "user-id-2"],
  "createdAt": "2025-11-07T09:00:00Z",
  
  // Metadata
  "isOverdue": false,
  "isArchived": false,
  
  // Related Data
  "comments": [...],
  "files": [...]
}
```

---

## 🎨 UI Indicators

### Visual Status Indicators
- **Ongoing** - Blue badge with clock icon
- **Completed** - Green badge with checkmark
- **Delayed** - Red badge with warning icon
- **Cancelled** - Gray badge with X icon

### Priority Colors
- **Low** - Gray
- **Medium** - Blue
- **High** - Orange
- **Urgent** - Red (pulsing animation)

### Task Card Icons
- 🌲 **Tree Icon** - Has sub-tasks
- ⚠️ **Warning Icon** - Overdue
- 📅 **Calendar Icon** - Has deadline
- 🎯 **Target Icon** - High/Urgent priority
- ✅ **Checkmark** - Completed

### Progress Bar Colors
- **0-30%** - Red gradient (need attention)
- **31-70%** - Blue gradient (in progress)
- **71-99%** - Orange gradient (almost done)
- **100%** - Green gradient (completed) with pulse animation

---

## 🔄 Real-Time Socket.io Events

### Client → Server Events

**Task Management:**
```javascript
// Create task (with new fields)
socket.emit('addTask', { 
  date, 
  task: { 
    text, 
    description, 
    deadline, 
    category, 
    priority, 
    tags 
  }, 
  token 
});

// Change status
socket.emit('changeStatus', { date, taskId, status, token });

// Update progress
socket.emit('updateProgress', { date, taskId, progress, token });
```

**Sub-task Management:**
```javascript
// Add sub-task
socket.emit('addSubTask', { date, taskId, subTaskText, token });

// Complete sub-task
socket.emit('completeSubTask', { date, taskId, subTaskId, token });
```

**Deadline Management:**
```javascript
// Extend deadline
socket.emit('extendDeadline', { 
  date, 
  taskId, 
  extensionAmount, 
  extensionUnit, 
  reason, 
  token 
});
```

### Server → Client Events

**Task Updates:**
```javascript
// Task added
socket.on('taskAdded', ({ date, task }) => {
  // task includes: status, priority, category, deadline, hasSubTasks
});

// Status changed
socket.on('statusChanged', ({ date, taskId, status, statusChangedAt, completedAt, progress }) => {
  // Update UI
});

// Sub-task added
socket.on('subTaskAdded', ({ date, taskId, subTask, hasSubTasks, progress }) => {
  // Update UI
});

// Sub-task completed
socket.on('subTaskCompleted', ({ date, taskId, subTaskId, progress, subTasks }) => {
  // Update progress bar
});

// Deadline extended
socket.on('deadlineExtended', ({ date, taskId, deadline, timeExtensions, status }) => {
  // Update deadline display
});
```

---

## 📖 API Endpoints Reference

### Task Endpoints

#### GET /api/tasks
Get tasks with advanced filtering:
```
Query Parameters:
- date: Filter by date (YYYY-MM-DD)
- status: Filter by status (ongoing, completed, delayed, cancelled)
- category: Filter by category
- priority: Filter by priority (low, medium, high, urgent)
- search: Search in text and description
- sortBy: Sort field (createdAt, deadline, priority, progress)
- sortOrder: asc or desc
- includeArchived: true/false
```

#### GET /api/tasks/categories
Get all unique category names:
```
Response: { success: true, categories: ["Development", "Design", ...] }
```

#### GET /api/tasks/overdue
Get all overdue tasks:
```
Response: { success: true, tasks: [...], count: 5 }
```

#### GET /api/tasks/:id
Get single task with full details:
```
Response includes: task with all fields, comments, files, sub-tasks, extensions
```

#### POST /api/tasks
Create new task:
```json
{
  "text": "Task title",
  "description": "Detailed description",
  "date": "2025-11-07",
  "deadline": "2025-11-10T15:00:00Z",
  "category": "Development",
  "priority": "high",
  "tags": ["frontend", "urgent"],
  "assignedTo": ["user-id-1", "user-id-2"]
}
```

#### PATCH /api/tasks/:id
Update task fields:
```json
{
  "text": "Updated title",
  "description": "Updated description",
  "deadline": "2025-11-12T15:00:00Z",
  "category": "Design",
  "priority": "urgent",
  "tags": ["ui", "ux"]
}
```

#### PATCH /api/tasks/:id/status
Change task status:
```json
{
  "status": "completed"  // ongoing, completed, delayed, cancelled
}
```

#### POST /api/tasks/:id/extend-deadline
Extend task deadline:
```json
{
  "extensionAmount": 3,
  "extensionUnit": "days",
  "reason": "Scope expanded per client request"
}
```

#### POST /api/tasks/:id/subtasks
Add sub-task:
```json
{
  "text": "Sub-task description"
}
```

#### PATCH /api/tasks/:id/subtasks/:subtaskId/complete
Mark sub-task as complete (no body needed)

---

## 🎨 Frontend Integration Guide

### Displaying Task Status
```javascript
function getStatusBadge(status) {
  const badges = {
    ongoing: '<span class="badge badge-blue"><i class="fas fa-clock"></i> Ongoing</span>',
    completed: '<span class="badge badge-green"><i class="fas fa-check"></i> Completed</span>',
    delayed: '<span class="badge badge-red"><i class="fas fa-exclamation-triangle"></i> Delayed</span>',
    cancelled: '<span class="badge badge-gray"><i class="fas fa-times"></i> Cancelled</span>'
  };
  return badges[status];
}
```

### Showing Deadline with Countdown
```javascript
function formatDeadline(deadline) {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diff = deadlineDate - now;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (diff < 0) {
    return `<span class="overdue">Overdue by ${Math.abs(days)} days</span>`;
  }
  
  if (days > 7) {
    return deadlineDate.toLocaleDateString();
  }
  
  if (days > 0) {
    return `<span class="upcoming">${days}d ${hours}h remaining</span>`;
  }
  
  return `<span class="urgent">${hours} hours remaining</span>`;
}
```

### Rendering Sub-tasks
```javascript
function renderSubTasks(subTasks) {
  const completed = subTasks.filter(st => st.isCompleted).length;
  const total = subTasks.length;
  
  return `
    <div class="subtasks-summary">
      <i class="fas fa-sitemap"></i>
      <span>${completed}/${total} sub-tasks completed</span>
      <div class="subtasks-progress">
        <div class="subtasks-bar" style="width: ${(completed/total)*100}%"></div>
      </div>
    </div>
  `;
}
```

### Category Filter UI
```javascript
// Fetch categories
fetch('/api/tasks/categories', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(res => res.json())
.then(data => {
  const select = document.getElementById('categoryFilter');
  data.categories.forEach(cat => {
    select.innerHTML += `<option value="${cat}">${cat}</option>`;
  });
});
```

### Extending Deadline Modal
```javascript
function showExtendDeadlineModal(taskId) {
  const modal = `
    <div class="modal">
      <h3>Extend Deadline</h3>
      <input type="number" id="extensionAmount" placeholder="Amount">
      <select id="extensionUnit">
        <option value="hours">Hours</option>
        <option value="days">Days</option>
      </select>
      <textarea id="extensionReason" placeholder="Reason for extension"></textarea>
      <button onclick="submitExtension('${taskId}')">Extend Deadline</button>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modal);
}

function submitExtension(taskId) {
  const amount = document.getElementById('extensionAmount').value;
  const unit = document.getElementById('extensionUnit').value;
  const reason = document.getElementById('extensionReason').value;
  
  socket.emit('extendDeadline', {
    date: currentDate,
    taskId,
    extensionAmount: parseInt(amount),
    extensionUnit: unit,
    reason,
    token: localStorage.getItem('token')
  });
}
```

---

## 🎯 Use Cases & Examples

### Use Case 1: Project Task with Sub-tasks
```javascript
// Create main task
POST /api/tasks
{
  "text": "Launch new website",
  "description": "Complete website redesign and launch",
  "date": "2025-11-07",
  "deadline": "2025-11-30T23:59:59Z",
  "category": "Projects",
  "priority": "urgent",
  "tags": ["website", "launch", "milestone"]
}

// Add sub-tasks
POST /api/tasks/:id/subtasks
{ "text": "Design homepage" }

POST /api/tasks/:id/subtasks
{ "text": "Develop frontend" }

POST /api/tasks/:id/subtasks
{ "text": "Setup hosting" }

POST /api/tasks/:id/subtasks
{ "text": "Launch and announce" }
```

### Use Case 2: Task with Deadline Extension
```javascript
// Task is created with Nov 10 deadline
POST /api/tasks
{
  "text": "Complete client proposal",
  "deadline": "2025-11-10T17:00:00Z",
  "category": "Sales",
  "priority": "high"
}

// Client requests changes, extend by 3 days
POST /api/tasks/:id/extend-deadline
{
  "extensionAmount": 3,
  "extensionUnit": "days",
  "reason": "Client requested additional features in proposal"
}

// Later, extend by 12 hours for final review
POST /api/tasks/:id/extend-deadline
{
  "extensionAmount": 12,
  "extensionUnit": "hours",
  "reason": "Marketing team needs to review"
}
```

### Use Case 3: Task Status Workflow
```javascript
// Task starts as "ongoing"
status: "ongoing"

// Deadline passes - automatically becomes "delayed"
status: "delayed" (auto-updated by system)

// Team decides to continue - extends deadline
POST /api/tasks/:id/extend-deadline
// Status auto-changes back to "ongoing"

// Work completes
PATCH /api/tasks/:id/status
{ "status": "completed" }

// Or if cancelled
PATCH /api/tasks/:id/status
{ "status": "cancelled" }
```

### Use Case 4: Organizing with Categories
```javascript
// Create tasks in different categories
POST /api/tasks { "text": "Fix login bug", "category": "Bugs" }
POST /api/tasks { "text": "Add dark mode", "category": "Features" }
POST /api/tasks { "text": "Update docs", "category": "Documentation" }

// Query by category
GET /api/tasks?category=Bugs

// Get all categories for dropdown
GET /api/tasks/categories
// Returns: ["Bugs", "Features", "Documentation"]
```

---

## 🔔 Notifications & Events

### Real-Time Notifications
When events occur, all connected users receive updates:

1. **Task Created** - Show new task in list
2. **Status Changed** - Update badge and color
3. **Progress Updated** - Animate progress bar
4. **Sub-task Added** - Show tree icon, update count
5. **Sub-task Completed** - Update progress, check icon
6. **Deadline Extended** - Update deadline display
7. **Comment Added** - Update comment count
8. **Task Deleted** - Remove from view

### Guest Limit Warnings
```javascript
socket.on('guestLimitReached', ({ type, message }) => {
  // type: 'task' or 'comment'
  // Show registration modal with message
  showRegistrationPrompt(message);
});
```

---

## 📈 Performance Optimizations

### Database Indexes
All new fields are properly indexed:
- `status` + `deadline` (compound index)
- `category` + `status` (compound index)
- `priority` + `deadline` (compound index)
- `assignedTo` (array index)

### Auto-Status Updates
Pre-save middleware automatically:
- Marks tasks as "delayed" when deadline passes
- Updates `hasSubTasks` flag
- Maintains data consistency

### Progress Calculation
Sub-task completion automatically calculates:
```
progress = (completed_subtasks / total_subtasks) * 100
```

---

## 🎓 Best Practices

### 1. Setting Deadlines
- Set realistic deadlines with buffer time
- Use time extensions for legitimate delays
- Document extension reasons for team transparency

### 2. Using Sub-tasks
- Break complex tasks into 3-7 sub-tasks
- Each sub-task should be independently completable
- Use descriptive sub-task names
- Complete sub-tasks as you finish them

### 3. Status Management
- Let system auto-mark "delayed" status
- Mark "completed" when all work is done
- Use "cancelled" instead of deleting (preserves history)
- "Ongoing" is default for active work

### 4. Categories & Priority
- Create consistent category names
- Use priority to highlight critical tasks
- Combine priority + deadline for urgency
- Use tags for cross-category organization

### 5. Team Collaboration
- Assign tasks to team members
- Use comments for updates
- Track progress as work continues
- Document extension reasons

---

## 🔧 Configuration

### App Settings (Admin Only)
Configure guest limits, file upload settings, and more:

```javascript
PUT /api/admin/settings
{
  "features": {
    "guestTaskLimit": 1,
    "guestCommentLimit": 1,
    "maxFileSize": 5242880,
    "allowGuestUsers": true
  }
}
```

---

## 🚀 Migration Guide

If you have existing tasks, they will automatically:
- Get default status: "ongoing"
- Get default priority: "medium"
- Have `hasSubTasks: false`
- Have `hasDeadline: false`
- Be backward compatible with frontend

No migration script needed - all new fields have defaults.

---

## 📚 Additional Resources

- **Main Documentation:** [`README.md`](README.md:1)
- **Deployment Guide:** [`DEPLOYMENT_GUIDE.md`](DEPLOYMENT_GUIDE.md:1)
- **Implementation Status:** [`IMPLEMENTATION_STATUS.md`](IMPLEMENTATION_STATUS.md:1)
- **API Routes:** Check route files in `routes/` directory
- **Data Models:** Check model files in `models/` directory

---

**Last Updated:** November 7, 2025
**Version:** 2.0.0 (Enhanced Features)
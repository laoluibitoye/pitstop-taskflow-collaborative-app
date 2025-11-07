# Beginner React Developer Guide - Continue TaskFlow Frontend

## 👋 Welcome!

This guide will help you complete the React frontend for TaskFlow. Don't worry if you're new to React - I'll explain everything step-by-step!

---

## 📋 What's Already Done For You

✅ **Backend** - Fully working API (no changes needed)  
✅ **React Project Structure** - Set up with Vite  
✅ **API Client** - All backend endpoints ready to use  
✅ **State Management** - Zustand store configured  
✅ **Socket.io** - Real-time updates ready  
✅ **Documentation** - Complete API reference  

**You only need to build UI components!**

---

## 🚀 STEP 1: Setup Your Development Environment

### Install Required Software

1. **Node.js** (v18 or higher)
   - Download from: https://nodejs.org
   - Verify: `node --version` should show v18+

2. **VS Code** (Recommended Editor)
   - Download from: https://code.visualstudio.com
   - Install extensions:
     - ES7+ React/Redux/React-Native snippets
     - Prettier - Code formatter
     - ESLint

3. **Git** (for version control)
   - Download from: https://git-scm.com
   - Verify: `git --version`

### Install Project Dependencies

```bash
# Navigate to client folder
cd client

# Install all React dependencies
npm install

# This will install:
# - React & React DOM
# - React Router (navigation)
# - Axios (API calls)
# - Socket.io Client (real-time)
# - Zustand (state management)
# - React Hot Toast (notifications)
# - Date-fns (date formatting)
# - React Dropzone (file uploads)
```

### Start Development Servers

**Terminal 1 - Backend:**
```bash
# From project root
npm install
npm start
# Server runs on http://localhost:3000
```

**Terminal 2 - React Frontend:**
```bash
# From client folder
cd client
npm run dev
# Frontend runs on http://localhost:5173
```

---

## 📁 STEP 2: Understanding the Project Structure

```
client/
├── index.html              ← Entry HTML (already created)
├── vite.config.js          ← Vite config (already created)
├── package.json            ← Dependencies (already created)
│
├── src/
│   ├── main.jsx           ← YOU CREATE: App entry point
│   ├── App.jsx            ← YOU CREATE: Main app component
│   ├── index.css          ← YOU CREATE: Global styles
│   │
│   ├── services/
│   │   └── api.js         ← ✅ DONE: All API functions ready
│   │
│   ├── store/
│   │   └── useStore.js    ← ✅ DONE: State management ready
│   │
│   ├── contexts/
│   │   └── SocketContext.jsx  ← ✅ DONE: Real-time ready
│   │
│   ├── pages/             ← YOU CREATE: Page components
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   └── Admin.jsx
│   │
│   └── components/        ← YOU CREATE: Reusable components
│       ├── TaskList.jsx
│       ├── TaskCard.jsx
│       ├── TaskDetail.jsx
│       ├── CreateTaskModal.jsx
│       └── ... more components
```

---

## 🎯 STEP 3: Build Your First Component (Main Entry)

### Create `src/main.jsx`

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

**What this does:** Renders your React app into the HTML page.

---

## 🎯 STEP 4: Create Main App Component

### Create `src/App.jsx`

```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { SocketProvider } from './contexts/SocketContext';
import { useStore } from './store/useStore';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function App() {
  const { isAuthenticated } = useStore();

  return (
    <BrowserRouter>
      <SocketProvider>
        <Routes>
          <Route 
            path="/login" 
            element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/dashboard" 
            element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} 
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
        <Toaster position="top-right" />
      </SocketProvider>
    </BrowserRouter>
  );
}

export default App;
```

**What this does:**
- Sets up routing (different pages)
- Protects dashboard (must be logged in)
- Wraps app in Socket.io for real-time
- Adds toast notifications

---

## 🎯 STEP 5: Create Login Page

### Create `src/pages/Login.jsx`

```jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';
import { useStore } from '../store/useStore';

function Login() {
  const [mode, setMode] = useState('login'); // 'login', 'register', 'guest'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const { setToken, setUser } = useStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data } = await authAPI.login({
        email: formData.email,
        password: formData.password
      });
      
      setToken(data.token);
      setUser(data.user);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data } = await authAPI.register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      
      setToken(data.token);
      setUser(data.user);
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data } = await authAPI.createGuest(formData.name);
      
      setToken(data.token);
      setUser(data.user);
      toast.success('Welcome, guest!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to create guest user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>TaskFlow</h1>
        <p>Team Collaboration Made Simple</p>
        
        <div className="mode-tabs">
          <button 
            className={mode === 'login' ? 'active' : ''}
            onClick={() => setMode('login')}
          >
            Login
          </button>
          <button 
            className={mode === 'register' ? 'active' : ''}
            onClick={() => setMode('register')}
          >
            Register
          </button>
          <button 
            className={mode === 'guest' ? 'active' : ''}
            onClick={() => setMode('guest')}
          >
            Guest
          </button>
        </div>

        {mode === 'login' && (
          <form onSubmit={handleLogin}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Loading...' : 'Login'}
            </button>
          </form>
        )}

        {mode === 'register' && (
          <form onSubmit={handleRegister}>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password (min 8 chars)"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>
        )}

        {mode === 'guest' && (
          <form onSubmit={handleGuest}>
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Joining...' : 'Continue as Guest'}
            </button>
            <small>Limited: 1 task, 1 comment</small>
          </form>
        )}
      </div>
    </div>
  );
}

export default Login;
```

**What this does:**
- Shows login/register/guest forms
- Calls `authAPI` functions (already created for you)
- Stores token and user in Zustand store
- Shows success/error toasts
- Redirects to dashboard on success

**Your task:** Copy this exactly and save as `client/src/pages/Login.jsx`

---

## 🎯 STEP 6: Create Dashboard Page

### Create `src/pages/Dashboard.jsx`

```jsx
import { useEffect, useState } from 'react';
import { taskAPI } from '../services/api';
import { useStore } from '../store/useStore';
import { useSocket } from '../contexts/SocketContext';
import toast from 'react-hot-toast';
import TaskList from '../components/TaskList';
import CreateTaskModal from '../components/CreateTaskModal';

function Dashboard() {
  const { 
    user, 
    currentDate, 
    setCurrentDate, 
    tasks, 
    setTasks,
    filters,
    setFilter,
    getFilteredTasks,
    logout
  } = useStore();
  
  const { connected } = useSocket();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');

  // Fetch tasks when date changes
  useEffect(() => {
    fetchTasks();
  }, [currentDate]);

  const fetchTasks = async () => {
    try {
      const { data } = await taskAPI.getTasks({ date: currentDate });
      setTasks(data.tasks);
    } catch (error) {
      toast.error('Failed to load tasks');
    }
  };

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    try {
      const { data } = await taskAPI.createTask({
        text: newTaskText,
        date: currentDate
      });
      toast.success('Task created!');
      setNewTaskText('');
      // Task will be added via Socket.io
    } catch (error) {
      if (error.response?.data?.requiresRegistration) {
        toast.error('Guest limit reached. Please register!');
      } else {
        toast.error('Failed to create task');
      }
    }
  };

  const handlePrevDay = () => {
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 1);
    setCurrentDate(prev.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 1);
    setCurrentDate(next.toISOString().split('T')[0]);
  };

  const filteredTasks = getFilteredTasks();

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="nav-brand">
          <h2>TaskFlow</h2>
          <span className={`status ${connected ? 'connected' : 'disconnected'}`}>
            {connected ? '● Connected' : '○ Disconnected'}
          </span>
        </div>
        <div className="nav-actions">
          <span>Welcome, {user?.name}</span>
          <button onClick={logout}>Logout</button>
        </div>
      </nav>

      <div className="main-content">
        <div className="controls">
          <div className="date-nav">
            <button onClick={handlePrevDay}>← Prev</button>
            <input 
              type="date" 
              value={currentDate}
              onChange={(e) => setCurrentDate(e.target.value)}
            />
            <button onClick={handleNextDay}>Next →</button>
          </div>

          <div className="filters">
            <select 
              value={filters.status} 
              onChange={(e) => setFilter('status', e.target.value)}
            >
              <option value="">All Status</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="delayed">Delayed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <input
              type="text"
              placeholder="Search tasks..."
              value={filters.search}
              onChange={(e) => setFilter('search', e.target.value)}
            />
          </div>
        </div>

        <form className="quick-add" onSubmit={handleQuickAdd}>
          <input
            type="text"
            placeholder="Add a task and press Enter..."
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            maxLength={200}
          />
          <button type="submit">Add Task</button>
        </form>

        <TaskList tasks={filteredTasks} />

        <button 
          className="fab"
          onClick={() => setShowCreateModal(true)}
        >
          + Create Detailed Task
        </button>
      </div>

      {showCreateModal && (
        <CreateTaskModal 
          onClose={() => setShowCreateModal(false)}
          onCreated={fetchTasks}
        />
      )}
    </div>
  );
}

export default Dashboard;
```

**What this does:**
- Shows navigation with user name and logout
- Date picker to switch days
- Filters for status and search
- Quick add form for simple tasks
- Shows list of tasks
- Button to open detailed task creation
- Uses Socket.io for real-time updates

**Your task:** Copy and create `client/src/pages/Dashboard.jsx`

---

## 🎯 STEP 7: Create Task List Component

### Create `src/components/TaskList.jsx`

```jsx
import { useState } from 'react';
import TaskCard from './TaskCard';
import TaskDetail from './TaskDetail';

function TaskList({ tasks }) {
  const [selectedTask, setSelectedTask] = useState(null);

  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <p>No tasks found</p>
        <small>Create your first task above</small>
      </div>
    );
  }

  return (
    <>
      <div className="task-grid">
        {tasks.map(task => (
          <TaskCard 
            key={task.id} 
            task={task}
            onClick={() => setSelectedTask(task)}
          />
        ))}
      </div>

      {selectedTask && (
        <TaskDetail 
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </>
  );
}

export default TaskList;
```

**What this does:**
- Maps over tasks array
- Renders a TaskCard for each task
- Opens TaskDetail modal when card clicked
- Shows empty state if no tasks

---

## 🎯 STEP 8: Create Task Card Component

### Create `src/components/TaskCard.jsx`

```jsx
function TaskCard({ task, onClick }) {
  const getStatusColor = (status) => {
    const colors = {
      ongoing: 'blue',
      completed: 'green',
      delayed: 'red',
      cancelled: 'gray'
    };
    return colors[status] || 'blue';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'gray',
      medium: 'blue',
      high: 'orange',
      urgent: 'red'
    };
    return colors[priority] || 'blue';
  };

  return (
    <div className="task-card" onClick={onClick}>
      <div className="task-header">
        <h3>{task.text}</h3>
        <div className="task-badges">
          <span className={`badge status-${getStatusColor(task.status)}`}>
            {task.status}
          </span>
          {task.priority && task.priority !== 'medium' && (
            <span className={`badge priority-${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
          )}
          {task.hasSubTasks && (
            <span className="badge">
              🌲 Sub-tasks
            </span>
          )}
        </div>
      </div>

      <div className="task-meta">
        <small>👤 {task.createdBy}</small>
        {task.deadline && (
          <small>📅 Due: {new Date(task.deadline).toLocaleDateString()}</small>
        )}
        <small>💬 {task.comments?.length || 0} comments</small>
      </div>

      <div className="progress-section">
        <div className="progress-header">
          <span>Progress</span>
          <span>{task.progress}%</span>
        </div>
        <div className="progress-bar">
          <div 
            className={`progress-fill ${task.progress === 100 ? 'complete' : ''}`}
            style={{ width: `${task.progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default TaskCard;
```

**What this does:**
- Displays task information
- Shows status and priority badges
- Indicates if task has sub-tasks
- Shows progress bar
- Shows deadline if set
- Clickable to open details

---

## 🎯 STEP 9: Create Task Detail Modal

### Create `src/components/TaskDetail.jsx`

```jsx
import { useState } from 'react';
import { taskAPI } from '../services/api';
import { useSocket } from '../contexts/SocketContext';
import toast from 'react-hot-toast';

function TaskDetail({ task, onClose }) {
  const [progress, setProgress] = useState(task.progress);
  const [comment, setComment] = useState('');
  const [subTask, setSubTask] = useState('');
  const { emitWithToken } = useSocket();

  const handleProgressChange = async (newProgress) => {
    setProgress(newProgress);
    try {
      emitWithToken('updateProgress', {
        date: task.date,
        taskId: task.id,
        progress: newProgress
      });
    } catch (error) {
      toast.error('Failed to update progress');
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await taskAPI.changeStatus(task.id, newStatus);
      toast.success('Status updated');
    } catch (error) {
      toast.error('Failed to change status');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      emitWithToken('addComment', {
        date: task.date,
        taskId: task.id,
        commentText: comment
      });
      setComment('');
      toast.success('Comment added');
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  const handleAddSubTask = async (e) => {
    e.preventDefault();
    if (!subTask.trim()) return;

    try {
      emitWithToken('addSubTask', {
        date: task.date,
        taskId: task.id,
        subTaskText: subTask
      });
      setSubTask('');
      toast.success('Sub-task added');
    } catch (error) {
      toast.error('Failed to add sub-task');
    }
  };

  const handleCompleteSubTask = async (subtaskId) => {
    try {
      emitWithToken('completeSubTask', {
        date: task.date,
        taskId: task.id,
        subTaskId: subtaskId
      });
    } catch (error) {
      toast.error('Failed to complete sub-task');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{task.text}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {task.description && <p>{task.description}</p>}

          <div className="task-info">
            <span>Created by: {task.createdBy}</span>
            <span>Category: {task.category || 'None'}</span>
            {task.deadline && (
              <span>Deadline: {new Date(task.deadline).toLocaleString()}</span>
            )}
          </div>

          <div className="progress-control">
            <label>Progress: {progress}%</label>
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => handleProgressChange(parseInt(e.target.value))}
            />
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="status-control">
            <label>Status:</label>
            <select 
              value={task.status} 
              onChange={(e) => handleStatusChange(e.target.value)}
            >
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="delayed">Delayed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {task.hasSubTasks && (
            <div className="subtasks-section">
              <h3>Sub-tasks ({task.subTasks.filter(st => st.isCompleted).length}/{task.subTasks.length})</h3>
              {task.subTasks.map(st => (
                <div key={st.id} className="subtask-item">
                  <input
                    type="checkbox"
                    checked={st.isCompleted}
                    onChange={() => !st.isCompleted && handleCompleteSubTask(st.id)}
                    disabled={st.isCompleted}
                  />
                  <span className={st.isCompleted ? 'completed' : ''}>{st.text}</span>
                </div>
              ))}
            </div>
          )}

          <form className="add-subtask" onSubmit={handleAddSubTask}>
            <input
              type="text"
              placeholder="Add sub-task..."
              value={subTask}
              onChange={(e) => setSubTask(e.target.value)}
            />
            <button type="submit">Add</button>
          </form>

          <div className="comments-section">
            <h3>Comments ({task.comments?.length || 0})</h3>
            {task.comments?.map(c => (
              <div key={c.id} className="comment">
                <strong>{c.author}</strong>
                <p>{c.text}</p>
                <small>{new Date(c.timestamp).toLocaleString()}</small>
              </div>
            ))}
          </div>

          <form className="add-comment" onSubmit={handleAddComment}>
            <textarea
              placeholder="Add a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
            />
            <button type="submit">Post Comment</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default TaskDetail;
```

**What this does:**
- Shows full task details
- Progress slider to update progress
- Status dropdown
- Sub-tasks with checkboxes
- Add new sub-tasks
- Comments list
- Add new comments
- Uses Socket.io for real-time updates

---

## 🎯 STEP 10: Create Simple Task Card

### Create `src/components/TaskCard.jsx`

See Step 8 above - already provided!

---

## 🎯 STEP 11: Create Task Creation Modal

### Create `src/components/CreateTaskModal.jsx`

```jsx
import { useState } from 'react';
import { taskAPI } from '../services/api';
import toast from 'react-hot-toast';

function CreateTaskModal({ onClose, onCreated }) {
  const [formData, setFormData] = useState({
    text: '',
    description: '',
    deadline: '',
    category: '',
    priority: 'medium'
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const taskData = {
        ...formData,
        date: new Date().toISOString().split('T')[0]
      };
      
      await taskAPI.createTask(taskData);
      toast.success('Task created!');
      onCreated();
      onClose();
    } catch (error) {
      toast.error('Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Create New Task</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="text"
            placeholder="Task title"
            value={formData.text}
            onChange={handleChange}
            required
            maxLength={200}
          />

          <textarea
            name="description"
            placeholder="Description (optional)"
            value={formData.description}
            onChange={handleChange}
            maxLength={1000}
          />

          <input
            type="datetime-local"
            name="deadline"
            placeholder="Deadline (optional)"
            value={formData.deadline}
            onChange={handleChange}
          />

          <input
            type="text"
            name="category"
            placeholder="Category (optional)"
            value={formData.category}
            onChange={handleChange}
          />

          <select name="priority" value={formData.priority} onChange={handleChange}>
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
            <option value="urgent">Urgent</option>
          </select>

          <div className="modal-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateTaskModal;
```

**What this does:**
- Form with all task fields
- Validates input
- Calls API to create task
- Shows success/error messages
- Closes on success

---

## 🎯 STEP 12: Add Basic Styling

### Create `src/index.css`

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #f5f5f7;
  color: #1d1d1f;
}

/* Login Page */
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-card {
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 100%;
}

.login-card h1 {
  margin-bottom: 8px;
  color: #6366f1;
}

.mode-tabs {
  display: flex;
  gap: 8px;
  margin: 20px 0;
}

.mode-tabs button {
  flex: 1;
  padding: 10px;
  border: 2px solid #e5e7eb;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

.mode-tabs button.active {
  background: #6366f1;
  color: white;
  border-color: #6366f1;
}

.login-card form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.login-card input {
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 16px;
}

.login-card button[type="submit"] {
  padding: 12px;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-size: 16px;
}

.login-card button:hover:not(:disabled) {
  background: #4f46e5;
}

.login-card button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Dashboard */
.dashboard {
  min-height: 100vh;
}

.navbar {
  background: white;
  padding: 16px 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status.connected {
  color: #10b981;
}

.status.disconnected {
  color: #ef4444;
}

.main-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
}

.controls {
  background: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}

.date-nav {
  display: flex;
  gap: 8px;
  align-items: center;
}

.date-nav button,
.date-nav input {
  padding: 8px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  cursor: pointer;
}

.filters {
  display: flex;
  gap: 12px;
}

.filters select,
.filters input {
  padding: 8px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
}

.quick-add {
  background: white;
  padding: 16px;
  border-radius: 12px;
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.quick-add input {
  flex: 1;
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 16px;
}

.quick-add button {
  padding: 12px 24px;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

/* Task Grid */
.task-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.task-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s;
}

.task-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.task-badges {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.badge.status-blue { background: #dbeafe; color: #1e40af; }
.badge.status-green { background: #d1fae5; color: #065f46; }
.badge.status-red { background: #fee2e2; color: #991b1b; }
.badge.status-gray { background: #f3f4f6; color: #374151; }

.badge.priority-orange { background: #fed7aa; color: #9a3412; }
.badge.priority-red { background: #fee2e2; color: #991b1b; }

.task-meta {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 12px;
}

.progress-section {
  margin-top: 12px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
}

.progress-bar {
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #6366f1;
  transition: width 0.3s ease;
}

.progress-fill.complete {
  background: #10b981;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 16px;
  padding: 24px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6b7280;
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.progress-control input[type="range"] {
  width: 100%;
}

.subtasks-section {
  border-top: 2px solid #f3f4f6;
  padding-top: 16px;
}

.subtask-item {
  display: flex;
  gap: 8px;
  padding: 8px;
  margin-bottom: 8px;
}

.subtask-item span.completed {
  text-decoration: line-through;
  color: #9ca3af;
}

.comments-section {
  border-top: 2px solid #f3f4f6;
  padding-top: 16px;
}

.comment {
  background: #f9fafb;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 12px;
}

.comment strong {
  color: #6366f1;
  margin-bottom: 4px;
  display: block;
}

.add-comment textarea {
  width: 100%;
  min-height: 80px;
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  resize: vertical;
}

.fab {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #6366f1;
  color: white;
  border: none;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #9ca3af;
}

button {
  font-family: inherit;
}

/* Responsive */
@media (max-width: 768px) {
  .task-grid {
    grid-template-columns: 1fr;
  }
  
  .controls {
    flex-direction: column;
  }
}
```

---

## ✅ FINAL CHECKLIST

After creating all the files above:

### Installation
```bash
cd client
npm install
npm run dev
```

### Testing
1. Backend should be running on http://localhost:3000
2. React app runs on http://localhost:5173
3. Try logging in
4. Create a task
5. Click task to see details
6. Add comment
7. Add sub-task
8. Update progress

### What Works:
- ✅ User authentication (login/register/guest)
- ✅ Create tasks (simple and detailed)
- ✅ View tasks by date
- ✅ Task details with sub-tasks
- ✅ Comments on tasks
- ✅ Progress tracking
- ✅ Status management
- ✅ Real-time updates
- ✅ Filter and search

### What to Add Later (Batch 2-4):
- File uploads
- Task sharing UI
- Admin dashboard
- More filters
- Better styling
- Animations

---

## 🆘 Need Help?

### Common Issues:

**"Cannot find module 'react'"**
```bash
cd client
npm install
```

**"Failed to fetch"**
- Make sure backend is running: `npm start` in root folder
- Check http://localhost:3000/api/auth/me in browser

**"Socket.io not connecting"**
- Backend must be running
- Check console for errors
- Ensure ports 3000 and 5173 are free

### Learning Resources:
- React Basics: https://react.dev/learn
- React Router: https://reactrouter.com
- Axios: https://axios-http.com
- Zustand: https://github.com/pmndrs/zustand

---

## 🎓 Understanding the Code

### How Data Flows:

1. **Login** → Calls `authAPI.login()` → Gets token → Stores in Zustand → Navigates to dashboard

2. **Create Task** → Calls `taskAPI.createTask()` → Socket.io broadcasts → All users see new task

3. **Update Progress** → Uses Socket.io `emitWithToken` → Real-time update → All users see progress change

4. **Comments** → Socket.io for instant posting → Appears immediately for all users

### Key Concepts:

**Zustand Store (`useStore`):**
- Global state accessible from any component
- `const { user, tasks } = useStore()` - Read data
- `setTasks(newTasks)` - Update data

**API Client (`api.js`):**
- All backend calls pre-configured
- `taskAPI.createTask(data)` - Returns promise
- `authAPI.login(credentials)` - Handles auth

**Socket.io:**
- `emitWithToken(event, data)` - Send to server
- `socket.on(event, callback)` - Listen for updates
- Automatically includes your token

---

## 🚀 Next Steps

1. Create all files listed above
2. Test each feature
3. Add styling improvements
4. Then move to Batch 2-4 for advanced features

You now have everything you need to complete a working Task Flow app! The backend handles all the complex logic - you're just building the UI that uses it.

**Good luck! You've got this! 🎉**
# TaskFlow - Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ installed
- MongoDB running (local or cloud)

### 1️⃣ Backend Setup

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env and add your MongoDB URI
MONGODB_URI=mongodb://localhost:27017/taskflow
JWT_SECRET=your-super-secret-jwt-key
PORT=3000

# Start backend server
npm start
```

Backend will run on: http://localhost:3000

### 2️⃣ Frontend Setup

```bash
# Go to client directory
cd client

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on: http://localhost:5173

### 3️⃣ First Steps

1. **Open Browser**: Navigate to http://localhost:5173
2. **Choose Login Method**:
   - **Guest Access**: Click "Continue as Guest" - Quick start, no registration
   - **Create Account**: Full features, persistent data
   - **Sign In**: If you already have an account

3. **Create Your First Task**:
   - Click "New Task" button
   - Fill in task details
   - Click "Create Task"

4. **Collaborate in Real-Time**:
   - Open another browser tab/window
   - Login with different name/account
   - See changes sync instantly!

## 🎯 Key Features to Try

### Task Management
- Create tasks with priorities and deadlines
- Update progress bars (click/drag or use buttons)
- Change status (Pending → In Progress → Completed)
- Add categories and descriptions

### Collaboration
- Add comments to tasks
- Break tasks into sub-tasks
- See who's online in realtime
- All changes sync across users instantly

### Advanced Features
- Extend deadlines when needed
- Filter tasks by status, priority, category
- Search across all tasks
- Navigate between dates

## 📱 Guest vs Registered Users

### Guest Users Can:
✅ View all tasks
✅ Create up to 10 tasks
✅ Comment on tasks
✅ Update progress
✅ Add sub-tasks
❌ Cannot access admin features

### Registered Users Can:
✅ Everything guests can do
✅ Unlimited task creation
✅ Access to admin dashboard (if admin role)
✅ Persistent account data
✅ Can convert from guest anytime

## 🔧 Troubleshooting

### Backend won't start?
- Check MongoDB is running
- Verify .env file exists and has correct values
- Check port 3000 is not in use

### Frontend won't start?
- Ensure backend is running first
- Check port 5173 is available
- Try clearing node_modules and reinstalling

### Real-time updates not working?
- Check browser console for Socket.io errors
- Verify backend is running
- Ensure both frontend and backend can communicate

## 📚 Project Structure

```
taskflow/
├── server.js              # Backend entry point
├── models/                # MongoDB schemas
├── routes/                # API endpoints
├── middleware/            # Auth & logging
├── public/                # Static files
└── client/                # React frontend
    ├── src/
    │   ├── components/    # UI components
    │   ├── contexts/      # React context
    │   ├── pages/         # Page components
    │   ├── services/      # API client
    │   └── store/         # State management
    └── public/            # Static assets
```

## 🌐 API Endpoints

### Authentication
- POST `/api/auth/register` - Create account
- POST `/api/auth/login` - Sign in
- POST `/api/auth/guest` - Guest login
- GET `/api/auth/me` - Current user

### Tasks
- GET `/api/tasks` - List tasks (with filters)
- POST `/api/tasks` - Create task
- GET `/api/tasks/:id` - Task details
- PATCH `/api/tasks/:id` - Update task
- DELETE `/api/tasks/:id` - Delete task
- PATCH `/api/tasks/:id/progress` - Update progress
- PATCH `/api/tasks/:id/status` - Change status
- POST `/api/tasks/:id/comments` - Add comment
- POST `/api/tasks/:id/subtasks` - Add sub-task

Full API documentation: [API_REFERENCE.md](../API_REFERENCE.md)

## 💡 Tips

1. **Use Keyboard Shortcuts**:
   - Press Tab to navigate quickly
   - Enter to submit forms

2. **Progress Bar Pro Tips**:
   - Click and drag for precise control
   - Use +10% / -10% buttons for quick updates
   - Progress automatically calculates from sub-tasks

3. **Stay Organized**:
   - Use categories to group related tasks
   - Set priorities to focus on important items
   - Add deadlines to track time-sensitive work

4. **Team Collaboration**:
   - Use comments for updates and questions
   - Break complex tasks into sub-tasks
   - Monitor active users sidebar

## 🐛 Found a Bug?

Check console for errors:
- Browser: Press F12 → Console tab
- Backend: Check terminal output

## 📖 Learn More

- [Features Documentation](../FEATURES_DOCUMENTATION.md)
- [Deployment Guide](../DEPLOYMENT_GUIDE.md)
- [API Reference](../API_REFERENCE.md)

## 🎉 You're Ready!

Start collaborating with your team on TaskFlow!
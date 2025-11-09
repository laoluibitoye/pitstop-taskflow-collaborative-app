# 🚀 Run TaskFlow Application

## Quick Start (2 Steps)

### Step 1: Start Backend Server

Open a terminal in the project root:

```bash
# Make sure you're in the root directory
cd c:/Users/Laolu Ibitoye/Desktop/Kilo-Code-Playground

# Install backend dependencies (if not done)
npm install

# Start the backend server
npm start
```

**Expected Output:**
```
Server running on port 3000
MongoDB connected successfully
Socket.io initialized
```

Backend is now running at: **http://localhost:3000**

### Step 2: Start Frontend (React)

Open a NEW terminal in the client directory:

```bash
# Navigate to client folder
cd client

# Dependencies should already be installed
# If not, run: npm install

# Start the Vite development server
npm run dev
```

**Expected Output:**
```
VITE v5.0.7  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

Frontend is now running at: **http://localhost:5173**

### Step 3: Open Your Browser

Navigate to: **http://localhost:5173**

You should see the TaskFlow login screen with three options:
1. **Sign In** - For existing users
2. **Create Account** - For new users
3. **Continue as Guest** - Quick access without registration

## 🎯 Test the Application

### Test Real-Time Collaboration

1. Open **http://localhost:5173** in Browser Window 1
2. Click "Continue as Guest" and enter name "Alice"
3. Create a task

4. Open **http://localhost:5173** in Browser Window 2 (or Incognito)
5. Click "Continue as Guest" and enter name "Bob"
6. You should see Alice's task appear instantly!

7. Have Bob update the task's progress
8. Watch Alice's screen update in real-time!

### Test All Features

✅ **Task Creation**
- Click "New Task" button
- Fill in title, description, priority, category, deadline
- Submit and see it appear instantly

✅ **Progress Bar**
- Click and drag the progress bar
- Use +10% and -10% buttons
- See color change at 100%

✅ **Comments**
- Click on any task
- Go to "Comments" tab
- Add a comment
- See timestamp and user info

✅ **Sub-Tasks**
- Click on any task
- Go to "Subtasks" tab
- Add sub-tasks
- Click to toggle completion
- Watch progress auto-calculate

✅ **Filters**
- Use search box to find tasks
- Filter by status, category, priority
- Click "Clear Filters" to reset

✅ **Date Navigation**
- Use arrow buttons to change dates
- Click "Today" to return to today
- Tasks are organized by date

✅ **Active Users**
- See who's online in the sidebar
- Open another browser window
- Watch users appear/disappear

## 🐛 Troubleshooting

### Backend won't start?

**Error: "EADDRINUSE: port 3000 already in use"**
```bash
# Kill process on port 3000
# On Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Then restart: npm start
```

**Error: "MongoDB connection failed"**
- Ensure MongoDB is running
- Check MONGODB_URI in .env file
- Default: `mongodb://localhost:27017/taskflow`

### Frontend won't start?

**Error: "Cannot find module"**
```bash
cd client
rm -rf node_modules
npm install
npm run dev
```

**Error: "Port 5173 already in use"**
```bash
# Vite will automatically try next available port (5174, 5175, etc.)
# Or specify a different port:
npm run dev -- --port 3001
```

### Real-time updates not working?

1. Check Backend Console - Should show Socket.io connections
2. Check Browser Console (F12) - Look for Socket.io errors
3. Verify both frontend and backend are running
4. Check the connection indicator in the header (green dot = connected)

### UI looks broken?

1. Hard refresh: Ctrl + Shift + R (Windows) or Cmd + Shift + R (Mac)
2. Clear browser cache
3. Check browser console for CSS errors

## 📱 Access from Other Devices

### Access from Phone/Tablet on Same Network

1. Find your computer's IP address:
   ```bash
   # Windows
   ipconfig
   # Look for "IPv4 Address"
   
   # Mac/Linux
   ifconfig
   # Look for "inet"
   ```

2. Start frontend with host flag:
   ```bash
   npm run dev -- --host
   ```

3. On your phone/tablet, open browser and go to:
   ```
   http://YOUR_IP_ADDRESS:5173
   ```
   Example: `http://192.168.1.100:5173`

## 🎓 What to Try

### Scenario 1: Team Daily Standup
1. Create tasks for today
2. Add priorities (high for blockers)
3. Team members update progress
4. Use comments for status updates

### Scenario 2: Project Planning
1. Create tasks with deadlines
2. Break into sub-tasks
3. Assign categories (features, bugs, etc.)
4. Track completion over time

### Scenario 3: Real-Time Demo
1. Open on projector/screen
2. Multiple team members contribute
3. Watch updates appear live
4. Show active users sidebar

## 🎨 Screenshots to Expect

### Login Screen
- Three buttons: Sign In, Create Account, Continue as Guest
- Clean, centered design
- TaskFlow logo and branding

### Dashboard
- Header with "New Task" button and user menu
- Date selector with previous/next buttons
- Filter bar with search and dropdowns
- Task cards showing progress bars
- Active users sidebar

### Task Detail Modal
- Three tabs: Details, Comments, Subtasks
- Interactive progress bar
- Status buttons (pending/in progress/completed)
- Comment thread
- Sub-task checklist

## 💾 Data Persistence

- **Guest users**: Data persists as long as token is valid
- **Registered users**: Data saved in MongoDB permanently
- **Tasks**: Organized by date, survive app restart
- **Comments & Sub-tasks**: Fully persistent

## 🔐 User Roles

### Guest
- Can create up to 10 tasks
- Can view all tasks
- Can comment and update progress
- Limited to basic features

### User (Registered)
- Unlimited task creation
- All features available
- Permanent account
- Can convert from guest

### Admin
- Access to admin dashboard
- User management
- System settings
- Activity logs

## 📊 Performance Tips

- Tasks load per day (not all at once)
- Real-time updates use WebSocket (very efficient)
- Filters work on client-side (instant)
- Images/files cached by browser

## 🎉 You're Ready!

Both servers should now be running:
- ✅ Backend: http://localhost:3000
- ✅ Frontend: http://localhost:5173
- ✅ MongoDB: Connected
- ✅ Socket.io: Active

Open **http://localhost:5173** and start collaborating! 🚀

---

**Need Help?** 
- Check [QUICKSTART.md](client/QUICKSTART.md)
- See [FRONTEND_IMPLEMENTATION_SUMMARY.md](FRONTEND_IMPLEMENTATION_SUMMARY.md)
- Review [API_REFERENCE.md](API_REFERENCE.md)
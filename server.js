const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static('public'));

// In-memory data storage (replace with database in production)
const taskLists = {}; // { 'YYYY-MM-DD': { tasks: [], lastModified: timestamp } }
const activeUsers = new Map(); // { socketId: { name, joinedAt } }

// Helper function to get or create task list for a date
function getTaskList(date) {
  if (!taskLists[date]) {
    taskLists[date] = {
      tasks: [],
      lastModified: Date.now()
    };
  }
  return taskLists[date];
}

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle user joining
  socket.on('join', (guestName) => {
    activeUsers.set(socket.id, {
      name: guestName || `Guest_${socket.id.substring(0, 6)}`,
      joinedAt: Date.now()
    });
    
    // Notify all users about active users
    io.emit('activeUsers', Array.from(activeUsers.values()));
    
    console.log(`User joined: ${activeUsers.get(socket.id).name}`);
  });

  // Handle requesting task list for a specific date
  socket.on('requestTaskList', (date) => {
    const taskList = getTaskList(date);
    socket.emit('taskList', { date, tasks: taskList.tasks });
  });

  // Handle adding a new task
  socket.on('addTask', ({ date, task }) => {
    const taskList = getTaskList(date);
    const user = activeUsers.get(socket.id);
    
    const newTask = {
      id: uuidv4(),
      text: task.text,
      progress: 0,
      createdBy: user ? user.name : 'Anonymous',
      createdAt: Date.now(),
      comments: []
    };
    
    taskList.tasks.push(newTask);
    taskList.lastModified = Date.now();
    
    // Broadcast to all users
    io.emit('taskAdded', { date, task: newTask });
  });

  // Handle updating task progress
  socket.on('updateProgress', ({ date, taskId, progress }) => {
    const taskList = getTaskList(date);
    const task = taskList.tasks.find(t => t.id === taskId);
    
    if (task) {
      task.progress = Math.max(0, Math.min(100, progress));
      taskList.lastModified = Date.now();
      
      // Broadcast to all users
      io.emit('progressUpdated', { date, taskId, progress: task.progress });
    }
  });

  // Handle adding a comment to a task
  socket.on('addComment', ({ date, taskId, commentText }) => {
    const taskList = getTaskList(date);
    const task = taskList.tasks.find(t => t.id === taskId);
    const user = activeUsers.get(socket.id);
    
    if (task) {
      const newComment = {
        id: uuidv4(),
        text: commentText,
        author: user ? user.name : 'Anonymous',
        timestamp: Date.now()
      };
      
      task.comments.push(newComment);
      taskList.lastModified = Date.now();
      
      // Broadcast to all users
      io.emit('commentAdded', { date, taskId, comment: newComment });
    }
  });

  // Handle deleting a task
  socket.on('deleteTask', ({ date, taskId }) => {
    const taskList = getTaskList(date);
    const taskIndex = taskList.tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex !== -1) {
      taskList.tasks.splice(taskIndex, 1);
      taskList.lastModified = Date.now();
      
      // Broadcast to all users
      io.emit('taskDeleted', { date, taskId });
    }
  });

  // Handle user disconnect
  socket.on('disconnect', () => {
    const user = activeUsers.get(socket.id);
    if (user) {
      console.log(`User disconnected: ${user.name}`);
      activeUsers.delete(socket.id);
      
      // Notify all users about active users
      io.emit('activeUsers', Array.from(activeUsers.values()));
    }
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
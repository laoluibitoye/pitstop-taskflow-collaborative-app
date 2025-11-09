# 📋 Collaborative Task Manager

A real-time collaborative task management application that enables multiple users to work together on shared daily task lists. Built with Node.js, Express, Socket.io, and vanilla JavaScript.

## ✨ Features

### Core Functionality
- **No Login Required**: Users only need a guest name to join and collaborate
- **Date-Based Task Lists**: Organize tasks by calendar date with easy navigation
- **Real-Time Synchronization**: All changes are instantly reflected for all connected users
- **Visual Progress Tracking**: Interactive progress bars with slider controls and increment buttons
- **Threaded Comments**: Discuss tasks with team members through a comment system
- **User Activity Tracking**: See who added tasks and comments with timestamps
- **Multi-User Support**: Handle multiple simultaneous users without conflicts

### User Interface
- Clean, modern design with gradient backgrounds
- Responsive layout that works on desktop and mobile
- Intuitive controls for quick task addition
- Visual feedback with animations and color coding
- Active users panel showing current collaborators
- Date picker for easy navigation between days

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone or download the project:
```bash
cd Kilo-Code-Playground
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

### For Development
Use nodemon for auto-restart on file changes:
```bash
npm run dev
```

## 📖 Usage Guide

### Joining a Session
1. When you first open the application, you'll see a welcome modal
2. Enter your guest name (this will identify you to other users)
3. Click "Join Now" to start collaborating

### Managing Tasks

#### Adding a Task
1. Type your task in the input field at the top
2. Press Enter or click "Add Task"
3. The task appears immediately for all users

#### Updating Progress
You have three ways to update task progress:
- **Slider**: Drag the slider to set any percentage from 0-100%
- **Increment Buttons**: Use the + and - buttons to adjust by 10%
- **Direct Input**: The slider provides precise control

Progress bars change color when tasks reach 100% completion.

#### Adding Comments
1. Click "Show" or "Add Comment" on any task
2. Type your comment in the input field
3. Press Enter or click "Post"
4. Comments show the author name and timestamp

#### Deleting Tasks
- Click the "Delete" button on any task
- The task is removed for all users immediately

### Navigation

#### Changing Dates
- **Previous/Next Day Buttons**: Navigate one day at a time
- **Date Picker**: Jump to any specific date
- Tasks are automatically loaded for the selected date

#### Viewing Active Users
- Check the panel in the bottom-right corner
- See all currently connected users
- User count is displayed in the header

## 🏗️ Architecture

### Technology Stack
- **Backend**: Node.js + Express
- **Real-Time Communication**: Socket.io
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Data Storage**: In-memory (upgradeable to database)

### File Structure
```
Kilo-Code-Playground/
├── server.js              # Express server and Socket.io logic
├── package.json           # Project dependencies
├── public/
│   ├── index.html        # Main HTML structure
│   ├── styles.css        # Styling and animations
│   └── app.js            # Client-side JavaScript
└── README.md             # This file
```

### Socket.io Events

#### Client → Server
- `join`: User joins with guest name
- `requestTaskList`: Request tasks for a specific date
- `addTask`: Add a new task
- `updateProgress`: Update task progress percentage
- `addComment`: Add a comment to a task
- `deleteTask`: Delete a task

#### Server → Client
- `taskList`: Send complete task list for a date
- `taskAdded`: Broadcast new task to all users
- `progressUpdated`: Broadcast progress update
- `commentAdded`: Broadcast new comment
- `taskDeleted`: Broadcast task deletion
- `activeUsers`: Update list of active users

## 🔧 Configuration

### Changing the Port
Edit `server.js` and modify the PORT constant:
```javascript
const PORT = process.env.PORT || 3000;
```

Or set an environment variable:
```bash
PORT=8080 npm start
```

## 🚀 Deployment Options

### Local Network Access
Share your application on a local network:
1. Find your local IP address (e.g., 192.168.1.100)
2. Start the server
3. Share the URL: `http://192.168.1.100:3000`

### Production Deployment
For production use, consider:
1. **Database Integration**: Replace in-memory storage with MongoDB, PostgreSQL, etc.
2. **Authentication**: Add proper user authentication
3. **HTTPS**: Enable secure connections
4. **Environment Variables**: Use .env for configuration
5. **Process Manager**: Use PM2 or similar for production
6. **Cloud Hosting**: Deploy to Heroku, AWS, DigitalOcean, etc.

## 🎨 Customization

### Styling
Edit `public/styles.css` to customize:
- Color schemes (gradient backgrounds, button colors)
- Typography (fonts, sizes)
- Layout (spacing, sizing)
- Animations and transitions

### Progress Bar Colors
Modify the gradient in `.progress-bar`:
```css
.progress-bar {
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}
```

### Date Format
Change date display format in `public/app.js`:
```javascript
function formatDisplayDate(date) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}
```

## 🔒 Security Considerations

### Current Implementation
- Basic input sanitization (HTML escaping)
- No authentication (guest names only)
- In-memory storage (data lost on restart)

### Production Recommendations
1. Implement proper authentication
2. Add input validation and sanitization
3. Use database with proper data persistence
4. Add rate limiting to prevent abuse
5. Implement CSRF protection
6. Use HTTPS in production
7. Add authorization for task modifications

## 🐛 Known Limitations

1. **Data Persistence**: Tasks are stored in memory and cleared on server restart
2. **Scalability**: In-memory storage limits scaling to single server
3. **Authentication**: No user accounts or password protection
4. **File Attachments**: No support for file uploads
5. **Task Assignment**: No way to assign tasks to specific users
6. **Notifications**: No email or push notifications

## 🔮 Future Enhancements

- [ ] Database integration (MongoDB/PostgreSQL)
- [ ] User accounts with authentication
- [ ] Task assignments and priorities
- [ ] File attachments for tasks
- [ ] Email notifications
- [ ] Task categories/labels
- [ ] Search and filter functionality
- [ ] Export tasks to PDF/CSV
- [ ] Dark mode toggle
- [ ] Mobile app versions

## 📝 License

This project is open source and available for personal and commercial use.

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## 📧 Support

For questions or issues:
1. Check the documentation above
2. Review the code comments
3. Test in a local environment
4. Check browser console for errors

## 🎉 Acknowledgments

Built with:
- [Express](https://expressjs.com/) - Fast, unopinionated web framework
- [Socket.io](https://socket.io/) - Real-time bidirectional event-based communication
- [UUID](https://github.com/uuidjs/uuid) - Generate unique identifiers

---

**Happy Collaborating! 🚀**
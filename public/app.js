// ========================================
// Initialize Socket.io Connection
// ========================================
const socket = io();

// ========================================
// State Management
// ========================================
let currentDate = new Date();
let userName = '';
let tasks = [];
let currentTaskId = null;

// ========================================
// DOM Elements - Landing Page
// ========================================
const landingPage = document.getElementById('landingPage');
const getStartedBtn = document.getElementById('getStartedBtn');

// ========================================
// DOM Elements - App Container
// ========================================
const appContainer = document.getElementById('appContainer');
const welcomeModal = document.getElementById('welcomeModal');
const guestNameInput = document.getElementById('guestNameInput');
const joinBtn = document.getElementById('joinBtn');

// ========================================
// DOM Elements - Header
// ========================================
const themeToggle = document.getElementById('themeToggle');
const userNameDisplay = document.getElementById('userNameDisplay');
const activeUsersCount = document.getElementById('activeUsersCount');

// ========================================
// DOM Elements - Task List View
// ========================================
const taskListView = document.getElementById('taskListView');
const datePicker = document.getElementById('datePicker');
const currentDateDisplay = document.getElementById('currentDateDisplay');
const prevDayBtn = document.getElementById('prevDay');
const nextDayBtn = document.getElementById('nextDay');
const newTaskInput = document.getElementById('newTaskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const tasksGrid = document.getElementById('tasksGrid');
const emptyState = document.getElementById('emptyState');

// ========================================
// DOM Elements - Task Detail View
// ========================================
const taskDetailView = document.getElementById('taskDetailView');
const backToListBtn = document.getElementById('backToList');
const deleteTaskDetailBtn = document.getElementById('deleteTaskDetail');
const detailTaskTitle = document.getElementById('detailTaskTitle');
const detailCreator = document.getElementById('detailCreator');
const detailCreatedTime = document.getElementById('detailCreatedTime');
const detailProgressValue = document.getElementById('detailProgressValue');
const detailProgressSlider = document.getElementById('detailProgressSlider');
const detailProgressBar = document.getElementById('detailProgressBar');
const detailDecrementBtn = document.getElementById('detailDecrement');
const detailIncrementBtn = document.getElementById('detailIncrement');
const detailCommentCount = document.getElementById('detailCommentCount');
const detailCommentsList = document.getElementById('detailCommentsList');
const detailCommentInput = document.getElementById('detailCommentInput');
const detailAddCommentBtn = document.getElementById('detailAddComment');

// ========================================
// DOM Elements - Users Sidebar
// ========================================
const activeUsersList = document.getElementById('activeUsersList');
const sidebarUserCount = document.getElementById('sidebarUserCount');

// ========================================
// Helper Functions
// ========================================
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatDisplayDate(date) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (formatDate(date) === formatDate(today)) {
        return 'Today';
    } else if (formatDate(date) === formatDate(tomorrow)) {
        return 'Tomorrow';
    } else if (formatDate(date) === formatDate(yesterday)) {
        return 'Yesterday';
    }
    
    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function updateDateDisplay() {
    currentDateDisplay.textContent = formatDisplayDate(currentDate);
    datePicker.value = formatDate(currentDate);
}

function requestTaskList() {
    const dateStr = formatDate(currentDate);
    socket.emit('requestTaskList', dateStr);
}

// ========================================
// Theme Management
// ========================================
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.className = `${savedTheme}-theme`;
}

function toggleTheme() {
    const currentTheme = document.body.className.includes('dark') ? 'dark' : 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.body.className = `${newTheme}-theme`;
    localStorage.setItem('theme', newTheme);
}

// ========================================
// View Management
// ========================================
function showTaskList() {
    taskListView.classList.remove('hidden');
    taskDetailView.classList.add('hidden');
    currentTaskId = null;
}

function showTaskDetail(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    currentTaskId = taskId;
    
    // Update detail view
    detailTaskTitle.textContent = task.text;
    detailCreator.textContent = task.createdBy;
    detailCreatedTime.textContent = formatTimestamp(task.createdAt);
    
    // Update progress
    updateDetailProgress(task.progress);
    
    // Update comments
    detailCommentCount.textContent = task.comments.length;
    renderDetailComments(task.comments);
    
    // Show detail view
    taskListView.classList.add('hidden');
    taskDetailView.classList.remove('hidden');
}

function updateDetailProgress(progress) {
    detailProgressValue.textContent = `${progress}%`;
    detailProgressSlider.value = progress;
    detailProgressBar.style.width = `${progress}%`;
    
    const progressText = detailProgressBar.querySelector('.progress-text');
    if (progressText) {
        progressText.textContent = progress > 5 ? `${progress}%` : '';
    }
    
    if (progress === 100) {
        detailProgressBar.classList.add('complete');
    } else {
        detailProgressBar.classList.remove('complete');
    }
}

function renderDetailComments(comments) {
    detailCommentsList.innerHTML = '';
    
    if (comments.length === 0) {
        detailCommentsList.innerHTML = '<p style="text-align: center; color: var(--text-tertiary); padding: 2rem;">No comments yet. Be the first to comment!</p>';
        return;
    }
    
    comments.forEach(comment => {
        const commentEl = document.createElement('div');
        commentEl.className = 'comment-detail';
        commentEl.innerHTML = `
            <div class="comment-header-detail">
                <span class="comment-author-detail">${escapeHtml(comment.author)}</span>
                <span class="comment-time-detail">${formatTimestamp(comment.timestamp)}</span>
            </div>
            <div class="comment-text-detail">${escapeHtml(comment.text)}</div>
        `;
        detailCommentsList.appendChild(commentEl);
    });
}

// ========================================
// Render Functions
// ========================================
function renderTasks() {
    tasksGrid.innerHTML = '';
    
    if (tasks.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    }
    
    emptyState.classList.add('hidden');
    
    tasks.forEach((task, index) => {
        const taskCard = createTaskCard(task, index);
        tasksGrid.appendChild(taskCard);
    });
}

function createTaskCard(task, index) {
    const card = document.createElement('div');
    card.className = 'task-card';
    card.dataset.taskId = task.id;
    card.style.animationDelay = `${index * 0.05}s`;
    
    const progressClass = task.progress === 100 ? 'complete' : '';
    
    card.innerHTML = `
        <div class="task-header-card">
            <h3 class="task-title-card">${escapeHtml(task.text)}</h3>
            <div class="task-meta-card">
                <div class="meta-item-card">
                    <i class="fas fa-user"></i>
                    <span>${escapeHtml(task.createdBy)}</span>
                </div>
                <div class="meta-item-card">
                    <i class="fas fa-clock"></i>
                    <span>${formatTimestamp(task.createdAt)}</span>
                </div>
            </div>
        </div>
        
        <div class="task-progress-card">
            <div class="progress-info">
                <span class="progress-label-card">Progress</span>
                <span class="progress-percent-card">${task.progress}%</span>
            </div>
            <div class="progress-bar-card">
                <div class="progress-fill ${progressClass}" style="width: ${task.progress}%"></div>
            </div>
        </div>
        
        <div class="task-footer-card">
            <div class="comment-count">
                <i class="fas fa-comments"></i>
                <span>${task.comments.length} comment${task.comments.length !== 1 ? 's' : ''}</span>
            </div>
        </div>
    `;
    
    card.addEventListener('click', () => showTaskDetail(task.id));
    
    return card;
}

function updateTaskCard(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const card = document.querySelector(`.task-card[data-task-id="${taskId}"]`);
    if (!card) return;
    
    // Update progress
    const progressPercent = card.querySelector('.progress-percent-card');
    const progressFill = card.querySelector('.progress-fill');
    
    progressPercent.textContent = `${task.progress}%`;
    progressFill.style.width = `${task.progress}%`;
    
    if (task.progress === 100) {
        progressFill.classList.add('complete');
    } else {
        progressFill.classList.remove('complete');
    }
    
    // Update comments count
    const commentCount = card.querySelector('.comment-count span');
    commentCount.textContent = `${task.comments.length} comment${task.comments.length !== 1 ? 's' : ''}`;
}

// ========================================
// Event Handlers - Landing & Welcome
// ========================================
getStartedBtn.addEventListener('click', () => {
    landingPage.classList.add('hidden');
    appContainer.classList.remove('hidden');
    welcomeModal.classList.remove('hidden');
    guestNameInput.focus();
});

joinBtn.addEventListener('click', () => {
    const name = guestNameInput.value.trim();
    if (name) {
        userName = name;
        socket.emit('join', userName);
        welcomeModal.classList.add('hidden');
        userNameDisplay.textContent = userName;
        requestTaskList();
    }
});

guestNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        joinBtn.click();
    }
});

// ========================================
// Event Handlers - Header
// ========================================
themeToggle.addEventListener('click', toggleTheme);

// ========================================
// Event Handlers - Date Navigation
// ========================================
prevDayBtn.addEventListener('click', () => {
    currentDate.setDate(currentDate.getDate() - 1);
    updateDateDisplay();
    requestTaskList();
});

nextDayBtn.addEventListener('click', () => {
    currentDate.setDate(currentDate.getDate() + 1);
    updateDateDisplay();
    requestTaskList();
});

datePicker.addEventListener('change', (e) => {
    currentDate = new Date(e.target.value + 'T00:00:00');
    updateDateDisplay();
    requestTaskList();
});

document.querySelector('.date-display').addEventListener('click', () => {
    datePicker.showPicker();
});

// ========================================
// Event Handlers - Add Task
// ========================================
addTaskBtn.addEventListener('click', () => {
    const taskText = newTaskInput.value.trim();
    if (taskText) {
        const dateStr = formatDate(currentDate);
        socket.emit('addTask', {
            date: dateStr,
            task: { text: taskText }
        });
        newTaskInput.value = '';
    }
});

newTaskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTaskBtn.click();
    }
});

// ========================================
// Event Handlers - Task Detail View
// ========================================
backToListBtn.addEventListener('click', showTaskList);

deleteTaskDetailBtn.addEventListener('click', () => {
    if (currentTaskId && confirm('Are you sure you want to delete this task?')) {
        const dateStr = formatDate(currentDate);
        socket.emit('deleteTask', { date: dateStr, taskId: currentTaskId });
        showTaskList();
    }
});

detailDecrementBtn.addEventListener('click', () => {
    if (currentTaskId) {
        const task = tasks.find(t => t.id === currentTaskId);
        if (task) {
            const newProgress = Math.max(0, task.progress - 10);
            const dateStr = formatDate(currentDate);
            socket.emit('updateProgress', {
                date: dateStr,
                taskId: currentTaskId,
                progress: newProgress
            });
        }
    }
});

detailIncrementBtn.addEventListener('click', () => {
    if (currentTaskId) {
        const task = tasks.find(t => t.id === currentTaskId);
        if (task) {
            const newProgress = Math.min(100, task.progress + 10);
            const dateStr = formatDate(currentDate);
            socket.emit('updateProgress', {
                date: dateStr,
                taskId: currentTaskId,
                progress: newProgress
            });
        }
    }
});

detailProgressSlider.addEventListener('input', (e) => {
    if (currentTaskId) {
        const progress = parseInt(e.target.value);
        const dateStr = formatDate(currentDate);
        socket.emit('updateProgress', {
            date: dateStr,
            taskId: currentTaskId,
            progress
        });
    }
});

detailAddCommentBtn.addEventListener('click', () => {
    const commentText = detailCommentInput.value.trim();
    if (commentText && currentTaskId) {
        const dateStr = formatDate(currentDate);
        socket.emit('addComment', {
            date: dateStr,
            taskId: currentTaskId,
            commentText
        });
        detailCommentInput.value = '';
    }
});

detailCommentInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        detailAddCommentBtn.click();
    }
});

// ========================================
// Socket.io Event Listeners
// ========================================
socket.on('taskList', ({ date, tasks: receivedTasks }) => {
    if (date === formatDate(currentDate)) {
        tasks = receivedTasks;
        renderTasks();
        
        // If we're viewing a task detail, update it
        if (currentTaskId) {
            const task = tasks.find(t => t.id === currentTaskId);
            if (task) {
                showTaskDetail(currentTaskId);
            } else {
                showTaskList();
            }
        }
    }
});

socket.on('taskAdded', ({ date, task }) => {
    if (date === formatDate(currentDate)) {
        tasks.push(task);
        renderTasks();
    }
});

socket.on('progressUpdated', ({ date, taskId, progress }) => {
    if (date === formatDate(currentDate)) {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            task.progress = progress;
            updateTaskCard(taskId);
            
            // Update detail view if viewing this task
            if (currentTaskId === taskId) {
                updateDetailProgress(progress);
            }
        }
    }
});

socket.on('commentAdded', ({ date, taskId, comment }) => {
    if (date === formatDate(currentDate)) {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            task.comments.push(comment);
            updateTaskCard(taskId);
            
            // Update detail view if viewing this task
            if (currentTaskId === taskId) {
                detailCommentCount.textContent = task.comments.length;
                renderDetailComments(task.comments);
            }
        }
    }
});

socket.on('taskDeleted', ({ date, taskId }) => {
    if (date === formatDate(currentDate)) {
        tasks = tasks.filter(t => t.id !== taskId);
        renderTasks();
        
        // If we were viewing this task, go back to list
        if (currentTaskId === taskId) {
            showTaskList();
        }
    }
});

socket.on('activeUsers', (users) => {
    activeUsersCount.textContent = users.length;
    sidebarUserCount.textContent = users.length;
    
    activeUsersList.innerHTML = '';
    users.forEach((user, index) => {
        const li = document.createElement('li');
        li.textContent = user.name;
        li.style.animationDelay = `${index * 0.05}s`;
        activeUsersList.appendChild(li);
    });
});

// ========================================
// Initialize Application
// ========================================
function init() {
    initTheme();
    updateDateDisplay();
}

// Start the application
init();
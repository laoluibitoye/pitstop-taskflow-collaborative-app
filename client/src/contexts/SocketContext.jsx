import { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useStore } from '../store/useStore';

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { token, user, setActiveUsers, addTask, updateTask, deleteTask } = useStore();

  useEffect(() => {
    if (!token) return;

    const newSocket = io('http://localhost:3000', {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
      setConnected(true);
      
      // Join with token
      newSocket.emit('join', { token, guestName: user?.name });
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnected(false);
    });

    // Listen for active users
    newSocket.on('activeUsers', (users) => {
      setActiveUsers(users);
    });

    // Listen for task updates
    newSocket.on('taskAdded', ({ task }) => {
      addTask(task);
    });

    newSocket.on('progressUpdated', ({ taskId, progress, status, completedAt }) => {
      updateTask(taskId, { progress, status, completedAt });
    });

    newSocket.on('statusChanged', ({ taskId, status, statusChangedAt, completedAt, progress }) => {
      updateTask(taskId, { status, statusChangedAt, completedAt, progress });
    });

    newSocket.on('subTaskAdded', ({ taskId, subTask, hasSubTasks, progress }) => {
      updateTask(taskId, { hasSubTasks, progress });
    });

    newSocket.on('subTaskCompleted', ({ taskId, progress, subTasks }) => {
      updateTask(taskId, { progress, subTasks });
    });

    newSocket.on('deadlineExtended', ({ taskId, deadline, timeExtensions, status }) => {
      updateTask(taskId, { deadline, timeExtensions, status });
    });

    newSocket.on('commentAdded', ({ taskId, comment }) => {
      // Update task with new comment
      updateTask(taskId, { 
        comments: [...(useStore.getState().tasks.find(t => t.id === taskId)?.comments || []), comment]
      });
    });

    newSocket.on('taskDeleted', ({ taskId }) => {
      deleteTask(taskId);
    });

    newSocket.on('error', ({ message }) => {
      console.error('Socket error:', message);
    });

    newSocket.on('guestLimitReached', ({ type, message }) => {
      console.warn('Guest limit:', message);
      // Show modal or toast
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token, user]);

  const emitWithToken = (event, data) => {
    if (socket && token) {
      socket.emit(event, { ...data, token });
    }
  };

  return (
    <SocketContext.Provider value={{ socket, connected, emitWithToken }}>
      {children}
    </SocketContext.Provider>
  );
};
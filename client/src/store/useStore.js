import { create } from 'zustand';

export const useStore = create((set, get) => ({
  // Auth state
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  
  // Task state
  tasks: [],
  currentDate: new Date().toISOString().split('T')[0],
  selectedTask: null,
  categories: [],
  
  // UI state
  loading: false,
  error: null,
  
  // Filter state
  filters: {
    status: '',
    category: '',
    priority: '',
    search: ''
  },
  
  // Active users state
  activeUsers: [],
  
  // Auth actions
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setToken: (token) => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
    set({ token, isAuthenticated: !!token });
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false, tasks: [] });
  },
  
  // Task actions
  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((state) => ({ tasks: [task, ...state.tasks] })),
  updateTask: (id, updates) => set((state) => ({
    tasks: state.tasks.map(t => t.id === id ? { ...t, ...updates } : t)
  })),
  deleteTask: (id) => set((state) => ({
    tasks: state.tasks.filter(t => t.id !== id),
    selectedTask: state.selectedTask?.id === id ? null : state.selectedTask
  })),
  setSelectedTask: (task) => set({ selectedTask: task }),
  setCurrentDate: (date) => set({ currentDate: date }),
  setCategories: (categories) => set({ categories }),
  
  // Filter actions
  setFilter: (key, value) => set((state) => ({
    filters: { ...state.filters, [key]: value }
  })),
  resetFilters: () => set({
    filters: { status: '', category: '', priority: '', search: '' }
  }),
  
  // Get filtered tasks
  getFilteredTasks: () => {
    const { tasks, filters } = get();
    return tasks.filter(task => {
      if (filters.status && task.status !== filters.status) return false;
      if (filters.category && task.category !== filters.category) return false;
      if (filters.priority && task.priority !== filters.priority) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return task.text.toLowerCase().includes(searchLower) ||
               task.description?.toLowerCase().includes(searchLower);
      }
      return true;
    });
  },
  
  // Active users actions
  setActiveUsers: (users) => set({ activeUsers: users }),
  
  // UI actions
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error })
}));
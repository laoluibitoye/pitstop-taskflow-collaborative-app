import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { useAuth } from '../contexts/AuthContext';
import { taskAPI } from '../services/api';
import Header from '../components/layout/Header';
import DateSelector from '../components/tasks/DateSelector';
import TaskList from '../components/tasks/TaskList';
import TaskModal from '../components/tasks/TaskModal';
import TaskDetailModal from '../components/tasks/TaskDetailModal';
import FilterBar from '../components/tasks/FilterBar';
import ActiveUsers from '../components/layout/ActiveUsers';
import { format } from 'date-fns';

export default function Dashboard() {
  const { user } = useAuth();
  const { tasks, currentDate, setTasks, setCurrentDate, setCategories } = useStore();
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
    loadCategories();
  }, [currentDate]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const { data } = await taskAPI.getTasks({ date: currentDate });
      setTasks(data);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const { data } = await taskAPI.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  return (
    <div className="min-h-screen bg-bg-secondary">
      <Header onNewTask={() => setShowTaskModal(true)} />
      
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="flex-1">
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-1">
                Tasks for {format(new Date(currentDate), 'MMMM d, yyyy')}
              </h1>
              <p className="text-secondary">
                Collaborate with your team in real-time
              </p>
            </div>

            <DateSelector />
            <FilterBar />

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="spinner"></div>
              </div>
            ) : (
              <TaskList onTaskClick={() => setShowDetailModal(true)} />
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:w-80">
            <ActiveUsers />
          </div>
        </div>
      </div>

      {showTaskModal && (
        <TaskModal onClose={() => setShowTaskModal(false)} />
      )}

      {showDetailModal && (
        <TaskDetailModal onClose={() => setShowDetailModal(false)} />
      )}
    </div>
  );
}
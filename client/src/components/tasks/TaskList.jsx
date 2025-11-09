import { useStore } from '../../store/useStore';
import TaskCard from './TaskCard';

export default function TaskList({ onTaskClick }) {
  const { getFilteredTasks, setSelectedTask } = useStore();
  const tasks = getFilteredTasks();

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    onTaskClick();
  };

  if (tasks.length === 0) {
    return (
      <div className="card text-center py-12">
        <svg className="w-16 h-16 mx-auto text-text-tertiary mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
        <p className="text-secondary">Create a new task to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <TaskCard
          key={task._id}
          task={task}
          onClick={() => handleTaskClick(task)}
        />
      ))}
    </div>
  );
}
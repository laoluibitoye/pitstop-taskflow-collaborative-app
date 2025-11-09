import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { taskAPI } from '../../services/api';
import { format } from 'date-fns';
import ProgressBar from './ProgressBar';
import toast from 'react-hot-toast';

export default function TaskCard({ task, onClick }) {
  const { updateTask } = useStore();
  const [updating, setUpdating] = useState(false);

  const statusColors = {
    pending: 'badge-secondary',
    in_progress: 'badge-primary',
    completed: 'badge-success',
    overdue: 'badge-danger'
  };

  const priorityColors = {
    low: 'badge-secondary',
    medium: 'badge-warning',
    high: 'badge-danger'
  };

  const handleProgressChange = async (newProgress) => {
    if (updating) return;
    
    try {
      setUpdating(true);
      await taskAPI.updateProgress(task._id, newProgress);
      toast.success('Progress updated');
    } catch (error) {
      toast.error('Failed to update progress');
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await taskAPI.changeStatus(task._id, newStatus);
      toast.success('Status updated');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="card card-hover" onClick={onClick}>
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="text-lg font-semibold truncate">{task.text}</h3>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`badge ${priorityColors[task.priority]}`}>
                {task.priority}
              </span>
              <span className={`badge ${statusColors[task.status]}`}>
                {task.status.replace('_', ' ')}
              </span>
            </div>
          </div>

          {task.description && (
            <p className="text-secondary text-sm mb-3 line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="mb-3">
            <ProgressBar
              progress={task.progress}
              onChange={handleProgressChange}
              disabled={updating}
            />
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-secondary">
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>{task.createdBy?.name || 'Unknown'}</span>
            </div>

            {task.deadline && (
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{format(new Date(task.deadline), 'MMM d, h:mm a')}</span>
              </div>
            )}

            {task.category && (
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <span>{task.category}</span>
              </div>
            )}

            {task.comments?.length > 0 && (
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>{task.comments.length}</span>
              </div>
            )}

            {task.hasSubTasks && (
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <span>{task.subTasks?.filter(s => s.completed).length || 0}/{task.subTasks?.length || 0}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
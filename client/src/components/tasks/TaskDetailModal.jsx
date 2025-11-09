import { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { taskAPI, fileAPI } from '../../services/api';
import { format } from 'date-fns';
import ProgressBar from './ProgressBar';
import CommentSection from './CommentSection';
import SubTaskList from './SubTaskList';
import toast from 'react-hot-toast';

export default function TaskDetailModal({ onClose }) {
  const { selectedTask, updateTask, deleteTask } = useStore();
  const [task, setTask] = useState(selectedTask);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    if (selectedTask?._id) {
      loadTaskDetails();
    }
  }, [selectedTask?._id]);

  const loadTaskDetails = async () => {
    try {
      setLoading(true);
      const { data } = await taskAPI.getTask(selectedTask._id);
      setTask(data);
    } catch (error) {
      toast.error('Failed to load task details');
    } finally {
      setLoading(false);
    }
  };

  const handleProgressChange = async (progress) => {
    try {
      await taskAPI.updateProgress(task._id, progress);
      setTask({ ...task, progress });
      toast.success('Progress updated');
    } catch (error) {
      toast.error('Failed to update progress');
    }
  };

  const handleStatusChange = async (status) => {
    try {
      await taskAPI.changeStatus(task._id, status);
      setTask({ ...task, status });
      toast.success('Status updated');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await taskAPI.deleteTask(task._id);
      deleteTask(task._id);
      toast.success('Task deleted');
      onClose();
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const handleExtendDeadline = async () => {
    const hours = prompt('Extend deadline by how many hours?', '24');
    if (!hours) return;

    try {
      await taskAPI.extendDeadline(task._id, { hours: parseInt(hours) });
      toast.success('Deadline extended');
      loadTaskDetails();
    } catch (error) {
      toast.error('Failed to extend deadline');
    }
  };

  if (!task) return null;

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'secondary' },
    { value: 'in_progress', label: 'In Progress', color: 'primary' },
    { value: 'completed', label: 'Completed', color: 'success' },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: '800px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex-1">
            <h2 className="text-xl font-semibold mb-1">{task.text}</h2>
            <div className="flex items-center gap-2 text-sm text-secondary">
              <span>Created by {task.createdBy?.name}</span>
              <span>•</span>
              <span>{format(new Date(task.createdAt), 'MMM d, yyyy h:mm a')}</span>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-icon">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="border-b border-border-color">
          <div className="flex px-6">
            {['details', 'comments', 'subtasks'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition ${
                  activeTab === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-secondary hover:text-primary'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab === 'comments' && task.comments?.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-primary text-white text-xs rounded-full">
                    {task.comments.length}
                  </span>
                )}
                {tab === 'subtasks' && task.subTasks?.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-primary text-white text-xs rounded-full">
                    {task.subTasks.filter(s => s.completed).length}/{task.subTasks.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="spinner"></div>
            </div>
          ) : (
            <>
              {activeTab === 'details' && (
                <div className="space-y-6">
                  {task.description && (
                    <div>
                      <h4 className="font-medium mb-2">Description</h4>
                      <p className="text-secondary">{task.description}</p>
                    </div>
                  )}

                  <div>
                    <h4 className="font-medium mb-3">Progress</h4>
                    <ProgressBar
                      progress={task.progress}
                      onChange={handleProgressChange}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Status</label>
                      <div className="flex gap-2">
                        {statusOptions.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => handleStatusChange(opt.value)}
                            className={`btn btn-sm ${
                              task.status === opt.value ? 'btn-primary' : 'btn-secondary'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Priority</label>
                      <div className={`badge ${
                        task.priority === 'high' ? 'badge-danger' :
                        task.priority === 'medium' ? 'badge-warning' :
                        'badge-secondary'
                      }`}>
                        {task.priority}
                      </div>
                    </div>
                  </div>

                  {task.deadline && (
                    <div>
                      <h4 className="font-medium mb-2">Deadline</h4>
                      <div className="flex items-center gap-3">
                        <span className="text-secondary">
                          {format(new Date(task.deadline), 'MMMM d, yyyy h:mm a')}
                        </span>
                        <button
                          onClick={handleExtendDeadline}
                          className="btn btn-secondary btn-sm"
                        >
                          Extend
                        </button>
                      </div>
                      {task.timeExtensions > 0 && (
                        <p className="text-xs text-secondary mt-1">
                          Extended {task.timeExtensions} time(s)
                        </p>
                      )}
                    </div>
                  )}

                  {task.category && (
                    <div>
                      <h4 className="font-medium mb-2">Category</h4>
                      <span className="badge badge-primary">{task.category}</span>
                    </div>
                  )}

                  <div className="pt-4 border-t">
                    <button
                      onClick={handleDelete}
                      className="btn btn-danger btn-sm"
                    >
                      Delete Task
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'comments' && (
                <CommentSection task={task} onUpdate={loadTaskDetails} />
              )}

              {activeTab === 'subtasks' && (
                <SubTaskList task={task} onUpdate={loadTaskDetails} />
              )}
            </>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
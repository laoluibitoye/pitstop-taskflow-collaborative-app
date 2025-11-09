import { useState } from 'react';
import { taskAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function SubTaskList({ task, onUpdate }) {
  const [newSubTask, setNewSubTask] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleAddSubTask = async (e) => {
    e.preventDefault();
    if (!newSubTask.trim()) return;

    try {
      setSubmitting(true);
      await taskAPI.addSubTask(task._id, newSubTask);
      setNewSubTask('');
      toast.success('Sub-task added');
      onUpdate();
    } catch (error) {
      toast.error('Failed to add sub-task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleSubTask = async (subTaskId) => {
    try {
      await taskAPI.completeSubTask(task._id, subTaskId);
      toast.success('Sub-task updated');
      onUpdate();
    } catch (error) {
      toast.error('Failed to update sub-task');
    }
  };

  const completedCount = task.subTasks?.filter(s => s.completed).length || 0;
  const totalCount = task.subTasks?.length || 0;
  const completionPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 bg-bg-secondary rounded-lg">
        <div>
          <div className="text-2xl font-bold">{completedCount} / {totalCount}</div>
          <div className="text-sm text-secondary">Completed</div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">{completionPercent}%</div>
          <div className="text-sm text-secondary">Progress</div>
        </div>
      </div>

      <form onSubmit={handleAddSubTask} className="flex gap-2">
        <input
          type="text"
          className="input flex-1"
          placeholder="Add a sub-task..."
          value={newSubTask}
          onChange={(e) => setNewSubTask(e.target.value)}
          disabled={submitting}
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={submitting || !newSubTask.trim()}
        >
          Add
        </button>
      </form>

      <div className="space-y-2">
        {task.subTasks?.length === 0 ? (
          <p className="text-center text-secondary py-8">
            No sub-tasks yet. Add one to break down this task!
          </p>
        ) : (
          task.subTasks?.map((subTask) => (
            <div
              key={subTask._id}
              className="flex items-center gap-3 p-3 bg-bg-secondary rounded-lg hover:bg-bg-tertiary transition cursor-pointer"
              onClick={() => handleToggleSubTask(subTask._id)}
            >
              <div className="flex-shrink-0">
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                  subTask.completed
                    ? 'bg-success border-success'
                    : 'border-border-color'
                }`}>
                  {subTask.completed && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              <span className={`flex-1 ${subTask.completed ? 'line-through text-secondary' : ''}`}>
                {subTask.text}
              </span>
              {subTask.completed && (
                <span className="badge badge-success text-xs">Done</span>
              )}
            </div>
          ))
        )}
      </div>

      {totalCount > 0 && (
        <div className="p-3 bg-info/10 border border-info/20 rounded text-sm">
          <p className="text-secondary">
            💡 Click on any sub-task to toggle its completion status
          </p>
        </div>
      )}
    </div>
  );
}
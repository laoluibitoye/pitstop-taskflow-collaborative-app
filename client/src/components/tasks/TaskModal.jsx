import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { taskAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function TaskModal({ onClose }) {
  const { currentDate, categories } = useStore();
  const [formData, setFormData] = useState({
    text: '',
    description: '',
    priority: 'medium',
    category: '',
    deadline: '',
    date: currentDate
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.text.trim()) {
      toast.error('Task title is required');
      return;
    }

    try {
      setSubmitting(true);
      await taskAPI.createTask(formData);
      toast.success('Task created successfully');
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="text-xl font-semibold">Create New Task</h2>
          <button
            onClick={onClose}
            className="btn btn-secondary btn-icon"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Task Title *
              </label>
              <input
                type="text"
                name="text"
                className="input"
                placeholder="What needs to be done?"
                value={formData.text}
                onChange={handleChange}
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                Description
              </label>
              <textarea
                name="description"
                className="textarea"
                placeholder="Add more details..."
                value={formData.description}
                onChange={handleChange}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Priority
                </label>
                <select
                  name="priority"
                  className="select"
                  value={formData.priority}
                  onChange={handleChange}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Category
                </label>
                <select
                  name="category"
                  className="select"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="">None</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                Deadline (Optional)
              </label>
              <input
                type="datetime-local"
                name="deadline"
                className="input"
                value={formData.deadline}
                onChange={handleChange}
              />
            </div>

            <div className="p-3 bg-info/10 border border-info/20 rounded text-sm">
              <strong className="text-info">💡 Tip:</strong>
              <p className="text-secondary mt-1">
                All team members can see and interact with this task in real-time
              </p>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <div className="spinner"></div>
                  Creating...
                </>
              ) : (
                'Create Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
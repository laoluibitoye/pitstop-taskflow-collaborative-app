import { useState } from 'react';
import { taskAPI } from '../../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function CommentSection({ task, onUpdate }) {
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      setSubmitting(true);
      await taskAPI.addComment(task._id, comment);
      setComment('');
      toast.success('Comment added');
      onUpdate();
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!confirm('Delete this comment?')) return;

    try {
      await taskAPI.deleteComment(task._id, commentId);
      toast.success('Comment deleted');
      onUpdate();
    } catch (error) {
      toast.error('Failed to delete comment');
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          className="textarea"
          placeholder="Add a comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          disabled={submitting}
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={submitting || !comment.trim()}
        >
          {submitting ? 'Adding...' : 'Add Comment'}
        </button>
      </form>

      <div className="space-y-4">
        {task.comments?.length === 0 ? (
          <p className="text-center text-secondary py-8">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          task.comments?.map((comment) => (
            <div key={comment._id} className="p-4 bg-bg-secondary rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
                    {comment.user?.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{comment.user?.name}</div>
                    <div className="text-xs text-secondary">
                      {format(new Date(comment.createdAt), 'MMM d, h:mm a')}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(comment._id)}
                  className="btn btn-secondary btn-sm"
                  title="Delete comment"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <p className="text-secondary whitespace-pre-wrap">{comment.text}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
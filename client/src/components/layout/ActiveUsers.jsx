import { useStore } from '../../store/useStore';
import { formatDistanceToNow } from 'date-fns';

export default function ActiveUsers() {
  const { activeUsers } = useStore();

  return (
    <div className="card">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
        Active Users ({activeUsers.length})
      </h3>
      
      <div className="space-y-3">
        {activeUsers.length === 0 ? (
          <p className="text-secondary text-sm text-center py-4">
            No other users online
          </p>
        ) : (
          activeUsers.map((user) => (
            <div
              key={user.userId}
              className="flex items-center gap-3 p-2 rounded hover:bg-bg-secondary transition"
            >
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-medium">
                {user.name[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{user.name}</div>
                <div className="text-xs text-secondary">
                  {user.isGuest ? 'Guest' : user.role}
                </div>
              </div>
              <div className="w-2 h-2 bg-success rounded-full"></div>
            </div>
          ))
        )}
      </div>

      <div className="mt-6 p-3 bg-info/10 border border-info/20 rounded">
        <div className="flex items-start gap-2">
          <svg className="w-5 h-5 text-info flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="text-xs text-secondary">
            All users can see each other's changes in real-time through Socket.io
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function GuestLogin() {
  const [guestName, setGuestName] = useState('');
  const { loginAsGuest } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await loginAsGuest(guestName);
    if (result.success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-primary mb-2">Quick Access</h1>
          <p className="text-secondary">Enter as a guest to start collaborating</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Your Name</label>
            <input
              type="text"
              className="input"
              placeholder="e.g., Alex Smith"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              required
              autoFocus
              minLength={2}
            />
            <p className="text-xs text-secondary mt-1.5">
              Guest accounts can view and contribute to tasks
            </p>
          </div>

          <button type="submit" className="btn btn-primary btn-lg w-full mt-2">
            Continue as Guest
          </button>
        </form>

        <div className="mt-6 p-4 bg-info/10 border border-info/20 rounded text-sm">
          <strong className="text-info">💡 Guest Access:</strong>
          <ul className="mt-2 ml-4 space-y-1 text-secondary">
            <li>• No password required</li>
            <li>• Limited task creation (10 tasks)</li>
            <li>• Can convert to full account anytime</li>
          </ul>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-secondary">
            Want full access?{' '}
            <button
              onClick={() => navigate('/register')}
              className="text-primary font-medium hover:underline"
            >
              Create Account
            </button>
            {' or '}
            <button
              onClick={() => navigate('/login')}
              className="text-primary font-medium hover:underline"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
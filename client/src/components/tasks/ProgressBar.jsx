import { useState } from 'react';

export default function ProgressBar({ progress, onChange, disabled }) {
  const [isDragging, setIsDragging] = useState(false);
  const [localProgress, setLocalProgress] = useState(progress);

  const handleMouseDown = (e) => {
    if (disabled) return;
    setIsDragging(true);
    updateProgress(e);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || disabled) return;
    updateProgress(e);
  };

  const handleMouseUp = () => {
    if (!isDragging || disabled) return;
    setIsDragging(false);
    onChange(localProgress);
  };

  const updateProgress = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const newProgress = Math.round((x / rect.width) * 100);
    setLocalProgress(newProgress);
  };

  const handleIncrement = (amount) => {
    const newProgress = Math.max(0, Math.min(100, localProgress + amount));
    setLocalProgress(newProgress);
    onChange(newProgress);
  };

  const displayProgress = isDragging ? localProgress : progress;

  return (
    <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleIncrement(-10)}
            className="btn btn-secondary btn-sm"
            disabled={disabled || displayProgress === 0}
            title="Decrease 10%"
          >
            -10%
          </button>
          <button
            onClick={() => handleIncrement(10)}
            className="btn btn-secondary btn-sm"
            disabled={disabled || displayProgress === 100}
            title="Increase 10%"
          >
            +10%
          </button>
        </div>
        <span className="text-sm font-semibold">{displayProgress}%</span>
      </div>

      <div
        className="progress-container cursor-pointer relative"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ height: '12px' }}
      >
        <div
          className={`progress-bar ${displayProgress === 100 ? 'complete' : ''}`}
          style={{ width: `${displayProgress}%` }}
        >
          {isDragging && (
            <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-primary rounded-full shadow-lg"></div>
          )}
        </div>
      </div>

      <p className="text-xs text-secondary">
        Click and drag or use buttons to update progress
      </p>
    </div>
  );
}
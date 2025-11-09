import { useStore } from '../../store/useStore';
import { format, addDays, subDays } from 'date-fns';

export default function DateSelector() {
  const { currentDate, setCurrentDate } = useStore();

  const changeDate = (days) => {
    const newDate = addDays(new Date(currentDate), days);
    setCurrentDate(format(newDate, 'yyyy-MM-dd'));
  };

  const goToToday = () => {
    setCurrentDate(format(new Date(), 'yyyy-MM-dd'));
  };

  const isToday = currentDate === format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="card mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => changeDate(-1)}
            className="btn btn-secondary btn-icon"
            title="Previous day"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="text-center min-w-[200px]">
            <div className="text-lg font-semibold">
              {format(new Date(currentDate), 'EEEE')}
            </div>
            <div className="text-sm text-secondary">
              {format(new Date(currentDate), 'MMMM d, yyyy')}
            </div>
          </div>

          <button
            onClick={() => changeDate(1)}
            className="btn btn-secondary btn-icon"
            title="Next day"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {!isToday && (
          <button
            onClick={goToToday}
            className="btn btn-primary btn-sm"
          >
            Today
          </button>
        )}
      </div>
    </div>
  );
}
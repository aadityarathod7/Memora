import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Calendar, Loader2 } from 'lucide-react';
import { getCalendarData } from '../services/api';

const moodColors = {
  happy: '#22c55e',
  grateful: '#ec4899',
  calm: '#06b6d4',
  excited: '#f59e0b',
  hopeful: '#8b5cf6',
  tired: '#6b7280',
  anxious: '#3b82f6',
  sad: '#64748b',
  frustrated: '#ef4444',
  neutral: '#9ca3af'
};

const CalendarView = ({ onClose, onSelectEntry }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    fetchCalendarData();
  }, [year, month]);

  const fetchCalendarData = async () => {
    setLoading(true);
    try {
      const res = await getCalendarData(year, month + 1);
      setCalendarData(res.data.entries || {});
    } catch (err) {
      console.error('Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = () => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    // Add the days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const goToPrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(null);
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(null);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDay(null);
  };

  const days = getDaysInMonth();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const getEntriesForDay = (day) => {
    if (!day) return [];
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return calendarData[dateKey] || [];
  };

  const getDominantMood = (entries) => {
    if (!entries || entries.length === 0) return null;
    const moodCounts = {};
    entries.forEach(e => {
      moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
    });
    return Object.keys(moodCounts).reduce((a, b) => moodCounts[a] > moodCounts[b] ? a : b);
  };

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Calendar size={20} style={{ color: 'var(--gold-accent)' }} />
          <h2 className="font-serif text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Calendar</h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          style={{ color: 'var(--text-muted)' }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={goToPrevMonth}
          className="p-2 rounded-lg transition-colors"
          style={{ background: 'var(--bg-parchment)', color: 'var(--text-secondary)' }}
        >
          <ChevronLeft size={20} />
        </button>
        <div className="text-center">
          <h3 className="font-serif text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
            {monthName} {year}
          </h3>
          <button
            onClick={goToToday}
            className="text-xs font-serif mt-1"
            style={{ color: 'var(--app-accent)' }}
          >
            Today
          </button>
        </div>
        <button
          onClick={goToNextMonth}
          className="p-2 rounded-lg transition-colors"
          style={{ background: 'var(--bg-parchment)', color: 'var(--text-secondary)' }}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin" style={{ color: 'var(--app-accent)' }} />
        </div>
      ) : (
        <>
          {/* Week days header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-center text-xs font-serif font-medium py-2" style={{ color: 'var(--text-muted)' }}>
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              const entries = getEntriesForDay(day);
              const dominantMood = getDominantMood(entries);
              const isToday = day === new Date().getDate() &&
                             month === new Date().getMonth() &&
                             year === new Date().getFullYear();

              return (
                <div
                  key={index}
                  onClick={() => day && entries.length > 0 && setSelectedDay(day)}
                  className={`
                    aspect-square rounded-lg flex flex-col items-center justify-center text-sm font-serif relative
                    ${day ? 'cursor-pointer hover:shadow-md transition-all' : ''}
                    ${isToday ? 'ring-2' : ''}
                  `}
                  style={{
                    background: dominantMood ? `${moodColors[dominantMood]}20` : day ? 'var(--bg-parchment)' : 'transparent',
                    ringColor: 'var(--app-accent)',
                    color: 'var(--text-primary)'
                  }}
                >
                  {day && (
                    <>
                      <span className={isToday ? 'font-bold' : ''}>{day}</span>
                      {entries.length > 0 && (
                        <div
                          className="absolute bottom-1 w-2 h-2 rounded-full"
                          style={{ background: moodColors[dominantMood] || 'var(--app-accent)' }}
                        />
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Selected day entries */}
          {selectedDay && (
            <div className="mt-6 p-4 rounded-lg animate-fade-in-up" style={{ background: 'var(--bg-parchment)', border: '1px solid var(--border-light)' }}>
              <h4 className="font-serif font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
                {monthName} {selectedDay}, {year}
              </h4>
              <div className="space-y-2">
                {getEntriesForDay(selectedDay).map(entry => (
                  <button
                    key={entry._id}
                    onClick={() => onSelectEntry(entry)}
                    className="w-full text-left p-3 rounded-lg hover:shadow-md transition-all"
                    style={{ background: 'var(--bg-paper)', border: '1px solid var(--border-light)' }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ background: moodColors[entry.mood] || 'var(--app-accent)' }}
                      />
                      <span className="font-serif text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {entry.title}
                      </span>
                    </div>
                    <p className="text-xs line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                      {entry.content}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Mood legend */}
      <div className="mt-6 pt-4 border-t" style={{ borderColor: 'var(--border-light)' }}>
        <p className="text-xs font-serif mb-2" style={{ color: 'var(--text-muted)' }}>Mood colors</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(moodColors).slice(0, 6).map(([mood, color]) => (
            <div key={mood} className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full" style={{ background: color }} />
              <span className="text-xs capitalize" style={{ color: 'var(--text-secondary)' }}>{mood}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;

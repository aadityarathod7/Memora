import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Flame, Loader2 } from 'lucide-react';
import { getMoodHeatmap } from '../services/api';

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

const MoodHeatmap = ({ onClose }) => {
  // Default to 2026 to show existing entries (or use current year if in 2026+)
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear >= 2026 ? 2026 : currentYear);
  const [heatmapData, setHeatmapData] = useState({});
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [hoveredDay, setHoveredDay] = useState(null);

  useEffect(() => {
    fetchHeatmapData();
  }, [year]);

  const fetchHeatmapData = async () => {
    setLoading(true);
    try {
      const res = await getMoodHeatmap(year);
      setHeatmapData(res.data.heatmap || {});
      setStats(res.data.stats || {});
    } catch (err) {
      console.error('Failed to load heatmap data');
    } finally {
      setLoading(false);
    }
  };

  // Generate all days of the year
  const generateYearDays = () => {
    const days = [];
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }

    return days;
  };

  // Group days by week for GitHub-style layout
  const getWeeksData = () => {
    const days = generateYearDays();
    const weeks = [];
    let currentWeek = [];

    // Pad first week with empty days
    const firstDayOfYear = new Date(year, 0, 1).getDay();
    for (let i = 0; i < firstDayOfYear; i++) {
      currentWeek.push(null);
    }

    days.forEach(day => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });

    // Add remaining days
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }

    return weeks;
  };

  const getDayData = (date) => {
    if (!date) return null;
    const dateKey = date.toISOString().split('T')[0];
    return heatmapData[dateKey];
  };

  const weeks = getWeeksData();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Calculate month positions for labels
  const getMonthLabels = () => {
    const labels = [];
    let currentMonth = -1;

    weeks.forEach((week, weekIndex) => {
      week.forEach(day => {
        if (day && day.getMonth() !== currentMonth) {
          currentMonth = day.getMonth();
          labels.push({ month: months[currentMonth], weekIndex });
        }
      });
    });

    return labels;
  };

  const monthLabels = getMonthLabels();

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Flame size={20} style={{ color: 'var(--gold-accent)' }} />
          <h2 className="font-serif text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Mood Heatmap</h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 transition-colors rounded-lg hover:bg-gray-100"
          style={{ color: 'var(--text-muted)' }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Year navigation */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <button
          onClick={() => setYear(year - 1)}
          className="p-2 transition-colors rounded-lg"
          style={{ background: 'var(--bg-parchment)', color: 'var(--text-secondary)' }}
        >
          <ChevronLeft size={20} />
        </button>
        <span className="font-serif text-xl font-medium" style={{ color: 'var(--text-primary)' }}>
          {year}
        </span>
        <button
          onClick={() => setYear(year + 1)}
          disabled={year >= new Date().getFullYear()}
          className="p-2 transition-colors rounded-lg disabled:opacity-50"
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
          {/* Stats summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
            <div className="p-3 text-center rounded-lg" style={{ background: 'var(--bg-parchment)' }}>
              <div className="font-serif text-2xl font-bold" style={{ color: 'var(--app-accent)' }}>
                {stats.totalEntries || 0}
              </div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Entries</div>
            </div>
            <div className="p-3 text-center rounded-lg" style={{ background: 'var(--bg-parchment)' }}>
              <div className="font-serif text-2xl font-bold" style={{ color: 'var(--app-accent)' }}>
                {stats.activeDays || 0}
              </div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Active Days</div>
            </div>
            <div className="p-3 text-center rounded-lg" style={{ background: 'var(--bg-parchment)' }}>
              <div className="font-serif text-2xl font-bold capitalize" style={{ color: moodColors[stats.topMood] || 'var(--app-accent)' }}>
                {stats.topMood || '-'}
              </div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Top Mood</div>
            </div>
          </div>

          {/* Heatmap */}
          <div className="pb-4 overflow-x-auto scrollbar-thin">
            {/* Month labels */}
            <div className="flex mb-1 ml-8">
              {monthLabels.map(({ month, weekIndex }, i) => (
                <div
                  key={i}
                  className="text-xs"
                  style={{
                    color: 'var(--text-muted)',
                    marginLeft: i === 0 ? `${weekIndex * 14}px` : '0',
                    width: '40px'
                  }}
                >
                  {month}
                </div>
              ))}
            </div>

            <div className="flex">
              {/* Day labels */}
              <div className="flex flex-col gap-0.5 mr-2">
                {weekDays.map((day, i) => (
                  <div
                    key={i}
                    className="flex items-center h-3 text-xs"
                    style={{ color: 'var(--text-muted)', fontSize: '10px' }}
                  >
                    {i % 2 === 1 ? day.charAt(0) : ''}
                  </div>
                ))}
              </div>

              {/* Grid */}
              <div className="flex gap-0.5">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-0.5">
                    {week.map((day, dayIndex) => {
                      const dayData = getDayData(day);
                      const isToday = day && day.toDateString() === new Date().toDateString();

                      return (
                        <div
                          key={dayIndex}
                          className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm transition-all ${isToday ? 'ring-1 ring-offset-1' : ''}`}
                          style={{
                            background: dayData
                              ? moodColors[dayData.mood] || 'var(--app-accent)'
                              : day
                                ? 'var(--bg-parchment)'
                                : 'transparent',
                            opacity: dayData ? Math.min(0.4 + (dayData.count * 0.2), 1) : 1,
                            ringColor: 'var(--app-accent)',
                            cursor: dayData ? 'pointer' : 'default'
                          }}
                          onMouseEnter={() => dayData && setHoveredDay({ date: day, ...dayData })}
                          onMouseLeave={() => setHoveredDay(null)}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Hover tooltip */}
          {hoveredDay && (
            <div className="p-3 mt-4 rounded-lg animate-fade-in-up" style={{ background: 'var(--bg-parchment)', border: '1px solid var(--border-light)' }}>
              <div className="font-serif font-medium" style={{ color: 'var(--text-primary)' }}>
                {hoveredDay.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ background: moodColors[hoveredDay.mood] || 'var(--app-accent)' }}
                />
                <span className="text-sm capitalize" style={{ color: 'var(--text-secondary)' }}>
                  {hoveredDay.mood} - {hoveredDay.count} {hoveredDay.count === 1 ? 'entry' : 'entries'}
                </span>
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="pt-4 mt-6 border-t" style={{ borderColor: 'var(--border-light)' }}>
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Less</span>
              <div className="flex gap-1">
                <div className="w-3 h-3 rounded-sm" style={{ background: 'var(--bg-parchment)' }} />
                {[0.4, 0.6, 0.8, 1].map((opacity, i) => (
                  <div
                    key={i}
                    className="w-3 h-3 rounded-sm"
                    style={{ background: 'var(--app-accent)', opacity }}
                  />
                ))}
              </div>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>More</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MoodHeatmap;

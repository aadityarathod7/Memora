import { useState, useEffect } from 'react';
import { getMonthlySummary } from '../services/api';
import { Loader2, Calendar, TrendingUp, Award, Heart, Tag, BarChart3 } from 'lucide-react';

const MonthlySummaryPanel = ({ onClose }) => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  useEffect(() => {
    fetchSummary();
  }, [selectedMonth, selectedYear]);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await getMonthlySummary(selectedYear, selectedMonth);
      setSummary(res.data);
    } catch (err) {
      console.error('Failed to fetch monthly summary:', err);
    } finally {
      setLoading(false);
    }
  };

  const getMoodColor = (mood) => {
    const colors = {
      happy: '#FFD700',
      grateful: '#FF6B9D',
      calm: '#87CEEB',
      excited: '#FF8C00',
      hopeful: '#98D8C8',
      tired: '#B8B8B8',
      anxious: '#D8BFD8',
      sad: '#87CEEB',
      frustrated: '#FF6347',
      neutral: '#C0C0C0'
    };
    return colors[mood] || '#C0C0C0';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--app-accent)' }} />
      </div>
    );
  }

  if (!summary || !summary.summary) {
    return (
      <div className="text-center p-8">
        <Calendar size={48} className="mx-auto mb-4 opacity-30" style={{ color: 'var(--text-muted)' }} />
        <p className="font-serif text-lg mb-2" style={{ color: 'var(--text-secondary)' }}>
          No entries for {months[selectedMonth - 1]} {selectedYear}
        </p>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Start journaling to see your monthly insights!
        </p>
      </div>
    );
  }

  const { stats, period } = summary;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar size={20} style={{ color: 'var(--gold-accent)' }} />
          <h2 className="font-serif text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Monthly Summary
          </h2>
        </div>
        <button
          onClick={onClose}
          className="text-sm font-serif px-3 py-1 rounded-lg"
          style={{ color: 'var(--text-muted)', background: 'var(--bg-parchment)' }}
        >
          Close
        </button>
      </div>

      {/* Month/Year Selector */}
      <div className="flex gap-3">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
          className="flex-1 px-3 py-2 rounded-lg font-serif outline-none"
          style={{
            background: 'var(--bg-parchment)',
            border: '1px solid var(--border-light)',
            color: 'var(--text-primary)'
          }}
        >
          {months.map((month, idx) => (
            <option key={idx} value={idx + 1}>{month}</option>
          ))}
        </select>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          className="px-3 py-2 rounded-lg font-serif outline-none"
          style={{
            background: 'var(--bg-parchment)',
            border: '1px solid var(--border-light)',
            color: 'var(--text-primary)'
          }}
        >
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-xl" style={{ background: 'var(--bg-parchment)', border: '1px solid var(--border-light)' }}>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 size={16} style={{ color: 'var(--app-accent)' }} />
            <p className="text-xs font-serif" style={{ color: 'var(--text-muted)' }}>Total Entries</p>
          </div>
          <p className="text-2xl font-serif font-semibold" style={{ color: 'var(--text-primary)' }}>
            {stats.totalEntries}
          </p>
        </div>

        <div className="p-4 rounded-xl" style={{ background: 'var(--bg-parchment)', border: '1px solid var(--border-light)' }}>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={16} style={{ color: 'var(--app-accent)' }} />
            <p className="text-xs font-serif" style={{ color: 'var(--text-muted)' }}>Avg. Words</p>
          </div>
          <p className="text-2xl font-serif font-semibold" style={{ color: 'var(--text-primary)' }}>
            {stats.avgWords}
          </p>
        </div>

        <div className="p-4 rounded-xl" style={{ background: 'var(--bg-parchment)', border: '1px solid var(--border-light)' }}>
          <div className="flex items-center gap-2 mb-1">
            <Award size={16} style={{ color: 'var(--gold-accent)' }} />
            <p className="text-xs font-serif" style={{ color: 'var(--text-muted)' }}>Longest Streak</p>
          </div>
          <p className="text-2xl font-serif font-semibold" style={{ color: 'var(--text-primary)' }}>
            {stats.longestStreak} days
          </p>
        </div>

        <div className="p-4 rounded-xl" style={{ background: 'var(--bg-parchment)', border: '1px solid var(--border-light)' }}>
          <div className="flex items-center gap-2 mb-1">
            <Heart size={16} style={{ color: 'var(--app-accent)' }} />
            <p className="text-xs font-serif" style={{ color: 'var(--text-muted)' }}>Favorites</p>
          </div>
          <p className="text-2xl font-serif font-semibold" style={{ color: 'var(--text-primary)' }}>
            {stats.favoriteCount}
          </p>
        </div>
      </div>

      {/* Mood Distribution */}
      <div className="p-4 rounded-xl" style={{ background: 'var(--bg-parchment)', border: '1px solid var(--border-light)' }}>
        <h3 className="font-serif font-medium mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <BarChart3 size={16} />
          Mood Distribution
        </h3>
        <div className="space-y-2">
          {Object.entries(stats.moodDistribution)
            .sort((a, b) => b[1] - a[1])
            .map(([mood, count]) => {
              const percentage = Math.round((count / stats.totalEntries) * 100);
              return (
                <div key={mood}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-serif capitalize" style={{ color: 'var(--text-secondary)' }}>
                      {mood}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {count} ({percentage}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full" style={{ background: 'var(--bg-cream)' }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${percentage}%`,
                        background: getMoodColor(mood)
                      }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Top Tags */}
      {stats.topTags.length > 0 && (
        <div className="p-4 rounded-xl" style={{ background: 'var(--bg-parchment)', border: '1px solid var(--border-light)' }}>
          <h3 className="font-serif font-medium mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Tag size={16} />
            Top Themes
          </h3>
          <div className="flex flex-wrap gap-2">
            {stats.topTags.map(({ tag, count }) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full text-sm font-serif"
                style={{
                  background: 'var(--app-accent-light)',
                  color: 'var(--app-accent-dark)',
                  border: '1px solid var(--app-accent)'
                }}
              >
                {tag} ({count})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* AI Summary */}
      <div className="p-5 rounded-xl" style={{ background: 'var(--app-accent-light)', border: '1px solid var(--app-accent)' }}>
        <h3 className="font-serif font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--app-accent-dark)' }}>
          <Calendar size={18} />
          Memora's Insights
        </h3>
        <div className="prose prose-sm max-w-none" style={{ color: 'var(--text-primary)' }}>
          <p className="whitespace-pre-wrap leading-relaxed">{summary.summary}</p>
        </div>
      </div>
    </div>
  );
};

export default MonthlySummaryPanel;

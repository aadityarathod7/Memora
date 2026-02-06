import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { getWritingStats, getMoodAnalytics } from '../services/api';
import {
  TrendingUp,
  FileText,
  Type,
  Award,
  Flame,
  Calendar,
  Loader2
} from 'lucide-react';

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

const StatsPanel = ({ onClose }) => {
  const [stats, setStats] = useState(null);
  const [moodData, setMoodData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, moodRes] = await Promise.all([
        getWritingStats(),
        getMoodAnalytics(period)
      ]);
      setStats(statsRes.data);
      setMoodData(moodRes.data);
    } catch (err) {
      console.error('Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--app-accent)' }} />
      </div>
    );
  }

  const moodPieData = moodData?.moodCounts
    ? Object.entries(moodData.moodCounts).map(([mood, count]) => ({
        name: mood.charAt(0).toUpperCase() + mood.slice(1),
        value: count,
        color: moodColors[mood] || '#9ca3af'
      }))
    : [];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp size={20} style={{ color: 'var(--gold-accent)' }} />
          <h2 className="font-serif text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Your Journey Stats
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

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl" style={{ background: 'var(--bg-parchment)', border: '1px solid var(--border-light)' }}>
          <div className="flex items-center gap-2 mb-2">
            <FileText size={16} style={{ color: 'var(--app-accent)' }} />
            <span className="text-xs font-serif" style={{ color: 'var(--text-muted)' }}>Total Entries</span>
          </div>
          <p className="text-2xl font-serif font-semibold" style={{ color: 'var(--text-primary)' }}>
            {stats?.totalEntries || 0}
          </p>
        </div>

        <div className="p-4 rounded-xl" style={{ background: 'var(--bg-parchment)', border: '1px solid var(--border-light)' }}>
          <div className="flex items-center gap-2 mb-2">
            <Type size={16} style={{ color: 'var(--app-accent)' }} />
            <span className="text-xs font-serif" style={{ color: 'var(--text-muted)' }}>Total Words</span>
          </div>
          <p className="text-2xl font-serif font-semibold" style={{ color: 'var(--text-primary)' }}>
            {stats?.totalWords?.toLocaleString() || 0}
          </p>
        </div>

        <div className="p-4 rounded-xl" style={{ background: 'var(--bg-parchment)', border: '1px solid var(--border-light)' }}>
          <div className="flex items-center gap-2 mb-2">
            <Flame size={16} style={{ color: '#f59e0b' }} />
            <span className="text-xs font-serif" style={{ color: 'var(--text-muted)' }}>Current Streak</span>
          </div>
          <p className="text-2xl font-serif font-semibold" style={{ color: 'var(--text-primary)' }}>
            {stats?.streak?.current || 0} days
          </p>
        </div>

        <div className="p-4 rounded-xl" style={{ background: 'var(--bg-parchment)', border: '1px solid var(--border-light)' }}>
          <div className="flex items-center gap-2 mb-2">
            <Award size={16} style={{ color: 'var(--gold-accent)' }} />
            <span className="text-xs font-serif" style={{ color: 'var(--text-muted)' }}>Longest Streak</span>
          </div>
          <p className="text-2xl font-serif font-semibold" style={{ color: 'var(--text-primary)' }}>
            {stats?.streak?.longest || 0} days
          </p>
        </div>
      </div>

      {/* Period selector */}
      <div className="flex items-center gap-2">
        <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
        <span className="text-sm font-serif" style={{ color: 'var(--text-muted)' }}>Show:</span>
        {['week', 'month', 'year'].map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className="px-3 py-1 rounded-lg text-sm font-serif capitalize transition-all"
            style={{
              background: period === p ? 'var(--app-accent)' : 'var(--bg-parchment)',
              color: period === p ? 'white' : 'var(--text-secondary)'
            }}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Mood Distribution Pie Chart */}
        <div className="p-4 rounded-xl" style={{ background: 'var(--bg-parchment)', border: '1px solid var(--border-light)' }}>
          <h3 className="font-serif font-medium mb-4" style={{ color: 'var(--text-primary)' }}>
            Mood Distribution
          </h3>
          {moodPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={moodPieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {moodPieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center py-8 text-sm italic" style={{ color: 'var(--text-muted)' }}>
              No mood data for this period
            </p>
          )}
        </div>

        {/* Monthly Entries Bar Chart */}
        <div className="p-4 rounded-xl" style={{ background: 'var(--bg-parchment)', border: '1px solid var(--border-light)' }}>
          <h3 className="font-serif font-medium mb-4" style={{ color: 'var(--text-primary)' }}>
            Entries Over Time
          </h3>
          {stats?.monthlyStats?.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.monthlyStats}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="entries" fill="var(--app-accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center py-8 text-sm italic" style={{ color: 'var(--text-muted)' }}>
              No entries yet
            </p>
          )}
        </div>
      </div>

      {/* Longest Entry */}
      {stats?.longestEntry && (
        <div className="p-4 rounded-xl" style={{ background: 'var(--app-accent-light)', border: '1px solid var(--border-light)' }}>
          <h3 className="font-serif font-medium mb-2 flex items-center gap-2" style={{ color: 'var(--app-accent-dark)' }}>
            <Award size={16} />
            Your Longest Entry
          </h3>
          <p className="font-serif" style={{ color: 'var(--text-primary)' }}>
            "{stats.longestEntry.title}" - {stats.longestEntry.wordCount} words
          </p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {new Date(stats.longestEntry.date).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );
};

export default StatsPanel;

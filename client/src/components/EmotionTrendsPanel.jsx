import { useState, useEffect } from 'react';
import { getEmotionTrends } from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Loader2, TrendingUp, Smile, Activity, Info } from 'lucide-react';

const EmotionTrendsPanel = ({ onClose }) => {
  const [loading, setLoading] = useState(true);
  const [trendsData, setTrendsData] = useState(null);
  const [period, setPeriod] = useState('30');

  useEffect(() => {
    fetchTrends();
  }, [period]);

  const fetchTrends = async () => {
    setLoading(true);
    try {
      const res = await getEmotionTrends(period);
      setTrendsData(res.data);
    } catch (err) {
      console.error('Failed to fetch emotion trends:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getMoodEmoji = (mood) => {
    const emojis = {
      happy: '😊',
      grateful: '🙏',
      calm: '😌',
      excited: '🤩',
      hopeful: '🌟',
      tired: '😴',
      anxious: '😰',
      sad: '😢',
      frustrated: '😤',
      neutral: '😐'
    };
    return emojis[mood] || '😐';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--app-accent)' }} />
      </div>
    );
  }

  if (!trendsData || trendsData.trends.length === 0) {
    return (
      <div className="text-center p-8">
        <Activity size={48} className="mx-auto mb-4 opacity-30" style={{ color: 'var(--text-muted)' }} />
        <p className="font-serif text-lg mb-2" style={{ color: 'var(--text-secondary)' }}>
          Not enough data yet
        </p>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Keep journaling to see your emotional patterns!
        </p>
      </div>
    );
  }

  const { trends, insights } = trendsData;

  // Prepare chart data
  const chartData = trends.map(t => ({
    date: formatDate(t.date),
    fullDate: t.date,
    score: t.avgScore,
    entries: t.entryCount
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const trend = trends.find(t => t.date === data.fullDate);

      return (
        <div
          className="p-3 rounded-lg shadow-lg"
          style={{ background: 'var(--bg-paper)', border: '1px solid var(--border-light)' }}
        >
          <p className="font-serif font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
            {new Date(data.fullDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
          </p>
          <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
            Mood Score: <span className="font-semibold">{data.score}</span>
          </p>
          <div className="flex gap-1 text-lg">
            {Object.entries(trend.moods).map(([mood, count]) => (
              <span key={mood} title={`${mood}: ${count}`}>
                {getMoodEmoji(mood)}
              </span>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp size={20} style={{ color: 'var(--gold-accent)' }} />
          <h2 className="font-serif text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Emotion Trends
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

      {/* Period Selector */}
      <div className="flex gap-2">
        {['7', '30', '90'].map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className="px-4 py-2 rounded-lg font-serif text-sm transition-all"
            style={{
              background: period === p ? 'var(--app-accent)' : 'var(--bg-parchment)',
              color: period === p ? 'white' : 'var(--text-secondary)',
              border: `1px solid ${period === p ? 'var(--app-accent)' : 'var(--border-light)'}`
            }}
          >
            {p} days
          </button>
        ))}
      </div>

      {/* Insights Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 rounded-xl text-center" style={{ background: 'var(--bg-parchment)', border: '1px solid var(--border-light)' }}>
          <div className="text-3xl mb-2">{getMoodEmoji(insights.dominantMood)}</div>
          <p className="text-xs font-serif mb-1" style={{ color: 'var(--text-muted)' }}>Dominant Mood</p>
          <p className="font-serif font-medium capitalize" style={{ color: 'var(--text-primary)' }}>
            {insights.dominantMood}
          </p>
        </div>

        <div className="p-4 rounded-xl text-center" style={{ background: 'var(--bg-parchment)', border: '1px solid var(--border-light)' }}>
          <Smile size={32} className="mx-auto mb-2" style={{ color: 'var(--app-accent)' }} />
          <p className="text-xs font-serif mb-1" style={{ color: 'var(--text-muted)' }}>Positive Ratio</p>
          <p className="font-serif font-medium" style={{ color: 'var(--text-primary)' }}>
            {insights.positiveRatio}%
          </p>
        </div>

        <div className="p-4 rounded-xl text-center" style={{ background: 'var(--bg-parchment)', border: '1px solid var(--border-light)' }}>
          <Activity size={32} className="mx-auto mb-2" style={{ color: 'var(--app-accent)' }} />
          <p className="text-xs font-serif mb-1" style={{ color: 'var(--text-muted)' }}>Variability</p>
          <p className="font-serif font-medium" style={{ color: 'var(--text-primary)' }}>
            {insights.moodVariability}
          </p>
        </div>
      </div>

      {/* Info Card */}
      <div className="p-3 rounded-lg flex items-start gap-2" style={{ background: 'var(--app-accent-light)' }}>
        <Info size={16} className="mt-0.5" style={{ color: 'var(--app-accent)' }} />
        <p className="text-sm font-serif" style={{ color: 'var(--text-secondary)' }}>
          <strong>Mood Score</strong> ranges from -5 (very negative) to +5 (very positive).
          Higher variability indicates more emotional fluctuation.
        </p>
      </div>

      {/* Chart */}
      <div className="p-4 rounded-xl" style={{ background: 'var(--bg-parchment)', border: '1px solid var(--border-light)' }}>
        <h3 className="font-serif font-medium mb-4" style={{ color: 'var(--text-primary)' }}>
          Emotional Journey
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--app-accent)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--app-accent)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
            <XAxis
              dataKey="date"
              stroke="var(--text-muted)"
              style={{ fontSize: '12px', fontFamily: 'EB Garamond' }}
            />
            <YAxis
              stroke="var(--text-muted)"
              domain={[-5, 5]}
              style={{ fontSize: '12px', fontFamily: 'EB Garamond' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="score"
              stroke="var(--app-accent)"
              strokeWidth={2}
              fill="url(#colorScore)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Daily Breakdown */}
      <div className="p-4 rounded-xl max-h-64 overflow-y-auto" style={{ background: 'var(--bg-parchment)', border: '1px solid var(--border-light)' }}>
        <h3 className="font-serif font-medium mb-3 sticky top-0" style={{ color: 'var(--text-primary)', background: 'var(--bg-parchment)' }}>
          Daily Breakdown
        </h3>
        <div className="space-y-2">
          {trends.slice().reverse().map((trend) => (
            <div
              key={trend.date}
              className="flex items-center justify-between p-2 rounded-lg"
              style={{ background: 'var(--bg-paper)' }}
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-serif" style={{ color: 'var(--text-secondary)' }}>
                  {formatDate(trend.date)}
                </span>
                <div className="flex gap-1">
                  {Object.entries(trend.moods).map(([mood]) => (
                    <span key={mood} className="text-lg">{getMoodEmoji(mood)}</span>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold" style={{ color: trend.avgScore >= 0 ? 'var(--app-accent)' : 'var(--text-muted)' }}>
                  {trend.avgScore > 0 ? '+' : ''}{trend.avgScore}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {trend.entryCount} {trend.entryCount === 1 ? 'entry' : 'entries'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmotionTrendsPanel;

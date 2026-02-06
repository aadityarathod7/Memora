import { useState, useEffect } from 'react';
import { getWeeklySummary } from '../services/api';
import {
  Calendar,
  TrendingUp,
  FileText,
  Type,
  Loader2,
  Clock
} from 'lucide-react';

const moodConfig = {
  happy: { color: '#22c55e', label: 'Happy', emoji: '😊' },
  grateful: { color: '#ec4899', label: 'Grateful', emoji: '🙏' },
  calm: { color: '#06b6d4', label: 'Calm', emoji: '😌' },
  excited: { color: '#f59e0b', label: 'Excited', emoji: '🎉' },
  hopeful: { color: '#8b5cf6', label: 'Hopeful', emoji: '✨' },
  tired: { color: '#6b7280', label: 'Tired', emoji: '😴' },
  anxious: { color: '#3b82f6', label: 'Anxious', emoji: '😰' },
  sad: { color: '#64748b', label: 'Sad', emoji: '😢' },
  frustrated: { color: '#ef4444', label: 'Frustrated', emoji: '😤' },
  neutral: { color: '#9ca3af', label: 'Neutral', emoji: '😐' }
};

const WeeklySummaryPanel = ({ onClose, onSelectEntry }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await getWeeklySummary();
      setSummary(res.data);
    } catch (err) {
      console.error('Failed to fetch summary');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--app-accent)' }} />
      </div>
    );
  }

  const dominantMoodInfo = moodConfig[summary?.dominantMood] || moodConfig.neutral;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp size={20} style={{ color: 'var(--gold-accent)' }} />
          <h2 className="font-serif text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Weekly Summary
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
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-xl text-center" style={{ background: 'var(--bg-parchment)', border: '1px solid var(--border-light)' }}>
          <FileText size={24} className="mx-auto mb-2" style={{ color: 'var(--app-accent)' }} />
          <p className="text-2xl font-serif font-bold" style={{ color: 'var(--text-primary)' }}>
            {summary?.entriesCount || 0}
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Entries</p>
        </div>

        <div className="p-4 rounded-xl text-center" style={{ background: 'var(--bg-parchment)', border: '1px solid var(--border-light)' }}>
          <Type size={24} className="mx-auto mb-2" style={{ color: 'var(--app-accent)' }} />
          <p className="text-2xl font-serif font-bold" style={{ color: 'var(--text-primary)' }}>
            {summary?.totalWords?.toLocaleString() || 0}
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Words</p>
        </div>

        <div className="p-4 rounded-xl text-center" style={{ background: dominantMoodInfo.color + '15', border: `1px solid ${dominantMoodInfo.color}30` }}>
          <span className="text-2xl block mb-1">{dominantMoodInfo.emoji}</span>
          <p className="text-sm font-serif font-medium" style={{ color: dominantMoodInfo.color }}>
            {dominantMoodInfo.label}
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Top Mood</p>
        </div>
      </div>

      {/* Mood Breakdown */}
      {summary?.moodBreakdown && Object.keys(summary.moodBreakdown).length > 0 && (
        <div className="p-4 rounded-xl" style={{ background: 'var(--bg-parchment)', border: '1px solid var(--border-light)' }}>
          <h3 className="font-serif font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
            Mood Breakdown
          </h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(summary.moodBreakdown).map(([mood, count]) => (
              <span
                key={mood}
                className="px-3 py-1 rounded-full text-sm font-serif"
                style={{
                  background: moodConfig[mood]?.color + '20',
                  color: moodConfig[mood]?.color
                }}
              >
                {moodConfig[mood]?.emoji} {moodConfig[mood]?.label}: {count}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recent Entries */}
      {summary?.entries?.length > 0 ? (
        <div>
          <h3 className="font-serif font-medium mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Calendar size={16} style={{ color: 'var(--app-accent)' }} />
            This Week's Entries
          </h3>
          <div className="space-y-2 max-h-[40vh] overflow-y-auto">
            {summary.entries.map((entry) => (
              <button
                key={entry.id}
                onClick={() => {
                  onSelectEntry({ _id: entry.id, ...entry });
                  onClose();
                }}
                className="w-full text-left p-3 rounded-lg transition-all hover:shadow-md flex items-center gap-3"
                style={{
                  background: 'var(--bg-paper)',
                  border: '1px solid var(--border-light)'
                }}
              >
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: moodConfig[entry.mood]?.color || moodConfig.neutral.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-serif font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                    {entry.title}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {formatDate(entry.date)} · {entry.wordCount} words
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <Calendar size={48} className="mx-auto mb-4 opacity-30" style={{ color: 'var(--app-accent)' }} />
          <p className="font-serif italic" style={{ color: 'var(--text-muted)' }}>
            No entries this week yet. Start writing!
          </p>
        </div>
      )}
    </div>
  );
};

export default WeeklySummaryPanel;

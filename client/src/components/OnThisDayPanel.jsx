import { useState, useEffect } from 'react';
import { getOnThisDay } from '../services/api';
import {
  Calendar,
  Clock,
  Loader2,
  BookOpen
} from 'lucide-react';

const moodConfig = {
  happy: { color: '#22c55e', label: 'Happy' },
  grateful: { color: '#ec4899', label: 'Grateful' },
  calm: { color: '#06b6d4', label: 'Calm' },
  excited: { color: '#f59e0b', label: 'Excited' },
  hopeful: { color: '#8b5cf6', label: 'Hopeful' },
  tired: { color: '#6b7280', label: 'Tired' },
  anxious: { color: '#3b82f6', label: 'Anxious' },
  sad: { color: '#64748b', label: 'Sad' },
  frustrated: { color: '#ef4444', label: 'Frustrated' },
  neutral: { color: '#9ca3af', label: 'Neutral' }
};

const OnThisDayPanel = ({ onClose, onSelectEntry }) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOnThisDay();
  }, []);

  const fetchOnThisDay = async () => {
    try {
      const res = await getOnThisDay();
      setEntries(res.data);
    } catch (err) {
      console.error('Failed to fetch on this day');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getYearsAgo = (dateString) => {
    const then = new Date(dateString);
    const now = new Date();
    const years = now.getFullYear() - then.getFullYear();
    return years === 1 ? '1 year ago' : `${years} years ago`;
  };

  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--app-accent)' }} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar size={20} style={{ color: 'var(--gold-accent)' }} />
          <h2 className="font-serif text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            On This Day
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

      {/* Today's Date */}
      <div className="text-center p-4 rounded-xl" style={{ background: 'var(--app-accent-light)' }}>
        <p className="font-serif text-2xl font-semibold" style={{ color: 'var(--app-accent-dark)' }}>
          {today}
        </p>
        <p className="text-sm italic" style={{ color: 'var(--text-secondary)' }}>
          Looking back at your memories...
        </p>
      </div>

      {/* Entries */}
      {entries.length > 0 ? (
        <div className="space-y-4">
          {entries.map((entry) => (
            <button
              key={entry._id}
              onClick={() => {
                onSelectEntry(entry);
                onClose();
              }}
              className="w-full text-left p-5 rounded-xl transition-all hover:shadow-lg"
              style={{
                background: 'var(--bg-paper)',
                border: '1px solid var(--border-light)'
              }}
            >
              {/* Years ago badge */}
              <div className="flex items-center justify-between mb-3">
                <span
                  className="px-3 py-1 rounded-full text-sm font-serif font-medium"
                  style={{ background: 'var(--gold-accent)', color: 'white' }}
                >
                  {getYearsAgo(entry.createdAt)}
                </span>
                <span
                  className="px-2 py-0.5 rounded-full text-xs"
                  style={{
                    background: moodConfig[entry.mood]?.color + '20',
                    color: moodConfig[entry.mood]?.color
                  }}
                >
                  {moodConfig[entry.mood]?.label || 'Neutral'}
                </span>
              </div>

              <h3 className="font-serif text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                {entry.title}
              </h3>

              <p className="text-sm line-clamp-3 mb-3 handwritten" style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                {entry.content}
              </p>

              <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                <Clock size={12} />
                {formatDate(entry.createdAt)}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <BookOpen size={48} className="mx-auto mb-4 opacity-30" style={{ color: 'var(--app-accent)' }} />
          <p className="font-serif text-lg mb-2 italic" style={{ color: 'var(--text-primary)' }}>
            No memories from this day yet
          </p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Keep writing and you'll have memories to look back on!
          </p>
        </div>
      )}
    </div>
  );
};

export default OnThisDayPanel;

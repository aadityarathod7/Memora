import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Clock, Loader2, Pin, Star, MessageCircle, Tag } from 'lucide-react';
import { getTimeline } from '../services/api';

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

const TimelineView = ({ onClose, onSelectEntry }) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef();
  const lastEntryRef = useRef();

  useEffect(() => {
    fetchTimeline(1);
  }, []);

  const fetchTimeline = async (pageNum) => {
    if (pageNum === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const res = await getTimeline(pageNum, 15);
      const newEntries = res.data.entries || [];

      if (pageNum === 1) {
        setEntries(newEntries);
      } else {
        setEntries(prev => [...prev, ...newEntries]);
      }

      setHasMore(res.data.hasMore || false);
      setPage(pageNum);
    } catch (err) {
      console.error('Failed to load timeline');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Infinite scroll observer
  const handleObserver = useCallback((entries) => {
    const target = entries[0];
    if (target.isIntersecting && hasMore && !loadingMore) {
      fetchTimeline(page + 1);
    }
  }, [hasMore, loadingMore, page]);

  useEffect(() => {
    const option = {
      root: null,
      rootMargin: '100px',
      threshold: 0
    };

    observerRef.current = new IntersectionObserver(handleObserver, option);

    if (lastEntryRef.current) {
      observerRef.current.observe(lastEntryRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleObserver]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Group entries by date
  const groupedEntries = entries.reduce((groups, entry) => {
    const date = new Date(entry.createdAt).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(entry);
    return groups;
  }, {});

  // Separate pinned entries
  const pinnedEntries = entries.filter(e => e.isPinned);

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Clock size={20} style={{ color: 'var(--gold-accent)' }} />
          <h2 className="font-serif text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Timeline</h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          style={{ color: 'var(--text-muted)' }}
        >
          <X size={20} />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin" style={{ color: 'var(--app-accent)' }} />
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-12">
          <Clock size={48} className="mx-auto mb-4 opacity-30" style={{ color: 'var(--app-accent)' }} />
          <p className="font-serif text-lg" style={{ color: 'var(--text-secondary)' }}>No entries yet</p>
        </div>
      ) : (
        <div className="max-h-[80vh] sm:max-h-[60vh] overflow-y-auto pr-2">
          {/* Pinned entries section */}
          {pinnedEntries.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Pin size={14} style={{ color: 'var(--gold-accent)' }} />
                <span className="text-xs font-serif font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                  Pinned
                </span>
              </div>
              <div className="space-y-2">
                {pinnedEntries.map(entry => (
                  <button
                    key={`pinned-${entry._id}`}
                    onClick={() => onSelectEntry(entry)}
                    className="w-full text-left p-3 rounded-lg hover:shadow-md transition-all"
                    style={{ background: 'var(--bg-parchment)', border: '2px solid var(--gold-accent)' }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ background: moodColors[entry.mood] || 'var(--app-accent)' }}
                      />
                      <span className="font-serif text-sm font-medium flex-1" style={{ color: 'var(--text-primary)' }}>
                        {entry.title}
                      </span>
                      <Pin size={12} style={{ color: 'var(--gold-accent)' }} />
                    </div>
                    <p className="text-xs line-clamp-2 mb-2" style={{ color: 'var(--text-secondary)' }}>
                      {entry.content}
                    </p>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {formatDate(entry.createdAt)}
                    </div>
                  </button>
                ))}
              </div>
              <div className="my-4 border-b" style={{ borderColor: 'var(--border-light)' }} />
            </div>
          )}

          {/* Timeline */}
          <div className="relative">
            {/* Vertical line */}
            <div
              className="absolute left-4 top-0 bottom-0 w-0.5"
              style={{ background: 'var(--border-light)' }}
            />

            {Object.entries(groupedEntries).map(([date, dayEntries], groupIndex) => (
              <div key={date} className="mb-6">
                {/* Date header */}
                <div className="flex items-center gap-3 mb-3 relative">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center z-10"
                    style={{ background: 'var(--bg-paper)', border: '2px solid var(--app-accent)' }}
                  >
                    <Clock size={14} style={{ color: 'var(--app-accent)' }} />
                  </div>
                  <span className="font-serif font-medium" style={{ color: 'var(--text-primary)' }}>
                    {formatDate(dayEntries[0].createdAt)}
                  </span>
                </div>

                {/* Day's entries */}
                <div className="pl-12 space-y-3">
                  {dayEntries.filter(e => !e.isPinned).map((entry, entryIndex) => {
                    const isLast = groupIndex === Object.keys(groupedEntries).length - 1 &&
                                   entryIndex === dayEntries.filter(e => !e.isPinned).length - 1;

                    return (
                      <button
                        key={entry._id}
                        ref={isLast ? lastEntryRef : null}
                        onClick={() => onSelectEntry(entry)}
                        className="w-full text-left p-4 rounded-lg hover:shadow-md transition-all relative"
                        style={{ background: 'var(--bg-parchment)', border: '1px solid var(--border-light)' }}
                      >
                        {/* Timeline connector dot */}
                        <div
                          className="absolute -left-8 top-4 w-2 h-2 rounded-full"
                          style={{ background: moodColors[entry.mood] || 'var(--app-accent)' }}
                        />

                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ background: moodColors[entry.mood] || 'var(--app-accent)' }}
                          />
                          <span className="font-serif text-sm font-medium flex-1" style={{ color: 'var(--text-primary)' }}>
                            {entry.title}
                          </span>
                          <div className="flex items-center gap-1">
                            {entry.isFavorite && (
                              <Star size={12} fill="var(--gold-accent)" style={{ color: 'var(--gold-accent)' }} />
                            )}
                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                              {formatTime(entry.createdAt)}
                            </span>
                          </div>
                        </div>

                        <p className="text-sm line-clamp-3 mb-2" style={{ color: 'var(--text-secondary)' }}>
                          {entry.content}
                        </p>

                        <div className="flex items-center gap-3">
                          {entry.tags?.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Tag size={12} style={{ color: 'var(--text-muted)' }} />
                              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                {entry.tags.length}
                              </span>
                            </div>
                          )}
                          {entry.conversation?.length > 0 && (
                            <div className="flex items-center gap-1">
                              <MessageCircle size={12} style={{ color: 'var(--app-accent)' }} />
                              <span className="text-xs" style={{ color: 'var(--app-accent)' }}>
                                {Math.floor(entry.conversation.length / 2) + 1}
                              </span>
                            </div>
                          )}
                          {entry.wordCount && (
                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                              {entry.wordCount} words
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Loading more indicator */}
            {loadingMore && (
              <div className="flex items-center justify-center py-4">
                <Loader2 size={20} className="animate-spin" style={{ color: 'var(--app-accent)' }} />
              </div>
            )}

            {/* End of timeline */}
            {!hasMore && entries.length > 0 && (
              <div className="text-center py-4">
                <span className="text-xs font-serif italic" style={{ color: 'var(--text-muted)' }}>
                  Beginning of your journey
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimelineView;

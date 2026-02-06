import { useState, useEffect, useRef } from 'react';
import { searchEntries } from '../services/api';
import {
  Search,
  X,
  Clock,
  Loader2,
  FileText
} from 'lucide-react';

const moodConfig = {
  happy: { color: '#22c55e' },
  grateful: { color: '#ec4899' },
  calm: { color: '#06b6d4' },
  excited: { color: '#f59e0b' },
  hopeful: { color: '#8b5cf6' },
  tired: { color: '#6b7280' },
  anxious: { color: '#3b82f6' },
  sad: { color: '#64748b' },
  frustrated: { color: '#ef4444' },
  neutral: { color: '#9ca3af' }
};

const SearchPanel = ({ onClose, onSelectEntry }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.trim().length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await searchEntries(query);
        setResults(res.data);
        setSearched(true);
      } catch (err) {
        console.error('Search failed');
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const highlightMatch = (text, query) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-200 rounded px-0.5">{part}</mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="space-y-4 animate-fade-in-up">
      {/* Search Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Search size={20} style={{ color: 'var(--gold-accent)' }} />
          <h2 className="font-serif text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Search Entries
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

      {/* Search Input */}
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your memories..."
          className="w-full pl-11 pr-10 py-3 rounded-xl outline-none transition-all"
          style={{
            background: 'var(--bg-parchment)',
            border: '2px solid var(--border-light)',
            color: 'var(--text-primary)',
            fontFamily: "'EB Garamond', Georgia, serif"
          }}
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--text-muted)' }}
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Results */}
      <div className="space-y-2 max-h-[60vh] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={24} className="animate-spin" style={{ color: 'var(--app-accent)' }} />
          </div>
        ) : results.length > 0 ? (
          <>
            <p className="text-sm font-serif mb-3" style={{ color: 'var(--text-muted)' }}>
              Found {results.length} {results.length === 1 ? 'entry' : 'entries'}
            </p>
            {results.map((entry) => (
              <button
                key={entry._id}
                onClick={() => {
                  onSelectEntry(entry);
                  onClose();
                }}
                className="w-full text-left p-4 rounded-xl transition-all hover:shadow-md"
                style={{
                  background: 'var(--bg-paper)',
                  border: '1px solid var(--border-light)'
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: moodConfig[entry.mood]?.color || moodConfig.neutral.color }}
                  />
                  <span className="font-serif font-medium" style={{ color: 'var(--text-primary)' }}>
                    {highlightMatch(entry.title, query)}
                  </span>
                </div>
                <p className="text-sm line-clamp-2 mb-2" style={{ color: 'var(--text-secondary)' }}>
                  {highlightMatch(entry.content.substring(0, 150), query)}...
                </p>
                <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {formatDate(entry.createdAt)}
                  </span>
                  {entry.tags?.length > 0 && (
                    <span>{entry.tags.slice(0, 2).join(', ')}</span>
                  )}
                </div>
              </button>
            ))}
          </>
        ) : searched && query.trim().length >= 2 ? (
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto mb-4 opacity-30" style={{ color: 'var(--app-accent)' }} />
            <p className="font-serif text-lg italic" style={{ color: 'var(--text-primary)' }}>No entries found</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Try different keywords</p>
          </div>
        ) : (
          <div className="text-center py-12">
            <Search size={48} className="mx-auto mb-4 opacity-30" style={{ color: 'var(--app-accent)' }} />
            <p className="font-serif italic" style={{ color: 'var(--text-muted)' }}>
              Type at least 2 characters to search
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPanel;

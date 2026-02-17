import { useState, useEffect } from 'react';
import { searchEntries, getCustomTags } from '../services/api';
import {
  Search,
  X,
  Clock,
  Loader2,
  FileText,
  Filter,
  Calendar,
  Smile,
  Tag,
  Heart,
  ChevronDown,
  SortAsc
} from 'lucide-react';

const moodConfig = {
  happy: { label: 'Happy', color: '#22c55e', emoji: '😊' },
  grateful: { label: 'Grateful', color: '#ec4899', emoji: '🙏' },
  calm: { label: 'Calm', color: '#06b6d4', emoji: '😌' },
  excited: { label: 'Excited', color: '#f59e0b', emoji: '🤩' },
  hopeful: { label: 'Hopeful', color: '#8b5cf6', emoji: '🌟' },
  tired: { label: 'Tired', color: '#6b7280', emoji: '😴' },
  anxious: { label: 'Anxious', color: '#3b82f6', emoji: '😰' },
  sad: { label: 'Sad', color: '#64748b', emoji: '😢' },
  frustrated: { label: 'Frustrated', color: '#ef4444', emoji: '😤' },
  neutral: { label: 'Neutral', color: '#9ca3af', emoji: '😐' }
};

const AdvancedSearchPanel = ({ onClose, onSelectEntry }) => {
  const [filters, setFilters] = useState({
    q: '',
    startDate: '',
    endDate: '',
    moods: [],
    tags: [],
    favorites: false,
    minWords: '',
    maxWords: '',
    sortBy: 'newest'
  });

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [availableTags, setAvailableTags] = useState([]);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const res = await getCustomTags();
      setAvailableTags(res.data.customTags || []);
    } catch (err) {
      console.error('Failed to fetch tags');
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    setSearched(true);
    try {
      const res = await searchEntries(filters);
      setResults(res.data);
    } catch (err) {
      console.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searched) {
      const debounce = setTimeout(() => {
        handleSearch();
      }, 300);
      return () => clearTimeout(debounce);
    }
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleArrayFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(v => v !== value)
        : [...prev[key], value]
    }));
  };

  const clearFilters = () => {
    setFilters({
      q: '',
      startDate: '',
      endDate: '',
      moods: [],
      tags: [],
      favorites: false,
      minWords: '',
      maxWords: '',
      sortBy: 'newest'
    });
    setSearched(false);
    setResults([]);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.startDate || filters.endDate) count++;
    if (filters.moods.length > 0) count++;
    if (filters.tags.length > 0) count++;
    if (filters.favorites) count++;
    if (filters.minWords || filters.maxWords) count++;
    return count;
  };

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
        <mark key={i} style={{ background: 'var(--gold-accent)', borderRadius: '2px', padding: '0 2px' }}>{part}</mark>
      ) : (
        part
      )
    );
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className="space-y-4 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Search size={20} style={{ color: 'var(--gold-accent)' }} />
          <h2 className="font-serif text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Advanced Search
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
          type="text"
          value={filters.q}
          onChange={(e) => handleFilterChange('q', e.target.value)}
          placeholder="Search your memories..."
          className="w-full pl-11 pr-10 py-3 rounded-xl outline-none transition-all"
          style={{
            background: 'var(--bg-parchment)',
            border: '2px solid var(--border-light)',
            color: 'var(--text-primary)',
            fontFamily: "'EB Garamond', Georgia, serif"
          }}
        />
        {filters.q && (
          <button
            onClick={() => handleFilterChange('q', '')}
            className="absolute right-4 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--text-muted)' }}
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Filter Toggle & Search Button */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-serif text-sm transition-all"
          style={{
            background: showFilters ? 'var(--app-accent)' : 'var(--bg-parchment)',
            color: showFilters ? 'white' : 'var(--text-secondary)',
            border: `1px solid ${showFilters ? 'var(--app-accent)' : 'var(--border-light)'}`
          }}
        >
          <Filter size={16} />
          Filters
          {activeFilterCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-xs" style={{ background: 'white', color: 'var(--app-accent)' }}>
              {activeFilterCount}
            </span>
          )}
        </button>

        <button
          onClick={() => { handleSearch(); setSearched(true); }}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-serif text-sm"
          style={{ background: 'var(--app-accent)', color: 'white' }}
        >
          <Search size={16} />
          Search
        </button>

        {(searched || activeFilterCount > 0) && (
          <button
            onClick={clearFilters}
            className="px-4 py-2 rounded-lg font-serif text-sm"
            style={{ color: 'var(--text-muted)', border: '1px solid var(--border-light)' }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="p-4 rounded-xl space-y-4" style={{ background: 'var(--bg-parchment)', border: '1px solid var(--border-light)' }}>
          {/* Date Range */}
          <div>
            <label className="flex items-center gap-2 font-serif font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              <Calendar size={16} />
              Date Range
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="px-3 py-2 rounded-lg outline-none"
                style={{ background: 'var(--bg-paper)', border: '1px solid var(--border-light)', color: 'var(--text-primary)' }}
              />
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="px-3 py-2 rounded-lg outline-none"
                style={{ background: 'var(--bg-paper)', border: '1px solid var(--border-light)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>

          {/* Moods */}
          <div>
            <label className="flex items-center gap-2 font-serif font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              <Smile size={16} />
              Moods
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(moodConfig).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => toggleArrayFilter('moods', key)}
                  className="px-3 py-1.5 rounded-full text-sm font-serif transition-all flex items-center gap-1"
                  style={{
                    background: filters.moods.includes(key) ? config.color : 'var(--bg-paper)',
                    color: filters.moods.includes(key) ? 'white' : 'var(--text-secondary)',
                    border: `1px solid ${filters.moods.includes(key) ? config.color : 'var(--border-light)'}`
                  }}
                >
                  <span>{config.emoji}</span>
                  {config.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          {availableTags.length > 0 && (
            <div>
              <label className="flex items-center gap-2 font-serif font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                <Tag size={16} />
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleArrayFilter('tags', tag)}
                    className="px-3 py-1.5 rounded-full text-sm font-serif transition-all"
                    style={{
                      background: filters.tags.includes(tag) ? 'var(--app-accent)' : 'var(--bg-paper)',
                      color: filters.tags.includes(tag) ? 'white' : 'var(--text-secondary)',
                      border: `1px solid ${filters.tags.includes(tag) ? 'var(--app-accent)' : 'var(--border-light)'}`
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Favorites & Sort */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleFilterChange('favorites', !filters.favorites)}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-serif text-sm transition-all"
              style={{
                background: filters.favorites ? 'var(--app-accent)' : 'var(--bg-paper)',
                color: filters.favorites ? 'white' : 'var(--text-secondary)',
                border: `1px solid ${filters.favorites ? 'var(--app-accent)' : 'var(--border-light)'}`
              }}
            >
              <Heart size={16} fill={filters.favorites ? 'white' : 'none'} />
              Favorites Only
            </button>

            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="px-4 py-2 rounded-lg font-serif text-sm outline-none"
              style={{ background: 'var(--bg-paper)', border: '1px solid var(--border-light)', color: 'var(--text-primary)' }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="wordcount-high">Most Words</option>
              <option value="wordcount-low">Least Words</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="space-y-2 max-h-[50vh] overflow-y-auto">
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
                  <span className="font-serif font-medium flex-1" style={{ color: 'var(--text-primary)' }}>
                    {highlightMatch(entry.title, filters.q)}
                  </span>
                  {entry.isFavorite && <Heart size={14} fill="var(--app-accent)" style={{ color: 'var(--app-accent)' }} />}
                </div>
                <p className="text-sm line-clamp-2 mb-2" style={{ color: 'var(--text-secondary)' }}>
                  {highlightMatch(entry.content.substring(0, 150), filters.q)}...
                </p>
                <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {formatDate(entry.createdAt)}
                  </span>
                  {entry.wordCount && (
                    <span>{entry.wordCount} words</span>
                  )}
                  {entry.tags?.length > 0 && (
                    <span>{entry.tags.slice(0, 2).join(', ')}</span>
                  )}
                </div>
              </button>
            ))}
          </>
        ) : searched ? (
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto mb-4 opacity-30" style={{ color: 'var(--app-accent)' }} />
            <p className="font-serif text-lg italic" style={{ color: 'var(--text-primary)' }}>No entries found</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Try adjusting your filters</p>
          </div>
        ) : (
          <div className="text-center py-12">
            <Search size={48} className="mx-auto mb-4 opacity-30" style={{ color: 'var(--app-accent)' }} />
            <p className="font-serif italic" style={{ color: 'var(--text-muted)' }}>
              Click "Search" to find entries
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedSearchPanel;

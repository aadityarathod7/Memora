import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getEntries, createEntry, deleteEntry, replyToEntry } from '../services/api';
import {
  BookOpen,
  PenLine,
  Plus,
  Send,
  Trash2,
  LogOut,
  MessageCircle,
  Loader2,
  Clock,
  Smile,
  Heart,
  Sun,
  Zap,
  Star,
  Moon,
  CloudRain,
  Frown,
  Meh,
  User,
  Bot,
  Feather,
  BookMarked,
  Calendar,
  Filter,
  X,
  ChevronDown
} from 'lucide-react';

// Month names for filter
const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Mood configuration with icons
const moodConfig = {
  happy: { icon: Smile, label: 'Happy', color: '#22c55e' },
  grateful: { icon: Heart, label: 'Grateful', color: '#ec4899' },
  calm: { icon: Sun, label: 'Calm', color: '#06b6d4' },
  excited: { icon: Zap, label: 'Excited', color: '#f59e0b' },
  hopeful: { icon: Star, label: 'Hopeful', color: '#8b5cf6' },
  tired: { icon: Moon, label: 'Tired', color: '#6b7280' },
  anxious: { icon: CloudRain, label: 'Anxious', color: '#3b82f6' },
  sad: { icon: Frown, label: 'Sad', color: '#64748b' },
  frustrated: { icon: Frown, label: 'Frustrated', color: '#ef4444' },
  neutral: { icon: Meh, label: 'Neutral', color: '#9ca3af' }
};

const Journal = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const replyInputRef = useRef(null);

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [replying, setReplying] = useState(false);
  const [fetchingEntries, setFetchingEntries] = useState(true);
  const [showWriting, setShowWriting] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);

  // Journal form state
  const [journalContent, setJournalContent] = useState('');
  const [feeling, setFeeling] = useState('');

  // Reply state
  const [replyMessage, setReplyMessage] = useState('');

  // Filter state
  const [filterYear, setFilterYear] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Page turn animation state
  const [isPageTurning, setIsPageTurning] = useState(false);
  const [pageAnimation, setPageAnimation] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchEntries();
  }, [user, navigate]);

  const fetchEntries = async () => {
    try {
      const response = await getEntries();
      setEntries(response.data);
    } catch (err) {
      console.error('Failed to load entries');
    } finally {
      setFetchingEntries(false);
    }
  };

  const handleSaveEntry = async (e) => {
    e.preventDefault();
    if (!journalContent.trim()) return;

    setLoading(true);

    try {
      const today = new Date();
      const title = today.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      });

      const response = await createEntry({
        title,
        content: journalContent,
        mood: feeling || 'neutral'
      });

      const newEntry = response.data;
      setEntries([newEntry, ...entries]);
      setSelectedEntry(newEntry);
      setJournalContent('');
      setFeeling('');
      setShowWriting(false);
    } catch (err) {
      console.error('Failed to save entry');
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim() || !selectedEntry) return;

    setReplying(true);

    try {
      const response = await replyToEntry(selectedEntry._id, replyMessage);

      const updatedEntry = {
        ...selectedEntry,
        conversation: response.data.conversation
      };

      setSelectedEntry(updatedEntry);
      setEntries(entries.map(e =>
        e._id === selectedEntry._id ? updatedEntry : e
      ));

      setReplyMessage('');
    } catch (err) {
      console.error('Failed to send reply');
    } finally {
      setReplying(false);
    }
  };

  const handleDeleteEntry = async (id) => {
    try {
      await deleteEntry(id);
      setEntries(entries.filter(entry => entry._id !== id));
      if (selectedEntry?._id === id) {
        setSelectedEntry(null);
      }
    } catch (err) {
      console.error('Failed to delete entry');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMoodIcon = (mood) => {
    const config = moodConfig[mood] || moodConfig.neutral;
    const IconComponent = config.icon;
    return <IconComponent size={18} style={{ color: config.color }} />;
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Get unique years from entries
  const getAvailableYears = () => {
    const years = new Set();
    entries.forEach(entry => {
      const year = new Date(entry.createdAt).getFullYear();
      years.add(year);
    });
    return Array.from(years).sort((a, b) => b - a);
  };

  // Get unique months for selected year
  const getAvailableMonths = () => {
    if (!filterYear) return [];
    const months = new Set();
    entries.forEach(entry => {
      const date = new Date(entry.createdAt);
      if (date.getFullYear() === parseInt(filterYear)) {
        months.add(date.getMonth());
      }
    });
    return Array.from(months).sort((a, b) => a - b);
  };

  // Filter entries based on selected filters
  const getFilteredEntries = () => {
    return entries.filter(entry => {
      const entryDate = new Date(entry.createdAt);

      if (filterYear && entryDate.getFullYear() !== parseInt(filterYear)) {
        return false;
      }

      if (filterMonth !== '' && entryDate.getMonth() !== parseInt(filterMonth)) {
        return false;
      }

      return true;
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setFilterYear('');
    setFilterMonth('');
  };

  const filteredEntries = getFilteredEntries();
  const hasActiveFilters = filterYear || filterMonth !== '';

  // Handle page turn animation - 3D flip out then flip in with new content
  const handlePageTurn = (callback) => {
    setIsPageTurning(true);

    // Step 1: Flip OUT animation (current page rotates away)
    setPageAnimation('animate-page-flip-out');

    // Step 2: At end of flip-out, change content and start flip-in
    setTimeout(() => {
      // Change to new content
      callback();

      // Step 3: Flip IN animation (new content visible during rotation)
      setPageAnimation('animate-page-flip-in');

      // Step 4: Reset after flip-in completes
      setTimeout(() => {
        setIsPageTurning(false);
        setPageAnimation('');
      }, 450);
    }, 300); // Flip-out duration
  };

  // Wrapper for selecting entry with animation
  const handleSelectEntry = (entry) => {
    if (selectedEntry?._id === entry._id) return;

    handlePageTurn(() => {
      setSelectedEntry(entry);
      setShowWriting(false);
    });
  };

  // Wrapper for showing write form with animation
  const handleShowWriting = () => {
    handlePageTurn(() => {
      setShowWriting(true);
      setSelectedEntry(null);
    });
  };

  // Wrapper for canceling write with animation
  const handleCancelWriting = () => {
    handlePageTurn(() => {
      setShowWriting(false);
    });
  };

  if (fetchingEntries) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-cream)' }}>
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center animate-float" style={{ background: 'var(--app-accent-light)' }}>
            <BookOpen size={36} style={{ color: 'var(--app-accent)' }} />
          </div>
          <div className="flex items-center justify-center gap-3" style={{ color: 'var(--app-accent)' }}>
            <Loader2 size={20} className="animate-spin" />
            <span className="font-serif text-xl italic">Opening your journal...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-cream)' }}>
      {/* Book-style Header */}
      <header className="sticky top-0 z-20 backdrop-blur-md border-b" style={{ background: 'rgba(245, 241, 232, 0.95)', borderColor: 'var(--border-light)' }}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo with book styling */}
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity group">
              <div className="w-11 h-11 rounded-lg flex items-center justify-center shadow-md transition-transform group-hover:scale-105" style={{ background: 'linear-gradient(135deg, var(--book-spine) 0%, var(--app-accent-dark) 100%)' }}>
                <BookMarked size={22} className="text-white" />
              </div>
              <div>
                <h1 className="font-serif text-xl font-semibold tracking-wide" style={{ color: 'var(--text-primary)' }}>Memora</h1>
                <p className="text-xs italic" style={{ color: 'var(--text-muted)' }}>Where memories talk back</p>
              </div>
            </Link>

            {/* User section */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full shadow-sm" style={{ background: 'var(--bg-paper)', border: '1px solid var(--border-light)' }}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-inner" style={{ background: 'linear-gradient(135deg, var(--app-accent) 0%, var(--app-accent-dark) 100%)' }}>
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{user?.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:shadow-md"
                style={{ color: 'var(--text-secondary)', background: 'var(--bg-paper)' }}
              >
                <LogOut size={18} />
                <span className="hidden sm:inline text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Book container with spine */}
        <div className="flex">
          {/* Book spine */}
          <div className="hidden lg:block w-8 book-spine rounded-l-lg min-h-[70vh] flex-shrink-0">
            {/* Gold embossed text on spine */}
            <div className="h-full flex items-center justify-center">
              <span className="gold-emboss font-serif text-sm tracking-widest transform -rotate-90 whitespace-nowrap" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>
                MEMORA
              </span>
            </div>
          </div>

          {/* Main book content */}
          <div className="flex-1 grid lg:grid-cols-3 gap-0 lg:gap-0">
            {/* Left page - Past entries (like table of contents) */}
            <div className="lg:col-span-1 book-page rounded-l-none lg:rounded-l-none rounded-t-lg lg:rounded-t-none p-6" style={{ background: 'var(--bg-parchment)' }}>
              {/* Gold bookmark ribbon */}
              <div className="bookmark-ribbon right-4 hidden lg:block"></div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Feather size={18} style={{ color: 'var(--gold-accent)' }} />
                  <h2 className="font-serif text-lg font-semibold tracking-wide" style={{ color: 'var(--text-primary)' }}>My Entries</h2>
                </div>
                <button
                  onClick={handleShowWriting}
                  disabled={isPageTurning}
                  className="btn-accent text-white px-4 py-2 rounded-lg text-sm shadow-md flex items-center gap-2 disabled:opacity-70"
                >
                  <Plus size={16} />
                  New Entry
                </button>
              </div>

              {/* Filter Section */}
              {entries.length > 0 && (
                <div className="mb-4">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 text-sm font-serif px-3 py-2 rounded-lg transition-all w-full justify-between"
                    style={{
                      background: hasActiveFilters ? 'var(--app-accent-light)' : 'transparent',
                      color: hasActiveFilters ? 'var(--app-accent-dark)' : 'var(--text-secondary)',
                      border: '1px solid var(--border-light)'
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span>
                        {hasActiveFilters
                          ? `${filterMonth !== '' ? monthNames[parseInt(filterMonth)] + ' ' : ''}${filterYear}`
                          : 'Filter by date'}
                      </span>
                    </div>
                    <ChevronDown size={16} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Filter dropdowns */}
                  {showFilters && (
                    <div className="mt-3 p-4 rounded-lg animate-fade-in-up" style={{ background: 'var(--bg-paper)', border: '1px solid var(--border-light)' }}>
                      <div className="flex items-center gap-2 mb-3">
                        <Filter size={14} style={{ color: 'var(--gold-accent)' }} />
                        <span className="text-xs font-serif font-medium" style={{ color: 'var(--text-secondary)' }}>Filter entries</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {/* Year filter */}
                        <div>
                          <label className="block text-xs font-serif mb-1" style={{ color: 'var(--text-muted)' }}>Year</label>
                          <select
                            value={filterYear}
                            onChange={(e) => {
                              setFilterYear(e.target.value);
                              setFilterMonth('');
                            }}
                            className="w-full px-3 py-2 rounded-lg text-sm outline-none cursor-pointer"
                            style={{
                              background: 'var(--bg-parchment)',
                              border: '1px solid var(--border-light)',
                              color: 'var(--text-primary)',
                              fontFamily: "'EB Garamond', Georgia, serif"
                            }}
                          >
                            <option value="">All years</option>
                            {getAvailableYears().map(year => (
                              <option key={year} value={year}>{year}</option>
                            ))}
                          </select>
                        </div>

                        {/* Month filter */}
                        <div>
                          <label className="block text-xs font-serif mb-1" style={{ color: 'var(--text-muted)' }}>Month</label>
                          <select
                            value={filterMonth}
                            onChange={(e) => setFilterMonth(e.target.value)}
                            disabled={!filterYear}
                            className="w-full px-3 py-2 rounded-lg text-sm outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                              background: 'var(--bg-parchment)',
                              border: '1px solid var(--border-light)',
                              color: 'var(--text-primary)',
                              fontFamily: "'EB Garamond', Georgia, serif"
                            }}
                          >
                            <option value="">All months</option>
                            {getAvailableMonths().map(month => (
                              <option key={month} value={month}>{monthNames[month]}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Clear filters button */}
                      {hasActiveFilters && (
                        <button
                          onClick={clearFilters}
                          className="mt-3 flex items-center gap-1 text-xs font-serif px-3 py-1.5 rounded-lg transition-colors hover:bg-red-50"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          <X size={14} />
                          Clear filters
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Results count when filtered */}
              {hasActiveFilters && (
                <div className="mb-3 text-xs font-serif italic" style={{ color: 'var(--text-muted)' }}>
                  Showing {filteredEntries.length} of {entries.length} entries
                </div>
              )}

              {/* Chapter divider */}
              <div className="chapter-divider mb-4">
                <Star size={12} style={{ color: 'var(--gold-accent)' }} />
              </div>

              {entries.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen size={48} className="mx-auto mb-4 opacity-30" style={{ color: 'var(--app-accent)' }} />
                  <p className="font-serif text-lg mb-1 italic" style={{ color: 'var(--text-primary)' }}>No entries yet</p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Begin your story...</p>
                </div>
              ) : filteredEntries.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar size={48} className="mx-auto mb-4 opacity-30" style={{ color: 'var(--app-accent)' }} />
                  <p className="font-serif text-lg mb-1 italic" style={{ color: 'var(--text-primary)' }}>No entries found</p>
                  <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Try adjusting your filters</p>
                  <button
                    onClick={clearFilters}
                    className="text-sm font-serif px-4 py-2 rounded-lg transition-colors"
                    style={{ color: 'var(--app-accent-dark)', background: 'var(--app-accent-light)' }}
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
                  {filteredEntries.map((entry, index) => (
                    <button
                      key={entry._id}
                      onClick={() => handleSelectEntry(entry)}
                      disabled={isPageTurning}
                      className={`w-full text-left p-4 rounded-lg transition-all relative disabled:opacity-70 ${
                        selectedEntry?._id === entry._id
                          ? 'shadow-md'
                          : 'hover:shadow-sm'
                      }`}
                      style={{
                        background: selectedEntry?._id === entry._id ? 'var(--bg-paper)' : 'transparent',
                        border: selectedEntry?._id === entry._id
                          ? '2px solid var(--app-accent)'
                          : '1px solid transparent'
                      }}
                    >
                      {/* Page number style */}
                      <span className="absolute top-2 right-3 font-serif text-xs italic" style={{ color: 'var(--text-muted)' }}>
                        pg. {filteredEntries.length - index}
                      </span>

                      <div className="flex items-center gap-2 mb-2 pr-8">
                        {getMoodIcon(entry.mood)}
                        <p className="font-serif font-medium flex-1 truncate" style={{ color: 'var(--text-primary)' }}>{entry.title}</p>
                      </div>
                      <p className="text-sm line-clamp-2 mb-2 handwritten" style={{ color: 'var(--text-secondary)' }}>{entry.content}</p>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                          <Clock size={12} />
                          {formatTime(entry.createdAt)}
                        </div>
                        {entry.conversation && entry.conversation.length > 0 && (
                          <div className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--app-accent-light)', color: 'var(--app-accent-dark)' }}>
                            <MessageCircle size={12} />
                            {Math.floor(entry.conversation.length / 2) + 1}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right page - Main content */}
            <div className="lg:col-span-2 rounded-r-lg lg:border-l relative page-corner page-3d" style={{ background: 'var(--bg-paper)', borderColor: 'var(--border-light)' }}>
              <div className={`p-8 relative z-10 ${pageAnimation}`} style={{ transformStyle: 'preserve-3d' }}>
                {showWriting ? (
                  /* Writing new entry */
                  <div className="animate-fade-in-up">
                    <form onSubmit={handleSaveEntry}>
                      {/* Date header with ornate styling */}
                      <div className="text-center mb-8">
                        <div className="chapter-divider">
                          <Feather size={16} style={{ color: 'var(--gold-accent)' }} />
                        </div>
                        <h2 className="font-serif text-2xl font-semibold mt-4" style={{ color: 'var(--text-primary)' }}>
                          {new Date().toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </h2>
                        <div className="flex items-center justify-center gap-1 text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                          <Clock size={14} />
                          {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>

                      <div className="mb-6">
                        <textarea
                          value={journalContent}
                          onChange={(e) => setJournalContent(e.target.value)}
                          placeholder="Dear Memora, today I want to share..."
                          rows={12}
                          className="w-full bg-transparent border-none outline-none resize-none lined-paper handwritten"
                          style={{ color: 'var(--text-ink)' }}
                          autoFocus
                        />
                      </div>

                      <div className="mb-6">
                        <p className="text-sm font-serif font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>How are you feeling?</p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(moodConfig).slice(0, 8).map(([key, config]) => {
                            const IconComponent = config.icon;
                            return (
                              <button
                                key={key}
                                type="button"
                                onClick={() => setFeeling(key)}
                                className="px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2"
                                style={{
                                  background: feeling === key ? 'var(--app-accent)' : 'var(--bg-parchment)',
                                  color: feeling === key ? 'white' : 'var(--text-secondary)',
                                  boxShadow: feeling === key ? '0 2px 8px rgba(63, 91, 54, 0.3)' : 'none',
                                  border: feeling === key ? 'none' : '1px solid var(--border-light)'
                                }}
                              >
                                <IconComponent size={16} />
                                {config.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="chapter-divider">
                        <Star size={10} style={{ color: 'var(--gold-accent)' }} />
                      </div>

                      <div className="flex items-center justify-between pt-4">
                        <button
                          type="button"
                          onClick={handleCancelWriting}
                          disabled={isPageTurning}
                          className="px-4 py-2 rounded-lg transition-colors font-serif disabled:opacity-70"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={loading || !journalContent.trim()}
                          className="btn-accent text-white px-6 py-2.5 rounded-lg font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {loading ? (
                            <>
                              <Loader2 size={18} className="animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Feather size={18} />
                              Save Entry
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                ) : selectedEntry ? (
                  /* Viewing an entry with conversation */
                  <div className="space-y-6 animate-fade-in-up">
                    {/* Your journal entry */}
                    <div className="relative">
                      {/* Entry header */}
                      <div className="flex items-start justify-between mb-6">
                        <div className="text-center flex-1">
                          <div className="chapter-divider">
                            {getMoodIcon(selectedEntry.mood)}
                          </div>
                          <h2 className="font-serif text-2xl font-semibold mt-3" style={{ color: 'var(--text-primary)' }}>{selectedEntry.title}</h2>
                          <div className="flex items-center justify-center gap-1 text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                            <Clock size={14} />
                            {formatDate(selectedEntry.createdAt)}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            if (confirm('Delete this entry?')) {
                              handleDeleteEntry(selectedEntry._id);
                            }
                          }}
                          className="p-2 rounded-lg transition-colors hover:bg-red-50 hover:text-red-500 absolute right-0 top-0"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      {/* Entry content with drop cap effect */}
                      <div className="drop-cap text-lg leading-relaxed whitespace-pre-wrap handwritten ink-text" style={{ fontSize: '1.35rem' }}>
                        {selectedEntry.content}
                      </div>
                    </div>

                    {/* Decorative divider before AI response */}
                    {selectedEntry.aiResponse && (
                      <div className="chapter-divider my-8">
                        <BookOpen size={16} style={{ color: 'var(--gold-accent)' }} />
                      </div>
                    )}

                    {/* Initial AI response - styled like a letter response */}
                    {selectedEntry.aiResponse && (
                      <div className="animate-write-in">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--app-accent) 0%, var(--app-accent-dark) 100%)' }}>
                            <Bot size={16} className="text-white" />
                          </div>
                          <span className="font-serif text-sm font-medium italic" style={{ color: 'var(--app-accent-dark)' }}>Memora responds...</span>
                          <span className="text-xs flex items-center gap-1 ml-auto" style={{ color: 'var(--text-muted)' }}>
                            <Clock size={12} />
                            {formatTime(selectedEntry.createdAt)}
                          </span>
                        </div>
                        <div className="pl-10 border-l-2" style={{ borderColor: 'var(--app-accent-light)' }}>
                          <p className="leading-relaxed text-lg" style={{ color: 'var(--text-primary)', fontFamily: "'EB Garamond', Georgia, serif" }}>
                            {selectedEntry.aiResponse}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Conversation thread */}
                    {selectedEntry.conversation && selectedEntry.conversation.map((msg, index) => (
                      <div key={index} className={`${msg.role === 'user' ? 'pl-10' : ''}`}>
                        {msg.role === 'assistant' ? (
                          <div className="animate-write-in">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--app-accent) 0%, var(--app-accent-dark) 100%)' }}>
                                <Bot size={16} className="text-white" />
                              </div>
                              <span className="font-serif text-sm italic" style={{ color: 'var(--text-muted)' }}>Memora</span>
                              <span className="text-xs flex items-center gap-1 ml-auto" style={{ color: 'var(--text-muted)' }}>
                                <Clock size={11} />
                                {msg.createdAt ? formatTime(msg.createdAt) : ''}
                              </span>
                            </div>
                            <div className="pl-10 border-l-2" style={{ borderColor: 'var(--app-accent-light)' }}>
                              <p className="leading-relaxed" style={{ color: 'var(--text-primary)', fontFamily: "'EB Garamond', Georgia, serif" }}>
                                {msg.content}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="my-4">
                            <div className="flex items-center gap-2 mb-2 justify-end">
                              <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                                <Clock size={11} />
                                {msg.createdAt ? formatTime(msg.createdAt) : ''}
                              </span>
                              <span className="font-serif text-sm italic" style={{ color: 'var(--text-muted)' }}>{user?.name}</span>
                              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium" style={{ background: 'var(--leather-brown)' }}>
                                {user?.name?.charAt(0).toUpperCase()}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="leading-relaxed handwritten inline-block text-left px-4 py-3 rounded-lg" style={{ color: 'var(--text-ink)', background: 'var(--bg-parchment)', fontSize: '1.2rem' }}>
                                {msg.content}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Reply input - styled like writing in the margin */}
                    <div className="sticky bottom-4 mt-8">
                      <div className="chapter-divider mb-4">
                        <Feather size={12} style={{ color: 'var(--gold-accent)' }} />
                      </div>
                      <form onSubmit={handleReply} className="flex gap-3 items-end">
                        <div className="flex-1 rounded-xl p-4 shadow-inner" style={{ background: 'var(--bg-parchment)', border: '1px solid var(--border-light)' }}>
                          <textarea
                            ref={replyInputRef}
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                            placeholder="Write your thoughts..."
                            rows={2}
                            className="w-full bg-transparent border-none outline-none resize-none handwritten"
                            style={{ color: 'var(--text-ink)' }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleReply(e);
                              }
                            }}
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={replying || !replyMessage.trim()}
                          className="btn-accent text-white p-4 rounded-xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {replying ? (
                            <Loader2 size={20} className="animate-spin" />
                          ) : (
                            <Send size={20} />
                          )}
                        </button>
                      </form>
                    </div>
                  </div>
                ) : (
                  /* Empty state - invitation to write */
                  <div className="text-center py-12 animate-fade-in-up">
                    <div className="chapter-divider mb-8">
                      <Star size={16} style={{ color: 'var(--gold-accent)' }} />
                    </div>

                    <div className="w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 animate-float" style={{ background: 'var(--app-accent-light)' }}>
                      <BookOpen size={44} style={{ color: 'var(--app-accent)' }} />
                    </div>

                    <h2 className="font-serif text-3xl mb-3 font-semibold" style={{ color: 'var(--text-primary)' }}>Your Story Awaits</h2>
                    <p className="mb-8 max-w-md mx-auto text-lg font-serif italic" style={{ color: 'var(--text-secondary)' }}>
                      Every great story begins with a single word.
                      Share your memories, and I'll be here to listen.
                    </p>

                    <button
                      onClick={handleShowWriting}
                      disabled={isPageTurning}
                      className="btn-accent text-white px-8 py-4 rounded-xl font-medium shadow-lg flex items-center gap-3 mx-auto text-lg disabled:opacity-70"
                    >
                      <Feather size={22} />
                      Begin Writing
                    </button>

                    <div className="chapter-divider mt-12">
                      <Star size={12} style={{ color: 'var(--gold-accent)' }} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Journal;

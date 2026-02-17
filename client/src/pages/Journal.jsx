import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import PullToRefresh from 'react-simple-pull-to-refresh';
import { useSwipeable } from 'react-swipeable';
import {
  getEntries,
  createEntry,
  deleteEntry,
  replyToEntry,
  toggleFavorite as toggleFavoriteApi,
  togglePin as togglePinApi,
  updateEntryTags,
  updateEntry,
  getCustomTags,
  getPinStatus
} from '../services/api';
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
  ChevronDown,
  Search,
  Settings,
  TrendingUp,
  Lightbulb,
  Tag,
  Edit3,
  Check,
  Download,
  Pin,
  Mic,
  MapPin,
  Flame,
  WifiOff,
  Activity,
  Target,
  Menu,
  ArrowLeft,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

// Import feature panels
import StatsPanel from '../components/StatsPanel';
import SettingsPanel from '../components/SettingsPanel';
import AdvancedSearchPanel from '../components/AdvancedSearchPanel';
import OnThisDayPanel from '../components/OnThisDayPanel';
import PromptsPanel from '../components/PromptsPanel';
import WeeklySummaryPanel from '../components/WeeklySummaryPanel';
import MonthlySummaryPanel from '../components/MonthlySummaryPanel';
import EmotionTrendsPanel from '../components/EmotionTrendsPanel';
import GoalsPanel from '../components/GoalsPanel';
import MoodHeatmap from '../components/MoodHeatmap';
import TimelineView from '../components/TimelineView';
import VoiceRecorder from '../components/VoiceRecorder';
import LocationPicker from '../components/LocationPicker';
import ReflectionQuestions from '../components/ReflectionQuestions';
import { PINLockScreen } from '../components/PINLock';
import { isOffline, cacheEntries, getCachedEntries, savePendingEntry, setupOfflineListeners } from '../services/offlineStorage';

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
  const { user, logout, loading: authLoading } = useAuth();
  const { loadUserSettings } = useTheme();
  const navigate = useNavigate();
  const replyInputRef = useRef(null);

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [replying, setReplying] = useState(false);
  const [fetchingEntries, setFetchingEntries] = useState(true);
  const [showWriting, setShowWriting] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Journal form state
  const [journalContent, setJournalContent] = useState('');
  const [feeling, setFeeling] = useState('');
  const [entryTags, setEntryTags] = useState([]);

  // Reply state
  const [replyMessage, setReplyMessage] = useState('');

  // Filter state
  const [filterYear, setFilterYear] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Page turn animation state
  const [isPageTurning, setIsPageTurning] = useState(false);
  const [pageAnimation, setPageAnimation] = useState('');

  // Panel states
  const [activePanel, setActivePanel] = useState(null); // 'stats', 'settings', 'search', 'onthisday', 'prompts', 'summary'

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [editMood, setEditMood] = useState('');

  // Tags state
  const [customTags, setCustomTags] = useState([]);
  const [showTagPicker, setShowTagPicker] = useState(false);

  // New feature states
  const [entryLocation, setEntryLocation] = useState(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [isPinLocked, setIsPinLocked] = useState(false);
  const [checkingPin, setCheckingPin] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  // Check PIN status on load
  useEffect(() => {
    const checkPinStatus = async () => {
      // Don't check PIN if we don't have a user yet
      if (!user) {
        setCheckingPin(false);
        return;
      }

      try {
        const res = await getPinStatus();
        if (res.data.enabled) {
          setIsPinLocked(true);
        }
      } catch (err) {
        // If offline or error, just don't lock
        console.error('Failed to check PIN status:', err.message);
      } finally {
        setCheckingPin(false);
      }
    };

    checkPinStatus();
  }, [user]);

  // Setup offline listeners
  useEffect(() => {
    setIsOfflineMode(!navigator.onLine);

    const cleanup = setupOfflineListeners(
      () => setIsOfflineMode(false),
      () => setIsOfflineMode(true)
    );

    return cleanup;
  }, []);

  useEffect(() => {
    // User is guaranteed to exist because of ProtectedRoute
    fetchEntries();
    fetchCustomTags();
    loadUserSettings(); // Load theme settings from server
  }, []);

  const fetchEntries = async (page = 1, append = false) => {
    try {
      if (isOffline()) {
        // Load from cache when offline
        const cached = await getCachedEntries();
        setEntries(cached);
        setHasMore(false);
      } else {
        const response = await getEntries(page, 20);

        // Handle new pagination response structure
        const newEntries = response.data.entries || response.data;
        const pagination = response.data.pagination;

        // Ensure newEntries is always an array
        const entriesArray = Array.isArray(newEntries) ? newEntries : [];

        if (append) {
          setEntries(prev => [...prev, ...entriesArray]);
        } else {
          setEntries(entriesArray);
        }

        // Update pagination state
        if (pagination) {
          setHasMore(pagination.hasMore);
          setCurrentPage(pagination.currentPage);
        }

        // Cache entries for offline use
        await cacheEntries(newEntries);
      }
    } catch (err) {
      console.error('Failed to load entries');
      // Try loading from cache on error
      try {
        const cached = await getCachedEntries();
        setEntries(Array.isArray(cached) ? cached : []);
      } catch (cacheErr) {
        console.error('Failed to load cached entries');
        setEntries([]); // Ensure entries is always an array
      }
    } finally {
      setFetchingEntries(false);
      setLoadingMore(false);
    }
  };

  const loadMoreEntries = async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    await fetchEntries(currentPage + 1, true);
  };

  // Swipe gesture handlers for mobile
  const handleSwipe = (direction) => {
    if (!selectedEntry || isPageTurning) return;

    const currentIndex = filteredEntries.findIndex(e => e._id === selectedEntry._id);

    if (direction === 'Left' && currentIndex < filteredEntries.length - 1) {
      // Swipe left to next entry
      handleSelectEntry(filteredEntries[currentIndex + 1]);
    } else if (direction === 'Right' && currentIndex > 0) {
      // Swipe right to previous entry
      handleSelectEntry(filteredEntries[currentIndex - 1]);
    }
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => handleSwipe('Left'),
    onSwipedRight: () => handleSwipe('Right'),
    preventDefaultTouchmoveEvent: true,
    trackMouse: false
  });

  // Pull to refresh handler
  const handleRefresh = async () => {
    setCurrentPage(1);
    await fetchEntries(1, false);
  };

  const fetchCustomTags = async () => {
    try {
      const res = await getCustomTags();
      setCustomTags(res.data.customTags || []);
    } catch (err) {
      console.error('Failed to load tags');
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

      const entryData = {
        title,
        content: journalContent,
        mood: feeling || 'neutral',
        tags: entryTags
      };

      // Add location if available
      if (entryLocation) {
        entryData.location = entryLocation;
      }

      const response = await createEntry(entryData);

      const newEntry = response.data;
      setEntries([newEntry, ...entries]);
      setSelectedEntry(newEntry);
      setJournalContent('');
      setFeeling('');
      setEntryTags([]);
      setEntryLocation(null);
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

  const handleToggleFavorite = async () => {
    if (!selectedEntry) return;

    try {
      const res = await toggleFavoriteApi(selectedEntry._id);
      const updatedEntry = { ...selectedEntry, isFavorite: res.data.isFavorite };
      setSelectedEntry(updatedEntry);
      setEntries(entries.map(e =>
        e._id === selectedEntry._id ? updatedEntry : e
      ));
    } catch (err) {
      console.error('Failed to toggle favorite');
    }
  };

  const handleTogglePin = async () => {
    if (!selectedEntry) return;

    try {
      const res = await togglePinApi(selectedEntry._id);
      const updatedEntry = { ...selectedEntry, isPinned: res.data.isPinned };
      setSelectedEntry(updatedEntry);
      setEntries(entries.map(e =>
        e._id === selectedEntry._id ? updatedEntry : e
      ));
    } catch (err) {
      console.error('Failed to toggle pin');
    }
  };

  const handleVoiceTranscript = (transcript) => {
    setJournalContent(prev => prev + transcript);
  };

  const handlePinUnlock = () => {
    setIsPinLocked(false);
  };

  const handleUpdateTags = async (tags) => {
    if (!selectedEntry) return;

    try {
      const res = await updateEntryTags(selectedEntry._id, tags);
      const updatedEntry = { ...selectedEntry, tags: res.data.tags };
      setSelectedEntry(updatedEntry);
      setEntries(entries.map(e =>
        e._id === selectedEntry._id ? updatedEntry : e
      ));
    } catch (err) {
      console.error('Failed to update tags');
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedEntry || !editContent.trim()) return;

    try {
      const res = await updateEntry(selectedEntry._id, {
        content: editContent,
        mood: editMood
      });
      const updatedEntry = { ...selectedEntry, content: editContent, mood: editMood };
      setSelectedEntry(updatedEntry);
      setEntries(entries.map(e =>
        e._id === selectedEntry._id ? updatedEntry : e
      ));
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to save edit');
    }
  };

  const startEditing = () => {
    setEditContent(selectedEntry.content);
    setEditMood(selectedEntry.mood);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditContent('');
    setEditMood('');
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

  // Strip HTML tags for preview text
  const stripHtml = (html) => {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
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
    // Ensure entries is always an array
    if (!Array.isArray(entries)) {
      return [];
    }

    return entries.filter(entry => {
      const entryDate = new Date(entry.createdAt);

      if (showFavoritesOnly && !entry.isFavorite) {
        return false;
      }

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
    setShowFavoritesOnly(false);
  };

  const filteredEntries = getFilteredEntries();
  const hasActiveFilters = filterYear || filterMonth !== '' || showFavoritesOnly;

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
    setActivePanel(null);
    setIsEditing(false);

    handlePageTurn(() => {
      setSelectedEntry(entry);
      setShowWriting(false);
    });
  };

  // Keyboard navigation for entries
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only handle arrow keys when an entry is selected and not editing
      if (!selectedEntry || isPageTurning || isEditing || showWriting || activePanel) return;

      // Prevent arrow key navigation if user is typing in an input/textarea
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      const currentIndex = filteredEntries.findIndex(entry => entry._id === selectedEntry._id);

      if (e.key === 'ArrowRight' && currentIndex < filteredEntries.length - 1) {
        e.preventDefault();
        handleSelectEntry(filteredEntries[currentIndex + 1]);
      } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
        e.preventDefault();
        handleSelectEntry(filteredEntries[currentIndex - 1]);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setSelectedEntry(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedEntry, isPageTurning, isEditing, showWriting, activePanel, filteredEntries, handleSelectEntry]);

  // Wrapper for showing write form with animation
  const handleShowWriting = (prompt = '') => {
    setActivePanel(null);
    handlePageTurn(() => {
      setShowWriting(true);
      setSelectedEntry(null);
      if (prompt) {
        setJournalContent(`${prompt}\n\n`);
      }
    });
  };

  // Wrapper for canceling write with animation
  const handleCancelWriting = () => {
    handlePageTurn(() => {
      setShowWriting(false);
      setJournalContent('');
      setFeeling('');
      setEntryTags([]);
    });
  };

  // Open panel with animation
  const openPanel = (panel) => {
    setActivePanel(null);
    setIsEditing(false);
    handlePageTurn(() => {
      setActivePanel(panel);
      setShowWriting(false);
      setSelectedEntry(null);
    });
  };

  const closePanel = () => {
    handlePageTurn(() => {
      setActivePanel(null);
    });
  };

  // Handle prompt selection
  const handleSelectPrompt = (prompt) => {
    closePanel();
    setTimeout(() => {
      handleShowWriting(prompt);
    }, 500);
  };

  // Show PIN lock screen if enabled
  if (isPinLocked && !checkingPin) {
    return <PINLockScreen onUnlock={handlePinUnlock} />;
  }

  // Show loading screen while auth is loading or fetching data
  if (authLoading || fetchingEntries || checkingPin) {
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

            {/* Feature buttons */}
            <div className="flex items-center gap-2">
              {/* Offline indicator */}
              {isOfflineMode && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: '#fbbf24', color: '#78350f' }}>
                  <WifiOff size={14} />
                  <span className="text-xs font-medium hidden sm:inline">Offline</span>
                </div>
              )}

              {/* Desktop feature buttons - hidden on mobile */}
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={() => openPanel('search')}
                  className="p-2 rounded-lg transition-all hover:shadow-md"
                  style={{ color: 'var(--text-secondary)', background: 'var(--bg-paper)' }}
                  title="Search"
                >
                  <Search size={18} />
                </button>
                <button
                  onClick={() => openPanel('heatmap')}
                  className="p-2 rounded-lg transition-all hover:shadow-md"
                  style={{ color: 'var(--text-secondary)', background: 'var(--bg-paper)' }}
                  title="Mood Heatmap"
                >
                  <Flame size={18} />
                </button>
                <button
                  onClick={() => openPanel('timeline')}
                  className="p-2 rounded-lg transition-all hover:shadow-md"
                  style={{ color: 'var(--text-secondary)', background: 'var(--bg-paper)' }}
                  title="Timeline"
                >
                  <Clock size={18} />
                </button>
                <button
                  onClick={() => openPanel('stats')}
                  className="p-2 rounded-lg transition-all hover:shadow-md"
                  style={{ color: 'var(--text-secondary)', background: 'var(--bg-paper)' }}
                  title="Stats"
                >
                  <TrendingUp size={18} />
                </button>
                <button
                  onClick={() => openPanel('monthly-summary')}
                  className="p-2 rounded-lg transition-all hover:shadow-md"
                  style={{ color: 'var(--text-secondary)', background: 'var(--bg-paper)' }}
                  title="Monthly Summary"
                >
                  <Calendar size={18} />
                </button>
                <button
                  onClick={() => openPanel('emotion-trends')}
                  className="p-2 rounded-lg transition-all hover:shadow-md"
                  style={{ color: 'var(--text-secondary)', background: 'var(--bg-paper)' }}
                  title="Emotion Trends"
                >
                  <Activity size={18} />
                </button>
                <button
                  onClick={() => openPanel('goals')}
                  className="p-2 rounded-lg transition-all hover:shadow-md"
                  style={{ color: 'var(--text-secondary)', background: 'var(--bg-paper)' }}
                  title="Goals & Challenges"
                >
                  <Target size={18} />
                </button>
                <button
                  onClick={() => openPanel('prompts')}
                  className="p-2 rounded-lg transition-all hover:shadow-md"
                  style={{ color: 'var(--text-secondary)', background: 'var(--bg-paper)' }}
                  title="Writing Prompts"
                >
                  <Lightbulb size={18} />
                </button>
                <button
                  onClick={() => openPanel('settings')}
                  className="p-2 rounded-lg transition-all hover:shadow-md"
                  style={{ color: 'var(--text-secondary)', background: 'var(--bg-paper)' }}
                  title="Settings"
                >
                  <Settings size={18} />
                </button>

                {/* User section */}
                <div className="flex items-center gap-2 px-4 py-2 rounded-full shadow-sm ml-2" style={{ background: 'var(--bg-paper)', border: '1px solid var(--border-light)' }}>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-inner" style={{ background: 'linear-gradient(135deg, var(--app-accent) 0%, var(--app-accent-dark) 100%)' }}>
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{user?.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:shadow-md"
                  style={{ color: 'var(--text-secondary)', background: 'var(--bg-paper)' }}
                  title="Logout"
                >
                  <LogOut size={18} />
                  <span className="text-sm">Logout</span>
                </button>
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 rounded-lg transition-all hover:shadow-md"
                style={{ color: 'var(--text-secondary)', background: 'var(--bg-paper)' }}
                title="Menu"
              >
                <Menu size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {showMobileMenu && (
        <div className="md:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setShowMobileMenu(false)}>
          <div
            className="absolute right-0 top-0 h-full w-full max-w-xs shadow-2xl overflow-y-auto animate-slide-in-right"
            style={{ background: 'var(--bg-paper)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Menu Header */}
            <div className="sticky top-0 p-4 border-b flex items-center justify-between" style={{ background: 'var(--bg-paper)', borderColor: 'var(--border-light)' }}>
              <h3 className="font-serif text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Menu</h3>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="p-2 rounded-lg hover:bg-gray-100"
                style={{ color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* User Info */}
            <div className="p-4 border-b" style={{ borderColor: 'var(--border-light)' }}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-medium shadow-lg" style={{ background: 'linear-gradient(135deg, var(--app-accent) 0%, var(--app-accent-dark) 100%)' }}>
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-2">
              <button
                onClick={() => {
                  openPanel('search');
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-lg transition-all hover:shadow-sm mb-1"
                style={{ color: 'var(--text-primary)', background: 'transparent' }}
              >
                <Search size={20} style={{ color: 'var(--app-accent)' }} />
                <span className="font-serif">Search</span>
              </button>

              <button
                onClick={() => {
                  openPanel('heatmap');
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-lg transition-all hover:shadow-sm mb-1"
                style={{ color: 'var(--text-primary)', background: 'transparent' }}
              >
                <Flame size={20} style={{ color: 'var(--app-accent)' }} />
                <span className="font-serif">Mood Heatmap</span>
              </button>

              <button
                onClick={() => {
                  openPanel('timeline');
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-lg transition-all hover:shadow-sm mb-1"
                style={{ color: 'var(--text-primary)', background: 'transparent' }}
              >
                <Clock size={20} style={{ color: 'var(--app-accent)' }} />
                <span className="font-serif">Timeline</span>
              </button>

              <button
                onClick={() => {
                  openPanel('stats');
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-lg transition-all hover:shadow-sm mb-1"
                style={{ color: 'var(--text-primary)', background: 'transparent' }}
              >
                <TrendingUp size={20} style={{ color: 'var(--app-accent)' }} />
                <span className="font-serif">Stats</span>
              </button>

              <button
                onClick={() => {
                  openPanel('monthly-summary');
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-lg transition-all hover:shadow-sm mb-1"
                style={{ color: 'var(--text-primary)', background: 'transparent' }}
              >
                <Calendar size={20} style={{ color: 'var(--app-accent)' }} />
                <span className="font-serif">Monthly Summary</span>
              </button>

              <button
                onClick={() => {
                  openPanel('emotion-trends');
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-lg transition-all hover:shadow-sm mb-1"
                style={{ color: 'var(--text-primary)', background: 'transparent' }}
              >
                <Activity size={20} style={{ color: 'var(--app-accent)' }} />
                <span className="font-serif">Emotion Trends</span>
              </button>

              <button
                onClick={() => {
                  openPanel('goals');
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-lg transition-all hover:shadow-sm mb-1"
                style={{ color: 'var(--text-primary)', background: 'transparent' }}
              >
                <Target size={20} style={{ color: 'var(--app-accent)' }} />
                <span className="font-serif">Goals & Challenges</span>
              </button>

              <button
                onClick={() => {
                  openPanel('prompts');
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-lg transition-all hover:shadow-sm mb-1"
                style={{ color: 'var(--text-primary)', background: 'transparent' }}
              >
                <Lightbulb size={20} style={{ color: 'var(--app-accent)' }} />
                <span className="font-serif">Writing Prompts</span>
              </button>

              <button
                onClick={() => {
                  openPanel('settings');
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-lg transition-all hover:shadow-sm mb-1"
                style={{ color: 'var(--text-primary)', background: 'transparent' }}
              >
                <Settings size={20} style={{ color: 'var(--app-accent)' }} />
                <span className="font-serif">Settings</span>
              </button>

              <div className="my-2 border-t" style={{ borderColor: 'var(--border-light)' }}></div>

              <button
                onClick={() => {
                  handleLogout();
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-lg transition-all hover:shadow-sm"
                style={{ color: '#ef4444', background: 'transparent' }}
              >
                <LogOut size={20} />
                <span className="font-serif">Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Full-Screen Panels */}
      {activePanel && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={closePanel}>
          <div
            className="absolute inset-0 overflow-y-auto animate-fade-in"
            style={{ background: 'var(--bg-cream)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="min-h-full p-4">
              {activePanel === 'stats' && <StatsPanel onClose={closePanel} />}
              {activePanel === 'settings' && <SettingsPanel onClose={closePanel} />}
              {activePanel === 'search' && <AdvancedSearchPanel onClose={closePanel} onSelectEntry={handleSelectEntry} />}
              {activePanel === 'monthly-summary' && <MonthlySummaryPanel onClose={closePanel} />}
              {activePanel === 'emotion-trends' && <EmotionTrendsPanel onClose={closePanel} />}
              {activePanel === 'goals' && <GoalsPanel onClose={closePanel} />}
              {activePanel === 'onthisday' && <OnThisDayPanel onClose={closePanel} onSelectEntry={handleSelectEntry} />}
              {activePanel === 'prompts' && <PromptsPanel onClose={closePanel} onSelectPrompt={handleSelectPrompt} />}
              {activePanel === 'summary' && <WeeklySummaryPanel onClose={closePanel} onSelectEntry={handleSelectEntry} />}
              {activePanel === 'heatmap' && <MoodHeatmap onClose={closePanel} />}
              {activePanel === 'timeline' && <TimelineView onClose={closePanel} onSelectEntry={handleSelectEntry} />}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Full-Screen New Entry Form */}
      {showWriting && !activePanel && (
        <div className="lg:hidden fixed inset-0 z-50 overflow-y-auto" style={{ background: 'var(--bg-cream)' }}>
          <div className="min-h-screen p-4">
            <div className="rounded-lg p-4 shadow-lg" style={{ background: 'var(--bg-paper)' }}>
              <form onSubmit={handleSaveEntry}>
                {/* Mobile Header with Close Button */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b" style={{ borderColor: 'var(--border-light)' }}>
                  <h2 className="font-serif text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>New Entry</h2>
                  <button
                    type="button"
                    onClick={handleCancelWriting}
                    className="p-2 rounded-lg transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Date */}
                <div className="text-center mb-4">
                  <p className="font-serif text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {new Date().toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>

                {/* Voice & Location */}
                <div className="flex items-center gap-2 mb-4">
                  <VoiceRecorder onTranscript={handleVoiceTranscript} disabled={loading} />
                  <LocationPicker onLocationUpdate={setEntryLocation} />
                </div>

                {/* Journal Content */}
                <div className="mb-4">
                  <textarea
                    value={journalContent}
                    onChange={(e) => setJournalContent(e.target.value)}
                    placeholder="Dear Memora, today I want to share..."
                    rows={10}
                    className="w-full bg-transparent border-none outline-none resize-none lined-paper handwritten text-sm"
                    style={{ color: 'var(--text-ink)' }}
                    autoFocus
                  />
                </div>

                {/* Mood Selection */}
                <div className="mb-4">
                  <p className="text-xs font-serif font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>How are you feeling?</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(moodConfig).slice(0, 8).map(([key, config]) => {
                      const IconComponent = config.icon;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setFeeling(key)}
                          className="px-3 py-2 rounded-lg text-xs transition-all flex items-center gap-1 min-h-[40px]"
                          style={{
                            background: feeling === key ? 'var(--app-accent)' : 'var(--bg-parchment)',
                            color: feeling === key ? 'white' : 'var(--text-secondary)',
                            boxShadow: feeling === key ? '0 2px 8px rgba(63, 91, 54, 0.3)' : 'none',
                            border: feeling === key ? 'none' : '1px solid var(--border-light)'
                          }}
                        >
                          <IconComponent size={14} />
                          <span className="text-xs">{config.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Tags */}
                {customTags.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-serif font-medium mb-2 flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                      <Tag size={12} />
                      Tags (optional)
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {customTags.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            if (entryTags.includes(tag)) {
                              setEntryTags(entryTags.filter(t => t !== tag));
                            } else {
                              setEntryTags([...entryTags, tag]);
                            }
                          }}
                          className="px-2 py-1 rounded-full text-xs transition-all"
                          style={{
                            background: entryTags.includes(tag) ? 'var(--app-accent)' : 'var(--bg-parchment)',
                            color: entryTags.includes(tag) ? 'white' : 'var(--text-secondary)',
                            border: '1px solid var(--border-light)'
                          }}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'var(--border-light)' }}>
                  <button
                    type="button"
                    onClick={handleCancelWriting}
                    className="px-4 py-2 rounded-lg transition-colors font-serif text-sm"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !journalContent.trim()}
                    className="btn-accent text-white px-5 py-2 rounded-lg font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Feather size={16} />
                        Save
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Full-Screen Conversation View */}
      {selectedEntry && !activePanel && !showWriting && (
        <div className="lg:hidden fixed inset-0 z-50 overflow-y-auto" style={{ background: 'var(--bg-cream)' }} {...swipeHandlers}>
          <div className="min-h-screen p-4">
            <div className={`rounded-lg p-4 shadow-lg relative ${pageAnimation}`} style={{ background: 'var(--bg-paper)', transformStyle: 'preserve-3d' }}>
              {/* Mobile Header with Back Button */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b" style={{ borderColor: 'var(--border-light)' }}>
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="p-2 rounded-lg transition-colors flex items-center gap-2"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <ArrowLeft size={20} />
                  <span className="text-sm">Back</span>
                </button>

                {/* Entry position indicator */}
                <div className="text-xs font-serif" style={{ color: 'var(--text-muted)' }}>
                  {filteredEntries.findIndex(e => e._id === selectedEntry._id) + 1} of {filteredEntries.length}
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleTogglePin}
                    className="p-2 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                    style={{ color: selectedEntry.isPinned ? 'var(--gold-accent)' : 'var(--text-muted)' }}
                  >
                    <Pin size={18} fill={selectedEntry.isPinned ? 'var(--gold-accent)' : 'none'} />
                  </button>
                  <button
                    onClick={handleToggleFavorite}
                    className="p-2 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                    style={{ color: selectedEntry.isFavorite ? 'var(--gold-accent)' : 'var(--text-muted)' }}
                  >
                    <Star size={18} fill={selectedEntry.isFavorite ? 'var(--gold-accent)' : 'none'} />
                  </button>
                  <button
                    onClick={startEditing}
                    className="p-2 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <Edit3 size={18} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Delete this entry?')) {
                        handleDeleteEntry(selectedEntry._id);
                        setSelectedEntry(null);
                      }
                    }}
                    className="p-2 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Entry Header */}
              <div className="text-center mb-4">
                <div className="chapter-divider mb-2">
                  {getMoodIcon(selectedEntry.mood)}
                </div>
                <h2 className="font-serif text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>{selectedEntry.title}</h2>
                <div className="flex items-center justify-center gap-1 text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  <Clock size={12} />
                  {formatDate(selectedEntry.createdAt)}
                </div>
              </div>

              {/* Tags */}
              {selectedEntry.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedEntry.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-full text-xs"
                      style={{ background: 'var(--app-accent-light)', color: 'var(--app-accent-dark)' }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Entry Content */}
              {isEditing ? (
                <div className="space-y-4 mb-4">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={8}
                    className="w-full bg-transparent border-none outline-none resize-none lined-paper handwritten text-sm"
                    style={{ color: 'var(--text-ink)', background: 'var(--bg-parchment)', padding: '1rem', borderRadius: '0.5rem' }}
                  />
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(moodConfig).slice(0, 8).map(([key, config]) => {
                      const IconComponent = config.icon;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setEditMood(key)}
                          className="px-3 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1 min-h-[40px]"
                          style={{
                            background: editMood === key ? 'var(--app-accent)' : 'var(--bg-parchment)',
                            color: editMood === key ? 'white' : 'var(--text-secondary)',
                            border: '1px solid var(--border-light)'
                          }}
                        >
                          <IconComponent size={14} />
                          {config.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSaveEdit}
                      className="px-4 py-2 rounded-lg flex items-center gap-2 flex-1"
                      style={{ background: 'var(--app-accent)', color: 'white' }}
                    >
                      <Check size={16} />
                      Save
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="px-4 py-2 rounded-lg"
                      style={{ color: 'var(--text-muted)', background: 'var(--bg-parchment)' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div
                    className="text-base leading-relaxed handwritten whitespace-pre-wrap mb-4"
                    style={{ color: 'var(--text-ink)' }}
                  >
                    {selectedEntry.content}
                  </div>

                  {/* Location */}
                  {selectedEntry.location?.name && (
                    <div className="flex items-center gap-2 text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                      <MapPin size={14} />
                      <span>{selectedEntry.location.name}</span>
                    </div>
                  )}
                </>
              )}

              {/* AI Response */}
              {selectedEntry.aiResponse && !isEditing && (
                <>
                  <div className="chapter-divider my-4">
                    <BookOpen size={14} style={{ color: 'var(--gold-accent)' }} />
                  </div>
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--app-accent) 0%, var(--app-accent-dark) 100%)' }}>
                        <Bot size={14} className="text-white" />
                      </div>
                      <span className="font-serif text-xs font-medium italic" style={{ color: 'var(--app-accent-dark)' }}>Memora responds...</span>
                    </div>
                    <div className="pl-8 border-l-2" style={{ borderColor: 'var(--app-accent-light)' }}>
                      <p className="leading-relaxed text-sm" style={{ color: 'var(--text-primary)', fontFamily: "'EB Garamond', Georgia, serif" }}>
                        {selectedEntry.aiResponse}
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* Conversation Thread */}
              {!isEditing && selectedEntry.conversation && selectedEntry.conversation.map((msg, index) => (
                <div key={index} className="mb-4">
                  {msg.role === 'assistant' ? (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--app-accent) 0%, var(--app-accent-dark) 100%)' }}>
                          <Bot size={14} className="text-white" />
                        </div>
                        <span className="font-serif text-xs italic" style={{ color: 'var(--text-muted)' }}>Memora</span>
                      </div>
                      <div className="pl-8 border-l-2" style={{ borderColor: 'var(--app-accent-light)' }}>
                        <p className="leading-relaxed text-sm" style={{ color: 'var(--text-primary)', fontFamily: "'EB Garamond', Georgia, serif" }}>
                          {msg.content}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2 mb-2 justify-end">
                        <span className="font-serif text-xs italic" style={{ color: 'var(--text-muted)' }}>{user?.name}</span>
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-medium" style={{ background: 'var(--leather-brown)' }}>
                          {user?.name?.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="leading-relaxed handwritten inline-block text-left px-3 py-2 rounded-lg text-sm" style={{ color: 'var(--text-ink)', background: 'var(--bg-parchment)' }}>
                          {msg.content}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Reply Input */}
              {!isEditing && (
                <div className="mt-6 pt-4 border-t" style={{ borderColor: 'var(--border-light)' }}>
                  <form onSubmit={handleReply} className="flex gap-2 items-end">
                    <div className="flex-1 rounded-lg p-3" style={{ background: 'var(--bg-parchment)', border: '1px solid var(--border-light)' }}>
                      <textarea
                        ref={replyInputRef}
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        placeholder="Write your thoughts..."
                        rows={2}
                        className="w-full bg-transparent border-none outline-none resize-none handwritten text-sm"
                        style={{ color: 'var(--text-ink)' }}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={replying || !replyMessage.trim()}
                      className="btn-accent text-white p-3 rounded-lg shadow-md disabled:opacity-50 min-w-[48px] min-h-[48px] flex items-center justify-center"
                    >
                      {replying ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Send size={18} />
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* Swipe hint - shown briefly when entry opens */}
              {filteredEntries.length > 1 && (
                <div className="mt-4 text-center">
                  <p className="text-xs font-serif" style={{ color: 'var(--text-muted)' }}>
                    <span className="hidden sm:inline">Use ← → arrow keys or </span>
                    Swipe to navigate
                  </p>
                </div>
              )}

              {/* Navigation buttons for swipe/arrow keys */}
              <div className="fixed top-1/2 -translate-y-1/2 left-2 right-2 flex justify-between pointer-events-none">
                {/* Previous entry button */}
                {filteredEntries.findIndex(e => e._id === selectedEntry._id) > 0 && (
                  <button
                    onClick={() => {
                      const currentIndex = filteredEntries.findIndex(e => e._id === selectedEntry._id);
                      handleSelectEntry(filteredEntries[currentIndex - 1]);
                    }}
                    disabled={isPageTurning}
                    className="pointer-events-auto p-3 rounded-full shadow-lg transition-all disabled:opacity-50"
                    style={{
                      background: 'var(--bg-paper)',
                      color: 'var(--app-accent-dark)',
                      border: '2px solid var(--border-light)'
                    }}
                  >
                    <ChevronLeft size={24} />
                  </button>
                )}
                <div className="flex-1" />
                {/* Next entry button */}
                {filteredEntries.findIndex(e => e._id === selectedEntry._id) < filteredEntries.length - 1 && (
                  <button
                    onClick={() => {
                      const currentIndex = filteredEntries.findIndex(e => e._id === selectedEntry._id);
                      handleSelectEntry(filteredEntries[currentIndex + 1]);
                    }}
                    disabled={isPageTurning}
                    className="pointer-events-auto p-3 rounded-full shadow-lg transition-all disabled:opacity-50"
                    style={{
                      background: 'var(--bg-paper)',
                      color: 'var(--app-accent-dark)',
                      border: '2px solid var(--border-light)'
                    }}
                  >
                    <ChevronRight size={24} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Book container with spine */}
        <div className="flex flex-col lg:flex-row">
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
          <div className="flex-1 flex flex-col lg:grid lg:grid-cols-3 gap-0 lg:gap-0 w-full overflow-hidden">
            {/* Left page - Past entries (like table of contents) */}
            <div className="lg:col-span-1 book-page rounded-lg lg:rounded-l-none lg:rounded-t-none p-4 sm:p-6 w-full" style={{ background: 'var(--bg-parchment)' }}>
              {/* Gold bookmark ribbon */}
              <div className="bookmark-ribbon right-4 hidden lg:block"></div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Feather size={18} style={{ color: 'var(--gold-accent)' }} />
                  <h2 className="font-serif text-lg font-semibold tracking-wide" style={{ color: 'var(--text-primary)' }}>My Entries</h2>
                </div>
                <button
                  onClick={() => handleShowWriting()}
                  disabled={isPageTurning}
                  className="btn-accent text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-sm shadow-md flex items-center gap-2 disabled:opacity-70"
                >
                  <Plus size={16} />
                  New Entry
                </button>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={() => openPanel('onthisday')}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-serif transition-all"
                  style={{ background: 'var(--bg-paper)', border: '1px solid var(--border-light)', color: 'var(--text-secondary)' }}
                >
                  <Calendar size={14} />
                  On This Day
                </button>
                <button
                  onClick={() => openPanel('summary')}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-serif transition-all"
                  style={{ background: 'var(--bg-paper)', border: '1px solid var(--border-light)', color: 'var(--text-secondary)' }}
                >
                  <TrendingUp size={14} />
                  Weekly
                </button>
                <button
                  onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-serif transition-all"
                  style={{
                    background: showFavoritesOnly ? 'var(--gold-accent)' : 'var(--bg-paper)',
                    border: '1px solid var(--border-light)',
                    color: showFavoritesOnly ? 'white' : 'var(--text-secondary)'
                  }}
                >
                  <Star size={14} fill={showFavoritesOnly ? 'white' : 'none'} />
                  Favorites
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
                      <Filter size={16} />
                      <span>
                        {hasActiveFilters
                          ? `${showFavoritesOnly ? 'Favorites ' : ''}${filterMonth !== '' ? monthNames[parseInt(filterMonth)] + ' ' : ''}${filterYear}`
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

              <PullToRefresh
                onRefresh={handleRefresh}
                pullingContent={
                  <div className="text-center py-2">
                    <p className="text-xs font-serif" style={{ color: 'var(--text-muted)' }}>Pull to refresh...</p>
                  </div>
                }
                refreshingContent={
                  <div className="text-center py-2">
                    <Loader2 size={16} className="animate-spin mx-auto" style={{ color: 'var(--app-accent)' }} />
                  </div>
                }
              >
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
                  <div className="space-y-3 max-h-[60vh] md:max-h-[50vh] overflow-y-auto pr-2">
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
                      <span className="absolute top-2 right-3 font-serif text-xs italic flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                        {entry.isFavorite && <Star size={12} fill="var(--gold-accent)" style={{ color: 'var(--gold-accent)' }} />}
                        pg. {filteredEntries.length - index}
                      </span>

                      <div className="flex items-center gap-2 mb-2 pr-12">
                        {getMoodIcon(entry.mood)}
                        <p className="font-serif font-medium flex-1 truncate" style={{ color: 'var(--text-primary)' }}>{entry.title}</p>
                      </div>
                      <p className="text-sm line-clamp-2 mb-2 handwritten" style={{ color: 'var(--text-secondary)' }}>{stripHtml(entry.content)}</p>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                          <Clock size={12} />
                          {formatTime(entry.createdAt)}
                        </div>
                        {entry.tags?.length > 0 && (
                          <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                            <Tag size={12} />
                            {entry.tags.length}
                          </div>
                        )}
                        {entry.conversation && entry.conversation.length > 0 && (
                          <div className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--app-accent-light)', color: 'var(--app-accent-dark)' }}>
                            <MessageCircle size={12} />
                            {Math.floor(entry.conversation.length / 2) + 1}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}

                  {/* Load More Button */}
                  {hasMore && !loadingMore && (
                    <button
                      onClick={loadMoreEntries}
                      className="w-full mt-3 py-2.5 rounded-lg font-serif text-sm transition-all hover:shadow-sm"
                      style={{
                        background: 'var(--bg-parchment)',
                        border: '1px solid var(--border-light)',
                        color: 'var(--app-accent-dark)'
                      }}
                    >
                      Load More Entries
                    </button>
                  )}

                  {loadingMore && (
                    <div className="flex items-center justify-center py-4 mt-3">
                      <Loader2 size={20} className="animate-spin" style={{ color: 'var(--app-accent)' }} />
                    </div>
                  )}
                </div>
              )}
              </PullToRefresh>
            </div>

            {/* Right page - Main content */}
            <div className="lg:col-span-2 rounded-lg lg:rounded-r-lg lg:rounded-l-none lg:border-l relative page-corner page-3d mt-4 lg:mt-0 w-full" style={{ background: 'var(--bg-paper)', borderColor: 'var(--border-light)' }}>
              <div className={`p-4 sm:p-8 relative z-10 ${pageAnimation}`} style={{ transformStyle: 'preserve-3d' }}>
                {/* Feature Panels - Desktop Only */}
                <div className="hidden lg:block">
                  {activePanel === 'stats' && <StatsPanel onClose={closePanel} />}
                  {activePanel === 'settings' && <SettingsPanel onClose={closePanel} />}
                  {activePanel === 'search' && <AdvancedSearchPanel onClose={closePanel} onSelectEntry={handleSelectEntry} />}
                  {activePanel === 'monthly-summary' && <MonthlySummaryPanel onClose={closePanel} />}
                  {activePanel === 'emotion-trends' && <EmotionTrendsPanel onClose={closePanel} />}
                  {activePanel === 'goals' && <GoalsPanel onClose={closePanel} />}
                  {activePanel === 'onthisday' && <OnThisDayPanel onClose={closePanel} onSelectEntry={handleSelectEntry} />}
                  {activePanel === 'prompts' && <PromptsPanel onClose={closePanel} onSelectPrompt={handleSelectPrompt} />}
                  {activePanel === 'summary' && <WeeklySummaryPanel onClose={closePanel} onSelectEntry={handleSelectEntry} />}
                  {activePanel === 'heatmap' && <MoodHeatmap onClose={closePanel} />}
                  {activePanel === 'timeline' && <TimelineView onClose={closePanel} onSelectEntry={handleSelectEntry} />}
                </div>

                {!activePanel && showWriting ? (
                  /* Writing new entry - Desktop only, Mobile uses full-screen overlay */
                  <div className="hidden lg:block animate-fade-in-up">
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

                      {/* Voice recorder and Location */}
                      <div className="flex items-center justify-between mb-4">
                        <VoiceRecorder onTranscript={handleVoiceTranscript} disabled={loading} />
                        <LocationPicker onLocationUpdate={setEntryLocation} />
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

                      {/* Tags Section */}
                      <div className="mb-6">
                        <p className="text-sm font-serif font-medium mb-3 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                          <Tag size={14} />
                          Add tags (optional)
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {customTags.map((tag) => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => {
                                if (entryTags.includes(tag)) {
                                  setEntryTags(entryTags.filter(t => t !== tag));
                                } else {
                                  setEntryTags([...entryTags, tag]);
                                }
                              }}
                              className="px-3 py-1 rounded-full text-sm transition-all"
                              style={{
                                background: entryTags.includes(tag) ? 'var(--app-accent)' : 'var(--bg-parchment)',
                                color: entryTags.includes(tag) ? 'white' : 'var(--text-secondary)',
                                border: '1px solid var(--border-light)'
                              }}
                            >
                              {tag}
                            </button>
                          ))}
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
                ) : !activePanel && selectedEntry ? (
                  /* Viewing an entry with conversation - Desktop only, Mobile uses full-screen overlay */
                  <div {...swipeHandlers} className="hidden lg:block space-y-6 animate-fade-in-up">
                    {/* Your journal entry */}
                    <div className="relative">
                      {/* Entry header */}
                      <div className="flex items-start justify-between mb-6">
                        {/* Previous entry button */}
                        <div className="flex items-center">
                          {filteredEntries.findIndex(e => e._id === selectedEntry._id) > 0 && (
                            <button
                              onClick={() => {
                                const currentIndex = filteredEntries.findIndex(e => e._id === selectedEntry._id);
                                handleSelectEntry(filteredEntries[currentIndex - 1]);
                              }}
                              disabled={isPageTurning}
                              className="p-2 rounded-lg transition-all disabled:opacity-50 hover:bg-opacity-10"
                              style={{ color: 'var(--app-accent-dark)', background: 'transparent' }}
                              title="Previous entry (←)"
                            >
                              <ChevronLeft size={24} />
                            </button>
                          )}
                        </div>

                        <div className="text-center flex-1">
                          <div className="chapter-divider">
                            {getMoodIcon(selectedEntry.mood)}
                          </div>
                          <h2 className="font-serif text-2xl font-semibold mt-3" style={{ color: 'var(--text-primary)' }}>{selectedEntry.title}</h2>
                          <div className="flex items-center justify-center gap-1 text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                            <Clock size={14} />
                            {formatDate(selectedEntry.createdAt)}
                          </div>
                          {/* Entry position indicator */}
                          {filteredEntries.length > 1 && (
                            <div className="text-xs mt-1 font-serif" style={{ color: 'var(--text-muted)' }}>
                              {filteredEntries.findIndex(e => e._id === selectedEntry._id) + 1} of {filteredEntries.length}
                            </div>
                          )}
                        </div>

                        {/* Next entry button */}
                        <div className="flex items-center">
                          {filteredEntries.findIndex(e => e._id === selectedEntry._id) < filteredEntries.length - 1 && (
                            <button
                              onClick={() => {
                                const currentIndex = filteredEntries.findIndex(e => e._id === selectedEntry._id);
                                handleSelectEntry(filteredEntries[currentIndex + 1]);
                              }}
                              disabled={isPageTurning}
                              className="p-2 rounded-lg transition-all disabled:opacity-50 hover:bg-opacity-10"
                              style={{ color: 'var(--app-accent-dark)', background: 'transparent' }}
                              title="Next entry (→)"
                            >
                              <ChevronRight size={24} />
                            </button>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-0.5 sm:gap-1 absolute right-0 top-0">
                          <button
                            onClick={handleTogglePin}
                            className="p-2.5 sm:p-2 rounded-lg transition-colors hover:bg-yellow-50 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
                            style={{ color: selectedEntry.isPinned ? 'var(--gold-accent)' : 'var(--text-muted)' }}
                            title={selectedEntry.isPinned ? 'Unpin entry' : 'Pin entry'}
                          >
                            <Pin size={18} fill={selectedEntry.isPinned ? 'var(--gold-accent)' : 'none'} />
                          </button>
                          <button
                            onClick={handleToggleFavorite}
                            className="p-2.5 sm:p-2 rounded-lg transition-colors hover:bg-yellow-50 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
                            style={{ color: selectedEntry.isFavorite ? 'var(--gold-accent)' : 'var(--text-muted)' }}
                            title={selectedEntry.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                          >
                            <Star size={18} fill={selectedEntry.isFavorite ? 'var(--gold-accent)' : 'none'} />
                          </button>
                          <button
                            onClick={startEditing}
                            className="p-2.5 sm:p-2 rounded-lg transition-colors hover:bg-blue-50 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
                            style={{ color: 'var(--text-muted)' }}
                            title="Edit entry"
                          >
                            <Edit3 size={18} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Delete this entry?')) {
                                handleDeleteEntry(selectedEntry._id);
                              }
                            }}
                            className="p-2.5 sm:p-2 rounded-lg transition-colors hover:bg-red-50 hover:text-red-500 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
                            style={{ color: 'var(--text-muted)' }}
                            title="Delete entry"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>

                      {/* Tags display */}
                      {selectedEntry.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {selectedEntry.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 rounded-full text-xs"
                              style={{ background: 'var(--app-accent-light)', color: 'var(--app-accent-dark)' }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Edit mode or display */}
                      {isEditing ? (
                        <div className="space-y-4">
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            rows={10}
                            className="w-full bg-transparent border-none outline-none resize-none lined-paper handwritten"
                            style={{ color: 'var(--text-ink)', background: 'var(--bg-parchment)', padding: '1rem', borderRadius: '0.5rem' }}
                          />
                          <div className="flex flex-wrap gap-2 mb-4">
                            {Object.entries(moodConfig).slice(0, 8).map(([key, config]) => {
                              const IconComponent = config.icon;
                              return (
                                <button
                                  key={key}
                                  type="button"
                                  onClick={() => setEditMood(key)}
                                  className="px-3 py-1.5 rounded-lg text-sm transition-all flex items-center gap-1"
                                  style={{
                                    background: editMood === key ? 'var(--app-accent)' : 'var(--bg-parchment)',
                                    color: editMood === key ? 'white' : 'var(--text-secondary)',
                                    border: '1px solid var(--border-light)'
                                  }}
                                >
                                  <IconComponent size={14} />
                                  {config.label}
                                </button>
                              );
                            })}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={handleSaveEdit}
                              className="px-4 py-2 rounded-lg flex items-center gap-2"
                              style={{ background: 'var(--app-accent)', color: 'white' }}
                            >
                              <Check size={16} />
                              Save Changes
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="px-4 py-2 rounded-lg"
                              style={{ color: 'var(--text-muted)', background: 'var(--bg-parchment)' }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Entry content with drop cap effect */}
                          <div
                            className="drop-cap text-lg leading-relaxed handwritten ink-text whitespace-pre-wrap"
                            style={{ fontSize: '1.35rem', color: 'var(--text-ink)' }}
                          >
                            {selectedEntry.content}
                          </div>

                          {/* Location display */}
                          {selectedEntry.location?.name && (
                            <div className="mt-4 flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                              <MapPin size={14} />
                              <span>{selectedEntry.location.name}</span>
                            </div>
                          )}
                        </>
                      )}

                      {/* Tag picker */}
                      {!isEditing && (
                        <div className="mt-4">
                          <button
                            onClick={() => setShowTagPicker(!showTagPicker)}
                            className="flex items-center gap-1 text-xs font-serif px-3 py-1.5 rounded-lg transition-all"
                            style={{ background: 'var(--bg-parchment)', color: 'var(--text-muted)', border: '1px solid var(--border-light)' }}
                          >
                            <Tag size={12} />
                            {selectedEntry.tags?.length > 0 ? 'Edit tags' : 'Add tags'}
                          </button>
                          {showTagPicker && (
                            <div className="mt-2 p-3 rounded-lg animate-fade-in-up" style={{ background: 'var(--bg-parchment)', border: '1px solid var(--border-light)' }}>
                              <div className="flex flex-wrap gap-2">
                                {customTags.map((tag) => (
                                  <button
                                    key={tag}
                                    onClick={() => {
                                      const currentTags = selectedEntry.tags || [];
                                      const newTags = currentTags.includes(tag)
                                        ? currentTags.filter(t => t !== tag)
                                        : [...currentTags, tag];
                                      handleUpdateTags(newTags);
                                    }}
                                    className="px-2 py-1 rounded-full text-xs transition-all"
                                    style={{
                                      background: selectedEntry.tags?.includes(tag) ? 'var(--app-accent)' : 'var(--bg-paper)',
                                      color: selectedEntry.tags?.includes(tag) ? 'white' : 'var(--text-secondary)',
                                      border: '1px solid var(--border-light)'
                                    }}
                                  >
                                    {tag}
                                  </button>
                                ))}
                              </div>
                              <button
                                onClick={() => setShowTagPicker(false)}
                                className="mt-2 text-xs"
                                style={{ color: 'var(--text-muted)' }}
                              >
                                Done
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Reflection Questions */}
                      {!isEditing && (
                        <ReflectionQuestions
                          entryId={selectedEntry._id}
                          existingQuestions={selectedEntry.reflectionQuestions}
                          onQuestionClick={(question) => setReplyMessage(question)}
                        />
                      )}
                    </div>

                    {/* Decorative divider before AI response */}
                    {selectedEntry.aiResponse && !isEditing && (
                      <div className="chapter-divider my-8">
                        <BookOpen size={16} style={{ color: 'var(--gold-accent)' }} />
                      </div>
                    )}

                    {/* Initial AI response - styled like a letter response */}
                    {selectedEntry.aiResponse && !isEditing && (
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
                    {!isEditing && selectedEntry.conversation && selectedEntry.conversation.map((msg, index) => (
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

                    {/* Mobile swipe hint */}
                    {filteredEntries.length > 1 && (
                      <div className="lg:hidden text-center py-4 mt-4">
                        <p className="text-xs font-serif italic" style={{ color: 'var(--text-muted)' }}>
                          ← Swipe to navigate between entries →
                        </p>
                      </div>
                    )}

                    {/* Reply input - styled like writing in the margin */}
                    {!isEditing && (
                      <div className="sticky bottom-2 sm:bottom-4 mt-4 sm:mt-8">
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
                    )}
                  </div>
                ) : !activePanel && (
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
                      onClick={() => handleShowWriting()}
                      disabled={isPageTurning}
                      className="btn-accent text-white px-8 py-4 rounded-xl font-medium shadow-lg flex items-center gap-3 mx-auto text-lg disabled:opacity-70"
                    >
                      <Feather size={22} />
                      Begin Writing
                    </button>

                    {/* Quick action buttons */}
                    <div className="flex flex-wrap justify-center gap-3 mt-8">
                      <button
                        onClick={() => openPanel('prompts')}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-serif transition-all"
                        style={{ background: 'var(--bg-parchment)', color: 'var(--text-secondary)', border: '1px solid var(--border-light)' }}
                      >
                        <Lightbulb size={16} />
                        Need inspiration?
                      </button>
                      <button
                        onClick={() => openPanel('onthisday')}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-serif transition-all"
                        style={{ background: 'var(--bg-parchment)', color: 'var(--text-secondary)', border: '1px solid var(--border-light)' }}
                      >
                        <Calendar size={16} />
                        On This Day
                      </button>
                    </div>

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

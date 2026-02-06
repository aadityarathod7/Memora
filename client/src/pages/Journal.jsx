import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getEntries, createEntry, deleteEntry } from '../services/api';
import EntryForm from '../components/Journal/EntryForm';
import EntryCard from '../components/Journal/EntryCard';
import AIResponse from '../components/Chat/AIResponse';

const Journal = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingEntries, setFetchingEntries] = useState(true);
  const [latestResponse, setLatestResponse] = useState(null);
  const [expandedEntry, setExpandedEntry] = useState(null);
  const [error, setError] = useState('');

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
      setError('Failed to load entries');
    } finally {
      setFetchingEntries(false);
    }
  };

  const handleCreateEntry = async (entryData) => {
    setLoading(true);
    setError('');
    setLatestResponse(null);

    try {
      const response = await createEntry(entryData);
      const newEntry = response.data;
      setEntries([newEntry, ...entries]);
      setLatestResponse(newEntry.aiResponse);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save entry');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = async (id) => {
    try {
      await deleteEntry(id);
      setEntries(entries.filter(entry => entry._id !== id));
      if (latestResponse && entries[0]?._id === id) {
        setLatestResponse(null);
      }
    } catch (err) {
      setError('Failed to delete entry');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (fetchingEntries) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-warm-500">Loading your journal...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/60 backdrop-blur-sm border-b border-warm-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className="w-8 h-8 text-warm-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
            <div>
              <h1 className="font-serif text-xl text-warm-800">My Journal</h1>
              <p className="text-sm text-warm-500">Hello, {user?.name}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-warm-600 hover:text-warm-800 text-sm"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Entry Form */}
        <div className="mb-8">
          <EntryForm onSubmit={handleCreateEntry} loading={loading} />
        </div>

        {/* Latest AI Response */}
        {latestResponse && (
          <div className="mb-8">
            <AIResponse response={latestResponse} isNew={true} />
          </div>
        )}

        {/* Past Entries */}
        <div>
          <h2 className="text-2xl font-serif text-warm-800 mb-4">Past Entries</h2>
          {entries.length === 0 ? (
            <div className="text-center py-12 text-warm-500">
              <p className="text-lg">No entries yet.</p>
              <p className="text-sm mt-2">Start writing to see your journal fill up with memories.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map((entry) => (
                <EntryCard
                  key={entry._id}
                  entry={entry}
                  onDelete={handleDeleteEntry}
                  isExpanded={expandedEntry === entry._id}
                  onToggle={() => setExpandedEntry(expandedEntry === entry._id ? null : entry._id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Journal;

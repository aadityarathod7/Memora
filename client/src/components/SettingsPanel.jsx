import { useState, useEffect } from 'react';
import { getProfile, updateSettings, getCustomTags, addCustomTag, deleteCustomTag, exportEntries, createBackup } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import {
  Settings,
  Sun,
  Moon,
  Palette,
  Type,
  Tag,
  Plus,
  X,
  Download,
  FileJson,
  FileText,
  Loader2,
  Check,
  Lock,
  Bell,
  FileCode
} from 'lucide-react';
import { PINSettings } from './PINLock';
import ReminderSettings from './ReminderSettings';

const themes = [
  { id: 'forest', name: 'Forest', primary: '#6F9463', bg: '#F5F1E8' },
  { id: 'ocean', name: 'Ocean', primary: '#4A90A4', bg: '#F0F5F7' },
  { id: 'sunset', name: 'Sunset', primary: '#D97757', bg: '#FDF5F0' },
  { id: 'lavender', name: 'Lavender', primary: '#8B7BC6', bg: '#F5F3FA' },
  { id: 'midnight', name: 'Midnight', primary: '#5B6B8A', bg: '#F2F3F5' }
];

const fonts = [
  { id: 'default', name: 'Default', preview: 'EB Garamond' },
  { id: 'handwritten', name: 'Handwritten', preview: 'Caveat' },
  { id: 'classic', name: 'Classic', preview: 'Georgia' },
  { id: 'modern', name: 'Modern', preview: 'Inter' }
];

const SettingsPanel = ({ onClose, onSettingsChange }) => {
  const { setTheme: setGlobalTheme, setDarkMode: setGlobalDarkMode, setFont: setGlobalFont } = useTheme();
  const [settings, setSettings] = useState({ theme: 'forest', darkMode: false, font: 'default' });
  const [customTags, setCustomTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [activeTab, setActiveTab] = useState('appearance'); // 'appearance', 'security', 'data'

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, tagsRes] = await Promise.all([
        getProfile(),
        getCustomTags()
      ]);
      setSettings(profileRes.data.settings || { theme: 'forest', darkMode: false, font: 'default' });
      setCustomTags(tagsRes.data.customTags || []);
    } catch (err) {
      console.error('Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = async (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    setSaving(true);

    // Apply theme changes immediately
    if (key === 'theme') setGlobalTheme(value);
    if (key === 'darkMode') setGlobalDarkMode(value);
    if (key === 'font') setGlobalFont(value);

    try {
      await updateSettings({ [key]: value });
      if (onSettingsChange) {
        onSettingsChange(newSettings);
      }
    } catch (err) {
      console.error('Failed to save setting');
    } finally {
      setSaving(false);
    }
  };

  const handleAddTag = async (e) => {
    e.preventDefault();
    if (!newTag.trim()) return;

    try {
      const res = await addCustomTag(newTag);
      setCustomTags(res.data.customTags);
      setNewTag('');
    } catch (err) {
      console.error('Failed to add tag');
    }
  };

  const handleDeleteTag = async (tag) => {
    try {
      const res = await deleteCustomTag(tag);
      setCustomTags(res.data.customTags);
    } catch (err) {
      console.error('Failed to delete tag');
    }
  };

  const handleExport = async (format = 'json') => {
    setExporting(true);
    try {
      if (format === 'backup') {
        await createBackup();
      } else {
        await exportEntries(format);
      }
    } catch (err) {
      console.error('Failed to export:', err);
      alert('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handlePdfExport = async () => {
    try {
      const entriesRes = await getEntries();
      const entries = entriesRes.data;

      // Create a new window for PDF-friendly content
      const printWindow = window.open('', '_blank');
      const moodLabels = {
        happy: 'Happy', grateful: 'Grateful', calm: 'Calm', excited: 'Excited',
        hopeful: 'Hopeful', tired: 'Tired', anxious: 'Anxious', sad: 'Sad',
        frustrated: 'Frustrated', neutral: 'Neutral'
      };

      const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
      };

      const entriesHtml = entries.map(entry => `
        <div class="entry">
          <h2>${entry.title}</h2>
          <p class="meta">${formatDate(entry.createdAt)} | Mood: ${moodLabels[entry.mood] || 'Neutral'}${entry.tags?.length ? ` | Tags: ${entry.tags.join(', ')}` : ''}</p>
          <div class="content">${entry.content.replace(/\n/g, '<br>')}</div>
          ${entry.aiResponse ? `
            <div class="response">
              <p class="response-label">Memora's Response:</p>
              <p>${entry.aiResponse}</p>
            </div>
          ` : ''}
        </div>
      `).join('<hr class="divider">');

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>My Memora Journal</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Caveat:wght@400;500&display=swap');
            body {
              font-family: 'EB Garamond', Georgia, serif;
              max-width: 800px;
              margin: 0 auto;
              padding: 40px;
              color: #2C3E2A;
              background: #FFFEF9;
            }
            .header {
              text-align: center;
              margin-bottom: 40px;
              padding-bottom: 20px;
              border-bottom: 2px solid #6F9463;
            }
            .header h1 {
              font-size: 2.5em;
              color: #3F5B36;
              margin-bottom: 5px;
            }
            .header p {
              font-style: italic;
              color: #5A6B57;
            }
            .entry {
              margin-bottom: 30px;
              page-break-inside: avoid;
            }
            .entry h2 {
              color: #3F5B36;
              margin-bottom: 5px;
            }
            .entry .meta {
              font-size: 0.9em;
              color: #8A9A87;
              margin-bottom: 15px;
            }
            .entry .content {
              font-family: 'Caveat', cursive;
              font-size: 1.3em;
              line-height: 1.8;
              white-space: pre-wrap;
            }
            .response {
              margin-top: 20px;
              padding: 15px;
              background: #F5F1E8;
              border-left: 3px solid #6F9463;
              border-radius: 0 8px 8px 0;
            }
            .response-label {
              font-weight: 600;
              color: #6F9463;
              margin-bottom: 5px;
            }
            .divider {
              border: none;
              border-top: 1px solid #C4A962;
              margin: 30px 0;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              color: #8A9A87;
              font-size: 0.9em;
            }
            @media print {
              body { padding: 20px; }
              .entry { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>My Memora Journal</h1>
            <p>Where memories talk back</p>
            <p style="font-size: 0.9em; margin-top: 10px;">Exported on ${new Date().toLocaleDateString()}</p>
          </div>
          ${entriesHtml}
          <div class="footer">
            <p>Generated with Memora - ${entries.length} entries</p>
          </div>
        </body>
        </html>
      `);

      printWindow.document.close();
      printWindow.focus();

      // Trigger print dialog after content loads
      setTimeout(() => {
        printWindow.print();
      }, 500);
    } catch (err) {
      console.error('Failed to generate PDF');
    }
  };

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
          <Settings size={20} style={{ color: 'var(--gold-accent)' }} />
          <h2 className="font-serif text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Settings
          </h2>
          {saving && <Loader2 size={16} className="animate-spin" style={{ color: 'var(--app-accent)' }} />}
        </div>
        <button
          onClick={onClose}
          className="text-sm font-serif px-3 py-1 rounded-lg"
          style={{ color: 'var(--text-muted)', background: 'var(--bg-parchment)' }}
        >
          Close
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b" style={{ borderColor: 'var(--border-light)' }}>
        <button
          onClick={() => setActiveTab('appearance')}
          className={`px-4 py-2 font-serif transition-all ${activeTab === 'appearance' ? 'border-b-2' : ''}`}
          style={{
            color: activeTab === 'appearance' ? 'var(--app-accent)' : 'var(--text-muted)',
            borderColor: activeTab === 'appearance' ? 'var(--app-accent)' : 'transparent'
          }}
        >
          Appearance
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 font-serif transition-all ${activeTab === 'security' ? 'border-b-2' : ''}`}
          style={{
            color: activeTab === 'security' ? 'var(--app-accent)' : 'var(--text-muted)',
            borderColor: activeTab === 'security' ? 'var(--app-accent)' : 'transparent'
          }}
        >
          Security & Reminders
        </button>
        <button
          onClick={() => setActiveTab('data')}
          className={`px-4 py-2 font-serif transition-all ${activeTab === 'data' ? 'border-b-2' : ''}`}
          style={{
            color: activeTab === 'data' ? 'var(--app-accent)' : 'var(--text-muted)',
            borderColor: activeTab === 'data' ? 'var(--app-accent)' : 'transparent'
          }}
        >
          Data & Export
        </button>
      </div>

      {/* Appearance Tab */}
      {activeTab === 'appearance' && (
        <div className="space-y-6">
          {/* Theme Selection */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Palette size={16} style={{ color: 'var(--app-accent)' }} />
              <h3 className="font-serif font-medium" style={{ color: 'var(--text-primary)' }}>Theme</h3>
            </div>
        <div className="grid grid-cols-5 gap-2">
          {themes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => handleSettingChange('theme', theme.id)}
              className="p-3 rounded-xl transition-all relative"
              style={{
                background: theme.bg,
                border: settings.theme === theme.id ? `2px solid ${theme.primary}` : '2px solid transparent',
                boxShadow: settings.theme === theme.id ? `0 0 0 2px ${theme.primary}30` : 'none'
              }}
            >
              <div className="w-6 h-6 rounded-full mx-auto mb-1" style={{ background: theme.primary }} />
              <p className="text-xs font-serif" style={{ color: 'var(--text-secondary)' }}>{theme.name}</p>
              {settings.theme === theme.id && (
                <div className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: theme.primary }}>
                  <Check size={10} className="text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Dark Mode Toggle */}
      <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'var(--bg-parchment)', border: '1px solid var(--border-light)' }}>
        <div className="flex items-center gap-3">
          {settings.darkMode ? <Moon size={18} style={{ color: 'var(--app-accent)' }} /> : <Sun size={18} style={{ color: 'var(--gold-accent)' }} />}
          <div>
            <p className="font-serif font-medium" style={{ color: 'var(--text-primary)' }}>Dark Mode</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Easier on the eyes at night</p>
          </div>
        </div>
        <button
          onClick={() => handleSettingChange('darkMode', !settings.darkMode)}
          className={`w-12 h-6 rounded-full transition-all relative ${settings.darkMode ? 'bg-green-500' : ''}`}
          style={{ background: settings.darkMode ? 'var(--app-accent)' : 'var(--border-light)' }}
        >
          <div
            className="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all"
            style={{ left: settings.darkMode ? '26px' : '4px' }}
          />
        </button>
      </div>

      {/* Font Selection */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Type size={16} style={{ color: 'var(--app-accent)' }} />
          <h3 className="font-serif font-medium" style={{ color: 'var(--text-primary)' }}>Font Style</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {fonts.map((font) => (
            <button
              key={font.id}
              onClick={() => handleSettingChange('font', font.id)}
              className="p-3 rounded-xl transition-all text-left"
              style={{
                background: 'var(--bg-parchment)',
                border: settings.font === font.id ? '2px solid var(--app-accent)' : '1px solid var(--border-light)'
              }}
            >
              <p className="font-medium" style={{ fontFamily: font.preview, color: 'var(--text-primary)' }}>{font.name}</p>
              <p className="text-xs mt-1" style={{ fontFamily: font.preview, color: 'var(--text-muted)' }}>The quick brown fox</p>
            </button>
          ))}
        </div>
      </div>

          {/* Custom Tags Management */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Tag size={16} style={{ color: 'var(--app-accent)' }} />
              <h3 className="font-serif font-medium" style={{ color: 'var(--text-primary)' }}>Custom Tags</h3>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {customTags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full text-sm flex items-center gap-1"
                  style={{ background: 'var(--app-accent-light)', color: 'var(--app-accent-dark)' }}
                >
                  {tag}
                  <button
                    onClick={() => handleDeleteTag(tag)}
                    className="hover:opacity-70 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
            <form onSubmit={handleAddTag} className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add new tag..."
                className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
                style={{
                  background: 'var(--bg-parchment)',
                  border: '1px solid var(--border-light)',
                  color: 'var(--text-primary)'
                }}
              />
              <button
                type="submit"
                disabled={!newTag.trim()}
                className="px-3 py-2 rounded-lg disabled:opacity-50"
                style={{ background: 'var(--app-accent)', color: 'white' }}
              >
                <Plus size={18} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Security & Reminders Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* PIN Lock Settings */}
          <PINSettings />

          {/* Divider */}
          <div className="border-t" style={{ borderColor: 'var(--border-light)' }} />

          {/* Reminder Settings */}
          <ReminderSettings onClose={() => {}} />
        </div>
      )}

      {/* Data & Export Tab */}
      {activeTab === 'data' && (
        <div className="space-y-6">

          {/* Export Data */}
          <div className="p-4 rounded-xl" style={{ background: 'var(--bg-parchment)', border: '1px solid var(--border-light)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Download size={16} style={{ color: 'var(--app-accent)' }} />
              <h3 className="font-serif font-medium" style={{ color: 'var(--text-primary)' }}>Export Data</h3>
            </div>
            <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
              Download your journal entries in multiple formats
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleExport('backup')}
                disabled={exporting}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                style={{ background: 'var(--app-accent)', color: 'white' }}
              >
                {exporting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <FileJson size={16} />
                )}
                {exporting ? 'Exporting...' : 'Full Backup'}
              </button>
              <button
                onClick={() => handleExport('json')}
                disabled={exporting}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                style={{ background: 'var(--bg-paper)', color: 'var(--text-secondary)', border: '1px solid var(--border-light)' }}
              >
                <FileJson size={16} />
                JSON
              </button>
              <button
                onClick={() => handleExport('markdown')}
                disabled={exporting}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                style={{ background: 'var(--bg-paper)', color: 'var(--text-secondary)', border: '1px solid var(--border-light)' }}
              >
                <FileCode size={16} />
                Markdown
              </button>
              <button
                onClick={() => handleExport('csv')}
                disabled={exporting}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                style={{ background: 'var(--bg-paper)', color: 'var(--text-secondary)', border: '1px solid var(--border-light)' }}
              >
                <FileText size={16} />
                CSV
              </button>
            </div>
            <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
              💡 <strong>Full Backup</strong> includes all settings and data for restoration
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPanel;

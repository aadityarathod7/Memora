import { useState, useEffect } from 'react';
import { Bell, Clock, Shield, Loader2, Check } from 'lucide-react';
import { getReminders, updateReminders } from '../services/api';

const timezones = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Kolkata',
  'Australia/Sydney',
  'Pacific/Auckland'
];

const ReminderSettings = ({ onClose }) => {
  const [settings, setSettings] = useState({
    enabled: false,
    time: '20:00',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    streakProtection: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await getReminders();
      if (res.data.reminders) {
        setSettings({
          enabled: res.data.reminders.enabled || false,
          time: res.data.reminders.time || '20:00',
          timezone: res.data.reminders.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
          streakProtection: res.data.reminders.streakProtection !== false
        });
      }
    } catch (err) {
      console.error('Failed to load reminder settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateReminders(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save reminder settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={24} className="animate-spin" style={{ color: 'var(--app-accent)' }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Bell size={20} style={{ color: 'var(--gold-accent)' }} />
        <h3 className="font-serif text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          Daily Reminders
        </h3>
      </div>

      {/* Enable/Disable toggle */}
      <div className="flex items-center justify-between p-4 rounded-lg" style={{ background: 'var(--bg-parchment)' }}>
        <div>
          <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Enable reminders</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Get daily notifications to write</p>
        </div>
        <button
          onClick={() => handleChange('enabled', !settings.enabled)}
          className={`
            w-12 h-6 rounded-full transition-all relative
            ${settings.enabled ? 'bg-green-500' : 'bg-gray-300'}
          `}
        >
          <div
            className={`
              absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all
              ${settings.enabled ? 'left-7' : 'left-1'}
            `}
          />
        </button>
      </div>

      {settings.enabled && (
        <>
          {/* Time picker */}
          <div className="p-4 rounded-lg" style={{ background: 'var(--bg-parchment)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Clock size={16} style={{ color: 'var(--app-accent)' }} />
              <label className="font-medium" style={{ color: 'var(--text-primary)' }}>
                Reminder time
              </label>
            </div>
            <input
              type="time"
              value={settings.time}
              onChange={(e) => handleChange('time', e.target.value)}
              className="w-full px-4 py-2 rounded-lg outline-none"
              style={{
                background: 'var(--bg-paper)',
                border: '1px solid var(--border-light)',
                color: 'var(--text-primary)'
              }}
            />
          </div>

          {/* Timezone */}
          <div className="p-4 rounded-lg" style={{ background: 'var(--bg-parchment)' }}>
            <label className="block font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
              Timezone
            </label>
            <select
              value={settings.timezone}
              onChange={(e) => handleChange('timezone', e.target.value)}
              className="w-full px-4 py-2 rounded-lg outline-none cursor-pointer"
              style={{
                background: 'var(--bg-paper)',
                border: '1px solid var(--border-light)',
                color: 'var(--text-primary)'
              }}
            >
              {timezones.map(tz => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>

          {/* Streak Protection */}
          <div className="flex items-center justify-between p-4 rounded-lg" style={{ background: 'var(--bg-parchment)' }}>
            <div className="flex items-center gap-3">
              <Shield size={20} style={{ color: 'var(--app-accent)' }} />
              <div>
                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Streak protection</p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Get extra reminders when your streak is at risk
                </p>
              </div>
            </div>
            <button
              onClick={() => handleChange('streakProtection', !settings.streakProtection)}
              className={`
                w-12 h-6 rounded-full transition-all relative
                ${settings.streakProtection ? 'bg-green-500' : 'bg-gray-300'}
              `}
            >
              <div
                className={`
                  absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all
                  ${settings.streakProtection ? 'left-7' : 'left-1'}
                `}
              />
            </button>
          </div>
        </>
      )}

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all"
        style={{
          background: saved ? '#22c55e' : 'var(--app-accent)',
          color: 'white'
        }}
      >
        {saving ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Saving...
          </>
        ) : saved ? (
          <>
            <Check size={18} />
            Saved!
          </>
        ) : (
          'Save settings'
        )}
      </button>

      <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
        Note: Browser notifications must be enabled for reminders to work.
      </p>
    </div>
  );
};

export default ReminderSettings;

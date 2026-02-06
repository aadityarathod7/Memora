import { useState, useEffect } from 'react';
import { getDailyPrompts } from '../services/api';
import {
  Lightbulb,
  Loader2,
  Feather,
  RefreshCw
} from 'lucide-react';

const PromptsPanel = ({ onClose, onSelectPrompt }) => {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState('');

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    setLoading(true);
    try {
      const res = await getDailyPrompts();
      setPrompts(res.data.prompts);
      setDate(res.data.date);
    } catch (err) {
      console.error('Failed to fetch prompts');
    } finally {
      setLoading(false);
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
          <Lightbulb size={20} style={{ color: 'var(--gold-accent)' }} />
          <h2 className="font-serif text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Writing Prompts
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

      {/* Date */}
      <div className="text-center">
        <p className="text-sm italic" style={{ color: 'var(--text-muted)' }}>
          Today's inspiration for {new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      {/* Prompts */}
      <div className="space-y-4">
        {prompts.map((prompt, index) => (
          <button
            key={index}
            onClick={() => onSelectPrompt(prompt)}
            className="w-full text-left p-6 rounded-xl transition-all hover:shadow-lg group"
            style={{
              background: 'var(--bg-paper)',
              border: '1px solid var(--border-light)'
            }}
          >
            <div className="flex items-start gap-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
                style={{ background: 'var(--app-accent-light)' }}
              >
                <Feather size={18} style={{ color: 'var(--app-accent)' }} />
              </div>
              <div className="flex-1">
                <p className="font-serif text-lg leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                  {prompt}
                </p>
                <p className="text-sm mt-2 italic opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--app-accent)' }}>
                  Click to start writing with this prompt
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Tip */}
      <div className="text-center p-4 rounded-xl" style={{ background: 'var(--bg-parchment)' }}>
        <p className="text-sm italic" style={{ color: 'var(--text-muted)' }}>
          New prompts appear every day. Check back tomorrow for fresh inspiration!
        </p>
      </div>
    </div>
  );
};

export default PromptsPanel;

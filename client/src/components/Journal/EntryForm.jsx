import { useState } from 'react';

const moods = [
  { value: 'happy', emoji: '&#128522;', label: 'Happy' },
  { value: 'grateful', emoji: '&#128591;', label: 'Grateful' },
  { value: 'calm', emoji: '&#128524;', label: 'Calm' },
  { value: 'excited', emoji: '&#129321;', label: 'Excited' },
  { value: 'hopeful', emoji: '&#127775;', label: 'Hopeful' },
  { value: 'neutral', emoji: '&#128528;', label: 'Neutral' },
  { value: 'tired', emoji: '&#128564;', label: 'Tired' },
  { value: 'anxious', emoji: '&#128543;', label: 'Anxious' },
  { value: 'sad', emoji: '&#128546;', label: 'Sad' },
  { value: 'frustrated', emoji: '&#128545;', label: 'Frustrated' },
];

const EntryForm = ({ onSubmit, loading }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('neutral');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    onSubmit({ title, content, mood });
    setTitle('');
    setContent('');
    setMood('neutral');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white/80 rounded-2xl shadow-soft p-6">
      <h2 className="text-2xl font-serif text-warm-800 mb-6">Write in Your Journal</h2>

      <div className="mb-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Give this entry a title..."
          className="w-full px-4 py-3 rounded-lg border border-warm-200 focus:border-warm-400 focus:ring-2 focus:ring-warm-200 outline-none transition-all bg-cream-50 font-serif text-lg"
          required
        />
      </div>

      <div className="mb-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind today? Share your thoughts, feelings, or what happened..."
          rows={6}
          className="w-full px-4 py-3 rounded-lg border border-warm-200 focus:border-warm-400 focus:ring-2 focus:ring-warm-200 outline-none transition-all bg-cream-50 resize-none text-warm-800 leading-relaxed"
          required
        />
      </div>

      <div className="mb-6">
        <label className="block text-warm-700 text-sm font-medium mb-3">
          How are you feeling?
        </label>
        <div className="flex flex-wrap gap-2">
          {moods.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setMood(m.value)}
              className={`px-3 py-2 rounded-full text-sm flex items-center gap-1 transition-all ${
                mood === m.value
                  ? 'bg-warm-500 text-white shadow-soft'
                  : 'bg-cream-100 text-warm-700 hover:bg-cream-200'
              }`}
            >
              <span dangerouslySetInnerHTML={{ __html: m.emoji }} />
              <span>{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !title.trim() || !content.trim()}
        className="w-full py-3 bg-warm-500 text-white rounded-lg font-medium hover:bg-warm-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Writing...</span>
          </>
        ) : (
          <>
            <span>&#128214;</span>
            <span>Save Entry</span>
          </>
        )}
      </button>
    </form>
  );
};

export default EntryForm;

const moodEmojis = {
  happy: '&#128522;',
  grateful: '&#128591;',
  calm: '&#128524;',
  excited: '&#129321;',
  hopeful: '&#127775;',
  neutral: '&#128528;',
  tired: '&#128564;',
  anxious: '&#128543;',
  sad: '&#128546;',
  frustrated: '&#128545;',
};

const EntryCard = ({ entry, onDelete, isExpanded, onToggle }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white/80 rounded-xl shadow-soft overflow-hidden transition-all hover:shadow-warm">
      {/* Header */}
      <div
        className="p-4 cursor-pointer flex items-center justify-between"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <span
            className="text-2xl"
            dangerouslySetInnerHTML={{ __html: moodEmojis[entry.mood] || moodEmojis.neutral }}
          />
          <div>
            <h3 className="font-serif text-lg text-warm-800">{entry.title}</h3>
            <p className="text-sm text-warm-500">{formatDate(entry.createdAt)}</p>
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-warm-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-warm-100">
          {/* Entry Content */}
          <div className="mt-4 mb-4">
            <p className="text-warm-700 leading-relaxed whitespace-pre-wrap">{entry.content}</p>
          </div>

          {/* AI Response */}
          {entry.aiResponse && (
            <div className="bg-gradient-to-br from-warm-50 to-cream-50 rounded-lg p-4 border border-warm-100 mb-4">
              <p className="text-xs text-warm-500 font-medium mb-2">Book Companion's response:</p>
              <p className="text-warm-700 font-serif italic">{entry.aiResponse}</p>
            </div>
          )}

          {/* Delete Button */}
          <div className="flex justify-end">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm('Are you sure you want to delete this entry?')) {
                  onDelete(entry._id);
                }
              }}
              className="text-sm text-red-400 hover:text-red-600 transition-colors"
            >
              Delete Entry
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EntryCard;

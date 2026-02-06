const AIResponse = ({ response, isNew }) => {
  if (!response) return null;

  return (
    <div className={`bg-gradient-to-br from-warm-100 to-cream-100 rounded-2xl p-6 border border-warm-200 ${isNew ? 'animate-fade-in' : ''}`}>
      <div className="flex items-start gap-4">
        {/* Book Avatar */}
        <div className="flex-shrink-0 w-12 h-12 bg-warm-500 rounded-full flex items-center justify-center shadow-soft">
          <svg className="w-6 h-6 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
        </div>

        {/* Response Content */}
        <div className="flex-1">
          <p className="text-sm text-warm-500 font-medium mb-2">Your Book Companion says...</p>
          <p className="text-warm-800 leading-relaxed font-serif text-lg">
            {response}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIResponse;

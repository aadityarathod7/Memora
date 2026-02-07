import { useState } from 'react';
import { Sparkles, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { generateReflectionQuestions } from '../services/api';

const ReflectionQuestions = ({ entryId, existingQuestions, onQuestionClick }) => {
  const [questions, setQuestions] = useState(existingQuestions || []);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleGenerate = async () => {
    if (!entryId) return;

    setLoading(true);
    try {
      const res = await generateReflectionQuestions(entryId);
      setQuestions(res.data.questions || []);
      setExpanded(true);
    } catch (err) {
      console.error('Failed to generate reflection questions');
    } finally {
      setLoading(false);
    }
  };

  if (!entryId) return null;

  return (
    <div className="mt-6">
      {questions.length === 0 ? (
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:shadow-md disabled:opacity-50"
          style={{
            background: 'linear-gradient(135deg, var(--app-accent-light) 0%, var(--bg-parchment) 100%)',
            color: 'var(--app-accent-dark)',
            border: '1px solid var(--app-accent)'
          }}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm font-serif">Generating questions...</span>
            </>
          ) : (
            <>
              <Sparkles size={16} />
              <span className="text-sm font-serif">Get reflection questions</span>
            </>
          )}
        </button>
      ) : (
        <div className="rounded-lg overflow-hidden" style={{ background: 'var(--bg-parchment)', border: '1px solid var(--border-light)' }}>
          {/* Header */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between p-3 hover:bg-opacity-50 transition-colors"
            style={{ background: 'var(--app-accent-light)' }}
          >
            <div className="flex items-center gap-2">
              <Sparkles size={16} style={{ color: 'var(--app-accent)' }} />
              <span className="font-serif font-medium" style={{ color: 'var(--app-accent-dark)' }}>
                Reflection Questions
              </span>
            </div>
            {expanded ? (
              <ChevronUp size={18} style={{ color: 'var(--app-accent)' }} />
            ) : (
              <ChevronDown size={18} style={{ color: 'var(--app-accent)' }} />
            )}
          </button>

          {/* Questions list */}
          {expanded && (
            <div className="p-4 space-y-3">
              {questions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => onQuestionClick && onQuestionClick(question)}
                  className="w-full text-left p-3 rounded-lg transition-all hover:shadow-sm group"
                  style={{ background: 'var(--bg-paper)', border: '1px solid var(--border-light)' }}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium"
                      style={{ background: 'var(--app-accent)', color: 'white' }}
                    >
                      {index + 1}
                    </span>
                    <p className="text-sm leading-relaxed group-hover:text-opacity-80" style={{ color: 'var(--text-primary)' }}>
                      {question}
                    </p>
                  </div>
                </button>
              ))}

              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
                style={{ color: 'var(--text-muted)' }}
              >
                {loading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Sparkles size={14} />
                )}
                Generate new questions
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReflectionQuestions;

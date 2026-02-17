import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookMarked, Mail, KeyRound, User, ArrowRight, ArrowLeft, Sparkles, Feather, Star } from 'lucide-react';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signup, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      navigate('/journal');
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await signup(name, email, password);
      // Don't navigate here - let the useEffect handle it when user is set
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ background: 'var(--bg-cream)' }}>
      <div className="w-full max-w-md">
        {/* Book-styled card */}
        <div className="relative">
          {/* Book spine effect */}
          <div className="absolute left-0 top-4 bottom-4 w-3 book-spine rounded-l-md hidden sm:block"></div>

          <div className="journal-entry rounded-2xl p-6 sm:p-8 relative sm:ml-3" style={{ background: 'var(--bg-paper)' }}>
            {/* Gold bookmark ribbon */}
            <div className="absolute -top-2 right-8 w-5 h-16 rounded-b-sm" style={{ background: 'linear-gradient(180deg, var(--gold-accent) 0%, #B8994F 100%)' }}>
              <div className="absolute bottom-0 left-0 right-0 h-4" style={{ background: 'inherit', clipPath: 'polygon(0 0, 50% 100%, 100% 0)' }}></div>
            </div>

            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto rounded-xl flex items-center justify-center mb-4 shadow-md" style={{ background: 'linear-gradient(135deg, var(--book-spine) 0%, var(--app-accent-dark) 100%)' }}>
                <Sparkles size={32} className="text-white" />
              </div>

              <div className="chapter-divider mb-4">
                <Star size={10} style={{ color: 'var(--gold-accent)' }} />
              </div>

              <h1 className="text-2xl sm:text-3xl font-serif font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Begin Your Story</h1>
              <p className="font-serif italic" style={{ color: 'var(--text-secondary)' }}>Create your personal Memora</p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-serif border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-serif font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Your name
                </label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl outline-none transition-all"
                    style={{
                      border: '2px solid var(--border-light)',
                      background: 'var(--bg-parchment)',
                      color: 'var(--text-primary)',
                      fontFamily: "'EB Garamond', Georgia, serif"
                    }}
                    placeholder="What should we call you?"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-serif font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Email address
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl outline-none transition-all"
                    style={{
                      border: '2px solid var(--border-light)',
                      background: 'var(--bg-parchment)',
                      color: 'var(--text-primary)',
                      fontFamily: "'EB Garamond', Georgia, serif"
                    }}
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-serif font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Password
                </label>
                <div className="relative">
                  <KeyRound size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl outline-none transition-all"
                    style={{
                      border: '2px solid var(--border-light)',
                      background: 'var(--bg-parchment)',
                      color: 'var(--text-primary)',
                      fontFamily: "'EB Garamond', Georgia, serif"
                    }}
                    placeholder="At least 6 characters"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-serif font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Confirm password
                </label>
                <div className="relative">
                  <KeyRound size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl outline-none transition-all"
                    style={{
                      border: '2px solid var(--border-light)',
                      background: 'var(--bg-parchment)',
                      color: 'var(--text-primary)',
                      fontFamily: "'EB Garamond', Georgia, serif"
                    }}
                    placeholder="Type password again"
                    required
                  />
                </div>
              </div>

              <div className="chapter-divider pt-2">
                <Feather size={12} style={{ color: 'var(--gold-accent)' }} />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 btn-accent text-white rounded-xl font-medium shadow-lg text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
              >
                {loading ? 'Creating your journal...' : (
                  <>
                    Start Your Journey
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>

            <p className="text-center mt-8 font-serif" style={{ color: 'var(--text-secondary)' }}>
              Already have a journal?{' '}
              <Link to="/login" className="font-medium hover:underline" style={{ color: 'var(--app-accent-dark)' }}>
                Open it
              </Link>
            </p>

            <Link to="/" className="flex items-center justify-center gap-1 mt-4 text-sm hover:opacity-80 transition-opacity font-serif" style={{ color: 'var(--text-muted)' }}>
              <ArrowLeft size={16} />
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;

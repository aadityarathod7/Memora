import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookMarked, Mail, KeyRound, ArrowRight, ArrowLeft, Feather, Star } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, user, loading: authLoading } = useAuth();
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
    setLoading(true);

    try {
      await login(email, password);
      // Don't navigate here - let the useEffect handle it when user is set
    } catch (err) {
      setError(err.response?.data?.message || 'Could not log in. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-cream)' }}>
      <div className="w-full max-w-md">
        {/* Book-styled card */}
        <div className="relative">
          {/* Book spine effect */}
          <div className="absolute left-0 top-4 bottom-4 w-3 book-spine rounded-l-md hidden sm:block"></div>

          <div className="journal-entry rounded-2xl p-8 relative sm:ml-3" style={{ background: 'var(--bg-paper)' }}>
            {/* Gold bookmark ribbon */}
            <div className="absolute -top-2 right-8 w-5 h-16 rounded-b-sm" style={{ background: 'linear-gradient(180deg, var(--gold-accent) 0%, #B8994F 100%)' }}>
              <div className="absolute bottom-0 left-0 right-0 h-4" style={{ background: 'inherit', clipPath: 'polygon(0 0, 50% 100%, 100% 0)' }}></div>
            </div>

            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto rounded-xl flex items-center justify-center mb-4 shadow-md" style={{ background: 'linear-gradient(135deg, var(--book-spine) 0%, var(--app-accent-dark) 100%)' }}>
                <BookMarked size={32} className="text-white" />
              </div>

              <div className="chapter-divider mb-4">
                <Star size={10} style={{ color: 'var(--gold-accent)' }} />
              </div>

              <h1 className="text-3xl font-serif font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Welcome Back</h1>
              <p className="font-serif italic" style={{ color: 'var(--text-secondary)' }}>Your memories await you</p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-serif border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
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
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              <div className="chapter-divider">
                <Feather size={12} style={{ color: 'var(--gold-accent)' }} />
              </div>

              <div className="text-right mb-4">
                <Link to="/forgot-password" className="text-sm font-serif hover:underline" style={{ color: 'var(--app-accent)' }}>
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 btn-accent text-white rounded-xl font-medium shadow-lg text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? 'Opening your journal...' : (
                  <>
                    Open Memora
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>

            <p className="text-center mt-8 font-serif" style={{ color: 'var(--text-secondary)' }}>
              New to Memora?{' '}
              <Link to="/signup" className="font-medium hover:underline" style={{ color: 'var(--app-accent-dark)' }}>
                Begin your story
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

export default Login;

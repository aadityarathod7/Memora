import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookMarked, Mail, KeyRound, User, ArrowRight, ArrowLeft, Sparkles, Feather, Star, CheckCircle } from 'lucide-react';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState('');

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
      const response = await signup(name, email, password);
      console.log('Signup response:', response); // Debug log

      // Check if response indicates email verification is needed
      if (response?.requiresVerification) {
        // Redirect to OTP verification page
        navigate('/verify-otp', { state: { email } });
      } else if (response?.message && response.message.includes('verify')) {
        // Fallback: show success message if requiresVerification not set
        setSignupSuccess(true);
        setUserEmail(email);
        setLoading(false);
      } else {
        // User is logged in immediately (old flow or verification disabled)
        // Let the useEffect handle navigation when user is set
        setLoading(false);
      }
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

            {signupSuccess ? (
              <div className="text-center py-4">
                <CheckCircle size={64} className="mx-auto mb-4" style={{ color: '#22c55e' }} />
                <h2 className="font-serif text-xl mb-3" style={{ color: 'var(--text-primary)' }}>
                  Check Your Email!
                </h2>
                <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                  We've sent a verification link to <strong>{userEmail}</strong>
                </p>
                <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                  Please check your inbox and click the verification link to activate your account. The link will expire in 24 hours.
                </p>
                <div className="space-y-3">
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Didn't receive the email?
                  </p>
                  <Link
                    to="/resend-verification"
                    className="inline-block px-6 py-3 rounded-lg font-medium"
                    style={{
                      color: 'var(--app-accent-dark)',
                      background: 'var(--bg-parchment)',
                      border: '1px solid var(--border-light)'
                    }}
                  >
                    Resend Verification Email
                  </Link>
                </div>
              </div>
            ) : (
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
            )}

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

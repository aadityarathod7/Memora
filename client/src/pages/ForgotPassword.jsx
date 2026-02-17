import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axios.post('/api/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-cream)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl sm:text-4xl mb-2" style={{ color: 'var(--app-accent)' }}>
            Memora
          </h1>
          <p className="font-serif italic" style={{ color: 'var(--text-muted)' }}>
            Where memories talk back
          </p>
        </div>

        <div className="book-page rounded-lg p-6 sm:p-8 shadow-lg" style={{ background: 'var(--bg-paper)' }}>
          {sent ? (
            <div className="text-center">
              <CheckCircle size={64} className="mx-auto mb-4" style={{ color: '#22c55e' }} />
              <h2 className="font-serif text-xl sm:text-2xl mb-3" style={{ color: 'var(--text-primary)' }}>
                Check Your Email
              </h2>
              <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
                If an account exists for <strong>{email}</strong>, you will receive a password reset link shortly.
              </p>
              <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                Didn't receive the email? Check your spam folder or try again.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm font-serif"
                style={{ color: 'var(--app-accent)' }}
              >
                <ArrowLeft size={16} />
                Back to login
              </Link>
            </div>
          ) : (
            <>
              <h2 className="font-serif text-xl sm:text-2xl mb-2" style={{ color: 'var(--text-primary)' }}>
                Reset Password
              </h2>
              <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                Enter your email address and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-lg outline-none border"
                      style={{
                        background: 'var(--bg-parchment)',
                        borderColor: 'var(--border-light)',
                        color: 'var(--text-primary)'
                      }}
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-lg text-sm" style={{ background: '#fee', color: '#c00' }}>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full py-3 rounded-lg font-serif font-medium transition-all disabled:opacity-50"
                  style={{
                    background: 'var(--app-accent)',
                    color: 'white'
                  }}
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-sm font-serif"
                  style={{ color: 'var(--app-accent)' }}
                >
                  <ArrowLeft size={16} />
                  Back to login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

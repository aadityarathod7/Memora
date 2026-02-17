import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import axios from 'axios';

const ResendVerification = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axios.post('/api/auth/resend-verification', { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send verification email');
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
                Verification Email Sent
              </h2>
              <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
                We've sent a new verification link to <strong>{email}</strong>. Please check your inbox and spam folder.
              </p>
              <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                The link will expire in 24 hours.
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
                Resend Verification Email
              </h2>
              <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                Enter your email address and we'll send you a new verification link.
              </p>

              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4 text-sm">
                  {error}
                </div>
              )}

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
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 btn-accent text-white rounded-lg font-medium disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send Verification Email'}
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

export default ResendVerification;

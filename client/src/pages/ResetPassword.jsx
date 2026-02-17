import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft, CheckCircle, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await axios.post(`/api/auth/reset-password/${token}`, { password });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
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
          {success ? (
            <div className="text-center">
              <CheckCircle size={64} className="mx-auto mb-4" style={{ color: '#22c55e' }} />
              <h2 className="font-serif text-xl sm:text-2xl mb-3" style={{ color: 'var(--text-primary)' }}>
                Password Reset Successful
              </h2>
              <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
                Your password has been reset. You can now log in with your new password.
              </p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Redirecting to login page...
              </p>
            </div>
          ) : (
            <>
              <h2 className="font-serif text-xl sm:text-2xl mb-2" style={{ color: 'var(--text-primary)' }}>
                Create New Password
              </h2>
              <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                Enter your new password below.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    New Password
                  </label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-10 pr-12 py-3 rounded-lg outline-none border"
                      style={{
                        background: 'var(--bg-parchment)',
                        borderColor: 'var(--border-light)',
                        color: 'var(--text-primary)'
                      }}
                      placeholder="At least 6 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-lg outline-none border"
                      style={{
                        background: 'var(--bg-parchment)',
                        borderColor: 'var(--border-light)',
                        color: 'var(--text-primary)'
                      }}
                      placeholder="Re-enter password"
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
                  disabled={loading || !password || !confirmPassword}
                  className="w-full py-3 rounded-lg font-serif font-medium transition-all disabled:opacity-50"
                  style={{
                    background: 'var(--app-accent)',
                    color: 'white'
                  }}
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
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

export default ResetPassword;

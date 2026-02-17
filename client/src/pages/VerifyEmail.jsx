import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import axios from 'axios';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    verifyEmail();
  }, [token]);

  const verifyEmail = async () => {
    try {
      const response = await axios.get(`/api/auth/verify-email/${token}`);
      setStatus('success');
      setMessage(response.data.message);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Email verification failed');
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
          {status === 'verifying' && (
            <div className="text-center">
              <Loader2 size={64} className="mx-auto mb-4 animate-spin" style={{ color: 'var(--app-accent)' }} />
              <h2 className="font-serif text-xl sm:text-2xl mb-3" style={{ color: 'var(--text-primary)' }}>
                Verifying Email
              </h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                Please wait while we verify your email address...
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <CheckCircle size={64} className="mx-auto mb-4" style={{ color: '#22c55e' }} />
              <h2 className="font-serif text-xl sm:text-2xl mb-3" style={{ color: 'var(--text-primary)' }}>
                Email Verified!
              </h2>
              <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
                {message}
              </p>
              <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                Redirecting to login page...
              </p>
              <Link
                to="/login"
                className="inline-block px-6 py-3 btn-accent text-white rounded-lg font-medium"
              >
                Go to Login
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <XCircle size={64} className="mx-auto mb-4" style={{ color: '#ef4444' }} />
              <h2 className="font-serif text-xl sm:text-2xl mb-3" style={{ color: 'var(--text-primary)' }}>
                Verification Failed
              </h2>
              <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
                {message}
              </p>
              <div className="space-y-3">
                <Link
                  to="/resend-verification"
                  className="block px-6 py-3 btn-accent text-white rounded-lg font-medium"
                >
                  Request New Verification Email
                </Link>
                <Link
                  to="/login"
                  className="block px-6 py-3 rounded-lg font-medium"
                  style={{
                    color: 'var(--app-accent-dark)',
                    background: 'var(--bg-parchment)',
                    border: '1px solid var(--border-light)'
                  }}
                >
                  Back to Login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;

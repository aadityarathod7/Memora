import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, Mail, ArrowLeft } from 'lucide-react';
import axios from 'axios';

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resending, setResending] = useState(false);

  // Redirect if no email provided
  useEffect(() => {
    if (!email) {
      navigate('/signup');
    }
  }, [email, navigate]);

  const handleOtpChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(0, 1); // Only take first character
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();

    // Check if pasted data is 6 digits
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      // Focus last input
      const lastInput = document.getElementById('otp-5');
      if (lastInput) lastInput.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const otpCode = otp.join('');

    if (otpCode.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setLoading(true);

    try {
      await axios.post('/api/auth/verify-email', { email, otp: otpCode });
      setSuccess(true);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please try again.');
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setResending(true);

    try {
      await axios.post('/api/auth/resend-verification', { email });
      setError(''); // Clear any errors
      // Show success message by temporarily using error field with success style
      setOtp(['', '', '', '', '', '']); // Clear OTP inputs
      const firstInput = document.getElementById('otp-0');
      if (firstInput) firstInput.focus();

      // You might want to show a success message here
      alert('New verification code sent! Please check your email.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code');
    } finally {
      setResending(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-cream)' }}>
        <div className="w-full max-w-md">
          <div className="book-page rounded-lg p-6 sm:p-8 shadow-lg" style={{ background: 'var(--bg-paper)' }}>
            <div className="text-center">
              <CheckCircle size={64} className="mx-auto mb-4" style={{ color: '#22c55e' }} />
              <h2 className="font-serif text-xl sm:text-2xl mb-3" style={{ color: 'var(--text-primary)' }}>
                Email Verified!
              </h2>
              <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                Your account has been successfully verified.
              </p>
              <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                Redirecting to login page...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-cream)' }}>
      <div className="w-full max-w-md">
        <div className="relative">
          {/* Book spine effect */}
          <div className="absolute left-0 top-4 bottom-4 w-3 book-spine rounded-l-md hidden sm:block"></div>

          <div className="journal-entry rounded-2xl p-6 sm:p-8 relative sm:ml-3" style={{ background: 'var(--bg-paper)' }}>
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto rounded-xl flex items-center justify-center mb-4 shadow-md" style={{ background: 'linear-gradient(135deg, var(--book-spine) 0%, var(--app-accent-dark) 100%)' }}>
                <Mail size={32} className="text-white" />
              </div>

              <h1 className="text-2xl sm:text-3xl font-serif font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                Verify Your Email
              </h1>
              <p className="font-serif mb-2" style={{ color: 'var(--text-secondary)' }}>
                We've sent a 6-digit code to
              </p>
              <p className="font-serif font-semibold" style={{ color: 'var(--app-accent-dark)' }}>
                {email}
              </p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-serif border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-center text-sm font-serif font-medium mb-4" style={{ color: 'var(--text-secondary)' }}>
                  Enter verification code
                </label>

                {/* OTP Input boxes */}
                <div className="flex gap-2 justify-center">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold rounded-xl outline-none transition-all"
                      style={{
                        border: '2px solid var(--border-light)',
                        background: 'var(--bg-parchment)',
                        color: 'var(--text-primary)',
                        fontFamily: "'Courier New', monospace"
                      }}
                      required
                    />
                  ))}
                </div>

                <p className="text-center text-xs mt-4" style={{ color: 'var(--text-muted)' }}>
                  Code expires in 10 minutes
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || otp.join('').length !== 6}
                className="w-full py-4 btn-accent text-white rounded-xl font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify Email'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm font-serif mb-3" style={{ color: 'var(--text-secondary)' }}>
                Didn't receive the code?
              </p>
              <button
                onClick={handleResend}
                disabled={resending}
                className="text-sm font-serif font-medium hover:underline disabled:opacity-50"
                style={{ color: 'var(--app-accent-dark)' }}
              >
                {resending ? 'Sending...' : 'Resend Code'}
              </button>
            </div>

            <Link to="/signup" className="flex items-center justify-center gap-1 mt-6 text-sm hover:opacity-80 transition-opacity font-serif" style={{ color: 'var(--text-muted)' }}>
              <ArrowLeft size={16} />
              Back to signup
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;

import { useState, useEffect, useRef } from 'react';
import { Lock, Fingerprint, X, Check, Loader2, BookMarked } from 'lucide-react';
import { getPinStatus, setPin, verifyPin, disablePin } from '../services/api';

// PIN Lock Screen Component
export const PINLockScreen = ({ onUnlock }) => {
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const inputRefs = useRef([]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value.slice(-1);
    setPin(newPin);
    setError('');

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when complete
    if (newPin.every(d => d) && index === 3) {
      handleVerify(newPin.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (pinCode) => {
    setVerifying(true);
    try {
      const res = await verifyPin(pinCode);
      if (res.data.verified) {
        onUnlock();
      } else {
        setError('Incorrect PIN');
        setPin(['', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      setError('Failed to verify PIN');
      setPin(['', '', '', '']);
    } finally {
      setVerifying(false);
    }
  };

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'var(--bg-cream)' }}>
      <div className="text-center p-8 max-w-sm w-full">
        {/* Logo */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, var(--book-spine) 0%, var(--app-accent-dark) 100%)' }}>
          <BookMarked size={36} className="text-white" />
        </div>

        <h1 className="font-serif text-2xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
          Welcome Back
        </h1>
        <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
          Enter your PIN to unlock Memora
        </p>

        {/* PIN Input */}
        <div className="flex justify-center gap-3 mb-6">
          {pin.map((digit, index) => (
            <input
              key={index}
              ref={el => inputRefs.current[index] = el}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              disabled={verifying}
              className="w-14 h-14 text-center text-2xl font-mono rounded-xl outline-none transition-all"
              style={{
                background: 'var(--bg-paper)',
                border: error ? '2px solid #ef4444' : '2px solid var(--border-light)',
                color: 'var(--text-primary)'
              }}
            />
          ))}
        </div>

        {error && (
          <p className="text-sm mb-4" style={{ color: '#ef4444' }}>{error}</p>
        )}

        {verifying && (
          <div className="flex items-center justify-center gap-2" style={{ color: 'var(--app-accent)' }}>
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm">Verifying...</span>
          </div>
        )}
      </div>
    </div>
  );
};

// PIN Settings Component
export const PINSettings = ({ onClose }) => {
  const [status, setStatus] = useState({ enabled: false, biometricEnabled: false });
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('view'); // 'view', 'set', 'disable'
  const [newPin, setNewPin] = useState(['', '', '', '']);
  const [confirmPin, setConfirmPin] = useState(['', '', '', '']);
  const [currentPin, setCurrentPin] = useState(['', '', '', '']);
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await getPinStatus();
      setStatus(res.data);
    } catch (err) {
      console.error('Failed to get PIN status');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (setter, array, index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newArray = [...array];
    newArray[index] = value.slice(-1);
    setter(newArray);
    setError('');

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (array, index, e) => {
    if (e.key === 'Backspace' && !array[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSetPin = async () => {
    if (step === 1) {
      if (!newPin.every(d => d)) {
        setError('Please enter a complete PIN');
        return;
      }
      setStep(2);
      setConfirmPin(['', '', '', '']);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } else {
      if (newPin.join('') !== confirmPin.join('')) {
        setError('PINs do not match');
        setConfirmPin(['', '', '', '']);
        inputRefs.current[0]?.focus();
        return;
      }

      setSaving(true);
      try {
        await setPin(newPin.join(''));
        setStatus({ enabled: true, biometricEnabled: false });
        setMode('view');
        resetInputs();
      } catch (err) {
        setError('Failed to set PIN');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleDisablePin = async () => {
    if (!currentPin.every(d => d)) {
      setError('Please enter your current PIN');
      return;
    }

    setSaving(true);
    try {
      const res = await disablePin(currentPin.join(''));
      setStatus({ enabled: false, biometricEnabled: false });
      setMode('view');
      resetInputs();
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Incorrect PIN');
        setCurrentPin(['', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        setError('Failed to disable PIN');
      }
    } finally {
      setSaving(false);
    }
  };

  const resetInputs = () => {
    setNewPin(['', '', '', '']);
    setConfirmPin(['', '', '', '']);
    setCurrentPin(['', '', '', '']);
    setStep(1);
    setError('');
  };

  const renderPinInputs = (array, setter) => (
    <div className="flex justify-center gap-3 mb-4">
      {array.map((digit, index) => (
        <input
          key={index}
          ref={el => inputRefs.current[index] = el}
          type="password"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleInputChange(setter, array, index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(array, index, e)}
          disabled={saving}
          className="w-12 h-12 text-center text-xl font-mono rounded-lg outline-none transition-all"
          style={{
            background: 'var(--bg-paper)',
            border: error ? '2px solid #ef4444' : '2px solid var(--border-light)',
            color: 'var(--text-primary)'
          }}
        />
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={24} className="animate-spin" style={{ color: 'var(--app-accent)' }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Lock size={20} style={{ color: 'var(--gold-accent)' }} />
        <h3 className="font-serif text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          PIN Lock
        </h3>
      </div>

      {mode === 'view' && (
        <>
          <div className="p-4 rounded-lg" style={{ background: 'var(--bg-parchment)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  {status.enabled ? 'PIN lock enabled' : 'PIN lock disabled'}
                </p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {status.enabled ? 'Your journal is protected' : 'Add extra security to your journal'}
                </p>
              </div>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: status.enabled ? '#22c55e' : 'var(--bg-paper)' }}
              >
                <Lock size={20} style={{ color: status.enabled ? 'white' : 'var(--text-muted)' }} />
              </div>
            </div>
          </div>

          {status.enabled ? (
            <button
              onClick={() => { setMode('disable'); resetInputs(); }}
              className="w-full py-3 rounded-lg font-medium"
              style={{ background: '#ef4444', color: 'white' }}
            >
              Disable PIN Lock
            </button>
          ) : (
            <button
              onClick={() => { setMode('set'); resetInputs(); }}
              className="w-full py-3 rounded-lg font-medium"
              style={{ background: 'var(--app-accent)', color: 'white' }}
            >
              Set Up PIN Lock
            </button>
          )}
        </>
      )}

      {mode === 'set' && (
        <div className="text-center">
          <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
            {step === 1 ? 'Enter a 4-digit PIN' : 'Confirm your PIN'}
          </p>

          {step === 1
            ? renderPinInputs(newPin, setNewPin)
            : renderPinInputs(confirmPin, setConfirmPin)
          }

          {error && <p className="text-sm mb-4" style={{ color: '#ef4444' }}>{error}</p>}

          <div className="flex gap-3">
            <button
              onClick={() => { setMode('view'); resetInputs(); }}
              className="flex-1 py-2 rounded-lg"
              style={{ background: 'var(--bg-parchment)', color: 'var(--text-secondary)' }}
            >
              Cancel
            </button>
            <button
              onClick={handleSetPin}
              disabled={saving}
              className="flex-1 py-2 rounded-lg flex items-center justify-center gap-2"
              style={{ background: 'var(--app-accent)', color: 'white' }}
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : null}
              {step === 1 ? 'Next' : 'Set PIN'}
            </button>
          </div>
        </div>
      )}

      {mode === 'disable' && (
        <div className="text-center">
          <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
            Enter your current PIN to disable
          </p>

          {renderPinInputs(currentPin, setCurrentPin)}

          {error && <p className="text-sm mb-4" style={{ color: '#ef4444' }}>{error}</p>}

          <div className="flex gap-3">
            <button
              onClick={() => { setMode('view'); resetInputs(); }}
              className="flex-1 py-2 rounded-lg"
              style={{ background: 'var(--bg-parchment)', color: 'var(--text-secondary)' }}
            >
              Cancel
            </button>
            <button
              onClick={handleDisablePin}
              disabled={saving}
              className="flex-1 py-2 rounded-lg flex items-center justify-center gap-2"
              style={{ background: '#ef4444', color: 'white' }}
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : null}
              Disable
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PINLockScreen;

import React, { useState } from 'react';
import { Phone, KeyRound, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../../shared/components/Button';
import { Input } from '../../shared/components/Input';
import { authApi } from '../../services/api/authApi';
import { useAuth } from '../../services/auth/AuthProvider';

export const CitizenLogin = ({ onSuccess }) => {
  const [mobile, setMobile] = useState('9876543210');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1: Enter mobile, 2: Enter OTP
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [devNote, setDevNote] = useState(null);

  const { login } = useAuth();

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!mobile.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await authApi.requestCitizenOtp(mobile.trim());
      setDevNote(res.devNote || 'OTP sent. Enter the code received on your phone.');
      setStep(2);
      setOtp(''); // User types the 6-digit OTP code received
    } catch (err) {
      setError(err.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await authApi.verifyCitizenOtp(mobile.trim(), otp.trim());
      login(res.user, res.token);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {step === 1 ? (
        <form onSubmit={handleRequestOtp} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div>
            <h3 style={{ fontSize: 'var(--font-xl)', fontWeight: 900, color: 'var(--color-text-primary)' }}>
              CITIZEN LOGIN
            </h3>
            <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              Sign in with your 10-digit mobile number to track, verify, and support civic issues.
            </p>
          </div>

          {error && (
            <div style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: 'var(--color-status-danger)', fontSize: 'var(--font-xs)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <Input
            label="Mobile Number"
            icon={Phone}
            placeholder="e.g. 9876543210"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            required
          />

          <Button type="submit" variant="primary" icon={ArrowRight} disabled={loading}>
            {loading ? 'SENDING OTP...' : 'REQUEST OTP'}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div>
            <h3 style={{ fontSize: 'var(--font-xl)', fontWeight: 900, color: 'var(--color-text-primary)' }}>
              VERIFY OTP
            </h3>
            <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              Enter 6-digit OTP sent to <strong>{mobile}</strong>
            </p>
          </div>

          {devNote && (
            <div style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-brand-subtle)', color: 'var(--color-brand-primary)', fontSize: 'var(--font-xs)', fontWeight: 700 }}>
              💡 {devNote}
            </div>
          )}

          {error && (
            <div style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: 'var(--color-status-danger)', fontSize: 'var(--font-xs)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <Input
            label="6-Digit OTP"
            icon={KeyRound}
            placeholder="123456"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />

          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <Button type="button" variant="secondary" onClick={() => setStep(1)} style={{ flex: 1 }}>
              Change Number
            </Button>
            <Button type="submit" variant="primary" icon={CheckCircle2} disabled={loading} style={{ flex: 2 }}>
              {loading ? 'VERIFYING...' : 'VERIFY & SIGN IN'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

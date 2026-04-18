import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Fingerprint, Delete, Lock, ShieldCheck } from 'lucide-react';

interface PinLockScreenProps {
  mode: 'unlock' | 'setup' | 'confirm';
  onUnlock: () => void;
  onSetupComplete?: (pin: string) => void;
  onCancel?: () => void;
  storedPinHash?: string;
  biometricAvailable?: boolean;
  onBiometricAttempt?: () => void;
}

// Simple hash for PIN (not crypto-grade, but fine for local app lock)
async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin + '_borrow_manager_salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export { hashPin };

export function PinLockScreen({ 
  mode, 
  onUnlock, 
  onSetupComplete, 
  onCancel,
  storedPinHash, 
  biometricAvailable, 
  onBiometricAttempt 
}: PinLockScreenProps) {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [phase, setPhase] = useState<'enter' | 'confirm'>('enter');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const maxDigits = 4;

  const handleDigit = useCallback((digit: string) => {
    if (mode === 'setup') {
      if (phase === 'enter') {
        if (pin.length < maxDigits) {
          const newPin = pin + digit;
          setPin(newPin);
          setError('');
          if (newPin.length === maxDigits) {
            setTimeout(() => {
              setPhase('confirm');
              setConfirmPin('');
            }, 300);
          }
        }
      } else {
        if (confirmPin.length < maxDigits) {
          const newConfirm = confirmPin + digit;
          setConfirmPin(newConfirm);
          setError('');
          if (newConfirm.length === maxDigits) {
            if (newConfirm === pin) {
              setSuccess(true);
              setTimeout(() => {
                onSetupComplete?.(pin);
              }, 500);
            } else {
              setError('PINs do not match. Try again.');
              setTimeout(() => {
                setPhase('enter');
                setPin('');
                setConfirmPin('');
              }, 1000);
            }
          }
        }
      }
    } else {
      // unlock mode
      if (pin.length < maxDigits) {
        const newPin = pin + digit;
        setPin(newPin);
        setError('');
        if (newPin.length === maxDigits) {
          hashPin(newPin).then(hash => {
            if (hash === storedPinHash) {
              setSuccess(true);
              setTimeout(() => onUnlock(), 400);
            } else {
              setError('Incorrect PIN');
              setTimeout(() => setPin(''), 600);
            }
          });
        }
      }
    }
  }, [pin, confirmPin, phase, mode, storedPinHash, onUnlock, onSetupComplete]);

  const handleDelete = useCallback(() => {
    setError('');
    if (mode === 'setup' && phase === 'confirm') {
      setConfirmPin(prev => prev.slice(0, -1));
    } else {
      setPin(prev => prev.slice(0, -1));
    }
  }, [mode, phase]);

  // Keyboard support
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleDelete();
      } else if (e.key === 'Escape' && onCancel) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleDigit, handleDelete, onCancel]);

  const currentPin = mode === 'setup' && phase === 'confirm' ? confirmPin : pin;
  const title = mode === 'setup' 
    ? (phase === 'enter' ? 'Create Your PIN' : 'Confirm Your PIN')
    : 'Enter PIN to Unlock';
  const subtitle = mode === 'setup'
    ? (phase === 'enter' ? 'Choose a 4-digit PIN' : 'Re-enter the same PIN')
    : 'Your data is protected';

  const digits = ['1','2','3','4','5','6','7','8','9','bio','0','del'];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-br from-gray-950 via-indigo-950 to-gray-950"
    >
      {/* Decorative background circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-xs px-6">
        {/* Lock Icon */}
        <motion.div 
          className="w-20 h-20 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mb-6"
          animate={success ? { scale: [1, 1.2, 1], borderColor: '#22c55e' } : error ? { x: [-8, 8, -8, 8, 0] } : {}}
          transition={{ duration: 0.4 }}
        >
          {success ? (
            <ShieldCheck size={36} className="text-emerald-400" />
          ) : (
            <Lock size={36} className="text-indigo-400" />
          )}
        </motion.div>

        {/* Title */}
        <h1 className="text-xl font-black text-white mb-1 text-center">{title}</h1>
        <p className="text-sm text-gray-400 mb-8 text-center">{subtitle}</p>

        {/* PIN Dots */}
        <div className="flex gap-4 mb-4">
          {Array.from({ length: maxDigits }).map((_, i) => (
            <motion.div
              key={i}
              className={`w-4 h-4 rounded-full border-2 transition-colors duration-200 ${
                i < currentPin.length 
                  ? (error ? 'bg-rose-500 border-rose-500' : 'bg-indigo-400 border-indigo-400') 
                  : 'border-gray-600'
              }`}
              animate={i < currentPin.length ? { scale: [0.8, 1.2, 1] } : {}}
              transition={{ duration: 0.15 }}
            />
          ))}
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-rose-400 text-sm font-semibold mb-2 h-5"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
        {!error && <div className="h-7" />}

        {/* Number Pad */}
        <div className="grid grid-cols-3 gap-3 w-full">
          {digits.map((d) => {
            if (d === 'bio') {
              if (biometricAvailable && mode === 'unlock') {
                return (
                  <button
                    key="bio"
                    onClick={() => onBiometricAttempt?.()}
                    className="h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400 hover:bg-white/10 active:scale-95 transition-all"
                  >
                    <Fingerprint size={28} />
                  </button>
                );
              }
              return <div key="bio" className="h-16" />;
            }
            if (d === 'del') {
              return (
                <button
                  key="del"
                  onClick={handleDelete}
                  className="h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-white/10 active:scale-95 transition-all"
                >
                  <Delete size={24} />
                </button>
              );
            }
            return (
              <button
                key={d}
                onClick={() => handleDigit(d)}
                className="h-16 rounded-2xl bg-white/5 border border-white/10 text-white text-2xl font-bold hover:bg-white/10 active:scale-95 transition-all"
              >
                {d}
              </button>
            );
          })}
        </div>

        {/* Cancel button for setup mode */}
        {onCancel && (
          <button
            onClick={onCancel}
            className="mt-6 text-gray-500 text-sm font-semibold hover:text-gray-300 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </motion.div>
  );
}

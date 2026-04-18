import { useState, useEffect, useCallback } from 'react';
import { hashPin } from '../components/PinLockScreen';

const STORAGE_KEY = 'bm_pin_hash';
const BIOMETRIC_KEY = 'bm_biometric_enabled';

export function useAppLock() {
  const [isLocked, setIsLocked] = useState(false);
  const [pinHash, setPinHash] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY));
  const [biometricEnabled, setBiometricEnabled] = useState(() => localStorage.getItem(BIOMETRIC_KEY) === 'true');
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [isSettingUp, setIsSettingUp] = useState(false);

  const isPinEnabled = pinHash !== null;

  // Check WebAuthn availability
  useEffect(() => {
    if (window.PublicKeyCredential) {
      PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        .then(available => setBiometricAvailable(available))
        .catch(() => setBiometricAvailable(false));
    }
  }, []);

  // Lock on app load if PIN is set
  useEffect(() => {
    if (isPinEnabled) {
      setIsLocked(true);
    }
  }, []);

  // Lock on visibility change (user switches away from app)
  useEffect(() => {
    if (!isPinEnabled) return;
    
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        setIsLocked(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [isPinEnabled]);

  const unlock = useCallback(() => {
    setIsLocked(false);
  }, []);

  const setupPin = useCallback(async (newPin: string) => {
    const hash = await hashPin(newPin);
    localStorage.setItem(STORAGE_KEY, hash);
    setPinHash(hash);
    setIsSettingUp(false);
    setIsLocked(false);
  }, []);

  const removePin = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(BIOMETRIC_KEY);
    setPinHash(null);
    setBiometricEnabled(false);
    setIsLocked(false);
  }, []);

  const toggleBiometric = useCallback((val: boolean) => {
    localStorage.setItem(BIOMETRIC_KEY, String(val));
    setBiometricEnabled(val);
  }, []);

  const attemptBiometric = useCallback(async (): Promise<boolean> => {
    if (!biometricAvailable || !biometricEnabled) return false;

    try {
      // Use WebAuthn for platform authenticator (fingerprint/face)
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: { name: 'Borrow Manager', id: window.location.hostname || 'localhost' },
          user: {
            id: new Uint8Array(16),
            name: 'user@borrowmanager',
            displayName: 'Borrow Manager User'
          },
          pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required'
          },
          timeout: 60000
        }
      });

      if (credential) {
        unlock();
        return true;
      }
    } catch {
      // Biometric failed or dismissed
      console.log('Biometric authentication failed or was cancelled');
    }
    return false;
  }, [biometricAvailable, biometricEnabled, unlock]);

  return {
    isLocked,
    isPinEnabled,
    pinHash,
    biometricEnabled,
    biometricAvailable,
    isSettingUp,
    setIsSettingUp,
    unlock,
    setupPin,
    removePin,
    toggleBiometric,
    attemptBiometric,
  };
}

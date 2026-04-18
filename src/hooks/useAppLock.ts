import { useState, useEffect, useCallback } from 'react';
import { hashPin } from '../components/PinLockScreen';
import { NativeBiometric, BiometryType } from 'capacitor-native-biometric';

const STORAGE_KEY = 'bm_pin_hash';
const BIOMETRIC_KEY = 'bm_biometric_enabled';

export function useAppLock() {
  const [isLocked, setIsLocked] = useState(false);
  const [pinHash, setPinHash] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY));
  const [biometricEnabled, setBiometricEnabled] = useState(() => localStorage.getItem(BIOMETRIC_KEY) === 'true');
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometryType, setBiometryType] = useState<BiometryType>(BiometryType.NONE);
  const [isSettingUp, setIsSettingUp] = useState(false);

  const isPinEnabled = pinHash !== null;

  // Check native biometric availability
  useEffect(() => {
    NativeBiometric.isAvailable()
      .then((result) => {
        setBiometricAvailable(result.isAvailable);
        setBiometryType(result.biometryType);
      })
      .catch(() => {
        setBiometricAvailable(false);
        setBiometryType(BiometryType.NONE);
      });
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

  // Auto-trigger biometric on lock if enabled
  useEffect(() => {
    if (isLocked && isPinEnabled && biometricEnabled && biometricAvailable) {
      // Small delay so the lock screen renders first
      const timer = setTimeout(() => {
        attemptBiometric();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isLocked]);

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

  const toggleBiometric = useCallback(async (val: boolean) => {
    if (val) {
      // Verify biometric works before enabling
      try {
        await NativeBiometric.verifyIdentity({
          reason: 'Verify to enable biometric unlock',
          title: 'Enable Biometric',
          subtitle: 'Confirm your identity',
          description: 'Use your fingerprint or face to unlock Borrow Manager',
        });
        localStorage.setItem(BIOMETRIC_KEY, 'true');
        setBiometricEnabled(true);
      } catch {
        // User cancelled or biometric failed — don't enable
        console.log('Biometric verification failed, not enabling');
      }
    } else {
      localStorage.setItem(BIOMETRIC_KEY, 'false');
      setBiometricEnabled(false);
    }
  }, []);

  const attemptBiometric = useCallback(async (): Promise<boolean> => {
    if (!biometricAvailable || !biometricEnabled) return false;

    try {
      await NativeBiometric.verifyIdentity({
        reason: 'Unlock Borrow Manager',
        title: 'Unlock App',
        subtitle: 'Use biometric to unlock',
        description: 'Place your finger on the sensor or look at the camera',
        useFallback: false, // Don't show device PIN fallback — user can use our PIN
        maxAttempts: 3,
      });
      // Biometric passed!
      unlock();
      return true;
    } catch {
      // Biometric failed or dismissed — user can still enter PIN
      console.log('Biometric authentication failed or was cancelled');
    }
    return false;
  }, [biometricAvailable, biometricEnabled, unlock]);

  // Get a user-friendly label for the biometric type
  const biometricLabel = biometryType === BiometryType.FACE_AUTHENTICATION 
    ? 'Face Unlock' 
    : biometryType === BiometryType.IRIS_AUTHENTICATION
    ? 'Iris Unlock'
    : 'Fingerprint Unlock';

  return {
    isLocked,
    isPinEnabled,
    pinHash,
    biometricEnabled,
    biometricAvailable,
    biometricLabel,
    biometryType,
    isSettingUp,
    setIsSettingUp,
    unlock,
    setupPin,
    removePin,
    toggleBiometric,
    attemptBiometric,
  };
}

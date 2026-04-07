'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
  signOut,
} from 'firebase/auth';
import { getUserProfile, createUserProfile, updateUserProfile } from '@/lib/firestore';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const p = await getUserProfile(firebaseUser.uid);
        setProfile(p);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);

  const register = async (email, password, name, phone, role = 'buyer', extra = {}) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const profileData = { email, name, phone, role };
    if (role === 'supplier' && extra.companyName) {
      profileData.companyName = extra.companyName;
      profileData.city = extra.city || '';
      profileData.category = extra.category || '';
    }
    await createUserProfile(cred.user.uid, profileData);
    const p = await getUserProfile(cred.user.uid);
    setProfile(p);
    return cred;
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    // Создаём профиль если первый вход
    const existing = await getUserProfile(cred.user.uid);
    if (!existing) {
      await createUserProfile(cred.user.uid, {
        email: cred.user.email,
        name: cred.user.displayName || '',
        phone: cred.user.phoneNumber || '',
        role: 'buyer',
      });
    }
    const p = await getUserProfile(cred.user.uid);
    setProfile(p);
    return cred;
  };

  const loginWithApple = async () => {
    const provider = new OAuthProvider('apple.com');
    provider.addScope('email');
    provider.addScope('name');
    const cred = await signInWithPopup(auth, provider);
    const existing = await getUserProfile(cred.user.uid);
    if (!existing) {
      await createUserProfile(cred.user.uid, {
        email: cred.user.email || '',
        name: cred.user.displayName || '',
        phone: '',
        role: 'buyer',
      });
    }
    const p = await getUserProfile(cred.user.uid);
    setProfile(p);
    return cred;
  };

  const logout = () => signOut(auth);

  const updateProfile = async (data) => {
    if (!user) return;
    await updateUserProfile(user.uid, data);
    const p = await getUserProfile(user.uid);
    setProfile(p);
  };

  const isAdmin = profile?.role === 'admin' ||
    user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const isSupplier = profile?.role === 'supplier';

  return (
    <AuthContext.Provider value={{
      user, profile, loading, login, register, logout, loginWithGoogle, loginWithApple, updateProfile, isAdmin, isSupplier
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

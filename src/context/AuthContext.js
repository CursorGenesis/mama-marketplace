'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
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
    // Обработка возврата после signInWithRedirect (мобильные)
    getRedirectResult(auth).then(async (result) => {
      if (result?.user) {
        const existing = await getUserProfile(result.user.uid);
        if (!existing) {
          await createUserProfile(result.user.uid, {
            email: result.user.email,
            name: result.user.displayName || '',
            phone: result.user.phoneNumber || '',
            role: 'buyer',
          });
        }
      }
    }).catch(() => {});

    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          setUser(firebaseUser);
          const p = await getUserProfile(firebaseUser.uid);
          setProfile(p || { role: 'buyer' });
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (e) {
        console.error('Auth profile load error:', e);
        if (firebaseUser) {
          setUser(firebaseUser);
          setProfile({ role: 'buyer' });
        }
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);

  const register = async (email, password, name, phone, role = 'buyer', extra = {}) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const profileData = { email, name, phone, role };
    if (extra.inn) profileData.inn = extra.inn;
    if (extra.shopName) profileData.shopName = extra.shopName;
    if (extra.city) profileData.city = extra.city;
    if (extra.address) profileData.address = extra.address;
    if (extra.agentRef) profileData.agentRef = extra.agentRef;
    if (role === 'supplier') {
      profileData.companyName = extra.companyName || '';
      profileData.city = extra.city || '';
      profileData.address = extra.address || '';
      profileData.whatsapp = extra.whatsapp || '';
      profileData.category = extra.category || '';
      if (extra.licenseConfirmed) profileData.licenseConfirmed = true;
      if (extra.deliverySchedule) profileData.deliverySchedule = extra.deliverySchedule;
    }
    await createUserProfile(cred.user.uid, profileData);
    const p = await getUserProfile(cred.user.uid);
    setProfile(p);
    return cred;
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const isMobile = typeof window !== 'undefined' && /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobile) {
      // Redirect уходит на страницу Google и вернётся обратно — остальное обработает getRedirectResult в useEffect
      await signInWithRedirect(auth, provider);
      return; // redirect прерывает выполнение
    }

    const cred = await signInWithPopup(auth, provider);
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

  // Поддержка нескольких админов через comma-separated список в env.
  // Например NEXT_PUBLIC_ADMIN_EMAIL="alla@gmail.com,backup@gmail.com".
  // Это снимает операционный риск «один админ → отпуск/болезнь = парализованная платформа».
  // Для полного доступа в Firestore Rules второму админу нужно ещё проставить role:'admin' в его профиле.
  const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);
  const isAdmin = profile?.role === 'admin' ||
    (user?.email ? adminEmails.includes(user.email.toLowerCase()) : false);
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

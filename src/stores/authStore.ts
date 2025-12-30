import { create } from 'zustand';
import { auth, db } from '../config/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface User {
  uid: string;
  email: string | null;
  username?: string;
  role?: string;
  [key: string]: any;
}

interface AuthStore {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, username: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Try to get user data from Firestore, but don't fail if offline
      let userData = {};
      try {
        const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
        if (userDoc.exists()) {
          userData = userDoc.data() || {};
        }
      } catch (firestoreError: any) {
        // If Firestore is offline or document doesn't exist, continue with basic user info
        console.warn('Could not load user data from Firestore:', firestoreError.message);
        // User can still log in with basic info from auth
      }
      
      set({ 
        user: { 
          uid: userCredential.user.uid, 
          email: userCredential.user.email,
          ...userData
        }, 
        loading: false 
      });
      return true;
    } catch (error: any) {
      let errorMessage = error.message;
      
      // Provide user-friendly error messages
      if (error.code === 'auth/configuration-not-found' || error.message?.includes('CONFIGURATION_NOT_FOUND')) {
        errorMessage = 'يرجى تفعيل مصادقة البريد الإلكتروني/كلمة المرور في Firebase Console';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'المستخدم غير موجود';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'كلمة المرور غير صحيحة';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'البريد الإلكتروني غير صحيح';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'خطأ في الاتصال بالشبكة';
      }
      
      set({ error: errorMessage, loading: false });
      console.error('Login error:', error);
      return false;
    }
  },

  register: async (email: string, password: string, username: string) => {
    set({ loading: true, error: null });
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        username,
        email,
        role: 'user',
        createdAt: new Date().toISOString()
      });
      set({ 
        user: { 
          uid: userCredential.user.uid, 
          email, 
          username, 
          role: 'user' 
        }, 
        loading: false 
      });
      return true;
    } catch (error: any) {
      let errorMessage = error.message;
      
      // Provide user-friendly error messages
      if (error.code === 'auth/configuration-not-found' || error.message?.includes('CONFIGURATION_NOT_FOUND')) {
        errorMessage = 'يرجى تفعيل مصادقة البريد الإلكتروني/كلمة المرور في Firebase Console';
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'البريد الإلكتروني مستخدم بالفعل';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'البريد الإلكتروني غير صحيح';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'كلمة المرور ضعيفة جداً (يجب أن تكون 6 أحرف على الأقل)';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'خطأ في الاتصال بالشبكة';
      }
      
      set({ error: errorMessage, loading: false });
      console.error('Registration error:', error);
      return false;
    }
  },

  logout: async () => {
    await signOut(auth);
    set({ user: null });
  }
}));

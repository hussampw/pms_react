import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, enableIndexedDbPersistence, connectFirestoreEmulator } from 'firebase/firestore';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: "AIzaSyAKa8GcedYGk_YCybcZm9CsKrmy73wYIGA",
  authDomain: "property-management-com.firebaseapp.com",
  projectId: "property-management-com",
  storageBucket: "property-management-com.firebasestorage.app",
  messagingSenderId: "586124033050",
  appId: "1:586124033050:android:ffafe4d14ce2fc813ce5a3"
};

// Initialize Firebase app only if it hasn't been initialized
let app: FirebaseApp;
try {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
} catch (error) {
  console.error('Firebase app initialization error:', error);
  throw error;
}

// Initialize Auth - Firebase v12 handles persistence automatically in React Native
let auth: Auth;
try {
  auth = getAuth(app);
  if (!auth) {
    throw new Error('Firebase Auth failed to initialize');
  }
} catch (error: any) {
  console.error('Firebase Auth initialization error:', error);
  // Don't throw, but log the error - app can still work without auth if needed
  throw new Error(`Firebase Auth configuration error: ${error.message || 'Unknown error'}`);
}

// Initialize Firestore
let db: Firestore;
try {
  db = getFirestore(app);
  if (!db) {
    throw new Error('Firestore failed to initialize');
  }
  
  // Enable offline persistence only on web platform
  // React Native doesn't support IndexedDB persistence the same way
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.indexedDB) {
    enableIndexedDbPersistence(db).catch((err: any) => {
      if (err.code === 'failed-precondition') {
        console.warn('Firestore persistence failed: Multiple tabs open');
      } else if (err.code === 'unimplemented') {
        // Silently ignore - IndexedDB not available (e.g., React Native)
        console.log('Firestore offline persistence not available on this platform');
      } else {
        console.warn('Firestore persistence error:', err);
      }
    });
  } else {
    // On React Native, Firestore will use memory cache by default
    // This is fine for most use cases
    console.log('Firestore using memory cache (offline persistence not available on React Native)');
  }
} catch (error: any) {
  console.error('Firestore initialization error:', error);
  throw new Error(`Firestore configuration error: ${error.message || 'Unknown error'}`);
}

export { auth, db };

'use client';

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// This file exports the Firebase configuration object.
// It is used by the initializeFirebase function in src/firebase/index.ts.

export const firebaseConfig = {
  projectId: 'studio-70057284-39522',
  appId: '1:82523194884:web:558a470af182446b2c9751',
  apiKey: 'AIzaSyCBgdfvcfNjZ0OfRgWZh6rKTnM0RH3KFr0',
  authDomain: 'studio-70057284-39522.firebaseapp.com',
  measurementId: '',
  messagingSenderId: '82523194884',
};

// This function initializes Firebase and returns the SDK instances.
// It ensures that Firebase is only initialized once.
export function initializeFirebase() {
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  const auth = getAuth(app);
  const firestore = getFirestore(app);

  return { firebaseApp: app, auth, firestore };
}

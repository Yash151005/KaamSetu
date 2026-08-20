// Firebase client config (for future Firebase Auth integration)
// Currently using backend API for all data operations

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

// Placeholder — initialize Firebase when needed
// import { initializeApp } from 'firebase/app';
// import { getAuth, signInAnonymously } from 'firebase/auth';
// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);

export default firebaseConfig;

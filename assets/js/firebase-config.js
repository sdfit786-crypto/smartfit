import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { getAnalytics, isSupported } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js';

const firebaseConfig = {
  apiKey: 'AIzaSyAUHyrErlJTFsQmoQpwqC7lWLLs1aam9tc',
  authDomain: 'sd-fit-9bde8.firebaseapp.com',
  projectId: 'sd-fit-9bde8',
  storageBucket: 'sd-fit-9bde8.firebasestorage.app',
  messagingSenderId: '917399113323',
  appId: '1:917399113323:web:6c189cfcdd2889bcb32b2e',
  measurementId: 'G-Q89KCP3MMJ'
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = isSupported().then(supported => supported ? getAnalytics(app) : null).catch(() => null);

import { createUserWithEmailAndPassword, updateProfile } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { doc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { auth, db } from './firebase-config.js';
import { firestoreErrorMessage } from './firebase-errors.js';

const form = document.getElementById('registerForm');
const message = document.getElementById('successMessage');
const preferredSex = new URLSearchParams(location.search).get('sex');
if (preferredSex === 'female' || preferredSex === 'male') {
  document.querySelector(`input[name="sex"][value="${preferredSex}"]`).checked = true;
}

function showMessage(text, type) {
  message.textContent = text;
  message.className = `message show ${type}`;
}

function friendlyError(error) {
  const messages = {
    'auth/email-already-in-use': 'An account already exists for this email. Try logging in instead.',
    'auth/invalid-email': 'Enter a valid email address.',
    'auth/weak-password': 'Choose a password with at least 6 characters.',
    'auth/unauthorized-domain': 'Add this site’s domain in Firebase Authentication settings.'
  };
  return messages[error.code] || 'We could not create your account. Check your connection and Firebase settings, then try again.';
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  if (!form.reportValidity()) return;

  const button = form.querySelector('[type="submit"]');
  const formData = new FormData(form);
  const profile = {
    fullName: String(formData.get('name')).trim(),
    age: Number(formData.get('age')),
    location: String(formData.get('location')).trim(),
    sex: String(formData.get('sex')),
    stylePreference: 'Casual',
    measurements: Object.fromEntries(['height', 'weight', 'chest', 'waist', 'hips', 'shoulder']
      .map(field => [field, formData.get(field) ? Number(formData.get(field)) : null]))
  };

  button.disabled = true;
  button.textContent = 'Creating your account…';
  message.className = 'message';
  const email = String(formData.get('email')).trim();
  let accountUser = null;
  try {
    accountUser = auth.currentUser?.email?.toLowerCase() === email.toLowerCase()
      ? auth.currentUser
      : (await createUserWithEmailAndPassword(auth, email, String(formData.get('password')))).user;
    try {
      sessionStorage.setItem(`sdFitPendingProfile_${accountUser.uid}`, JSON.stringify(profile));
    } catch (storageError) {
      console.warn('Could not preserve the pending profile in this browser session.', storageError);
    }
    await updateProfile(accountUser, { displayName: profile.fullName });
    await setDoc(doc(db, 'users', accountUser.uid), { ...profile, email: accountUser.email, createdAt: serverTimestamp() }, { merge: true });
    sessionStorage.removeItem(`sdFitPendingProfile_${accountUser.uid}`);
    location.href = profile.sex === 'female' ? 'SD-Fit-Girls-Dashboard.html' : 'SD-Fit-Boys-Dashboard.html';
  } catch (error) {
    showMessage(accountUser ? `Your account exists, but its profile was not saved. ${firestoreErrorMessage(error)}` : friendlyError(error), 'error');
    button.disabled = false;
    button.textContent = 'Create My Profile  →';
  }
});

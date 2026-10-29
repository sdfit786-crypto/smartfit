
    import { signInWithEmailAndPassword, sendPasswordResetEmail, signInWithPopup, signInWithRedirect, getRedirectResult, GoogleAuthProvider, FacebookAuthProvider } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
    import { doc, getDoc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
    import { auth, db } from './firebase-config.js';
    import { firestoreErrorMessage } from './firebase-errors.js';

    const passwordInput = document.getElementById('password');
    const togglePassword = document.getElementById('toggle-password');
    const form = document.getElementById('login-form');
    const message = document.getElementById('form-message');
    const providerButtons = [...document.querySelectorAll('[data-provider]')];
    let providerSignInPending = false;

    togglePassword.addEventListener('click', () => {
      const show = passwordInput.type === 'password';
      passwordInput.type = show ? 'text' : 'password';
      togglePassword.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
      togglePassword.title = show ? 'Hide password' : 'Show password';
    });

    function showMessage(text, type = 'error') {
      message.textContent = text;
      message.className = `message show ${type}`;
    }

    function friendlyError(error) {
      if (location.protocol === 'file:' && ['auth/unauthorized-domain', 'auth/operation-not-supported-in-this-environment'].includes(error.code)) {
        return 'Google sign-in cannot run from a file URL. Start the site on localhost or open its deployed HTTPS address, then authorize that domain in Firebase.';
      }
      const messages = {
        'auth/invalid-credential': 'Email or password is incorrect.',
        'auth/user-not-found': 'No account was found for this email.',
        'auth/wrong-password': 'Email or password is incorrect.',
        'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
        'auth/popup-closed-by-user': 'The sign-in window was closed before finishing.',
        'auth/popup-blocked': 'Your browser blocked the sign-in window. We’ll continue with a redirect instead.',
        'auth/unauthorized-domain': 'This site is not authorized for sign-in. Add its domain in Firebase Authentication settings.',
        'auth/operation-not-allowed': 'This sign-in provider is disabled. Enable it in Firebase Authentication settings.',
        'auth/invalid-oauth-client-id': 'The Google OAuth client is not configured correctly. Review the Google provider settings in Firebase Authentication.',
        'auth/operation-not-supported-in-this-environment': 'Google sign-in needs a hosted site. Open the app through localhost or your deployed HTTPS site, not as a file.',
        'auth/network-request-failed': 'Could not connect to Google sign-in. Check your internet connection and try again.',
        'auth/account-exists-with-different-credential': 'An account already uses this email with a different sign-in method. Sign in with that method first.'
      };
      return messages[error.code] || 'We could not sign you in. Check your connection and Firebase settings, then try again.';
    }

    function setProviderButtonsBusy(busy, activeButton = null, label = 'Connecting…') {
      providerButtons.forEach(button => {
        button.disabled = busy;
        button.setAttribute('aria-busy', String(busy && button === activeButton));
        const buttonLabel = button.querySelector('span:last-child');
        if (!buttonLabel) return;
        if (busy && button === activeButton) {
          button.dataset.originalLabel = buttonLabel.textContent;
          buttonLabel.textContent = label;
        } else if (!busy && button.dataset.originalLabel) {
          buttonLabel.textContent = button.dataset.originalLabel;
          delete button.dataset.originalLabel;
        }
      });
    }

    async function goToDashboard(user) {
      const profileRef = doc(db, 'users', user.uid);
      const profileSnapshot = await getDoc(profileRef);
      let pendingProfile = null;
      try {
        pendingProfile = JSON.parse(sessionStorage.getItem(`sdFitPendingProfile_${user.uid}`) || 'null');
      } catch (error) {
        console.warn('Could not restore the pending signup profile.', error);
      }
      const profile = profileSnapshot.exists() ? profileSnapshot.data() : pendingProfile || {};
      const sex = profile.sex || 'prefer-not-to-say';
      if (!profileSnapshot.exists()) {
        await setDoc(profileRef, { ...profile, fullName: profile.fullName || user.displayName || '', email: user.email, sex, createdAt: serverTimestamp() }, { merge: true });
      }
      sessionStorage.removeItem(`sdFitPendingProfile_${user.uid}`);
      location.href = sex === 'female' ? 'SD-Fit-Girls-Dashboard.html' : 'SD-Fit-Boys-Dashboard.html';
    }

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const email = document.getElementById('email').value.trim();
      const password = passwordInput.value;
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showMessage('Please enter a valid email address.');
        document.getElementById('email').focus();
        return;
      }
      if (password.length < 6) {
        showMessage('Your password must be at least 6 characters long.');
        passwordInput.focus();
        return;
      }
      const button = form.querySelector('[type="submit"]');
      button.disabled = true;
      button.textContent = 'Signing in…';
      try {
        const credential = await signInWithEmailAndPassword(auth, email, password);
        await goToDashboard(credential.user);
      } catch (error) {
        showMessage(auth.currentUser ? firestoreErrorMessage(error) : friendlyError(error));
      } finally {
        button.disabled = false;
        button.textContent = 'Login';
      }
    });

    document.getElementById('forgot-link').addEventListener('click', async (event) => {
      event.preventDefault();
      const email = document.getElementById('email').value.trim();
      if (!email) {
        showMessage('Enter your email address first, then choose Forgot Password.');
        document.getElementById('email').focus();
        return;
      }
      try {
        await sendPasswordResetEmail(auth, email);
        showMessage('Password reset instructions have been sent to your email.', 'success');
      } catch (error) {
        showMessage(friendlyError(error));
      }
    });
    async function finishProviderSignIn(credential) {
      if (credential) await goToDashboard(credential.user);
    }

    getRedirectResult(auth).then(finishProviderSignIn).catch(error => {
      showMessage(auth.currentUser ? firestoreErrorMessage(error) : friendlyError(error));
    });

    providerButtons.forEach(button => {
      button.addEventListener('click', async () => {
        if (providerSignInPending) return;
        const providerName = button.dataset.provider;
        const provider = providerName === 'Google'
          ? new GoogleAuthProvider()
          : providerName === 'Facebook'
            ? new FacebookAuthProvider()
            : null;
        if (!provider) {
          showMessage('This sign-in provider is not supported.');
          return;
        }
        providerSignInPending = true;
        setProviderButtonsBusy(true, button);
        try {
          if (providerName === 'Google') {
            provider.setCustomParameters({ prompt: 'select_account' });
          }
          const credential = await signInWithPopup(auth, provider);
          await finishProviderSignIn(credential);
        } catch (error) {
          if (error.code === 'auth/popup-blocked') {
            try {
              button.querySelector('span:last-child').textContent = 'Redirecting…';
              await signInWithRedirect(auth, provider);
              return;
            } catch (redirectError) {
              showMessage(friendlyError(redirectError));
            }
          } else {
            showMessage(auth.currentUser ? firestoreErrorMessage(error) : friendlyError(error));
          }
        } finally {
          providerSignInPending = false;
          setProviderButtonsBusy(false);
        }
      });
    });
  
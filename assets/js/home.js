
		import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
		import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
		import { auth, db } from './firebase-config.js';

		const createProfile = document.getElementById('createProfile');
		const selectionHint = document.getElementById('selectionHint');
		const signedIn = document.getElementById('signedIn');
		const accountActions = document.getElementById('accountActions');
		let selectedAudience = '';

		document.querySelectorAll('[data-audience]').forEach(button => {
			button.addEventListener('click', () => {
				selectedAudience = button.dataset.audience;
				document.querySelectorAll('[data-audience]').forEach(card => card.setAttribute('aria-pressed', String(card === button)));
				createProfile.href = `smart-fd-fit-register.html?sex=${selectedAudience}`;
				createProfile.removeAttribute('aria-disabled');
				selectionHint.textContent = `${button.querySelector('strong').textContent} collection selected.`;
			});
		});

		createProfile.addEventListener('click', event => {
			if (selectedAudience) return;
			event.preventDefault();
			selectionHint.textContent = 'Choose a collection before creating your profile.';
			document.querySelector('[data-audience]').focus();
		});

		onAuthStateChanged(auth, async user => {
			if (!user) return;
			let sex = selectedAudience;
			try {
				const snapshot = await getDoc(doc(db, 'users', user.uid));
				sex = snapshot.exists() ? snapshot.data().sex || sex : sex;
			} catch (error) {
				console.warn('Could not load the signed-in profile.', error);
			}
			const dashboard = sex === 'female' ? 'SD-Fit-Girls-Dashboard.html' : 'SD-Fit-Boys-Dashboard.html';
			signedIn.innerHTML = `Signed in as <strong></strong> <a class="action secondary" href="${dashboard}">Continue&nbsp; ↗</a>`;
			signedIn.querySelector('strong').textContent = user.displayName || user.email;
			signedIn.classList.add('show');
			accountActions.style.display = 'none';
			selectionHint.textContent = 'Your style space is ready.';
		});
	
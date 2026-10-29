import { onAuthStateChanged, signOut, updateProfile } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { doc, getDoc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { auth, db } from './firebase-config.js';
import { firestoreErrorMessage } from './firebase-errors.js';
import { classifyBodyShape, getShapeAdvice, matchIllustrativeSize } from './fit-knowledge.js';

const isGirlsDashboard = location.pathname.includes('Girls');
const loginUrl = 'smart-fd-fit-login.html';
const dashboardFile = isGirlsDashboard ? 'SD-Fit-Girls-Dashboard.html' : 'SD-Fit-Boys-Dashboard.html';
const currentPage = document.body.dataset.page || 'overview';
const destination = currentPage === 'overview' ? dashboardFile : `${dashboardFile}?page=${currentPage}`;
const pageNavLabels = {
  overview: 'Dashboard',
  outfits: 'Outfit recommendations',
  stylist: 'Outfit builder',
  body: 'Body profile',
  wardrobe: 'Wardrobe',
  tryon: 'Virtual try-on',
  planner: 'Style planner',
  color: 'Color stylist',
  shopping: 'Shopping assistant',
  inspiration: 'Inspiration',
  collections: 'Style collections',
  settings: 'Settings',
  help: 'Help and support'
};
const pageHeadingTitles = {
  outfits: 'Outfit ideas',
  stylist: 'Outfit builder',
  body: 'Body & size',
  wardrobe: 'Wardrobe',
  tryon: 'Virtual try-on',
  planner: 'Style planner',
  color: 'Color stylist',
  shopping: 'Shopping assistant',
  inspiration: 'Style inspiration',
  collections: 'Style collections',
  settings: 'Settings',
  help: 'Help & support'
};
const pageSubtitles = {
  outfits: 'Recommendations matched to your preferences and fit.',
  stylist: 'Build a complete look for your day or occasion.',
  body: 'Manage your measurements and find practical fit guidance.',
  wardrobe: 'Organize the pieces you own and plan what to wear.',
  tryon: 'Preview an outfit before adding it to your look.',
  planner: 'Plan outfits for the week ahead.',
  color: 'Explore colors that work with your preferences.',
  shopping: 'Build a practical list around your wardrobe.',
  inspiration: 'Explore ideas and save looks you love.',
  collections: 'Browse curated looks for different moments.',
  settings: 'Update your profile and fit preferences.',
  help: 'Find guidance for using Smart FD Fit.'
};
document.querySelectorAll('[data-nav]').forEach(link => {
  link.classList.toggle('active', link.dataset.nav === pageNavLabels[currentPage]);
});
document.querySelectorAll('#sd-fit-feature-nav a').forEach(link => {
  const page = new URL(link.href, location.href).searchParams.get('page') || 'overview';
  if (page === currentPage) link.setAttribute('aria-current', 'page');
});
document.title = `Smart FD Fit | ${currentPage === 'overview' ? 'Dashboard' : (pageNavLabels[currentPage] || 'Dashboard')}`;
const profileName = document.getElementById('sideName');
const greetingName = document.getElementById('greetingName');
if (currentPage !== 'overview') {
  const heading = pageHeadingTitles[currentPage] || 'Dashboard';
  document.getElementById('pageHeadingPrefix').textContent = '';
  greetingName.textContent = heading;
  document.querySelector('.topbar .eyebrow').textContent = `SMART FD FIT · ${heading.toUpperCase()}`;
  document.querySelector('.topbar .subtitle').textContent = pageSubtitles[currentPage] || '';
}
const avatar = document.getElementById('avatarInitial');
const settingsForm = document.getElementById('profileSettingsForm');
const settingsStatus = document.getElementById('settingsStatus');
const favoriteStorageKey = userId => `smartFdFitSavedOutfitsV1_${userId}`;
let currentMeasurements = {};
let currentUser = null;
let currentProfile = {};

function setMeasurement(id, value, unit) {
  const element = document.getElementById(id);
  if (element) element.firstChild.textContent = `${value ?? '—'} `;
}

function renderProfile(user, profile, analyzeShape = true) {
  const name = (profile.fullName || user.displayName || user.email || 'Style enthusiast').trim();
  profileName.textContent = name;
  greetingName.textContent = currentPage === 'overview'
    ? name.split(/\s+/)[0]
    : pageHeadingTitles[currentPage] || 'Dashboard';
  avatar.textContent = name.charAt(0).toUpperCase();

  const measurements = profile.measurements || {};
  currentMeasurements = measurements;
  settingsForm.elements.namedItem('fullName').value = profile.fullName || user.displayName || '';
  settingsForm.elements.namedItem('email').value = user.email || profile.email || '';
  settingsForm.elements.namedItem('age').value = profile.age ?? '';
  settingsForm.elements.namedItem('location').value = profile.location || '';
  settingsForm.elements.namedItem('stylePreference').value = profile.stylePreference || 'Casual';
  settingsForm.elements.namedItem('fitGarmentType').value = profile.fitGarmentType || 'outfit';
  ['height', 'weight', 'chest', 'waist', 'hips', 'shoulder'].forEach(field => {
    settingsForm.elements.namedItem(field).value = measurements[field] ?? '';
  });
  setMeasurement('profileHeight', measurements.height, 'cm');
  setMeasurement('profileWeight', measurements.weight, 'kg');
  setMeasurement('profileWaist', measurements.waist, 'cm');
  const completionFields = [profile.fullName, profile.age, profile.location, profile.sex,
    measurements.height, measurements.weight, measurements.chest, measurements.waist,
    measurements.hips, measurements.shoulder];
  const completion = Math.round(completionFields.filter(value => value !== null && value !== undefined && value !== '').length / completionFields.length * 100);
  document.getElementById('profileCompletionStat').textContent = `${completion}%`;
  document.getElementById('profileCompletionValue').textContent = `${completion}%`;
  document.querySelector('.body-info .progress span').style.width = `${completion}%`;
  document.getElementById('stylePreference').textContent = profile.stylePreference || 'Casual';
  const shapeFields = { shapeShoulder: 'shoulder', shapeChest: 'chest', shapeWaist: 'waist', shapeHips: 'hips' };
  Object.entries(shapeFields).forEach(([id, field]) => {
    const input = document.getElementById(id);
    if (input && measurements[field] != null) input.value = measurements[field];
  });
  if (profile.fitGarmentType) document.getElementById('fitGarmentType').value = profile.fitGarmentType;
  if (analyzeShape && Object.keys(shapeFields).every(id => document.getElementById(id).value) && typeof window.analyseBodyShape === 'function') {
    window.analyseBodyShape();
  }
  const preferredCategory = [...document.querySelectorAll('.category')].find(button => button.querySelector('strong')?.textContent === (profile.stylePreference || 'Casual'));
  document.querySelectorAll('.category').forEach(button => button.classList.remove('selected'));
  if (preferredCategory) preferredCategory.classList.add('selected');
}

function renderFavorites(favoriteIds) {
  window.sdFitSavedOutfits = new Set(favoriteIds);
  document.querySelectorAll('[data-outfit]').forEach(button => {
    const saved = window.sdFitSavedOutfits.has(button.dataset.outfit);
    button.classList.toggle('saved', saved);
    button.textContent = saved ? '♥' : '♡';
  });
  document.getElementById('savedCount').textContent = String(window.sdFitSavedOutfits.size);
}

function renderWeeklyCount(plan) {
  const count = Array.isArray(plan) ? plan.length : 0;
  document.getElementById('weeklyLookCount').textContent = String(count).padStart(2, '0');
}

onAuthStateChanged(auth, async user => {
  if (!user) {
    location.replace(loginUrl);
    return;
  }

  currentUser = user;
  window.sdFitUserId = user.uid;
  const profileRef = doc(db, 'users', user.uid);
  try {
    const snapshot = await getDoc(profileRef);
    const profile = snapshot.exists() ? snapshot.data() : {};
    currentProfile = profile;
    const isFemale = profile.sex === 'female';
    const profileFile = isFemale ? 'SD-Fit-Girls-Dashboard.html' : 'SD-Fit-Boys-Dashboard.html';
    const profileDestination = currentPage === 'overview' ? profileFile : `${profileFile}?page=${currentPage}`;
    if (profileDestination !== destination) {
      location.replace(profileDestination);
      return;
    }

    renderProfile(user, profile);
    let storedFavorites = [];
    try {
      const localFavorites = JSON.parse(localStorage.getItem(favoriteStorageKey(user.uid)) || '[]');
      if (Array.isArray(localFavorites)) storedFavorites = localFavorites;
    } catch (error) {
      console.warn('Could not read locally saved favorites.', error);
    }
    const favoriteIds = Array.isArray(profile.savedOutfits) ? profile.savedOutfits : storedFavorites;
    renderFavorites(favoriteIds);
    let savedPlan = null;
    try {
      savedPlan = JSON.parse(localStorage.getItem(`smartFdFitWeeklyPlanV1_${isGirlsDashboard ? 'girls' : 'boys'}`) || 'null');
    } catch (error) {
      console.warn('Could not read the saved weekly plan.', error);
    }
    renderWeeklyCount(savedPlan?.plan);
    if (!snapshot.exists()) {
      await setDoc(profileRef, { fullName: user.displayName || '', sex: isGirlsDashboard ? 'female' : 'male', createdAt: serverTimestamp() }, { merge: true });
    }
  } catch (error) {
    console.error('Could not load the Smart FD Fit profile.', error);
    if (typeof window.notify === 'function') window.notify(firestoreErrorMessage(error));
  }
});

settingsForm.addEventListener('submit', async event => {
  event.preventDefault();
  settingsStatus.textContent = '';
  settingsStatus.classList.remove('error');
  if (!settingsForm.reportValidity()) return;
  if (!currentUser || !window.sdFitUserId) {
    settingsStatus.textContent = 'Your profile is still loading. Please try again in a moment.';
    settingsStatus.classList.add('error');
    return;
  }

  const formData = new FormData(settingsForm);
  const measurements = Object.fromEntries(['height', 'weight', 'chest', 'waist', 'hips', 'shoulder']
    .map(field => [field, formData.get(field) === '' ? null : Number(formData.get(field))]));
  const updatedProfile = {
    fullName: String(formData.get('fullName')).trim(),
    age: Number(formData.get('age')),
    location: String(formData.get('location')).trim(),
    stylePreference: String(formData.get('stylePreference')),
    fitGarmentType: String(formData.get('fitGarmentType')),
    measurements,
    updatedAt: serverTimestamp()
  };
  const submitButton = settingsForm.querySelector('[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = 'Saving changes…';
  try {
    await setDoc(doc(db, 'users', currentUser.uid), updatedProfile, { merge: true });
    currentProfile = { ...currentProfile, ...updatedProfile, measurements };
    document.getElementById('fitGarmentType').value = updatedProfile.fitGarmentType;
    renderProfile(currentUser, currentProfile, false);
    try {
      await updateProfile(currentUser, { displayName: updatedProfile.fullName });
    } catch (error) {
      console.error('Profile saved, but the sign-in display name could not be updated.', error);
      settingsStatus.textContent = 'Profile saved. Your account display name could not be synced; sign in again to retry.';
      settingsStatus.classList.add('error');
      return;
    }
    settingsStatus.textContent = 'Your profile and fit preferences are up to date.';
  } catch (error) {
    console.error('Could not save profile settings.', error);
    settingsStatus.textContent = firestoreErrorMessage(error);
    settingsStatus.classList.add('error');
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Save changes';
  }
});

document.getElementById('signOutButton').addEventListener('click', async () => {
  try {
    await signOut(auth);
    location.replace(loginUrl);
  } catch (error) {
    if (typeof window.notify === 'function') window.notify('Could not sign out. Please try again.');
  }
});

window.addEventListener('sd-fit:favorites-changed', async event => {
  if (!window.sdFitUserId) return;
  try {
    await setDoc(doc(db, 'users', window.sdFitUserId), { savedOutfits: event.detail, updatedAt: serverTimestamp() }, { merge: true });
  } catch (error) {
    if (typeof window.notify === 'function') window.notify(`Favorite saved on this device. ${firestoreErrorMessage(error)}`);
  }
});

window.addEventListener('sd-fit:style-changed', async event => {
  if (!window.sdFitUserId) return;
  currentProfile = { ...currentProfile, stylePreference: event.detail };
  settingsForm.elements.namedItem('stylePreference').value = event.detail;
  try {
    await setDoc(doc(db, 'users', window.sdFitUserId), { stylePreference: event.detail, updatedAt: serverTimestamp() }, { merge: true });
  } catch (error) {
    if (typeof window.notify === 'function') window.notify(firestoreErrorMessage(error));
  }
});

window.addEventListener('sd-fit:weekly-plan-changed', event => renderWeeklyCount(event.detail));

function renderShapeAdvice(shape) {
  const host = document.getElementById('shapeResult');
  host.replaceChildren();
  const mark = document.createElement('div');
  mark.className = 'shape-result-mark';
  mark.textContent = '⌁';
  const content = document.createElement('div');
  const heading = document.createElement('strong');
  heading.textContent = shape ? `Possible shape: ${shape.label}` : 'Add measurements to explore fit ideas';
  content.appendChild(heading);
  if (shape) {
    const cues = document.createElement('p');
    cues.textContent = shape.cues;
    content.appendChild(cues);
    const ideas = document.createElement('ul');
    shape.ideas.forEach(idea => {
      const item = document.createElement('li');
      item.textContent = idea;
      ideas.appendChild(item);
    });
    content.appendChild(ideas);
    const checks = document.createElement('p');
    checks.textContent = `Fit checks: ${shape.fit.join('; ')}.`;
    content.appendChild(checks);
  }
  host.append(mark, content);
}

function renderSizeAdvice(result) {
  const host = document.getElementById('fitSizeResult');
  host.replaceChildren();
  const heading = document.createElement('strong');
  heading.textContent = 'Illustrative size guide';
  host.appendChild(heading);

  const resultText = document.createElement('span');
  resultText.className = 'fit-size-value';
  if (result.status === 'chart_match') resultText.textContent = `Starter band: ${result.sizes[0]}`;
  else if (result.status === 'multiple_matches') resultText.textContent = `Possible bands: ${result.sizes.join(' / ')}`;
  else if (result.status === 'no_chart_match') resultText.textContent = 'No band matched every selected measurement.';
  else resultText.textContent = 'Enter the measurements used by this chart.';
  host.appendChild(resultText);

  const detail = document.createElement('p');
  if (result.status === 'chart_match' || result.status === 'multiple_matches') {
    detail.textContent = `Compared ${result.measurementsUsed.join(', ')} against the supplied ${isGirlsDashboard ? 'girls’' : 'boys’'} starter bands.`;
  } else if (result.status === 'no_chart_match') {
    detail.textContent = 'Your measurements span different bands. Prioritize the garment area that needs more room and consult the brand’s chart.';
  } else {
    detail.textContent = 'Choose a top, bottom, or full outfit comparison and enter its required measurements.';
  }
  host.appendChild(detail);

  const warning = document.createElement('p');
  warning.className = 'fit-size-warning';
  warning.textContent = result.warning;
  host.appendChild(warning);
}

async function analyseBodyShape() {
  const readMeasurement = id => {
    const value = document.getElementById(id).value;
    return value === '' ? null : Number(value);
  };
  const measurements = {
    shoulder: readMeasurement('shapeShoulder'),
    chest: readMeasurement('shapeChest'),
    waist: readMeasurement('shapeWaist'),
    hips: readMeasurement('shapeHips')
  };
  const audience = isGirlsDashboard ? 'girls' : 'boys';
  const primary = measurements.chest;
  const garment = document.getElementById('fitGarmentType').value;

  try {
    const shapeId = classifyBodyShape(audience, { ...measurements, primary });
    const shapeAdvice = shapeId ? await getShapeAdvice(audience, shapeId) : null;
    const sizeAdvice = await matchIllustrativeSize(audience, {
      primary,
      waist: measurements.waist,
      hips: measurements.hips
    }, garment);
    renderShapeAdvice(shapeAdvice);
    window.sdFitShapeAdvice = shapeAdvice;
    renderSizeAdvice(sizeAdvice);
    if (window.sdFitUserId) {
      await setDoc(doc(db, 'users', window.sdFitUserId), {
        measurements,
        bodyShapeId: shapeId,
        fitGarmentType: garment,
        updatedAt: serverTimestamp()
      }, { merge: true });
      currentMeasurements = measurements;
      currentProfile = { ...currentProfile, measurements: { ...currentProfile.measurements, ...measurements }, fitGarmentType: garment };
      ['chest', 'waist', 'hips', 'shoulder'].forEach(field => {
        settingsForm.elements.namedItem(field).value = measurements[field] ?? '';
      });
      settingsForm.elements.namedItem('fitGarmentType').value = garment;
      window.notify('Fit ideas and measurements updated.');
    }
  } catch (error) {
    console.error('Could not load the sizing and style knowledge pack.', error);
    const host = document.getElementById('fitSizeResult');
    host.textContent = 'The sizing guide could not load. Serve the complete project folder over HTTP and try again.';
    if (window.sdFitUserId) window.notify(firestoreErrorMessage(error));
  }
}

window.analyseBodyShape = analyseBodyShape;
function updateFitRequirements() {
  const garment = document.getElementById('fitGarmentType').value;
  document.getElementById('shapeChest').required = garment !== 'bottom';
  document.getElementById('shapeWaist').required = garment !== 'top';
  document.getElementById('shapeHips').required = garment !== 'top';
  document.getElementById('shapeShoulder').required = false;
}

updateFitRequirements();
document.getElementById('shapeForm').addEventListener('submit', async event => {
  event.preventDefault();
  await analyseBodyShape();
});

document.getElementById('fitGarmentType').addEventListener('change', () => {
  updateFitRequirements();
  const form = document.getElementById('shapeForm');
  if (form.checkValidity()) analyseBodyShape();
});
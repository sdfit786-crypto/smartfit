export function firestoreErrorMessage(error) {
  switch (error?.code) {
    case 'permission-denied':
      return 'Firestore denied access. Confirm its API is enabled, the database exists, the user is signed in, and firestore.rules is deployed to this project.';
    case 'failed-precondition':
    case 'not-found':
      return 'The Firestore database is not ready. Create the default database in Firebase Console, then deploy firestore.rules.';
    case 'unavailable':
      return 'Firestore could not connect. Confirm the Cloud Firestore API is enabled and check your connection.';
    default:
      return `Firestore request failed (${error?.code || 'unknown'}). Confirm the database exists and firestore.rules is deployed.`;
  }
}
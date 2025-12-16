// filename: firebase.ts

// The Firebase compat libraries, when loaded as ES modules from the CDN via an import map,
// do not provide standard named or default exports. Instead, they execute and attach
// the 'firebase' namespace to the global window object.
// We import them here for their side-effects (to ensure they run) and then retrieve
// the firebase object from the window.
import "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";

// This approach resolves the "Cannot read properties of undefined (reading 'length')"
// error that occurs when trying to use `import * as firebase from ...`.
const firebase = (window as any).firebase;

// Config from Firebase console. For production apps, it's recommended to manage these
// values using environment variables, but they are safe to be public.
const firebaseConfig = {
  apiKey: "AIzaSyCqpfu0HEQKCeVO_IKERz-LGet-h75TkS0",
  authDomain: "band-practice-tracker-c2eed.firebaseapp.com",
  projectId: "band-practice-tracker-c2eed",
  storageBucket: "band-practice-tracker-c2eed.firebasestorage.app",
  messagingSenderId: "758731412791",
  appId: "1:758731412791:web:0ac12c5c7db30a18fbf6b2",
  measurementId: "G-TM98FXE9QS"
};

// Initialize once.
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Get the Firestore instance
const db = firebase.firestore();
const auth = firebase.auth();
const googleProvider = new firebase.auth.GoogleAuthProvider();

// In some network environments, the default real-time connection (WebChannel)
// can fail, leading to timeouts. Forcing long-polling is a robust workaround
// to ensure a stable connection to the Firestore backend. This also helps
// prevent related errors, like the circular structure to JSON error, which can
// occur when the SDK enters a failed or offline state.
db.settings({
    experimentalForceLongPolling: true,
    useFetchStreams: false,
});

// Export a single Firestore instance from compat
export { db, auth, googleProvider };

// Export the firebase namespace itself so other modules can access its types correctly.
export { firebase };
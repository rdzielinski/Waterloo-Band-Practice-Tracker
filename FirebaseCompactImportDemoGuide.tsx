import React from 'react';

const guideText = `<!-- filename: FirebaseCompatImportGuide.md -->

# Firebase compat ESM import guide (React)

Symptoms we fixed:
- Uncaught SyntaxError: The requested module 'firebase/compat/app' does not provide an export named 'default'
- Uncaught TypeError: Cannot read properties of undefined (reading 'length')
- Service firestore is not available
- Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore

Root cause:
- In ESM (browser), \`firebase/compat/app\` does not provide a default export.
  Using \`import firebase from "firebase/compat/app"\` yields \`firebase === undefined\`.
  Later, \`firebase.apps.length\` throws because \`firebase\` is undefined.
- Mixing module sources (compat + modular, or multiple versions/CDNs) creates two SDK instances.
  Firestore types then mismatch, causing runtime errors.

Correct import style for compat:
\`\`\`ts
import * as firebase from "firebase/compat/app";
import "firebase/compat/firestore";

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
export const db = firebase.firestore();
\`\`\`
`;

const FirebaseCompactImportDemoGuide: React.FC = () => {
  return (
    <div>
      <pre>{guideText}</pre>
    </div>
  );
};

export default FirebaseCompactImportDemoGuide;

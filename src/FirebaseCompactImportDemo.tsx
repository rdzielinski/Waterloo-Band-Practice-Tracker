

// filename: FirebaseCompactImportDemo.tsx
// Purpose: Small React component to verify that the compat ESM namespace import works
// and that firebase.apps and firebase.firestore() are available. It reads a few docs
// from a tiny "compatDemo" collection to prove the Firestore instance is valid.

import React, { useEffect, useState } from "react";

// Import from the central firebase.ts to ensure a single, correctly typed instance is used.
import { db, firebase } from "./firebase";
// FIX: Using a namespace import aliased as `firebaseType` allows TypeScript to correctly resolve 
// the type augmentations from 'firebase/compat/firestore'.
import type firebaseType from "firebase/compat/app";
import "firebase/compat/firestore";

// The central firebase.ts handles initialization.

type DemoDoc = {
  // FIX: Use the aliased firebase type namespace for correct type definitions.
  createdAt?: firebaseType.firestore.Timestamp;
  note?: string;
};

const FirebaseCompatImportDemo: React.FC = () => {
  const [status, setStatus] = useState<string>("Starting demo…");
  const [appsCount, setAppsCount] = useState<number>(0);
  const [docs, setDocs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Verify namespace import behaves: firebase.apps exists and is an array
      const count = firebase.apps.length;
      setAppsCount(count);

      setStatus("Initialized. Reading demo collection…");

      const demoCollection = db.collection("compatDemo");
      demoCollection
        .orderBy("createdAt", "desc")
        .limit(5)
        .get()
        .then((snapshot) => {
          const lines: string[] = [];
          snapshot.forEach((snap) => {
            const data = snap.data() as DemoDoc;
            const when =
              data.createdAt && typeof data.createdAt.toDate === "function"
                ? data.createdAt.toDate().toISOString()
                : "(no date)";
            lines.push(`${snap.id} | ${data.note ?? "(no note)"} | ${when}`);
          });
          setDocs(lines);
          setStatus("Success: compat Firestore connected and read demo collection.");
        })
        .catch((e) => {
          console.error(e);
          setError(String(e));
          setStatus("Failed to read from compat Firestore.");
        });
    } catch (e) {
      console.error(e);
      setError(String(e));
      setStatus("Compat import crashed during initialization.");
    }
  }, []);

  return (
    <div className="p-4 rounded-lg bg-maroon-dark text-white space-y-3">
      <h2 className="text-xl font-bold">Firebase Compat Import Demo</h2>
      <p>
        Status: <span className="text-gold">{status}</span>
      </p>
      <p>firebase.apps.length = {appsCount}</p>
      {error && (
        <p className="text-red-300">
          Error: <span className="font-mono">{error}</span>
        </p>
      )}
      <div>
        <h3 className="font-semibold mb-2">Latest demo docs (compatDemo):</h3>
        {docs.length === 0 ? (
          <p className="text-gray-300">No documents loaded yet.</p>
        ) : (
          <ul className="list-disc ml-6">
            {docs.map((line) => (
              <li key={line} className="font-mono text-sm">
                {line}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default FirebaseCompatImportDemo;
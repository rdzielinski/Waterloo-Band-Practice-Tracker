import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Firebase compat libraries attach themselves to the window.
// Importing them here for their side-effects ensures they are loaded
// and executed before the app runs.
import "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error("Fatal: Root element #root not found in document.");
}

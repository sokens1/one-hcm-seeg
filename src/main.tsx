import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Supprimer l'avertissement findDOMNode de ReactQuill
const originalError = console.error;
console.error = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('findDOMNode is deprecated')) {
    return;
  }
  originalError.call(console, ...args);
};

const container = document.getElementById("root");
if (!container) throw new Error('Failed to find the root element');

const root = createRoot(container);
root.render(<App />);

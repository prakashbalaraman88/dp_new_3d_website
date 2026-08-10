import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { captureAttribution, initPixel } from './utils/analytics';

// Capture campaign context, then start the Pixel only when prior consent exists.
captureAttribution();
initPixel();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

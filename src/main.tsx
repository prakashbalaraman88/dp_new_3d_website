import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { captureAttribution, initPixel } from './utils/analytics';

// Capture campaign context, then start the Pixel only when prior consent exists.
captureAttribution();
initPixel();

const root = document.getElementById('root')!;
// SEO prerendering adds readable article markup to the route document. The
// client app owns the same container once JavaScript is ready.
if (root.hasChildNodes()) root.replaceChildren();

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
);

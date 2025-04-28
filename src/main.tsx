// Import polyfills first to ensure they're available throughout the application
import "./polyfills";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// Import ReactDOM for legacy fallback
import App from "./App.tsx";
import "./index.css";

// Old-style browser support - fallback for browsers that don't support modern React
const renderApp = () => {
  // Try modern rendering method first
  try {
    const rootElement = document.getElementById("root");
    if (!rootElement) throw new Error("Root element not found");

    // Use createRoot if available (React 18+)
    createRoot(rootElement).render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  } catch (err) {
    console.warn("Modern React rendering failed, trying legacy method:", err);

    // Fallback for older browsers or environments
    try {
      const rootElement = document.getElementById("root");

      // Check if ReactDOM is available and has render method
      if (rootElement) {
        // Use modern rendering method as fallback
        createRoot(rootElement).render(
          <StrictMode>
            <App />
          </StrictMode>
        );
      } else {
        throw new Error("Root element not found for fallback rendering");
      }
    } catch (fallbackErr) {
      console.error("All rendering methods failed:", fallbackErr);

      // Display a friendly error message to the user
      const rootElement = document.getElementById("root");
      if (rootElement) {
        rootElement.innerHTML = `
          <div style="max-width: 500px; margin: 2rem auto; padding: 2rem; text-align: center; font-family: sans-serif;">
            <h1 style="margin-bottom: 1rem; color: #333;">Browser Compatibility Issue</h1>
            <p style="margin-bottom: 1rem; color: #666;">
              We're having trouble running this application in your browser. Please try using
              a more recent browser like Chrome, Firefox, Safari, or Edge.
            </p>
            <p style="font-size: 0.8rem; color: #888;">
              Error details: ${
                (fallbackErr as Error)?.message || "Unknown error"
              }
            </p>
          </div>
        `;
      }
    }
  }
};

// Attempt to render the application
renderApp();

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./lib/auth";
import { warmBackend } from "./lib/api";
import "./fonts.css";
import "./index.css";

// Start waking the (possibly sleeping) backend immediately, in parallel with
// booting the app, so the first real API call isn't stuck behind a cold start.
warmBackend();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);

import React from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { BrowserRouter } from "react-router-dom";
import App from "./app/App.tsx";
import "./styles/index.css";

console.log("GOOGLE CLIENT ID:", import.meta.env.VITE_GOOGLE_CLIENT_ID);
console.log("ORIGIN:", window.location.origin);

createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </GoogleOAuthProvider>
);
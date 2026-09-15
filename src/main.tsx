import React from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { BrowserRouter } from "react-router-dom";
import App from "./app/App.tsx";
import "./styles/index.css";

const requestedLanguage = new URLSearchParams(window.location.search).get("lang");
const savedLanguage = window.localStorage.getItem("han-spoon-language");
const googleLocale = (requestedLanguage ?? savedLanguage) === "zh-TW" ? "zh_TW" : undefined;

createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID} locale={googleLocale}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </GoogleOAuthProvider>
);

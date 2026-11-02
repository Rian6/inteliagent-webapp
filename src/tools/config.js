const proxy = import.meta.env.VITE_USE_API_PROXY === "true";
export const SERVIDOR_MAIN = proxy
  ? window.location.origin
  : import.meta.env.VITE_MAIN_URL || "http://localhost:8070";
export const AUTH_URL = proxy
  ? window.location.origin
  : import.meta.env.VITE_AUTH_URL || "http://localhost:8080";
export const CHAT_URL = proxy
  ? window.location.origin
  : import.meta.env.VITE_CHAT_URL || "http://localhost:5000";

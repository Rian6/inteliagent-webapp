import { AUTH_URL } from "../tools/config";
let session;
let status = { ready: false, error: "" };
let generation = 0,
  renewal,
  restoration;
const listeners = new Set();
const eventKey = "inteliagent.auth-event";
const logoutKey = "inteliagent.logged-out";
function loggedOut() {
  try {
    return localStorage.getItem(logoutKey) === "1";
  } catch {
    return false;
  }
}
const notify = () => listeners.forEach((listener) => listener());
export const getSession = () => session;
export const getSessionStatus = () => status;
export const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
function publish(user) {
  session = user && session?.id === user.id ? { ...session, ...user } : user;
  generation++;
  status = { ready: true, error: "" };
  notify();
}
function broadcast(type) {
  try {
    localStorage.setItem(
      eventKey,
      JSON.stringify({ type, nonce: Date.now() + ":" + Math.random() }),
    );
  } catch {
    /* Private browsing can disable storage. */
  }
}
export function setSession(user) {
  try {
    if (user) localStorage.removeItem(logoutKey);
    else localStorage.setItem(logoutKey, "1");
  } catch {}
  publish(user);
  broadcast(user ? "login" : "logout");
}
function expiry(token) {
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return Number(JSON.parse(atob(payload)).exp) * 1000 || 0;
  } catch {
    return 0;
  }
}
export function refreshSession(expectedToken) {
  if (expectedToken && (!session || session.token !== expectedToken))
    return Promise.resolve(session);
  if (renewal) return renewal;
  const epoch = generation;
  renewal = (async () => {
    const response = await fetch(AUTH_URL + "/api/user/refresh/web", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) {
      const error = new Error("Session renewal failed");
      error.status = response.status;
      throw error;
    }
    const user = await response.json();
    if (!user?.id || !user.idCede || !user.token) {
      const error = new Error("Invalid session");
      error.status = 401;
      throw error;
    }
    if (generation === epoch) publish(user);
    return session;
  })()
    .catch((error) => {
      if (error.status === 401 && generation === epoch) publish(undefined);
      throw error;
    })
    .finally(() => {
      renewal = undefined;
    });
  return renewal;
}
export function ensureSession() {
  if (!session) return Promise.resolve(undefined);
  if (expiry(session.token) > Date.now() + 30000)
    return Promise.resolve(session);
  return refreshSession(session.token);
}
export function restoreSession() {
  if (loggedOut()) {
    publish(undefined);
    return Promise.resolve();
  }
  if (restoration) return restoration;
  const epoch = generation;
  if (!session) {
    status = { ready: false, error: "" };
    notify();
  }
  restoration = refreshSession()
    .catch((error) => {
      if (error.status !== 401 && generation === epoch) {
        status = {
          ready: true,
          error:
            "Não foi possível restaurar sua sessão. Verifique a conexão e tente novamente.",
        };
        notify();
      }
    })
    .finally(() => {
      restoration = undefined;
    });
  return restoration;
}
export function invalidateSession(token) {
  if (session?.token === token) publish(undefined);
}
export function logout() {
  try {
    localStorage.setItem(logoutKey, "1");
  } catch {}
  publish(undefined);
  broadcast("logout");
  // The local logout is immediate; the server also revokes this browser's refresh session.
  return fetch(AUTH_URL + "/api/user/logout/web", {
    method: "POST",
    credentials: "include",
  }).catch(() => {});
}
window.addEventListener("storage", (event) => {
  if (event.key !== eventKey || !event.newValue) return;
  try {
    const action = JSON.parse(event.newValue).type;
    publish(undefined);
    if (action === "login") restoreSession();
  } catch {
    /* Ignore malformed notifications. */
  }
});
const renewIfActive = () => {
  if (session && document.visibilityState !== "hidden")
    ensureSession().catch(() => {});
};
window.addEventListener("focus", renewIfActive);
document.addEventListener("visibilitychange", renewIfActive);
setInterval(renewIfActive, 60000);

export function updatePermissions(id,permissions){if(!session||session.id!==id)return;session={...session,permissions};notify();}

export function updateProfile(profile) {
  if (!session || session.id !== profile.id) return;
  const {nome,email,role,idCede,situacaoAprovacao,codigoSede,nomeSede,foto}=profile;
  session={...session,nome,email,role,idCede,situacaoAprovacao,codigoSede,nomeSede,foto};
  notify();
}

import axios from "axios";
import {
  getSession,
  ensureSession,
  refreshSession,
  invalidateSession,
} from "./session";
import { SERVIDOR_MAIN, AUTH_URL, CHAT_URL } from "../tools/config";
const origins = [SERVIDOR_MAIN, AUTH_URL, CHAT_URL].map(
  (url) => new URL(url, window.location.origin).origin,
);
const publicPaths = new Set([
  "/api/user/login",
  "/api/user/login/web",
  "/api/user/register",
  "/api/user/sendEmail",
  "/api/user/validateRegisterUser",
  "/api/user/validateCodeUserRegister",
  "/api/user/password/request",
  "/api/user/password/reset",
  "/api/cede/validate",
]);
export const api = axios.create({ timeout: 15000 });
api.interceptors.request.use(async (config) => {
  const url = new URL(config.url, config.baseURL || window.location.origin);
  config._protectedInternal =
    origins.includes(url.origin) && !publicPaths.has(url.pathname);
  if (config._protectedInternal) {
    const user = await ensureSession();
    config._sessionToken = user?.token;
    if (user?.token) config.headers.Authorization = "Bearer " + user.token;
  }
  return config;
});
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    if (error.response?.status === 401 && config?._protectedInternal) {
      if (!config._authRetried && getSession()) {
        config._authRetried = true;
        const user = await refreshSession(config._sessionToken);
        if (user?.token) {
          config.headers.Authorization = "Bearer " + user.token;
          return api(config);
        }
      }
      invalidateSession(config._sessionToken);
    }
    return Promise.reject(error);
  },
);
export const errorMessage = (error) =>
  error.response?.status === 403
    ? "Você não tem permissão para esta operação."
    : "Não foi possível concluir a operação. Tente novamente.";

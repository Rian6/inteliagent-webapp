import { api } from "./api";
export async function apiFetch(url, options = {}) {
  const response = await api({
    url,
    method: options.method || "GET",
    data: options.body ? JSON.parse(options.body) : undefined,
    signal: options.signal,
  });
  return {
    ok: response.status >= 200 && response.status < 300,
    status: response.status,
    json: async () => response.data,
  };
}

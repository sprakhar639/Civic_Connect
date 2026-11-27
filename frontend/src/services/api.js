import axios from "axios";

import { API_URL } from "../config/env";
import { tokenStorage } from "./tokenStorage";

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

const DEFAULT_MESSAGES = {
  400: "The request was invalid. Check the form and try again.",
  401: "Your session has expired. Please sign in again.",
  403: "You don't have permission to do that.",
  404: "We couldn't find what you were looking for.",
  413: "That file is too large for the server to accept.",
  500: "The server ran into a problem. Please try again shortly.",
};

// Logs the admin out everywhere: AuthContext listens for this event.
export function signalUnauthorized() {
  tokenStorage.clear();
  window.dispatchEvent(new Event("auth:unauthorized"));
}

const api = axios.create({ baseURL: API_URL, timeout: 30_000 });

api.interceptors.request.use((config) => {
  const token = tokenStorage.getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isCancel(error)) return Promise.reject(error);

    if (!error.response) {
      return Promise.reject(
        new ApiError("Can't reach the CivicConnect server. Check that the backend is running.", 0),
      );
    }

    const { status, data } = error.response;

    // A failed login is a 401 too, but there's no session to drop yet.
    const isLoginRequest = error.config?.url?.endsWith("/auth/login");
    if (status === 401 && !isLoginRequest) signalUnauthorized();

    return Promise.reject(
      new ApiError(
        data?.message || data?.error || DEFAULT_MESSAGES[status] || `Request failed with status ${status}`,
        status,
        data?.errors,
      ),
    );
  },
);

export default api;

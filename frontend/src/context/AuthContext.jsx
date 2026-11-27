import { createContext, useCallback, useContext, useEffect, useState } from "react";

import * as authService from "../features/auth/auth.service";
import { decodeTokenExpiry, isTokenExpired, tokenStorage } from "../services/tokenStorage";

const AuthContext = createContext(null);

// Pure: StrictMode may call it twice. Stale tokens are cleared in an effect.
function restoreSession() {
  const token = tokenStorage.getToken();
  const user = tokenStorage.getUser();
  if (!token || !user) return { user: null, expired: false };
  if (isTokenExpired(token)) return { user: null, expired: true };
  return { user, expired: false };
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(restoreSession);

  useEffect(() => {
    const token = tokenStorage.getToken();
    if (token && isTokenExpired(token)) tokenStorage.clear();
  }, []);

  // The API client fires this on any 401 from an admin endpoint.
  useEffect(() => {
    function handleUnauthorized() {
      setSession((prev) => ({ user: null, expired: Boolean(prev.user) }));
    }
    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, []);

  // Log out the moment the JWT expires, rather than on the next failed request.
  useEffect(() => {
    if (!session.user) return;
    const expiresAt = decodeTokenExpiry(tokenStorage.getToken());
    if (!expiresAt) return;

    const timer = setTimeout(() => {
      tokenStorage.clear();
      setSession({ user: null, expired: true });
    }, Math.max(0, expiresAt - Date.now()));
    return () => clearTimeout(timer);
  }, [session.user]);

  const login = useCallback(async (credentials) => {
    const { token, user } = await authService.login(credentials);
    tokenStorage.save(token, user);
    setSession({ user, expired: false });
    return user;
  }, []);

  const logout = useCallback(() => {
    tokenStorage.clear();
    setSession({ user: null, expired: false });
  }, []);

  return (
    <AuthContext.Provider value={{ user: session.user, sessionExpired: session.expired, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook lives beside its provider; only affects fast refresh of this file.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}

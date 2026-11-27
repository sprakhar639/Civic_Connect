// The admin session: a JWT plus the user it belongs to, kept in localStorage.

const TOKEN_KEY = "civicconnect:token";
const USER_KEY = "civicconnect:user";

function safeGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

// Reads the `exp` claim (seconds) without verifying the signature; the
// backend still verifies every request.
export function decodeTokenExpiry(token) {
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const { exp } = JSON.parse(atob(payload));
    return typeof exp === "number" ? exp * 1000 : null;
  } catch {
    return null;
  }
}

export function isTokenExpired(token) {
  const expiresAt = decodeTokenExpiry(token);
  return expiresAt !== null && expiresAt <= Date.now();
}

export const tokenStorage = {
  getToken() {
    return safeGet(TOKEN_KEY);
  },

  getUser() {
    try {
      return JSON.parse(safeGet(USER_KEY));
    } catch {
      return null;
    }
  },

  save(token, user) {
    try {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch {
      // Storage blocked; the session lasts until reload.
    }
  },

  clear() {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {
      // Nothing to clear.
    }
  },
};

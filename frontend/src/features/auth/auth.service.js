import { USE_MOCKS } from "../../config/env";
import { toUser, unwrap } from "../../services/adapters";
import api from "../../services/api";
import * as mock from "../../services/mock/mockServer";

// POST /api/auth/login -> { data: { token, user: { id, username, email, role } } }
export async function login(credentials) {
  if (USE_MOCKS) return mock.auth.login(credentials);
  const { data } = await api.post("/api/auth/login", credentials);
  const { token, user } = unwrap(data);
  return { token, user: toUser(user) };
}

import { getToken, setToken } from "./api";
import { isExpired, parseJwt, type JwtPayload } from "./jwt";

export function getAuth() {
  const token = getToken();
  if (!token) return { token: null as string | null, payload: null as JwtPayload | null };

  const payload = parseJwt(token);
  if (!payload || isExpired(payload)) {
    setToken(null);
    return { token: null as string | null, payload: null as JwtPayload | null };
  }

  return { token, payload };
}

export function logout() {
  setToken(null);
}

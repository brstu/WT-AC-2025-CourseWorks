export type JwtPayload = {
  userId: string;
  role: "ADMIN" | "AGENT" | "USER";
  iat?: number;
  exp?: number;
};

function base64UrlDecode(input: string) {
  const pad = input.length % 4;
  const base64 = (input + (pad ? "=".repeat(4 - pad) : "")).replace(/-/g, "+").replace(/_/g, "/");
  const decoded = atob(base64);
  // handle utf-8
  try {
    return decodeURIComponent(
      decoded
        .split("")
        .map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, "0")}`)
        .join("")
    );
  } catch {
    return decoded;
  }
}

export function parseJwt(token: string): JwtPayload | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const payloadJson = base64UrlDecode(parts[1]);
    return JSON.parse(payloadJson) as JwtPayload;
  } catch {
    return null;
  }
}

export function isExpired(payload: JwtPayload | null) {
  if (!payload?.exp) return false;
  const now = Math.floor(Date.now() / 1000);
  return payload.exp <= now;
}

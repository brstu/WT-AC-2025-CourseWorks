export type ApiOk<T> = { status: "ok"; data: T };

const DEFAULT_API_URL = "http://localhost:3000";

export function getApiBaseUrl() {
  const fromEnv = (import.meta as any).env?.VITE_API_URL as string | undefined;
  return (fromEnv && fromEnv.trim()) || DEFAULT_API_URL;
}

export function getToken(): string | null {
  return localStorage.getItem("token");
}

export function setToken(token: string | null) {
  if (!token) localStorage.removeItem("token");
  else localStorage.setItem("token", token);
}

async function readJsonSafe(res: Response) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return { status: "error", error: { message: text } };
  }
}

export async function apiRequest<T>(
  path: string,
  options: {
    method?: string;
    token?: string | null;
    body?: any;
  } = {}
): Promise<ApiOk<T>> {
  const url = `${getApiBaseUrl()}${path}`;
  const token = options.token ?? getToken();

  const res = await fetch(url, {
    method: options.method ?? "GET",
    headers: {
      ...(options.body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const json = await readJsonSafe(res);

  if (!res.ok) {
    const message = json?.message || json?.error || `HTTP ${res.status}`;
    throw new Error(typeof message === "string" ? message : JSON.stringify(message));
  }

  return json as ApiOk<T>;
}

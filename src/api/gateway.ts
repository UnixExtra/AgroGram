export type AuthStep = "wait_phone" | "wait_code" | "wait_password" | "ready" | "logging_out";

export interface AuthState {
  step: AuthStep;
}

export interface ChatSummary {
  id: number;
  title: string;
  lastMessage?: string;
  unread: number;
  pinned: boolean;
  updatedAt: number;
}

export type GatewayError =
  | { kind: "not_configured" }
  | { kind: "network"; message: string }
  | { kind: "unauthorized" }
  | { kind: "server"; status: number; message: string };

export class GatewayClientError extends Error {
  constructor(public readonly info: GatewayError) {
    super(info.kind);
  }
}

const BASE = (import.meta.env.VITE_GATEWAY_URL as string | undefined)?.replace(/\/$/, "") ?? "";

export const gatewayConfigured = BASE.length > 0 || import.meta.env.DEV;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!gatewayConfigured) throw new GatewayClientError({ kind: "not_configured" });
  let res: Response;
  try {
    res = await fetch(`${BASE}/api${path}`, {
      ...init,
      credentials: "include",
      headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    });
  } catch (e) {
    throw new GatewayClientError({
      kind: "network",
      message: e instanceof Error ? e.message : "Нет соединения",
    });
  }
  if (res.status === 401) throw new GatewayClientError({ kind: "unauthorized" });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new GatewayClientError({ kind: "server", status: res.status, message: body.slice(0, 200) });
  }
  return (await res.json()) as T;
}

export const gateway = {
  authState: () => request<AuthState>("/auth/state"),
  submitPhone: (phone: string) =>
    request<AuthState>("/auth/phone", { method: "POST", body: JSON.stringify({ phone }) }),
  submitCode: (code: string) =>
    request<AuthState>("/auth/code", { method: "POST", body: JSON.stringify({ code }) }),
  submitPassword: (password: string) =>
    request<AuthState>("/auth/password", { method: "POST", body: JSON.stringify({ password }) }),
  logout: () => request<AuthState>("/auth/logout", { method: "POST" }),
  chats: () => request<{ chats: ChatSummary[] }>("/chats"),
};

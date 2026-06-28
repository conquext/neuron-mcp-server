import axios, { AxiosError } from "axios";
import { readFileSync, writeFileSync, mkdirSync, chmodSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

// Resolve API URL: prefer NEURON_API_URL if it points to a real server (not Docker-internal hostnames)
const envUrl = process.env.NEURON_API_URL || "";
const isDockerInternal = envUrl.includes("neuron-api:") || (envUrl.includes("localhost") && !envUrl.includes("https://"));
const BASE_URL = isDockerInternal ? "https://api.neuron.ng/api/v1" : (envUrl || "https://api.neuron.ng/api/v1");

const TOKEN_CACHE_DIR = join(homedir(), ".neuron");
const TOKEN_CACHE_FILE = join(TOKEN_CACHE_DIR, "mcp-token-cache.json");

function readCachedToken(): string {
  try {
    const raw = readFileSync(TOKEN_CACHE_FILE, "utf-8");
    const cache = JSON.parse(raw);
    if (cache.baseUrl === BASE_URL && cache.token) {
      return cache.token;
    }
  } catch {
    // No cache or unreadable — that's fine
  }
  return "";
}

function writeCachedToken(token: string): void {
  try {
    mkdirSync(TOKEN_CACHE_DIR, { recursive: true, mode: 0o700 });
    writeFileSync(TOKEN_CACHE_FILE, JSON.stringify({ baseUrl: BASE_URL, token }), { mode: 0o600 });
  } catch {
    // Non-critical — best effort
  }
}

let authToken = process.env.NEURON_AUTH_TOKEN || readCachedToken();

export function setAuthToken(token: string): void {
  authToken = token;
  writeCachedToken(token);
}

export function getAuthToken(): string {
  return authToken;
}

export function getBaseUrl(): string {
  return BASE_URL;
}

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: { message: string; code: string; details?: unknown };
}

export async function api<T = unknown>(
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  endpoint: string,
  data?: unknown,
  params?: Record<string, string | number | undefined>,
  headers?: Record<string, string>,
): Promise<ApiResponse<T>> {
  try {
    const cleanParams: Record<string, string | number> = {};
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined) cleanParams[k] = v;
      }
    }

    const cleanEndpoint = endpoint.replace(/^\/+/, "");
    const response = await axios({
      method,
      url: `${BASE_URL}/${cleanEndpoint}`,
      data,
      params: Object.keys(cleanParams).length > 0 ? cleanParams : undefined,
      timeout: 60000,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...headers,
      },
    });
    return response.data as ApiResponse<T>;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data) {
      return error.response.data as ApiResponse<T>;
    }
    throw error;
  }
}

export function handleError(error: unknown): string {
  if (error instanceof AxiosError) {
    if (error.response) {
      const body = error.response.data as ApiResponse;
      const msg = body?.error?.message || `HTTP ${error.response.status}`;
      return `Error: ${msg}`;
    }
    const url = error.config?.url || BASE_URL;
    if (error.code === "ECONNABORTED") return `Error: Request timed out connecting to ${url}`;
    if (error.code === "ECONNREFUSED") {
      return `Error: Connection refused to ${url}. Try: neuron_login({ token: "your-mcp-token" }) with a token from the Neuron dashboard.`;
    }
    if (error.code === "ENOTFOUND") return `Error: DNS lookup failed for ${url}. Check your network connection.`;
    return `Error: Network error (${error.code || "unknown"}): ${error.message} — URL: ${url}`;
  }
  return `Error: ${error instanceof Error ? error.message : String(error)}`;
}

export function jsonResult(data: unknown): { content: Array<{ type: "text"; text: string }> } {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

export function textResult(text: string): { content: Array<{ type: "text"; text: string }> } {
  return { content: [{ type: "text" as const, text }] };
}

export function errorResult(error: unknown): { content: Array<{ type: "text"; text: string }>; isError: true } {
  return { content: [{ type: "text" as const, text: handleError(error) }], isError: true };
}

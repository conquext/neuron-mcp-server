import { z } from "zod";
import http from "node:http";
import net from "node:net";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { api, jsonResult, textResult, errorResult, setAuthToken, getAuthToken } from "../client.js";

/** Find an available port by binding to port 0. */
function findAvailablePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.listen(0, "127.0.0.1", () => {
      const addr = srv.address();
      if (addr && typeof addr === "object") {
        const port = addr.port;
        srv.close(() => resolve(port));
      } else {
        srv.close(() => reject(new Error("Could not determine port")));
      }
    });
    srv.on("error", reject);
  });
}

/** Start a temporary HTTP server that waits for a callback with a token. */
function startCallbackServer(port: number): {
  server: http.Server;
  tokenPromise: Promise<string>;
  shutdown: () => void;
} {
  let resolveToken: (token: string) => void;
  let rejectToken: (err: Error) => void;
  const tokenPromise = new Promise<string>((resolve, reject) => {
    resolveToken = resolve;
    rejectToken = reject;
  });

  const server = http.createServer((req, res) => {
    const url = new URL(req.url || "/", `http://127.0.0.1:${port}`);

    if (url.pathname === "/callback") {
      const token = url.searchParams.get("token");
      if (token) {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end("<html><body><h2>Authorization successful!</h2><p>You can close this tab and return to your terminal.</p></body></html>");
        resolveToken(token);
      } else {
        res.writeHead(400, { "Content-Type": "text/plain" });
        res.end("Missing token parameter");
      }
    } else {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not found");
    }
  });

  server.listen(port, "127.0.0.1");

  const shutdown = () => {
    server.close();
    rejectToken(new Error("Server shut down"));
  };

  return { server, tokenPromise, shutdown };
}

/** Poll the backend for session approval. */
async function pollForApproval(sessionId: string, timeoutMs: number, intervalMs: number): Promise<string | null> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, intervalMs));

    try {
      const result = await api<{ status: string; token?: string }>("GET", `/auth/mcp/sessions/${sessionId}`);
      const data = result.data as { status: string; token?: string } | undefined;

      if (data?.status === "approved" && data.token) {
        return data.token;
      }
      if (data?.status === "consumed" || data?.status === "expired") {
        return null;
      }
    } catch {
      // Ignore transient errors, keep polling
    }
  }

  return null;
}

// Track pending browser auth session for non-blocking flow
let pendingSessionId: string | null = null;

export function registerAuthTools(server: McpServer): void {
  // Register
  server.registerTool(
    "neuron_register",
    {
      title: "Register New User",
      description: "Register a new user account with name, email, password, and organization name",
      inputSchema: z.object({
        name: z.string().describe("Full name of the user"),
        email: z.string().email().describe("Email address of the user"),
        password: z.string().min(8).describe("Password for the account (minimum 8 characters)"),
        orgName: z.string().describe("Name of the organization to create"),
      }),
      annotations: { destructiveHint: false },
    },
    async (params) => {
      try {
        const result = await api("POST", "/auth/register", {
          name: params.name,
          email: params.email,
          password: params.password,
          orgName: params.orgName,
        });
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  // Login (multi-mode)
  server.registerTool(
    "neuron_login",
    {
      title: "Login to Neuron",
      description:
        "Authenticate with Neuron. Three modes:\n" +
        "1. No args: Opens a browser URL for secure authorization (recommended — no credentials shared with AI)\n" +
        "2. token: Paste an MCP token from the Neuron dashboard\n" +
        "3. email+password: Legacy login (credentials visible to AI)",
      inputSchema: z.object({
        token: z.string().optional().describe("MCP token from Neuron dashboard (Settings > MCP Tokens)"),
        email: z.string().email().optional().describe("Email for legacy login"),
        password: z.string().optional().describe("Password for legacy login"),
      }).refine(
        (data) => {
          const hasToken = !!data.token;
          const hasCredentials = !!data.email && !!data.password;
          const hasPartialCredentials = !!data.email !== !!data.password;
          if (hasPartialCredentials) return false;
          if (hasToken && hasCredentials) return false;
          return true;
        },
        { message: "Provide either token, email+password, or nothing for browser auth" },
      ),
      annotations: { destructiveHint: false },
    },
    async (params) => {
      try {
        // Mode 1: Direct token
        if (params.token) {
          setAuthToken(params.token);
          const me = await api("GET", "/auth/me");
          if (!(me as any).success) {
            setAuthToken("");
            return errorResult(new Error("Invalid token. Please check and try again."));
          }
          const user = (me as any).data;
          return textResult(
            `Authenticated successfully as ${user.name} (${user.email})` +
            (user.organization ? ` — org: ${user.organization.name}` : ""),
          );
        }

        // Mode 2: Legacy email/password
        if (params.email && params.password) {
          const result = await api("POST", "/auth/login", {
            email: params.email,
            password: params.password,
          });
          if ((result as any).data?.accessToken) {
            setAuthToken((result as any).data.accessToken);
          }
          return jsonResult(result);
        }

        // Mode 3: Browser auth (default — no args)
        const isRemote = process.env.MCP_TRANSPORT === "http";

        // Check if background polling already set the token
        if (getAuthToken()) {
          try {
            const me = await api("GET", "/auth/me");
            const user = (me as any).data;
            if (user && (me as any).success) {
              pendingSessionId = null;
              return textResult(
                `Already authenticated as ${user.name} (${user.email})` +
                (user.organization ? ` — org: ${user.organization.name}` : ""),
              );
            }
          } catch {
            // Token invalid, continue with auth flow
            setAuthToken("");
          }
        }

        // Check if we have a pending session that was already approved
        if (pendingSessionId) {
          const token = await pollForApproval(pendingSessionId, 5000, 1000);
          if (token) {
            pendingSessionId = null;
            setAuthToken(token);
            const me = await api("GET", "/auth/me");
            const user = (me as any).data;
            return textResult(
              `Authenticated successfully as ${user?.name || "user"} (${user?.email || "unknown"})` +
              (user?.organization ? ` — org: ${user.organization.name}` : ""),
            );
          }
          // Session still pending or expired — create a new one
        }

        // For local/stdio mode, start a callback server. For remote/HTTP mode, skip it.
        let callbackUrl: string | undefined;
        let callbackPort: number | undefined;
        if (!isRemote) {
          try {
            callbackPort = await findAvailablePort();
            callbackUrl = `http://127.0.0.1:${callbackPort}/callback`;
          } catch {
            // Can't bind locally — skip callback server
          }
        }

        // Create session on backend
        const sessionResult = await api<{ sessionId: string; authUrl: string }>(
          "POST",
          "/auth/mcp/sessions",
          { callbackUrl: callbackUrl || "http://127.0.0.1:0/callback" },
        );

        const sessionData = (sessionResult as any).data;
        if (!sessionData?.sessionId || !sessionData?.authUrl) {
          return errorResult(new Error("Failed to create auth session. Is the server running?"));
        }

        const { sessionId, authUrl } = sessionData;
        pendingSessionId = sessionId;

        // Start background polling (non-blocking)
        const TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
        const POLL_INTERVAL_MS = 3000;

        // Fire-and-forget: poll in background and auto-set token when approved
        pollForApproval(sessionId, TIMEOUT_MS, POLL_INTERVAL_MS).then((token) => {
          if (token) {
            setAuthToken(token);
            pendingSessionId = null;
            console.error("✅ Neuron authorization approved. Token set automatically.");
          }
        }).catch(() => {});

        // Also start local callback server if available (for local/stdio mode only)
        if (callbackPort && !isRemote) {
          try {
            const { tokenPromise, shutdown } = startCallbackServer(callbackPort);
            tokenPromise.then((token) => {
              setAuthToken(token);
              pendingSessionId = null;
              console.error("✅ Neuron authorization approved via callback. Token set automatically.");
            }).catch(() => {});
            // Auto-shutdown after timeout
            setTimeout(() => shutdown(), TIMEOUT_MS);
          } catch {
            // Callback server not critical
          }
        }

        // Return immediately with the URL — don't block!
        return textResult(
          `🔗 Open this URL to authorize Neuron:\n\n  ${authUrl}\n\n` +
          `After approving in your browser, run neuron_login() again (no args) to confirm.\n\n` +
          `Alternatively, generate a token at Settings > MCP Tokens in the Neuron dashboard and run:\n` +
          `neuron_login({ token: "your-token-here" })`,
        );
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  // Refresh Token
  server.registerTool(
    "neuron_refresh_token",
    {
      title: "Refresh Access Token",
      description: "Refresh the access token using a refresh token. Automatically sets the new access token.",
      inputSchema: z.object({
        refreshToken: z.string().describe("Refresh token obtained from login"),
      }),
      annotations: { destructiveHint: false },
    },
    async (params) => {
      try {
        const result = await api("POST", "/auth/refresh", {
          refreshToken: params.refreshToken,
        });
        if ((result as any).data?.accessToken) {
          setAuthToken((result as any).data.accessToken);
        }
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  // Switch Organization
  server.registerTool(
    "neuron_switch_org",
    {
      title: "Switch Organization",
      description: "Switch to a different organization. Returns a new access token and automatically sets it.",
      inputSchema: z.object({
        orgId: z.string().describe("ID of the organization to switch to"),
      }),
    },
    async (params) => {
      try {
        const result = await api("POST", "/auth/switch-org", { orgId: params.orgId });
        if ((result as any).data?.accessToken) {
          setAuthToken((result as any).data.accessToken);
        }
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  // List Organizations
  server.registerTool(
    "neuron_list_organizations",
    {
      title: "List Organizations",
      description: "List all organizations the authenticated user belongs to",
      inputSchema: z.object({}),
      annotations: { readOnlyHint: true },
    },
    async () => {
      try {
        const result = await api("GET", "/auth/organizations");
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  // Get Profile
  server.registerTool(
    "neuron_get_profile",
    {
      title: "Get User Profile",
      description: "Get the authenticated user's profile information",
      inputSchema: z.object({}),
      annotations: { readOnlyHint: true },
    },
    async () => {
      try {
        const result = await api("GET", "/auth/me");
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  // Who Am I
  server.registerTool(
    "neuron_whoami",
    {
      title: "Check Current Account",
      description: "Check which Neuron account is currently logged in, including user name, email, role, and organization.",
      inputSchema: z.object({}),
      annotations: { readOnlyHint: true },
    },
    async () => {
      if (!getAuthToken()) {
        return textResult("Not logged in. Use neuron_login() to authenticate.");
      }
      try {
        const result = await api("GET", "/auth/me");
        const user = (result as any).data;
        if (!user || !(result as any).success) {
          return textResult("Not logged in or token is invalid. Use neuron_login() to authenticate.");
        }
        const lines = [
          `Logged in as: ${user.name} (${user.email})`,
          `Role: ${user.role || "member"}`,
          user.organization ? `Organization: ${user.organization.name}` : null,
        ].filter(Boolean);
        return textResult(lines.join("\n"));
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  // Logout
  server.registerTool(
    "neuron_logout",
    {
      title: "Logout",
      description: "Clear the current auth token locally. Does NOT revoke server-side MCP tokens — revoke from the Neuron dashboard (Settings > MCP Tokens) for full invalidation.",
      inputSchema: z.object({}),
    },
    async () => {
      setAuthToken("");
      return textResult("Logged out. Token cleared locally.\n\nTo revoke MCP tokens server-side, go to Settings > MCP Tokens in the Neuron dashboard.");
    },
  );
}

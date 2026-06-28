#!/usr/bin/env node
/**
 * Neuron MCP Server
 *
 * Exposes the full Neuron AI chatbot platform as MCP tools.
 * Supports 120+ tools covering bots, conversations, knowledge bases,
 * tools, webhooks, built-in tools, reflections, channels, contacts,
 * broadcasts, billing, media, AI, marketplace, and more.
 *
 * Environment variables:
 *   NEURON_API_URL   - Base URL (default: https://api.neuron.ng/api/v1)
 *   NEURON_AUTH_TOKEN - Pre-set JWT or API key for authentication
 *   MCP_TRANSPORT    - "http" for Streamable HTTP, "stdio" (default) for stdio
 *   PORT             - HTTP server port (default: 3001)
 *
 * Transports:
 *   stdio - For local Claude Code / IDE integration (default)
 *   http  - For remote connections (Claude.ai custom connectors)
 */

import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

// Load .env from mcp-server directory (not CWD which may be the project root)
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env") });

import { randomUUID } from "node:crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";

import { registerAuthTools } from "./tools/auth.js";
import { registerBotTools } from "./tools/bots.js";
import { registerBotApiKeyTools } from "./tools/bot-api-keys.js";
import { registerBotApiTools } from "./tools/bot-api.js";
import { registerConversationTools } from "./tools/conversations.js";
import { registerKnowledgeBaseTools } from "./tools/knowledge-bases.js";
import { registerToolsTools } from "./tools/tools.js";
import { registerWebhooksTools } from "./tools/webhooks.js";
import { registerReflectionsTools } from "./tools/reflections.js";
import { registerChannelsTools } from "./tools/channels.js";
import { registerPoolTools } from "./tools/pool.js";
import { registerOrganizationTools } from "./tools/organizations.js";
import { registerAuditTools } from "./tools/audit.js";
import { registerBuiltinToolsTools } from "./tools/builtin-tools.js";
import { registerOutboundWebhookTools } from "./tools/outbound-webhooks.js";
import { registerContactsTools } from "./tools/contacts.js";
import { registerContactListsTools } from "./tools/contact-lists.js";
import { registerBroadcastsTools } from "./tools/broadcasts.js";
import { registerBillingTools } from "./tools/billing.js";
import { registerMediaTools } from "./tools/media.js";
import { registerAiTools } from "./tools/ai.js";
import { registerCampaignTools } from "./tools/campaigns.js";
import { registerWalletTools } from "./tools/wallets.js";
import { registerPayoutTools } from "./tools/payouts.js";
import { registerBlogTools } from "./tools/blog.js";
import { registerNewsletterTools } from "./tools/newsletters.js";
import { registerListPoolTools } from "./tools/list-pool.js";

function createServer(): McpServer {
  const server = new McpServer({
    name: "neuron-mcp-server",
    version: "1.0.0",
  });

  // Register all tool groups
  registerAuthTools(server);
  registerBotTools(server);
  registerBotApiKeyTools(server);
  registerBotApiTools(server);
  registerConversationTools(server);
  registerKnowledgeBaseTools(server);
  registerToolsTools(server);
  registerWebhooksTools(server);
  registerReflectionsTools(server);
  registerChannelsTools(server);
  registerPoolTools(server);
  registerOrganizationTools(server);
  registerAuditTools(server);
  registerBuiltinToolsTools(server);
  registerOutboundWebhookTools(server);
  registerContactsTools(server);
  registerContactListsTools(server);
  registerBroadcastsTools(server);
  registerBillingTools(server);
  registerMediaTools(server);
  registerAiTools(server);
  registerCampaignTools(server);
  registerWalletTools(server);
  registerPayoutTools(server);
  registerBlogTools(server);
  registerNewsletterTools(server);
  registerListPoolTools(server);

  return server;
}

async function startStdio() {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Neuron MCP server running via stdio");
}

async function startHttp() {
  const PORT = parseInt(process.env.PORT || "3001", 10);
  const app = createMcpExpressApp({ host: "0.0.0.0" });

  const transports: Record<string, StreamableHTTPServerTransport> = {};

  function createTransport(): StreamableHTTPServerTransport {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      onsessioninitialized: (sid) => {
        transports[sid] = transport;
        console.error(`Session initialized: ${sid}`);
      },
    });

    transport.onclose = () => {
      const sid = transport.sessionId;
      if (sid && transports[sid]) {
        delete transports[sid];
      }
    };

    return transport;
  }

  app.all("/mcp", async (req, res) => {
    try {
      const sessionId = req.headers["mcp-session-id"] as string | undefined;
      let transport: StreamableHTTPServerTransport;

      if (sessionId && transports[sessionId]) {
        // Known session — reuse existing transport
        transport = transports[sessionId];
      } else if (req.method === "POST" && isInitializeRequest(req.body)) {
        // New or re-initializing client — create a fresh session
        // (handles both no session ID and stale session ID after server restart)
        transport = createTransport();
        const server = createServer();
        await server.connect(transport);
      } else if (sessionId && !transports[sessionId]) {
        // Stale session ID with a non-initialize request — tell client to re-initialize
        res.status(404).json({
          jsonrpc: "2.0",
          error: { code: -32000, message: "Session expired. Please reconnect." },
          id: null,
        });
        return;
      } else {
        res.status(400).json({
          jsonrpc: "2.0",
          error: { code: -32000, message: "Bad Request: No valid session ID provided" },
          id: null,
        });
        return;
      }

      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      console.error("Error handling MCP request:", error);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: "2.0",
          error: { code: -32603, message: "Internal server error" },
          id: null,
        });
      }
    }
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.error(`Neuron MCP server listening on http://0.0.0.0:${PORT}/mcp`);
  });

  process.on("SIGINT", async () => {
    console.error("Shutting down...");
    for (const sid of Object.keys(transports)) {
      await transports[sid].close().catch(() => {});
      delete transports[sid];
    }
    process.exit(0);
  });
}

const mode = process.env.MCP_TRANSPORT || "stdio";

if (mode === "http") {
  startHttp().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
  });
} else {
  startStdio().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
  });
}

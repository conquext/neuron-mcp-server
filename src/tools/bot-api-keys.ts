import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { api, jsonResult, errorResult } from "../client.js";

export function registerBotApiKeyTools(server: McpServer): void {
  // Create API Key
  server.registerTool(
    "neuron_create_api_key",
    {
      title: "Create API Key",
      description: "Generate a new API key for a bot to enable programmatic access. The key will have an 'nrn_' prefix and can optionally expire at a specified date.",
      annotations: {
        
        
      },
      inputSchema: z.object({
        botId: z.string().describe("The unique identifier of the bot for which to create the API key"),
        name: z.string().describe("A descriptive name for the API key to identify its purpose"),
        expiresAt: z.string().optional().describe("Optional ISO 8601 date-time when the key should expire (e.g., '2026-12-31T23:59:59Z')"),
      }),
    },
    async (params) => {
      try {
        const { botId, ...keyData } = params;
        const result = await api("POST", `bots/${botId}/api-keys`, keyData);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // List API Keys
  server.registerTool(
    "neuron_list_api_keys",
    {
      title: "List API Keys",
      description: "Retrieve all API keys associated with a specific bot including their names, creation dates, expiration dates, and revocation status.",
      annotations: {
        
        
      },
      inputSchema: z.object({
        botId: z.string().describe("The unique identifier of the bot whose API keys to retrieve"),
      }),
    },
    async (params) => {
      try {
        const result = await api("GET", `bots/${params.botId}/api-keys`);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // Revoke API Key
  server.registerTool(
    "neuron_revoke_api_key",
    {
      title: "Revoke API Key",
      description: "Revoke an API key to immediately invalidate it and prevent further use. This action cannot be undone.",
      annotations: {
        
        
      },
      inputSchema: z.object({
        botId: z.string().describe("The unique identifier of the bot that owns the API key"),
        keyId: z.string().describe("The unique identifier of the API key to revoke"),
      }),
    },
    async (params) => {
      try {
        const result = await api("DELETE", `bots/${params.botId}/api-keys/${params.keyId}`);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );
}

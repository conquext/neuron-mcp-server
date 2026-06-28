import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { api, jsonResult, errorResult } from "../client.js";

/**
 * Register bot integration tools (HTTP APIs, webhooks the bot can call)
 */
export function registerToolsTools(server: McpServer): void {
  // 1. Create Tool
  server.registerTool(
    "neuron_create_tool",
    {
      title: "Create Tool",
      description: "Create a new tool integration for a bot to call external HTTP APIs and webhooks",
      inputSchema: z.object({
        botId: z.string().describe("The ID of the bot to create the tool for"),
        name: z.string().describe("Name of the tool"),
        description: z.string().optional().describe("Description of what the tool does"),
        type: z.string().describe("Type of the tool (e.g., 'http', 'webhook')"),
        config: z.object({
          url: z.string().describe("The HTTP endpoint URL"),
          method: z.string().describe("HTTP method (GET, POST, PUT, DELETE, etc.)"),
          headers: z.record(z.string()).optional().describe("HTTP headers to include"),
          bodyTemplate: z.string().optional().describe("Template for request body"),
          responseMapping: z.record(z.any()).optional().describe("How to map the response"),
        }).describe("Tool configuration object"),
        authType: z.string().optional().describe("Authentication type (bearer, basic, apiKey, etc.)"),
        rateLimit: z.number().optional().describe("Rate limit (requests per minute)"),
        timeoutMs: z.number().optional().describe("Request timeout in milliseconds"),
      }),
      annotations: {
        openWorldHint: true,
      },
    },
    async (args) => {
      const { botId, ...body } = args;
      const response = await api("POST", `/tools/bot/${botId}`, body);

      if (response.success) {
        return jsonResult(response.data);
      } else {
        return errorResult(response.error || "Failed to create tool");
      }
    }
  );

  // 2. List Tools
  server.registerTool(
    "neuron_list_tools",
    {
      title: "List Tools",
      description: "List all tool integrations for a specific bot",
      inputSchema: z.object({
        botId: z.string().describe("The ID of the bot to list tools for"),
      }),
      annotations: {
        openWorldHint: true,
      },
    },
    async (args) => {
      const response = await api("GET", `/tools/bot/${args.botId}`);

      if (response.success) {
        return jsonResult(response.data);
      } else {
        return errorResult(response.error || "Failed to list tools");
      }
    }
  );

  // 3. Update Tool
  server.registerTool(
    "neuron_update_tool",
    {
      title: "Update Tool",
      description: "Update an existing tool integration configuration",
      inputSchema: z.object({
        id: z.string().describe("The ID of the tool to update"),
        name: z.string().optional().describe("Updated name of the tool"),
        description: z.string().optional().describe("Updated description"),
        config: z.object({
          url: z.string().optional().describe("The HTTP endpoint URL"),
          method: z.string().optional().describe("HTTP method"),
          headers: z.record(z.string()).optional().describe("HTTP headers"),
          bodyTemplate: z.string().optional().describe("Template for request body"),
          responseMapping: z.record(z.any()).optional().describe("Response mapping"),
        }).optional().describe("Updated tool configuration"),
        authType: z.string().optional().describe("Updated authentication type"),
        rateLimit: z.number().optional().describe("Updated rate limit"),
        timeoutMs: z.number().optional().describe("Updated timeout in milliseconds"),
      }),
      annotations: {
        openWorldHint: true,
      },
    },
    async (args) => {
      const { id, ...body } = args;
      const response = await api("PUT", `/tools/${id}`, body);

      if (response.success) {
        return jsonResult(response.data);
      } else {
        return errorResult(response.error || "Failed to update tool");
      }
    }
  );

  // 4. Delete Tool
  server.registerTool(
    "neuron_delete_tool",
    {
      title: "Delete Tool",
      description: "Delete a tool integration from a bot",
      inputSchema: z.object({
        id: z.string().describe("The ID of the tool to delete"),
      }),
      annotations: {
        openWorldHint: true,
      },
    },
    async (args) => {
      const response = await api("DELETE", `/tools/${args.id}`);

      if (response.success) {
        return jsonResult(response.data || { message: "Tool deleted successfully" });
      } else {
        return errorResult(response.error || "Failed to delete tool");
      }
    }
  );

  // 5. Test Tool
  server.registerTool(
    "neuron_test_tool",
    {
      title: "Test Tool",
      description: "Test a tool integration with sample arguments to verify it works correctly",
      inputSchema: z.object({
        id: z.string().describe("The ID of the tool to test"),
        args: z.record(z.any()).describe("Test arguments object to pass to the tool"),
      }),
      annotations: {
        openWorldHint: true,
      },
    },
    async (args) => {
      const { id, args: testArgs } = args;
      const response = await api("POST", `/tools/${id}/test`, { args: testArgs });

      if (response.success) {
        return jsonResult(response.data);
      } else {
        return errorResult(response.error || "Tool test failed");
      }
    }
  );

  // 6. Add Tool Secret
  server.registerTool(
    "neuron_add_tool_secret",
    {
      title: "Add Tool Secret",
      description: "Add or update a secret (API key, token, etc.) for a tool integration",
      inputSchema: z.object({
        id: z.string().describe("The ID of the tool"),
        key: z.string().describe("Secret key name (e.g., 'API_KEY', 'AUTH_TOKEN')"),
        value: z.string().describe("Secret value to store securely"),
      }),
      annotations: {
        openWorldHint: true,
      },
    },
    async (args) => {
      const { id, ...body } = args;
      const response = await api("POST", `/tools/${id}/secrets`, body);

      if (response.success) {
        return jsonResult(response.data || { message: "Secret added successfully" });
      } else {
        return errorResult(response.error || "Failed to add tool secret");
      }
    }
  );

  // 7. Remove Tool Secret
  server.registerTool(
    "neuron_remove_tool_secret",
    {
      title: "Remove Tool Secret",
      description: "Remove a secret from a tool integration",
      inputSchema: z.object({
        id: z.string().describe("The ID of the tool"),
        key: z.string().describe("Secret key name to remove"),
      }),
      annotations: {
        openWorldHint: true,
      },
    },
    async (args) => {
      const response = await api("DELETE", `/tools/${args.id}/secrets/${args.key}`);

      if (response.success) {
        return jsonResult(response.data || { message: "Secret removed successfully" });
      } else {
        return errorResult(response.error || "Failed to remove tool secret");
      }
    }
  );
}

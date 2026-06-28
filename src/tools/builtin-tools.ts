import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { api, jsonResult, errorResult } from "../client.js";

/**
 * Register built-in tool management tools (enable/disable per bot)
 */
export function registerBuiltinToolsTools(server: McpServer): void {
  // 1. List Built-in Tools
  server.registerTool(
    "neuron_list_builtin_tools",
    {
      title: "List Built-in Tools",
      description:
        "List all built-in tools with their enabled/disabled status for a specific bot. " +
        "Built-in tools include WhatsApp actions (send messages, delete messages, post status), " +
        "utility functions (web search, QR codes, weather), scheduling, knowledge base search, and more.",
      inputSchema: z.object({
        botId: z.string().describe("The ID of the bot to list built-in tools for"),
      }),
      annotations: {
        readOnlyHint: true,
        openWorldHint: true,
      },
    },
    async (args) => {
      const response = await api("GET", `/builtin-tools/bot/${args.botId}`);

      if (response.success) {
        return jsonResult(response.data);
      } else {
        return errorResult(response.error || "Failed to list built-in tools");
      }
    }
  );

  // 2. Toggle Built-in Tool
  server.registerTool(
    "neuron_toggle_builtin_tool",
    {
      title: "Toggle Built-in Tool",
      description:
        "Enable or disable a specific built-in tool for a bot. " +
        "Example tool IDs: delete_message, post_to_channel, post_status, web_search, " +
        "send_direct_message, react_to_message, set_reminder, create_poll, etc.",
      inputSchema: z.object({
        botId: z.string().describe("The ID of the bot"),
        toolId: z.string().describe("The ID of the built-in tool (e.g. 'delete_message', 'post_status')"),
        enabled: z.boolean().describe("Whether to enable (true) or disable (false) the tool"),
      }),
      annotations: {
        openWorldHint: true,
      },
    },
    async (args) => {
      const { botId, toolId, enabled } = args;
      const response = await api("PUT", `/builtin-tools/bot/${botId}/${toolId}`, { enabled });

      if (response.success) {
        return jsonResult(response.data);
      } else {
        return errorResult(response.error || "Failed to toggle built-in tool");
      }
    }
  );

  // 3. Bulk Toggle Built-in Tools
  server.registerTool(
    "neuron_bulk_toggle_builtin_tools",
    {
      title: "Bulk Toggle Built-in Tools",
      description:
        "Enable or disable multiple built-in tools at once for a bot. " +
        "Pass an array of { toolId, enabled } settings.",
      inputSchema: z.object({
        botId: z.string().describe("The ID of the bot"),
        settings: z
          .array(
            z.object({
              toolId: z.string().describe("The built-in tool ID"),
              enabled: z.boolean().describe("Whether to enable or disable"),
            })
          )
          .describe("Array of tool settings to apply"),
      }),
      annotations: {
        openWorldHint: true,
      },
    },
    async (args) => {
      const { botId, settings } = args;
      const response = await api("PUT", `/builtin-tools/bot/${botId}/bulk`, { settings });

      if (response.success) {
        return jsonResult(response.data);
      } else {
        return errorResult(response.error || "Failed to bulk toggle built-in tools");
      }
    }
  );
}

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { api, jsonResult, errorResult } from "../client.js";

/**
 * Register webhook tools (inbound webhooks that trigger bot actions)
 */
export function registerWebhooksTools(server: McpServer): void {
  // 1. Create Webhook
  server.registerTool(
    "neuron_create_webhook",
    {
      title: "Create Webhook",
      description: "Create a new inbound webhook that triggers bot actions when called",
      inputSchema: z.object({
        botId: z.string().describe("The ID of the bot to create the webhook for"),
        name: z.string().describe("Name of the webhook"),
        slug: z.string().optional().describe("URL-friendly slug for the webhook endpoint"),
        eventType: z.string().optional().describe("Type of event this webhook handles"),
        processingPrompt: z.string().optional().describe("Prompt to guide bot processing of webhook data"),
        isActive: z.boolean().optional().describe("Whether the webhook is active (default: true)"),
      }),
      annotations: {
        openWorldHint: true,
      },
    },
    async (args) => {
      const { botId, ...body } = args;
      const response = await api("POST", `/webhooks/bot/${botId}`, body);

      if (response.success) {
        return jsonResult(response.data);
      } else {
        return errorResult(response.error || "Failed to create webhook");
      }
    }
  );

  // 2. List Webhooks
  server.registerTool(
    "neuron_list_webhooks",
    {
      title: "List Webhooks",
      description: "List all inbound webhooks configured for a specific bot",
      inputSchema: z.object({
        botId: z.string().describe("The ID of the bot to list webhooks for"),
      }),
      annotations: {
        openWorldHint: true,
      },
    },
    async (args) => {
      const response = await api("GET", `/webhooks/bot/${args.botId}`);

      if (response.success) {
        return jsonResult(response.data);
      } else {
        return errorResult(response.error || "Failed to list webhooks");
      }
    }
  );

  // 3. Update Webhook
  server.registerTool(
    "neuron_update_webhook",
    {
      title: "Update Webhook",
      description: "Update an existing webhook configuration",
      inputSchema: z.object({
        id: z.string().describe("The ID of the webhook to update"),
        name: z.string().optional().describe("Updated name of the webhook"),
        eventType: z.string().optional().describe("Updated event type"),
        processingPrompt: z.string().optional().describe("Updated processing prompt"),
        isActive: z.boolean().optional().describe("Whether the webhook should be active"),
      }),
      annotations: {
        openWorldHint: true,
      },
    },
    async (args) => {
      const { id, ...body } = args;
      const response = await api("PUT", `/webhooks/${id}`, body);

      if (response.success) {
        return jsonResult(response.data);
      } else {
        return errorResult(response.error || "Failed to update webhook");
      }
    }
  );

  // 4. Delete Webhook
  server.registerTool(
    "neuron_delete_webhook",
    {
      title: "Delete Webhook",
      description: "Delete an inbound webhook from a bot",
      inputSchema: z.object({
        id: z.string().describe("The ID of the webhook to delete"),
      }),
      annotations: {
        openWorldHint: true,
      },
    },
    async (args) => {
      const response = await api("DELETE", `/webhooks/${args.id}`);

      if (response.success) {
        return jsonResult(response.data || { message: "Webhook deleted successfully" });
      } else {
        return errorResult(response.error || "Failed to delete webhook");
      }
    }
  );

  // 5. Get Webhook Logs
  server.registerTool(
    "neuron_get_webhook_logs",
    {
      title: "Get Webhook Logs",
      description: "Retrieve execution logs for a webhook to monitor activity and debug issues",
      inputSchema: z.object({
        id: z.string().describe("The ID of the webhook to get logs for"),
        page: z.number().optional().describe("Page number for pagination (default: 1)"),
        limit: z.number().optional().describe("Number of logs per page (default: 20)"),
      }),
      annotations: {
        openWorldHint: true,
      },
    },
    async (args) => {
      const { id, page, limit } = args;
      const params: Record<string, string> = {};

      if (page !== undefined) {
        params.page = String(page);
      }
      if (limit !== undefined) {
        params.limit = String(limit);
      }

      const response = await api("GET", `/webhooks/${id}/logs`, undefined, params);

      if (response.success) {
        return jsonResult(response.data);
      } else {
        return errorResult(response.error || "Failed to get webhook logs");
      }
    }
  );
}

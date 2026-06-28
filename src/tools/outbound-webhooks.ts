import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { api, jsonResult, errorResult } from "../client.js";

const eventTypes = [
  "message.created",
  "message.assistant",
  "conversation.created",
  "conversation.escalated",
  "conversation.closed",
  "bot.paused",
  "bot.resumed",
] as const;

/**
 * Register outbound webhook tools (event-driven webhooks that fire on bot events)
 */
export function registerOutboundWebhookTools(server: McpServer): void {
  // 1. Create Outbound Webhook
  server.registerTool(
    "neuron_create_outbound_webhook",
    {
      title: "Create Outbound Webhook",
      description:
        "Create a new outbound webhook that fires HTTP requests when bot events occur. " +
        "Events: message.created, message.assistant, conversation.created, conversation.escalated, " +
        "conversation.closed, bot.paused, bot.resumed.",
      inputSchema: z.object({
        botId: z.string().describe("The ID of the bot to create the outbound webhook for"),
        name: z.string().describe("Name of the webhook"),
        url: z.string().describe("The URL to send webhook events to"),
        eventTypes: z
          .array(z.enum(eventTypes))
          .describe("Which events should trigger this webhook"),
        filterPrompt: z
          .string()
          .optional()
          .describe("Optional LLM prompt to filter which events are sent (e.g. only forward escalations)"),
      }),
      annotations: {
        openWorldHint: true,
      },
    },
    async (args) => {
      const { botId, ...body } = args;
      const response = await api("POST", `/webhooks/outbound/bot/${botId}`, body);

      if (response.success) {
        return jsonResult(response.data);
      } else {
        return errorResult(response.error || "Failed to create outbound webhook");
      }
    }
  );

  // 2. List Outbound Webhooks
  server.registerTool(
    "neuron_list_outbound_webhooks",
    {
      title: "List Outbound Webhooks",
      description: "List all outbound webhooks configured for a specific bot",
      inputSchema: z.object({
        botId: z.string().describe("The ID of the bot to list outbound webhooks for"),
      }),
      annotations: {
        readOnlyHint: true,
        openWorldHint: true,
      },
    },
    async (args) => {
      const response = await api("GET", `/webhooks/outbound/bot/${args.botId}`);

      if (response.success) {
        return jsonResult(response.data);
      } else {
        return errorResult(response.error || "Failed to list outbound webhooks");
      }
    }
  );

  // 3. Update Outbound Webhook
  server.registerTool(
    "neuron_update_outbound_webhook",
    {
      title: "Update Outbound Webhook",
      description: "Update an existing outbound webhook configuration",
      inputSchema: z.object({
        id: z.string().describe("The ID of the outbound webhook to update"),
        name: z.string().optional().describe("Updated name"),
        url: z.string().optional().describe("Updated URL"),
        eventTypes: z
          .array(z.enum(eventTypes))
          .optional()
          .describe("Updated event types"),
        filterPrompt: z.string().optional().describe("Updated filter prompt"),
      }),
      annotations: {
        openWorldHint: true,
      },
    },
    async (args) => {
      const { id, ...body } = args;
      const response = await api("PUT", `/webhooks/outbound/${id}`, body);

      if (response.success) {
        return jsonResult(response.data);
      } else {
        return errorResult(response.error || "Failed to update outbound webhook");
      }
    }
  );

  // 4. Delete Outbound Webhook
  server.registerTool(
    "neuron_delete_outbound_webhook",
    {
      title: "Delete Outbound Webhook",
      description: "Delete an outbound webhook",
      inputSchema: z.object({
        id: z.string().describe("The ID of the outbound webhook to delete"),
      }),
      annotations: {
        destructiveHint: true,
        openWorldHint: true,
      },
    },
    async (args) => {
      const response = await api("DELETE", `/webhooks/outbound/${args.id}`);

      if (response.success) {
        return jsonResult(response.data || { message: "Outbound webhook deleted successfully" });
      } else {
        return errorResult(response.error || "Failed to delete outbound webhook");
      }
    }
  );

  // 5. Get Outbound Webhook Logs
  server.registerTool(
    "neuron_get_outbound_webhook_logs",
    {
      title: "Get Outbound Webhook Logs",
      description: "Retrieve delivery logs for an outbound webhook to monitor and debug event delivery",
      inputSchema: z.object({
        id: z.string().describe("The ID of the outbound webhook to get logs for"),
        page: z.number().optional().describe("Page number for pagination (default: 1)"),
        limit: z.number().optional().describe("Number of logs per page (default: 20)"),
      }),
      annotations: {
        readOnlyHint: true,
        openWorldHint: true,
      },
    },
    async (args) => {
      const { id, page, limit } = args;
      const params: Record<string, string> = {};
      if (page !== undefined) params.page = String(page);
      if (limit !== undefined) params.limit = String(limit);

      const response = await api("GET", `/webhooks/outbound/${id}/logs`, undefined, params);

      if (response.success) {
        return jsonResult(response.data);
      } else {
        return errorResult(response.error || "Failed to get outbound webhook logs");
      }
    }
  );
}

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { api, jsonResult, errorResult } from "../client.js";

export function registerBroadcastsTools(server: McpServer): void {
  // List broadcasts
  server.registerTool(
    "neuron_list_broadcasts",
    {
      title: "List Broadcasts",
      description: "List all broadcasts with optional filtering by status and pagination",
      inputSchema: z.object({
        status: z.string().optional().describe("Filter by broadcast status (e.g., 'draft', 'sent', 'scheduled')"),
        page: z.number().int().positive().optional().describe("Page number for pagination"),
        limit: z.number().int().positive().optional().describe("Number of broadcasts per page"),
      }),
      annotations: { readOnlyHint: true },
    },
    async (params) => {
      try {
        const result = await api("GET", "/broadcasts", undefined, {
          status: params.status,
          page: params.page,
          limit: params.limit,
        });
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // Create broadcast
  server.registerTool(
    "neuron_create_broadcast",
    {
      title: "Create Broadcast",
      description: "Create a new broadcast message. Provide recipients directly OR use recipientSources to resolve from contact lists. Channel is auto-resolved if not specified.",
      inputSchema: z.object({
        channelId: z.string().optional().describe("ID of the WhatsApp channel (optional — auto-resolved if omitted)"),
        name: z.string().describe("Name/label for the broadcast"),
        message: z.string().describe("The message content to broadcast"),
        messageType: z.string().optional().describe("Type of message (e.g., 'text', 'image', 'document')"),
        mediaUrl: z.string().optional().describe("URL of media to attach (for image/document message types)"),
        recipients: z.array(z.object({
          phone: z.string().describe("Recipient phone number"),
          contactName: z.string().optional().describe("Recipient contact name"),
        })).optional().describe("Direct list of recipients (alternative to recipientSources)"),
        recipientSources: z.object({
          listIds: z.array(z.string()).optional().describe("Contact list IDs or slugs to include"),
          phones: z.array(z.string()).optional().describe("Individual phone numbers to include"),
          filters: z.object({
            tags: z.array(z.string()).optional().describe("Only include contacts with these tags"),
          }).optional().describe("Additional filters to apply"),
          excludeListIds: z.array(z.string()).optional().describe("Contact list IDs or slugs to exclude"),
        }).optional().describe("Resolve recipients from contact lists, with filtering and exclusion"),
      }),
    },
    async (params) => {
      try {
        const result = await api("POST", "/broadcasts", params);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // Get broadcast
  server.registerTool(
    "neuron_get_broadcast",
    {
      title: "Get Broadcast",
      description: "Get detailed information about a specific broadcast by ID",
      inputSchema: z.object({
        id: z.string().describe("The unique identifier of the broadcast"),
      }),
      annotations: { readOnlyHint: true },
    },
    async (params) => {
      try {
        const result = await api("GET", `/broadcasts/${params.id}`);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // Get broadcast recipients
  server.registerTool(
    "neuron_get_broadcast_recipients",
    {
      title: "Get Broadcast Recipients",
      description: "Get the list of recipients for a specific broadcast with delivery status",
      inputSchema: z.object({
        id: z.string().describe("The unique identifier of the broadcast"),
        status: z.string().optional().describe("Filter by recipient delivery status"),
        page: z.number().int().positive().optional().describe("Page number for pagination"),
        limit: z.number().int().positive().optional().describe("Number of recipients per page"),
      }),
      annotations: { readOnlyHint: true },
    },
    async (params) => {
      try {
        const { id, ...query } = params;
        const result = await api("GET", `/broadcasts/${id}/recipients`, undefined, {
          status: query.status,
          page: query.page,
          limit: query.limit,
        });
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // Update broadcast
  server.registerTool(
    "neuron_update_broadcast",
    {
      title: "Update Broadcast",
      description: "Update an existing broadcast's details (before sending)",
      inputSchema: z.object({
        id: z.string().describe("The unique identifier of the broadcast to update"),
        name: z.string().optional().describe("New name for the broadcast"),
        message: z.string().optional().describe("New message content"),
        messageType: z.string().optional().describe("New message type"),
        mediaUrl: z.string().optional().describe("New media URL"),
      }),
    },
    async (params) => {
      try {
        const { id, ...body } = params;
        const result = await api("PUT", `/broadcasts/${id}`, body);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // Delete broadcast
  server.registerTool(
    "neuron_delete_broadcast",
    {
      title: "Delete Broadcast",
      description: "Delete a broadcast. This action cannot be undone.",
      inputSchema: z.object({
        id: z.string().describe("The unique identifier of the broadcast to delete"),
      }),
      annotations: { destructiveHint: true },
    },
    async (params) => {
      try {
        const result = await api("DELETE", `/broadcasts/${params.id}`);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // Send broadcast
  server.registerTool(
    "neuron_send_broadcast",
    {
      title: "Send Broadcast",
      description: "Send a broadcast to all its recipients. The broadcast must be in draft status.",
      inputSchema: z.object({
        id: z.string().describe("The unique identifier of the broadcast to send"),
      }),
    },
    async (params) => {
      try {
        const result = await api("POST", `/broadcasts/${params.id}/send`);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );
}

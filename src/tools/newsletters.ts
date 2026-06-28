import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { api, jsonResult, errorResult } from "../client.js";

export function registerNewsletterTools(server: McpServer): void {
  // 1. List newsletters
  server.registerTool(
    "neuron_list_newsletters",
    {
      title: "List Newsletters",
      description: "List all WhatsApp Channel newsletters for the organization. Optionally filter by WhatsApp session channel ID.",
      inputSchema: z.object({
        channelId: z.string().optional().describe("Filter newsletters by WhatsApp session channel ID"),
        page: z.number().int().positive().optional().describe("Page number for pagination"),
        limit: z.number().int().positive().optional().describe("Number of items per page"),
      }),
      annotations: { readOnlyHint: true },
    },
    async (args) => {
      try {
        const response = await api("GET", "/newsletters", undefined, {
          channelId: args.channelId,
          page: args.page,
          limit: args.limit,
        });
        return jsonResult(response);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // 2. Create newsletter
  server.registerTool(
    "neuron_create_newsletter",
    {
      title: "Create Newsletter",
      description: "Create a new WhatsApp Channel (newsletter) for one-way broadcast updates. Requires a connected Baileys session.",
      inputSchema: z.object({
        channelId: z.string().describe("The WhatsApp session channel ID to create the newsletter on"),
        name: z.string().describe("Name of the newsletter"),
        description: z.string().optional().describe("Description of the newsletter"),
      }),
    },
    async (args) => {
      try {
        const response = await api("POST", "/newsletters", args);
        return jsonResult(response);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // 3. Get newsletter
  server.registerTool(
    "neuron_get_newsletter",
    {
      title: "Get Newsletter",
      description: "Get details of a specific WhatsApp Channel newsletter",
      inputSchema: z.object({
        id: z.string().describe("The unique identifier of the newsletter"),
      }),
      annotations: { readOnlyHint: true },
    },
    async (args) => {
      try {
        const response = await api("GET", `/newsletters/${args.id}`);
        return jsonResult(response);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // 4. Update newsletter
  server.registerTool(
    "neuron_update_newsletter",
    {
      title: "Update Newsletter",
      description: "Update the name or description of a WhatsApp Channel newsletter",
      inputSchema: z.object({
        id: z.string().describe("The unique identifier of the newsletter to update"),
        name: z.string().optional().describe("New name for the newsletter"),
        description: z.string().optional().describe("New description for the newsletter"),
      }),
    },
    async (args) => {
      try {
        const { id, ...updateData } = args;
        const response = await api("PUT", `/newsletters/${id}`, updateData);
        return jsonResult(response);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // 5. Delete newsletter
  server.registerTool(
    "neuron_delete_newsletter",
    {
      title: "Delete Newsletter",
      description: "Delete a WhatsApp Channel newsletter. This action cannot be undone.",
      inputSchema: z.object({
        id: z.string().describe("The unique identifier of the newsletter to delete"),
      }),
    },
    async (args) => {
      try {
        const response = await api("DELETE", `/newsletters/${args.id}`);
        return jsonResult(response);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // 6. Post to newsletter
  server.registerTool(
    "neuron_post_to_newsletter",
    {
      title: "Post to Newsletter",
      description: "Post a message (text, image, video, or document) to a WhatsApp Channel newsletter. All subscribers will receive the message. Provide at least one of text or mediaUrl.",
      inputSchema: z.object({
        id: z.string().describe("The unique identifier of the newsletter"),
        text: z.string().optional().describe("The message text or caption to post"),
        messageType: z.enum(["text", "image", "video", "document"]).default("text").describe("The type of message to send"),
        mediaUrl: z.string().optional().describe("URL of the media file to attach (image, video, or document)"),
      }),
    },
    async (args) => {
      try {
        const body: Record<string, string | undefined> = {
          text: args.text,
          messageType: args.messageType,
          mediaUrl: args.mediaUrl,
        };
        const response = await api("POST", `/newsletters/${args.id}/post`, body);
        return jsonResult(response);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // 7. Refresh newsletter metadata
  server.registerTool(
    "neuron_refresh_newsletter",
    {
      title: "Refresh Newsletter",
      description: "Re-fetch metadata (name, description, subscriber count) for a WhatsApp Channel newsletter from WhatsApp",
      inputSchema: z.object({
        id: z.string().describe("The unique identifier of the newsletter to refresh"),
      }),
    },
    async (args) => {
      try {
        const response = await api("POST", `/newsletters/${args.id}/refresh`);
        return jsonResult(response);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // 8. Sync newsletters from WhatsApp
  server.registerTool(
    "neuron_sync_newsletters",
    {
      title: "Sync Newsletters",
      description: "Sync/import WhatsApp Channels from a connected WhatsApp session into Neuron. This discovers channels created outside Neuron.",
      inputSchema: z.object({
        channelId: z.string().describe("The WhatsApp session channel ID to sync newsletters from"),
      }),
    },
    async (args) => {
      try {
        const response = await api("POST", "/newsletters/sync", { channelId: args.channelId });
        return jsonResult(response);
      } catch (error) {
        return errorResult(error);
      }
    }
  );
}

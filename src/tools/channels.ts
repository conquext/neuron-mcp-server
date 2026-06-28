import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { api, jsonResult, textResult, errorResult } from "../client.js";

export function registerChannelsTools(server: McpServer): void {
  // 1. List all channels
  server.registerTool(
    "neuron_list_channels",
    {
      title: "List Channels",
      description: "List all WhatsApp channels configured in the Neuron system",
      inputSchema: z.object({}),
    },
    async () => {
      try {
        const response = await api("GET", "/channels");
        return jsonResult(response);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // 2. Create a new channel
  server.registerTool(
    "neuron_create_channel",
    {
      title: "Create Channel",
      description: "Create a new WhatsApp channel. Supports Meta Cloud API or Baileys (direct WhatsApp) integration.",
      inputSchema: z.object({
        name: z.string().describe("Display name for the channel"),
        type: z.enum(["meta_cloud", "baileys"]).describe("Channel type: 'meta_cloud' for Meta Cloud API or 'baileys' for direct WhatsApp"),
        phoneNumber: z.string().optional().describe("Phone number for the channel (optional)"),
        metaPhoneNumberId: z.string().optional().describe("Meta Phone Number ID (required for meta_cloud type)"),
        metaAccessToken: z.string().optional().describe("Meta Access Token (required for meta_cloud type)"),
      }),
    },
    async (args) => {
      try {
        const response = await api("POST", "/channels", args);
        return jsonResult(response);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // 3. Get channel details
  server.registerTool(
    "neuron_get_channel",
    {
      title: "Get Channel",
      description: "Get detailed information about a specific WhatsApp channel",
      inputSchema: z.object({
        id: z.string().describe("The unique identifier of the channel"),
      }),
    },
    async (args) => {
      try {
        const response = await api("GET", `/channels/${args.id}`);
        return jsonResult(response);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // 4. Update channel
  server.registerTool(
    "neuron_update_channel",
    {
      title: "Update Channel",
      description: "Update configuration details of an existing WhatsApp channel",
      inputSchema: z.object({
        id: z.string().describe("The unique identifier of the channel to update"),
        name: z.string().optional().describe("New display name for the channel"),
        phoneNumber: z.string().optional().describe("New phone number for the channel"),
        metaPhoneNumberId: z.string().optional().describe("New Meta Phone Number ID"),
        metaAccessToken: z.string().optional().describe("New Meta Access Token"),
      }),
    },
    async (args) => {
      try {
        const { id, ...updateData } = args;
        const response = await api("PUT", `/channels/${id}`, updateData);
        return jsonResult(response);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // 5. Delete channel
  server.registerTool(
    "neuron_delete_channel",
    {
      title: "Delete Channel",
      description: "Delete a WhatsApp channel from the system. This action cannot be undone.",
      inputSchema: z.object({
        id: z.string().describe("The unique identifier of the channel to delete"),
      }),
    },
    async (args) => {
      try {
        const response = await api("DELETE", `/channels/${args.id}`);
        return jsonResult(response);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // 6. Assign bot to channel
  server.registerTool(
    "neuron_assign_bot_to_channel",
    {
      title: "Assign Bot to Channel",
      description: "Assign a bot to handle messages on a specific WhatsApp channel",
      inputSchema: z.object({
        id: z.string().describe("The unique identifier of the channel"),
        botId: z.string().describe("The unique identifier of the bot to assign"),
      }),
    },
    async (args) => {
      try {
        const { id, botId } = args;
        const response = await api("POST", `/channels/${id}/assign-bot`, { botId });
        return jsonResult(response);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // 7. Unassign bot from channel
  server.registerTool(
    "neuron_unassign_bot_from_channel",
    {
      title: "Unassign Bot from Channel",
      description: "Remove the bot assignment from a WhatsApp channel",
      inputSchema: z.object({
        id: z.string().describe("The unique identifier of the channel"),
      }),
    },
    async (args) => {
      try {
        const response = await api("DELETE", `/channels/${args.id}/assign-bot`);
        return jsonResult(response);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // 8. Start channel session (Baileys)
  server.registerTool(
    "neuron_start_channel_session",
    {
      title: "Start Channel Session",
      description: "Start a Baileys (direct WhatsApp) session for the channel. Generates QR code for pairing.",
      inputSchema: z.object({
        id: z.string().describe("The unique identifier of the channel"),
      }),
    },
    async (args) => {
      try {
        const response = await api("POST", `/channels/${args.id}/session/start`);
        return jsonResult(response);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // 9. Stop channel session
  server.registerTool(
    "neuron_stop_channel_session",
    {
      title: "Stop Channel Session",
      description: "Stop the active Baileys session for the channel and disconnect from WhatsApp",
      inputSchema: z.object({
        id: z.string().describe("The unique identifier of the channel"),
      }),
    },
    async (args) => {
      try {
        const response = await api("POST", `/channels/${args.id}/session/stop`);
        return jsonResult(response);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // 10. Get channel status
  server.registerTool(
    "neuron_get_channel_status",
    {
      title: "Get Channel Status",
      description: "Get the current session status of a WhatsApp channel (connected, disconnected, etc.)",
      inputSchema: z.object({
        id: z.string().describe("The unique identifier of the channel"),
      }),
    },
    async (args) => {
      try {
        const response = await api("GET", `/channels/${args.id}/session/status`);
        return jsonResult(response);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // 11. Request pair code
  server.registerTool(
    "neuron_request_pair_code",
    {
      title: "Request Pair Code",
      description: "Request a pairing code for a Baileys channel instead of using QR code. Useful for linking with a phone number.",
      inputSchema: z.object({
        id: z.string().describe("The unique identifier of the channel"),
        phoneNumber: z.string().describe("Phone number to generate the pair code for"),
      }),
    },
    async (args) => {
      try {
        const response = await api("POST", `/channels/${args.id}/pair-code`, { phoneNumber: args.phoneNumber });
        return jsonResult(response);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // 12. List channel groups
  server.registerTool(
    "neuron_list_channel_groups",
    {
      title: "List Channel Groups",
      description: "List all WhatsApp groups that the channel is participating in",
      inputSchema: z.object({
        id: z.string().describe("The unique identifier of the channel"),
      }),
      annotations: { readOnlyHint: true },
    },
    async (args) => {
      try {
        const response = await api("GET", `/channels/${args.id}/groups`);
        return jsonResult(response);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // 13. Get group participants
  server.registerTool(
    "neuron_get_group_participants",
    {
      title: "Get Group Participants",
      description: "Get the list of participants in a specific WhatsApp group on a channel",
      inputSchema: z.object({
        id: z.string().describe("The unique identifier of the channel"),
        groupJid: z.string().describe("The JID of the WhatsApp group"),
      }),
      annotations: { readOnlyHint: true },
    },
    async (args) => {
      try {
        const response = await api("GET", `/channels/${args.id}/groups/${args.groupJid}/participants`);
        return jsonResult(response);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // 14. List WhatsApp contacts
  server.registerTool(
    "neuron_list_whatsapp_contacts",
    {
      title: "List WhatsApp Contacts",
      description: "List contacts from the WhatsApp account connected to this channel",
      inputSchema: z.object({
        id: z.string().describe("The unique identifier of the channel"),
        q: z.string().optional().describe("Search query to filter contacts"),
      }),
      annotations: { readOnlyHint: true },
    },
    async (args) => {
      try {
        const response = await api("GET", `/channels/${args.id}/whatsapp-contacts`, undefined, {
          q: args.q,
        });
        return jsonResult(response);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // 15. Get channel events
  server.registerTool(
    "neuron_get_channel_events",
    {
      title: "Get Channel Events",
      description: "Get the event log for a channel (connection events, message events, errors, etc.)",
      inputSchema: z.object({
        id: z.string().describe("The unique identifier of the channel"),
        page: z.number().int().positive().optional().describe("Page number for pagination"),
        limit: z.number().int().positive().optional().describe("Number of events per page"),
      }),
      annotations: { readOnlyHint: true },
    },
    async (args) => {
      try {
        const response = await api("GET", `/channels/${args.id}/events`, undefined, {
          page: args.page,
          limit: args.limit,
        });
        return jsonResult(response);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // 16. Get channel QR code
  server.registerTool(
    "neuron_get_channel_qr",
    {
      title: "Get Channel QR Code",
      description: "Get the QR code for pairing a Baileys channel with WhatsApp. Scan with WhatsApp mobile app.",
      inputSchema: z.object({
        id: z.string().describe("The unique identifier of the channel"),
      }),
    },
    async (args) => {
      try {
        const response = await api("GET", `/channels/${args.id}/qr`);
        return jsonResult(response);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // List bot channels
  server.registerTool(
    "neuron_list_bot_channels",
    {
      title: "List Bot Channels",
      description: "List all WhatsApp channels connected to a bot, including primary and secondary connections",
      inputSchema: z.object({
        botId: z.string().describe("The unique identifier of the bot"),
      }),
    },
    async (args) => {
      try {
        const response = await api("GET", `/bots/${args.botId}/channels`);
        return jsonResult(response);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // Add bot channel
  server.registerTool(
    "neuron_add_bot_channel",
    {
      title: "Add Bot Channel",
      description: "Connect an additional WhatsApp channel to a bot as a secondary number",
      inputSchema: z.object({
        botId: z.string().describe("The unique identifier of the bot"),
        channelId: z.string().describe("The unique identifier of the WhatsApp channel to connect"),
      }),
    },
    async (args) => {
      try {
        const response = await api("POST", `/bots/${args.botId}/channels`, { channelId: args.channelId });
        return jsonResult(response);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // Remove bot channel
  server.registerTool(
    "neuron_remove_bot_channel",
    {
      title: "Remove Bot Channel",
      description: "Disconnect a WhatsApp channel from a bot",
      inputSchema: z.object({
        botId: z.string().describe("The unique identifier of the bot"),
        channelId: z.string().describe("The unique identifier of the WhatsApp channel to disconnect"),
      }),
    },
    async (args) => {
      try {
        const response = await api("DELETE", `/bots/${args.botId}/channels/${args.channelId}`);
        return jsonResult(response);
      } catch (error) {
        return errorResult(error);
      }
    }
  );
}

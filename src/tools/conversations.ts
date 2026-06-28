import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { api, jsonResult, errorResult } from "../client.js";

/**
 * Register conversation-related MCP tools
 */
export function registerConversationTools(server: McpServer): void {
  // List conversations for a bot
  server.registerTool(
    "neuron_list_conversations",
    {
      title: "List Conversations",
      description: "Retrieve a list of conversations for a specific bot with optional filtering by status and pagination",
      inputSchema: z.object({
        botId: z.string().describe("The unique identifier of the bot"),
        status: z.string().optional().describe("Filter conversations by status (e.g., 'active', 'closed')"),
        cursor: z.string().optional().describe("Pagination cursor for retrieving the next page of results"),
        limit: z.number().int().positive().optional().describe("Maximum number of conversations to return per page"),
      }),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async (params) => {
      try {
        const result = await api("GET", `conversations/bot/${params.botId}`, undefined, {
          status: params.status,
          cursor: params.cursor,
          limit: params.limit,
        });
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // Get a specific conversation
  server.registerTool(
    "neuron_get_conversation",
    {
      title: "Get Conversation",
      description: "Retrieve detailed information about a specific conversation by its ID",
      inputSchema: z.object({
        id: z.string().describe("The unique identifier of the conversation"),
      }),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async (params) => {
      try {
        const result = await api("GET", `conversations/${params.id}`);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // Get messages from a conversation
  server.registerTool(
    "neuron_get_messages",
    {
      title: "Get Conversation Messages",
      description: "Retrieve messages from a specific conversation with optional pagination",
      inputSchema: z.object({
        id: z.string().describe("The unique identifier of the conversation"),
        cursor: z.string().optional().describe("Pagination cursor for retrieving the next page of messages"),
        limit: z.number().int().positive().optional().describe("Maximum number of messages to return per page"),
      }),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async (params) => {
      try {
        const result = await api("GET", `conversations/${params.id}/messages`, undefined, {
          cursor: params.cursor,
          limit: params.limit,
        });
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // Takeover a conversation
  server.registerTool(
    "neuron_takeover_conversation",
    {
      title: "Takeover Conversation",
      description: "Take over a conversation, transferring control from the bot to a human agent",
      inputSchema: z.object({
        id: z.string().describe("The unique identifier of the conversation to take over"),
      }),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async (params) => {
      try {
        const result = await api("POST", `conversations/${params.id}/takeover`);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // Release a conversation
  server.registerTool(
    "neuron_release_conversation",
    {
      title: "Release Conversation",
      description: "Release a conversation back to the bot, returning control from a human agent",
      inputSchema: z.object({
        id: z.string().describe("The unique identifier of the conversation to release"),
      }),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async (params) => {
      try {
        const result = await api("POST", `conversations/${params.id}/release`);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // Send a message to a conversation
  server.registerTool(
    "neuron_send_message",
    {
      title: "Send Message",
      description: "Send a message to a specific conversation",
      inputSchema: z.object({
        id: z.string().describe("The unique identifier of the conversation"),
        content: z.string().describe("The message content to send"),
        messageType: z.string().optional().describe("Type of message (e.g., 'text', 'image', 'document'). Defaults to 'text'."),
        mediaUrl: z.string().optional().describe("URL of media to attach (for image/document message types)"),
      }),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    async (params) => {
      try {
        const body: Record<string, unknown> = { content: params.content };
        if (params.messageType) body.messageType = params.messageType;
        if (params.mediaUrl) body.mediaUrl = params.mediaUrl;
        const result = await api("POST", `conversations/${params.id}/send`, body);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // Compose a new message (start new conversation)
  server.registerTool(
    "neuron_compose_message",
    {
      title: "Compose Message",
      description: "Compose and send a new message to a phone number, starting a new conversation if one does not exist",
      inputSchema: z.object({
        channelId: z.string().describe("ID of the WhatsApp channel to send through"),
        to: z.string().describe("Recipient phone number"),
        text: z.string().describe("Message text content"),
        messageType: z.string().optional().describe("Type of message (e.g., 'text', 'image', 'document')"),
        mediaUrl: z.string().optional().describe("URL of media to attach"),
        contactName: z.string().optional().describe("Display name for the contact"),
      }),
    },
    async (params) => {
      try {
        const result = await api("POST", "conversations/compose", params);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // Simple WhatsApp send — auto-resolves channel
  server.registerTool(
    "neuron_send_whatsapp",
    {
      title: "Send WhatsApp Message",
      description:
        "Send a WhatsApp message to a phone number or group. Auto-resolves which WhatsApp channel to use " +
        "(org default channel > first connected channel). Optionally attach media.",
      inputSchema: z.object({
        to: z.string().describe("Recipient: phone number (e.g. '2348012345678') or group JID (e.g. '120363XXX@g.us')"),
        text: z.string().describe("Message text"),
        messageType: z.string().optional().describe("Message type: 'text' (default), 'image', 'audio', 'video', 'document'"),
        mediaUrl: z.string().optional().describe("URL of media to attach (required for non-text types)"),
        channelId: z.string().optional().describe("Override auto-resolved channel with a specific channel ID"),
        contactName: z.string().optional().describe("Display name for the recipient"),
      }),
    },
    async (params) => {
      try {
        const result = await api("POST", "conversations/send-message", {
          to: params.to,
          text: params.text,
          messageType: params.messageType,
          mediaUrl: params.mediaUrl,
          channelId: params.channelId,
          contactName: params.contactName,
        });
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // Edit a message
  server.registerTool(
    "neuron_edit_message",
    {
      title: "Edit Message",
      description: "Edit the content of a previously sent message in a conversation",
      inputSchema: z.object({
        id: z.string().describe("The unique identifier of the conversation"),
        msgId: z.string().describe("The unique identifier of the message to edit"),
        content: z.string().describe("New content for the message"),
      }),
    },
    async (params) => {
      try {
        const result = await api("PUT", `conversations/${params.id}/messages/${params.msgId}`, {
          content: params.content,
        });
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // Delete a message
  server.registerTool(
    "neuron_delete_message",
    {
      title: "Delete Message",
      description: "Delete a specific message from a conversation. This action cannot be undone.",
      inputSchema: z.object({
        id: z.string().describe("The unique identifier of the conversation"),
        msgId: z.string().describe("The unique identifier of the message to delete"),
      }),
      annotations: { destructiveHint: true },
    },
    async (params) => {
      try {
        const result = await api("DELETE", `conversations/${params.id}/messages/${params.msgId}`);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // Close a conversation
  server.registerTool(
    "neuron_close_conversation",
    {
      title: "Close Conversation",
      description: "Close an active conversation, marking it as completed",
      inputSchema: z.object({
        id: z.string().describe("The unique identifier of the conversation to close"),
      }),
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async (params) => {
      try {
        const result = await api("POST", `conversations/${params.id}/close`);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );
}

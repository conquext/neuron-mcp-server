import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { api, jsonResult, errorResult } from "../client.js";

export function registerBotApiTools(server: McpServer): void {
  // Bot API Chat
  server.registerTool(
    "neuron_bot_api_chat",
    {
      title: "Bot API Chat",
      description: "Send a chat message to the bot API as a contact and receive an AI-generated response. Requires a valid API key with 'nrn_' prefix.",
      annotations: {
        
        
        
      },
      inputSchema: z.object({
        apiKey: z.string().describe("The bot API key starting with 'nrn_' prefix for authentication"),
        message: z.string().describe("The message text to send to the bot"),
        contactPhone: z.string().describe("The phone number of the contact sending the message (E.164 format recommended)"),
        contactName: z.string().optional().describe("Optional name of the contact for context"),
      }),
    },
    async (params) => {
      try {
        const { apiKey, ...chatData } = params;
        const result = await api(
          "POST",
          "bot-api/chat",
          chatData,
          undefined,
          { Authorization: `Bearer ${apiKey}` }
        );
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // Bot API Send
  server.registerTool(
    "neuron_bot_api_send",
    {
      title: "Bot API Send",
      description: "Send an outbound message through the bot API to a specified phone number. Supports text and media messages. Requires a valid API key.",
      annotations: {
        
        
        
      },
      inputSchema: z.object({
        apiKey: z.string().describe("The bot API key starting with 'nrn_' prefix for authentication"),
        to: z.string().describe("The recipient's phone number (E.164 format recommended)"),
        message: z.string().describe("The message text to send"),
        messageType: z.string().optional().describe("Optional message type (e.g., 'text', 'image', 'video', 'audio', 'document')"),
        mediaUrl: z.string().optional().describe("Optional URL to media file if sending media message"),
        channelId: z.string().optional().describe("Optional channel ID to send from a specific WhatsApp number. Uses the bot's primary number if omitted."),
      }),
    },
    async (params) => {
      try {
        const { apiKey, ...sendData } = params;
        const result = await api(
          "POST",
          "bot-api/send",
          sendData,
          undefined,
          { Authorization: `Bearer ${apiKey}` }
        );
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // Bot API List Conversations
  server.registerTool(
    "neuron_bot_api_list_conversations",
    {
      title: "Bot API List Conversations",
      description: "Retrieve a list of conversations managed by the bot. Supports filtering by status and pagination. Requires a valid API key.",
      annotations: {
        
        
        
      },
      inputSchema: z.object({
        apiKey: z.string().describe("The bot API key starting with 'nrn_' prefix for authentication"),
        status: z.string().optional().describe("Optional filter by conversation status (e.g., 'active', 'closed', 'pending')"),
        page: z.number().positive().optional().describe("Optional page number for pagination (default: 1)"),
        limit: z.number().positive().optional().describe("Optional number of conversations per page (default: 20)"),
      }),
    },
    async (params) => {
      try {
        const { apiKey, status, page, limit } = params;
        const queryParams: Record<string, string> = {};
        if (status) queryParams.status = status;
        if (page) queryParams.page = page.toString();
        if (limit) queryParams.limit = limit.toString();

        const result = await api(
          "GET",
          "bot-api/conversations",
          undefined,
          queryParams,
          { Authorization: `Bearer ${apiKey}` }
        );
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // Bot API Get Messages
  server.registerTool(
    "neuron_bot_api_get_messages",
    {
      title: "Bot API Get Messages",
      description: "Retrieve message history for a specific conversation with pagination support. Requires a valid API key.",
      annotations: {
        
        
        
      },
      inputSchema: z.object({
        apiKey: z.string().describe("The bot API key starting with 'nrn_' prefix for authentication"),
        conversationId: z.string().describe("The unique identifier of the conversation"),
        before: z.string().optional().describe("Optional cursor for pagination - retrieve messages before this message ID or timestamp"),
        limit: z.number().positive().optional().describe("Optional maximum number of messages to retrieve (default: 50)"),
      }),
    },
    async (params) => {
      try {
        const { apiKey, conversationId, before, limit } = params;
        const queryParams: Record<string, string> = {};
        if (before) queryParams.before = before;
        if (limit) queryParams.limit = limit.toString();

        const result = await api(
          "GET",
          `bot-api/conversations/${conversationId}/messages`,
          undefined,
          queryParams,
          { Authorization: `Bearer ${apiKey}` }
        );
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // Bot API Get Bot
  server.registerTool(
    "neuron_bot_api_get_bot",
    {
      title: "Bot API Get Bot",
      description: "Retrieve information about the bot associated with the provided API key including its configuration and status.",
      annotations: {
        
        
        
      },
      inputSchema: z.object({
        apiKey: z.string().describe("The bot API key starting with 'nrn_' prefix for authentication"),
      }),
    },
    async (params) => {
      try {
        const result = await api(
          "GET",
          "bot-api/bot",
          undefined,
          undefined,
          { Authorization: `Bearer ${params.apiKey}` }
        );
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );
}

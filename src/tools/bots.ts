import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { api, jsonResult, errorResult } from "../client.js";

export function registerBotTools(server: McpServer): void {
  // Create Bot
  server.registerTool(
    "neuron_create_bot",
    {
      title: "Create Bot",
      description: "Create a new bot with specified configuration including name, system prompt, and optional parameters like model, temperature, and phone number.",
      annotations: {
        
        
      },
      inputSchema: z.object({
        name: z.string().describe("The name of the bot"),
        systemPrompt: z.string().describe("The system prompt that defines the bot's behavior and personality"),
        assignment: z.string().optional().describe("One-sentence role definition (max 2000 chars)"),
        responsibilities: z.array(z.string()).optional().describe("Array of responsibility descriptions"),
        llmModel: z.string().optional().describe("OpenRouter model ID (e.g., google/gemini-2.5-flash-lite-preview-09-2025, openrouter/auto)"),
        llmTemperature: z.number().min(0).max(2).optional().describe("Temperature parameter for response randomness (0-2)"),
        maxTokens: z.number().positive().optional().describe("Maximum tokens for responses"),
        escalationPrompt: z.string().optional().describe("Prompt template for human handoff (max 5000 chars)"),
        greetingMessage: z.string().optional().describe("Auto-greeting when a new conversation starts (max 2000 chars)"),
        fallbackMessage: z.string().optional().describe("Fallback message when bot cannot understand (max 2000 chars)"),
        whatsappChannelId: z.string().optional().describe("UUID of the WhatsApp channel to associate with the bot"),
      }),
    },
    async (params) => {
      try {
        const result = await api("POST", "bots", {
          name: params.name,
          systemPrompt: params.systemPrompt,
          assignment: params.assignment,
          responsibilities: params.responsibilities,
          llmModel: params.llmModel,
          llmTemperature: params.llmTemperature,
          maxTokens: params.maxTokens,
          escalationPrompt: params.escalationPrompt,
          greetingMessage: params.greetingMessage,
          fallbackMessage: params.fallbackMessage,
          whatsappChannelId: params.whatsappChannelId,
        });
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // List Bots
  server.registerTool(
    "neuron_list_bots",
    {
      title: "List Bots",
      description: "Retrieve a list of all bots in the system with their configurations and status.",
      annotations: {
        
        
      },
      inputSchema: z.object({}),
    },
    async () => {
      try {
        const result = await api("GET", "bots");
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // Get Bot
  server.registerTool(
    "neuron_get_bot",
    {
      title: "Get Bot",
      description: "Retrieve detailed information about a specific bot by ID including its configuration, status, and associated resources.",
      annotations: {
        
        
      },
      inputSchema: z.object({
        id: z.string().describe("The unique identifier of the bot"),
      }),
    },
    async (params) => {
      try {
        const result = await api("GET", `bots/${params.id}`);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // Update Bot
  server.registerTool(
    "neuron_update_bot",
    {
      title: "Update Bot",
      description: "Update an existing bot's configuration including name, system prompt, model parameters, and phone number association.",
      annotations: {
        
        
      },
      inputSchema: z.object({
        id: z.string().describe("The unique identifier of the bot to update"),
        name: z.string().optional().describe("The new name of the bot"),
        systemPrompt: z.string().optional().describe("The new system prompt for the bot"),
        assignment: z.string().optional().describe("One-sentence role definition (max 2000 chars)"),
        responsibilities: z.array(z.string()).optional().describe("Array of responsibility descriptions"),
        llmModel: z.string().optional().describe("OpenRouter model ID (e.g., google/gemini-2.5-flash-lite-preview-09-2025, openrouter/auto)"),
        llmTemperature: z.number().min(0).max(2).optional().describe("The new temperature parameter (0-2)"),
        maxTokens: z.number().positive().optional().describe("The new maximum tokens limit"),
        escalationPrompt: z.string().optional().describe("Prompt template for human handoff (max 5000 chars)"),
        greetingMessage: z.string().optional().describe("Auto-greeting when a new conversation starts (max 2000 chars)"),
        fallbackMessage: z.string().optional().describe("Fallback message when bot cannot understand (max 2000 chars)"),
        whatsappChannelId: z.string().optional().describe("UUID of the WhatsApp channel to associate with the bot"),
      }),
    },
    async (params) => {
      try {
        const { id, ...updateData } = params;
        const result = await api("PUT", `bots/${id}`, updateData);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // Delete Bot
  server.registerTool(
    "neuron_delete_bot",
    {
      title: "Delete Bot",
      description: "Permanently delete a bot and all its associated data. This action cannot be undone.",
      annotations: {
        
        
      },
      inputSchema: z.object({
        id: z.string().describe("The unique identifier of the bot to delete"),
      }),
    },
    async (params) => {
      try {
        const result = await api("DELETE", `bots/${params.id}`);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // Pause Bot
  server.registerTool(
    "neuron_pause_bot",
    {
      title: "Pause Bot",
      description: "Pause a bot's operations temporarily. The bot will stop responding to messages until resumed.",
      annotations: {
        
        
      },
      inputSchema: z.object({
        id: z.string().describe("The unique identifier of the bot to pause"),
      }),
    },
    async (params) => {
      try {
        const result = await api("POST", `bots/${params.id}/pause`);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // Resume Bot
  server.registerTool(
    "neuron_resume_bot",
    {
      title: "Resume Bot",
      description: "Resume a paused bot's operations. The bot will start responding to messages again.",
      annotations: {
        
        
      },
      inputSchema: z.object({
        id: z.string().describe("The unique identifier of the bot to resume"),
      }),
    },
    async (params) => {
      try {
        const result = await api("POST", `bots/${params.id}/resume`);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // Get Bot Analytics
  server.registerTool(
    "neuron_get_bot_analytics",
    {
      title: "Get Bot Analytics",
      description: "Retrieve analytics and usage statistics for a specific bot including message counts, response times, and conversation metrics.",
      annotations: {
        
        
      },
      inputSchema: z.object({
        id: z.string().describe("The unique identifier of the bot"),
      }),
    },
    async (params) => {
      try {
        const result = await api("GET", `bots/${params.id}/analytics`);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // Attach Knowledge Base
  server.registerTool(
    "neuron_attach_knowledge_base",
    {
      title: "Attach Knowledge Base",
      description: "Attach a knowledge base to a bot to enhance its responses with specific domain knowledge. Optional priority determines retrieval order.",
      annotations: {
        
        
      },
      inputSchema: z.object({
        id: z.string().describe("The unique identifier of the bot"),
        knowledgeBaseId: z.string().describe("The unique identifier of the knowledge base to attach"),
        priority: z.number().optional().describe("Optional priority level for knowledge base retrieval (higher priority is checked first)"),
      }),
    },
    async (params) => {
      try {
        const { id, ...attachData } = params;
        const result = await api("POST", `bots/${id}/knowledge-bases`, attachData);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // List Bot Knowledge Bases
  server.registerTool(
    "neuron_list_bot_knowledge_bases",
    {
      title: "List Bot Knowledge Bases",
      description: "Retrieve all knowledge bases attached to a specific bot along with their priorities and metadata.",
      annotations: {
        
        
      },
      inputSchema: z.object({
        id: z.string().describe("The unique identifier of the bot"),
      }),
    },
    async (params) => {
      try {
        const result = await api("GET", `bots/${params.id}/knowledge-bases`);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // Detach Knowledge Base
  server.registerTool(
    "neuron_detach_knowledge_base",
    {
      title: "Detach Knowledge Base",
      description: "Remove a knowledge base from a bot. The bot will no longer use this knowledge base for responses.",
      annotations: {
        
        
      },
      inputSchema: z.object({
        id: z.string().describe("The unique identifier of the bot"),
        kbId: z.string().describe("The unique identifier of the knowledge base to detach"),
      }),
    },
    async (params) => {
      try {
        const result = await api("DELETE", `bots/${params.id}/knowledge-bases/${params.kbId}`);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );
}

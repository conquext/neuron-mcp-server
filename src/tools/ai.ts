import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { api, jsonResult, errorResult } from "../client.js";

export function registerAiTools(server: McpServer): void {
  // Rewrite text
  server.registerTool(
    "neuron_rewrite_text",
    {
      title: "Rewrite Text",
      description: "Use AI to rewrite or transform text based on an optional instruction (e.g., make it more formal, translate, summarize)",
      inputSchema: z.object({
        text: z.string().describe("The text to rewrite"),
        instruction: z.string().optional().describe("Instructions for how to rewrite the text (e.g., 'make it more professional', 'translate to Spanish')"),
      }),
    },
    async (params) => {
      try {
        const result = await api("POST", "/ai/rewrite", {
          text: params.text,
          instruction: params.instruction,
        });
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );
}

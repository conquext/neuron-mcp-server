import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { api, jsonResult, errorResult } from "../client.js";

export function registerListPoolTools(server: McpServer): void {
  // Browse pool
  server.registerTool(
    "neuron_browse_list_pool",
    {
      title: "Browse List Pool",
      description: "Browse verified contact lists available in the marketplace pool. Filter by category or region.",
      inputSchema: z.object({
        category: z.string().optional().describe("Filter by category (e.g., 'delivery', 'tech', 'consumers')"),
        region: z.string().optional().describe("Filter by region"),
        search: z.string().optional().describe("Search by description or category"),
        page: z.number().optional().describe("Page number"),
        limit: z.number().optional().describe("Items per page"),
      }),
      annotations: { readOnlyHint: true },
    },
    async (params) => {
      try {
        const result = await api("GET", "/list-pool", undefined, {
          category: params.category,
          region: params.region,
          search: params.search,
          page: params.page,
          limit: params.limit,
        });
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // Submit to pool
  server.registerTool(
    "neuron_submit_to_list_pool",
    {
      title: "Submit List to Pool",
      description: "Submit a contact list to the marketplace pool for advertisers to use.",
      inputSchema: z.object({
        listId: z.string().describe("Contact list ID to submit"),
        channelId: z.string().describe("WhatsApp channel ID for sending"),
        category: z.string().describe("Category (e.g., 'delivery', 'tech', 'consumers')"),
        description: z.string().optional().describe("Description of the audience"),
        demographics: z.object({
          regions: z.array(z.string()).optional(),
          tags: z.array(z.string()).optional(),
        }).optional().describe("Demographic information"),
        pricePerDelivery: z.number().describe("Price per delivery in kobo"),
      }),
    },
    async (params) => {
      try {
        const result = await api("POST", "/list-pool", params);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // Create ad request
  server.registerTool(
    "neuron_create_ad_request",
    {
      title: "Create Ad Request",
      description: "Create an ad request to distribute a message to contacts in pool lists matching target demographics.",
      inputSchema: z.object({
        message: z.string().describe("The ad message content"),
        messageType: z.string().optional().describe("Message type (text, image, video, document)"),
        mediaUrl: z.string().optional().describe("Media URL for non-text messages"),
        targetDemographics: z.object({
          categories: z.array(z.string()).optional().describe("Target categories"),
          regions: z.array(z.string()).optional().describe("Target regions"),
        }).describe("Demographics to match against pool entries"),
        targetGoal: z.number().describe("Target number of deliveries"),
        budget: z.number().describe("Total budget in kobo"),
      }),
    },
    async (params) => {
      try {
        const result = await api("POST", "/ad-requests", params);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // List ad requests
  server.registerTool(
    "neuron_list_ad_requests",
    {
      title: "List Ad Requests",
      description: "List your ad requests with optional status filter.",
      inputSchema: z.object({
        status: z.string().optional().describe("Filter by status (draft, pending_review, approved, active, paused, completed, rejected)"),
        page: z.number().optional(),
        limit: z.number().optional(),
      }),
      annotations: { readOnlyHint: true },
    },
    async (params) => {
      try {
        const result = await api("GET", "/ad-requests", undefined, {
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

  // Get ad request analytics
  server.registerTool(
    "neuron_get_ad_request_analytics",
    {
      title: "Get Ad Request Analytics",
      description: "Get delivery analytics and breakdown for an ad request.",
      inputSchema: z.object({
        adRequestId: z.string().describe("The ad request ID"),
      }),
      annotations: { readOnlyHint: true },
    },
    async (params) => {
      try {
        const result = await api("GET", `/ad-requests/${params.adRequestId}/analytics`);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );
}

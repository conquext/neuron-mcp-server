import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { api, jsonResult, errorResult } from "../client.js";

export function registerCampaignTools(server: McpServer): void {
  server.registerTool(
    "neuron_list_campaigns",
    {
      title: "List Campaigns",
      description: "List your organization's campaigns with optional status filter",
      inputSchema: z.object({
        status: z.string().optional().describe("Filter by status: draft, active, completed, etc."),
        page: z.number().int().positive().optional(),
        limit: z.number().int().positive().optional(),
      }),
      annotations: { readOnlyHint: true },
    },
    async (params) => {
      try {
        const result = await api("GET", "/campaigns", undefined, params);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.registerTool(
    "neuron_get_campaign",
    {
      title: "Get Campaign",
      description: "Get detailed information about a specific campaign",
      inputSchema: z.object({
        id: z.string().describe("Campaign ID"),
      }),
      annotations: { readOnlyHint: true },
    },
    async (params) => {
      try {
        const result = await api("GET", `/campaigns/${params.id}`);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.registerTool(
    "neuron_campaign_marketplace",
    {
      title: "Browse Campaign Marketplace",
      description: "Browse available campaigns that you can join and earn from",
      inputSchema: z.object({
        page: z.number().int().positive().optional(),
        limit: z.number().int().positive().optional(),
      }),
      annotations: { readOnlyHint: true },
    },
    async (params) => {
      try {
        const result = await api("GET", "/campaigns/marketplace", undefined, params);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.registerTool(
    "neuron_create_campaign",
    {
      title: "Create Campaign",
      description: "Create a new draft campaign. Requires Pro or Business plan.",
      inputSchema: z.object({
        title: z.string().describe("Campaign title"),
        message: z.string().describe("The WhatsApp message to send"),
        rewardPerDelivery: z.number().describe("Reward per delivery in kobo (e.g. 5000 = ₦50)"),
        totalBudget: z.number().describe("Total campaign budget in kobo"),
        deadline: z.string().describe("Campaign deadline (ISO date)"),
        description: z.string().optional().describe("Campaign description for marketplace listing"),
        guidelines: z.string().optional().describe("Guidelines for participants"),
        requireMutualContact: z.boolean().optional().describe("Only allow sends to contacts who have responded"),
      }),
    },
    async (params) => {
      try {
        const result = await api("POST", "/campaigns", params);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.registerTool(
    "neuron_update_campaign",
    {
      title: "Update Campaign",
      description: "Update a draft or rejected campaign",
      inputSchema: z.object({
        id: z.string().describe("Campaign ID"),
        title: z.string().optional().describe("Campaign title"),
        message: z.string().optional().describe("The WhatsApp message to send"),
        rewardPerDelivery: z.number().optional().describe("Reward per delivery in kobo"),
        totalBudget: z.number().optional().describe("Total campaign budget in kobo"),
        deadline: z.string().optional().describe("Campaign deadline (ISO date)"),
        description: z.string().optional().describe("Campaign description"),
        guidelines: z.string().optional().describe("Guidelines for participants"),
        requireMutualContact: z.boolean().optional(),
      }),
    },
    async (params) => {
      try {
        const { id, ...data } = params;
        const result = await api("PUT", `/campaigns/${id}`, data);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.registerTool(
    "neuron_delete_campaign",
    {
      title: "Delete Campaign",
      description: "Delete a draft campaign",
      inputSchema: z.object({
        id: z.string().describe("Campaign ID"),
      }),
      annotations: { destructiveHint: true },
    },
    async (params) => {
      try {
        const result = await api("DELETE", `/campaigns/${params.id}`);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.registerTool(
    "neuron_submit_campaign",
    {
      title: "Submit Campaign for Review",
      description: "Submit a draft campaign for admin review",
      inputSchema: z.object({
        id: z.string().describe("Campaign ID"),
      }),
    },
    async (params) => {
      try {
        const result = await api("POST", `/campaigns/${params.id}/submit`);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.registerTool(
    "neuron_fund_campaign",
    {
      title: "Fund Campaign",
      description: "Fund an approved campaign from your wallet balance",
      inputSchema: z.object({
        id: z.string().describe("Campaign ID"),
      }),
    },
    async (params) => {
      try {
        const result = await api("POST", `/campaigns/${params.id}/fund`);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.registerTool(
    "neuron_join_campaign",
    {
      title: "Join Campaign",
      description: "Join a campaign from the marketplace to earn rewards by sending messages",
      inputSchema: z.object({
        id: z.string().describe("Campaign ID"),
        channelId: z.string().describe("Your WhatsApp channel ID to send from"),
      }),
    },
    async (params) => {
      try {
        const { id, ...data } = params;
        const result = await api("POST", `/campaigns/${id}/join`, data);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.registerTool(
    "neuron_get_eligible_contacts",
    {
      title: "Get Eligible Contacts",
      description: "Get contacts eligible for receiving a campaign message (respects dedup and mutual contact rules)",
      inputSchema: z.object({
        id: z.string().describe("Campaign ID"),
      }),
      annotations: { readOnlyHint: true },
    },
    async (params) => {
      try {
        const result = await api("GET", `/campaigns/${params.id}/eligible-contacts`);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.registerTool(
    "neuron_send_campaign_message",
    {
      title: "Send Campaign Messages",
      description: "Send the campaign message to selected eligible contacts",
      inputSchema: z.object({
        id: z.string().describe("Campaign ID"),
        contactIds: z.array(z.string()).describe("Array of contact IDs to send to"),
      }),
    },
    async (params) => {
      try {
        const { id, contactIds } = params;
        const result = await api("POST", `/campaigns/${id}/send`, { contactIds });
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.registerTool(
    "neuron_my_participations",
    {
      title: "My Campaign Participations",
      description: "List campaigns you have joined as a participant",
      inputSchema: z.object({
        page: z.number().int().positive().optional(),
        limit: z.number().int().positive().optional(),
      }),
      annotations: { readOnlyHint: true },
    },
    async (params) => {
      try {
        const result = await api("GET", "/campaigns/my-participations", undefined, params);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.registerTool(
    "neuron_campaign_participants",
    {
      title: "List Campaign Participants",
      description: "List participants of a campaign you own",
      inputSchema: z.object({
        id: z.string().describe("Campaign ID"),
      }),
      annotations: { readOnlyHint: true },
    },
    async (params) => {
      try {
        const result = await api("GET", `/campaigns/${params.id}/participants`);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.registerTool(
    "neuron_pause_campaign",
    {
      title: "Pause Campaign",
      description: "Pause an active campaign",
      inputSchema: z.object({
        id: z.string().describe("Campaign ID"),
      }),
    },
    async (params) => {
      try {
        const result = await api("POST", `/campaigns/${params.id}/pause`);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.registerTool(
    "neuron_resume_campaign",
    {
      title: "Resume Campaign",
      description: "Resume a paused campaign",
      inputSchema: z.object({
        id: z.string().describe("Campaign ID"),
      }),
    },
    async (params) => {
      try {
        const result = await api("POST", `/campaigns/${params.id}/resume`);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.registerTool(
    "neuron_stop_campaign",
    {
      title: "Stop Campaign",
      description: "Stop an active campaign and refund remaining budget to wallet",
      inputSchema: z.object({
        id: z.string().describe("Campaign ID"),
      }),
      annotations: { destructiveHint: true },
    },
    async (params) => {
      try {
        const result = await api("POST", `/campaigns/${params.id}/stop`);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );
}

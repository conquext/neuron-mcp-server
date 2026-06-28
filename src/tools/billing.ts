import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { api, jsonResult, errorResult } from "../client.js";

export function registerBillingTools(server: McpServer): void {
  // Get billing info
  server.registerTool(
    "neuron_get_billing",
    {
      title: "Get Billing Info",
      description: "Get the current billing information, subscription status, and usage details for the organization",
      inputSchema: z.object({}),
      annotations: { readOnlyHint: true },
    },
    async () => {
      try {
        const result = await api("GET", "/billing");
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // Checkout
  server.registerTool(
    "neuron_checkout",
    {
      title: "Checkout Subscription",
      description: "Start a checkout session for a subscription plan. Returns a checkout URL or confirmation.",
      inputSchema: z.object({
        plan: z.enum(["pro", "business"]).describe("Subscription plan to purchase"),
      }),
    },
    async (params) => {
      try {
        const result = await api("POST", "/billing/checkout", { plan: params.plan });
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // Cancel subscription
  server.registerTool(
    "neuron_cancel_subscription",
    {
      title: "Cancel Subscription",
      description: "Cancel the current active subscription. The subscription will remain active until the end of the billing period.",
      inputSchema: z.object({}),
      annotations: { destructiveHint: true },
    },
    async () => {
      try {
        const result = await api("POST", "/billing/cancel");
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );
}

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { api, jsonResult, errorResult } from "../client.js";

export function registerWalletTools(server: McpServer): void {
  server.registerTool(
    "neuron_wallet_balance",
    {
      title: "Wallet Balance",
      description: "Check your organization's wallet balance",
      inputSchema: z.object({}),
      annotations: { readOnlyHint: true },
    },
    async () => {
      try {
        const result = await api("GET", "/wallets");
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.registerTool(
    "neuron_wallet_transactions",
    {
      title: "Wallet Transactions",
      description: "List wallet transaction history with optional type filter",
      inputSchema: z.object({
        type: z.string().optional().describe("Filter by type: credit, debit"),
        page: z.number().int().positive().optional(),
        limit: z.number().int().positive().optional(),
      }),
      annotations: { readOnlyHint: true },
    },
    async (params) => {
      try {
        const result = await api("GET", "/wallets/transactions", undefined, params);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.registerTool(
    "neuron_fund_wallet",
    {
      title: "Fund Wallet",
      description:
        "Initialize wallet funding via Paystack. Returns a checkout URL to complete payment.",
      inputSchema: z.object({
        amount: z.number().int().positive().describe("Amount in kobo (e.g. 500000 = ₦5,000)"),
        email: z.string().email().describe("Email for payment receipt"),
      }),
    },
    async (params) => {
      try {
        const result = await api("POST", "/wallets/fund", params);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.registerTool(
    "neuron_verify_wallet_funding",
    {
      title: "Verify Wallet Funding",
      description: "Verify a wallet funding transaction by Paystack reference",
      inputSchema: z.object({
        reference: z.string().describe("Paystack payment reference"),
      }),
    },
    async (params) => {
      try {
        const result = await api("POST", "/wallets/fund/verify", params);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );
}

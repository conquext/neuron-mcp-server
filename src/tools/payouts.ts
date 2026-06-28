import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { api, jsonResult, errorResult } from "../client.js";

export function registerPayoutTools(server: McpServer): void {
  server.registerTool(
    "neuron_verify_bank_account",
    {
      title: "Verify Bank Account",
      description: "Verify a Nigerian bank account number via Paystack",
      inputSchema: z.object({
        bankCode: z.string().describe("Bank code (e.g. '058' for GTBank)"),
        accountNumber: z.string().describe("10-digit bank account number"),
      }),
      annotations: { readOnlyHint: true },
    },
    async (params) => {
      try {
        const result = await api("POST", "/payouts/verify-account", params);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.registerTool(
    "neuron_save_bank_account",
    {
      title: "Save Bank Account",
      description: "Save a verified bank account for payouts",
      inputSchema: z.object({
        bankCode: z.string().describe("Bank code"),
        bankName: z.string().describe("Bank name (e.g. 'Guaranty Trust Bank')"),
        accountNumber: z.string().describe("10-digit account number"),
        accountName: z.string().describe("Account holder name from verification"),
      }),
    },
    async (params) => {
      try {
        const result = await api("POST", "/payouts/bank-account", params);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.registerTool(
    "neuron_get_bank_account",
    {
      title: "Get Bank Account",
      description: "Get the saved bank account for payouts",
      inputSchema: z.object({}),
      annotations: { readOnlyHint: true },
    },
    async () => {
      try {
        const result = await api("GET", "/payouts/bank-account");
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.registerTool(
    "neuron_request_payout",
    {
      title: "Request Payout",
      description: "Request a payout from your wallet to your saved bank account",
      inputSchema: z.object({
        amount: z.number().int().positive().describe("Amount in kobo (e.g. 100000 = ₦1,000)"),
      }),
    },
    async (params) => {
      try {
        const result = await api("POST", "/payouts/request", params);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.registerTool(
    "neuron_list_payouts",
    {
      title: "List Payouts",
      description: "List payout history",
      inputSchema: z.object({
        page: z.number().int().positive().optional(),
        limit: z.number().int().positive().optional(),
      }),
      annotations: { readOnlyHint: true },
    },
    async (params) => {
      try {
        const result = await api("GET", "/payouts", undefined, params);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );
}

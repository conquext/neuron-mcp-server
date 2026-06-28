import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { api, jsonResult, errorResult } from "../client.js";

export function registerAuditTools(server: McpServer): void {
  // List Audit Logs
  server.registerTool(
    "neuron_list_audit_logs",
    {
      title: "List Audit Logs",
      description: "Retrieve audit logs with optional filtering by page, limit, action, and resource type",
      inputSchema: z.object({
        page: z.number().int().positive().optional().describe("Page number for pagination (starts at 1)"),
        limit: z.number().int().positive().optional().describe("Number of records per page"),
        action: z.string().optional().describe("Filter by action type (e.g., 'CREATE', 'UPDATE', 'DELETE')"),
        resourceType: z.string().optional().describe("Filter by resource type (e.g., 'USER', 'ORGANIZATION', 'CAMPAIGN')"),
      }),
      annotations: {
        readOnlyHint: true,
      },
    },
    async (params) => {
      try {
        const queryParams: Record<string, string | number> = {};

        if (params.page !== undefined) {
          queryParams.page = params.page;
        }
        if (params.limit !== undefined) {
          queryParams.limit = params.limit;
        }
        if (params.action !== undefined) {
          queryParams.action = params.action;
        }
        if (params.resourceType !== undefined) {
          queryParams.resourceType = params.resourceType;
        }

        const result = await api("GET", "/audit", undefined, queryParams);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );
}

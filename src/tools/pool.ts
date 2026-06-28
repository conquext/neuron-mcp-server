import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { api, jsonResult, textResult, errorResult } from "../client.js";

export function registerPoolTools(server: McpServer): void {
  // 1. Browse pool
  server.registerTool(
    "neuron_browse_pool",
    {
      title: "Browse Pool",
      description: "Browse the marketplace/pool to discover shared bots, tools, knowledge bases, and reflections. Supports filtering and search.",
      inputSchema: z.object({
        query: z.string().optional().describe("Search query to filter items"),
        type: z.string().optional().describe("Filter by resource type (e.g., 'bot', 'tool', 'knowledge_base', 'reflection')"),
        category: z.string().optional().describe("Filter by category"),
        tags: z.string().optional().describe("Filter by tags (comma-separated)"),
        featured: z.boolean().optional().describe("Show only featured items"),
        page: z.number().optional().describe("Page number for pagination (default: 1)"),
        limit: z.number().optional().describe("Number of items per page (default: 20)"),
      }),
    },
    async (args) => {
      try {
        const queryParams: Record<string, string | number> = {};
        if (args.query) queryParams.query = args.query;
        if (args.type) queryParams.type = args.type;
        if (args.category) queryParams.category = args.category;
        if (args.tags) queryParams.tags = args.tags;
        if (args.featured !== undefined) queryParams.featured = args.featured ? "true" : "false";
        if (args.page !== undefined) queryParams.page = args.page;
        if (args.limit !== undefined) queryParams.limit = args.limit;
        const response = await api("GET", "/pool", undefined, queryParams);
        return jsonResult(response);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // 2. Get pool item
  server.registerTool(
    "neuron_get_pool_item",
    {
      title: "Get Pool Item",
      description: "Get detailed information about a specific item in the marketplace/pool",
      inputSchema: z.object({
        id: z.string().describe("The unique identifier of the pool item"),
      }),
    },
    async (args) => {
      try {
        const response = await api("GET", `/pool/${args.id}`);
        return jsonResult(response);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // 3. List published items
  server.registerTool(
    "neuron_list_published",
    {
      title: "List My Published Items",
      description: "List all items you have published to the marketplace/pool",
      inputSchema: z.object({}),
    },
    async () => {
      try {
        const response = await api("GET", "/pool/my");
        return jsonResult(response);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // 4. List installed items
  server.registerTool(
    "neuron_list_installed",
    {
      title: "List Installed Items",
      description: "List all items you have installed from the marketplace/pool",
      inputSchema: z.object({}),
    },
    async () => {
      try {
        const response = await api("GET", "/pool/installed");
        return jsonResult(response);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // 5. Publish to pool
  server.registerTool(
    "neuron_publish_to_pool",
    {
      title: "Publish to Pool",
      description: "Publish a bot, tool, knowledge base, or reflection to the marketplace/pool for others to discover and use",
      inputSchema: z.object({
        resourceType: z.enum(["bot", "tool", "knowledge_base", "reflection"]).describe("Type of resource to publish"),
        resourceId: z.string().describe("The unique identifier of the resource to publish"),
        title: z.string().describe("Title for the pool listing"),
        description: z.string().optional().describe("Detailed description of the resource"),
        category: z.string().optional().describe("Category for organizing the resource"),
        tags: z.array(z.string()).optional().describe("Tags for improved discoverability"),
      }),
    },
    async (args) => {
      try {
        const body = {
          type: args.resourceType,
          sourceId: args.resourceId,
          name: args.title,
          description: args.description,
          category: args.category,
          tags: args.tags,
        };
        const response = await api("POST", "/pool", body);
        return jsonResult(response);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // 6. Update pool item
  server.registerTool(
    "neuron_update_pool_item",
    {
      title: "Update Pool Item",
      description: "Update the metadata of a pool item you have published (title, description, category, tags)",
      inputSchema: z.object({
        id: z.string().describe("The unique identifier of the pool item to update"),
        title: z.string().optional().describe("New title for the pool listing"),
        description: z.string().optional().describe("New description"),
        category: z.string().optional().describe("New category"),
        tags: z.array(z.string()).optional().describe("New tags"),
      }),
    },
    async (args) => {
      try {
        const { id, ...updateData } = args;
        const response = await api("PUT", `/pool/${id}`, updateData);
        return jsonResult(response);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // 7. Unpublish from pool
  server.registerTool(
    "neuron_unpublish_from_pool",
    {
      title: "Unpublish from Pool",
      description: "Remove a published item from the marketplace/pool. This action cannot be undone.",
      inputSchema: z.object({
        id: z.string().describe("The unique identifier of the pool item to unpublish"),
      }),
    },
    async (args) => {
      try {
        const response = await api("DELETE", `/pool/${args.id}`);
        return jsonResult(response);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // 8. Install from pool
  server.registerTool(
    "neuron_install_from_pool",
    {
      title: "Install from Pool",
      description: "Install a resource from the marketplace/pool. Choose 'fork' to create an independent copy or 'subscribe' to receive updates.",
      inputSchema: z.object({
        id: z.string().describe("The unique identifier of the pool item to install"),
        mode: z.enum(["fork", "subscribe"]).optional().describe("Installation mode: 'fork' for independent copy or 'subscribe' for linked updates (default: 'fork')"),
      }),
    },
    async (args) => {
      try {
        const { id, mode } = args;
        const response = await api("POST", `/pool/${id}/install`, { mode });
        return jsonResult(response);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // 9. Pull pool update
  server.registerTool(
    "neuron_pull_pool_update",
    {
      title: "Pull Pool Update",
      description: "Pull the latest updates for a subscribed pool resource. Only applies to items installed with 'subscribe' mode.",
      inputSchema: z.object({
        installId: z.string().describe("The unique identifier of the installed resource"),
      }),
    },
    async (args) => {
      try {
        const response = await api("POST", `/pool/installed/${args.installId}/pull`);
        return jsonResult(response);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // 10. Toggle featured status
  server.registerTool(
    "neuron_toggle_featured",
    {
      title: "Toggle Featured Status",
      description: "Toggle the featured status of a pool item. Featured items appear prominently in the marketplace. (Admin operation)",
      inputSchema: z.object({
        id: z.string().describe("The unique identifier of the pool item"),
      }),
    },
    async (args) => {
      try {
        const response = await api("POST", `/pool/${args.id}/feature`);
        return jsonResult(response);
      } catch (error) {
        return errorResult(error);
      }
    }
  );
}

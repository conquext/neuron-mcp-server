import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { api, jsonResult, errorResult } from "../client.js";

/**
 * Register knowledge base management tools for the Neuron MCP server.
 * Provides CRUD operations for knowledge bases, entries, and search capabilities.
 */
export function registerKnowledgeBaseTools(server: McpServer): void {
  // 1. Create Knowledge Base
  server.registerTool(
    "neuron_create_knowledge_base",
    {
      title: "Create Knowledge Base",
      description: "Create a new knowledge base to store and organize information, documents, and entries.",
      inputSchema: z.object({
        name: z.string().describe("Name of the knowledge base"),
        description: z.string().optional().describe("Optional description of the knowledge base purpose"),
        rootInstruction: z.string().optional().describe("Optional root instruction or context for the knowledge base"),
      }),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    async (params) => {
      try {
        const result = await api("POST", "knowledge-bases", {
          name: params.name,
          description: params.description,
          rootInstruction: params.rootInstruction,
        });
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // 2. List Knowledge Bases
  server.registerTool(
    "neuron_list_knowledge_bases",
    {
      title: "List Knowledge Bases",
      description: "Retrieve all knowledge bases accessible to the current user.",
      inputSchema: z.object({}),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async () => {
      try {
        const result = await api("GET", "knowledge-bases");
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // 3. Get Knowledge Base
  server.registerTool(
    "neuron_get_knowledge_base",
    {
      title: "Get Knowledge Base",
      description: "Retrieve detailed information about a specific knowledge base by its ID.",
      inputSchema: z.object({
        id: z.string().describe("Unique identifier of the knowledge base"),
      }),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async (params) => {
      try {
        const result = await api("GET", `knowledge-bases/${params.id}`);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // 4. Update Knowledge Base
  server.registerTool(
    "neuron_update_knowledge_base",
    {
      title: "Update Knowledge Base",
      description: "Update the properties of an existing knowledge base such as name, description, or root instruction.",
      inputSchema: z.object({
        id: z.string().describe("Unique identifier of the knowledge base to update"),
        name: z.string().optional().describe("New name for the knowledge base"),
        description: z.string().optional().describe("New description for the knowledge base"),
        rootInstruction: z.string().optional().describe("New root instruction or context"),
      }),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async (params) => {
      try {
        const result = await api("PUT", `knowledge-bases/${params.id}`, {
          name: params.name,
          description: params.description,
          rootInstruction: params.rootInstruction,
        });
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // 5. Delete Knowledge Base
  server.registerTool(
    "neuron_delete_knowledge_base",
    {
      title: "Delete Knowledge Base",
      description: "Permanently delete a knowledge base and all its associated entries and documents.",
      inputSchema: z.object({
        id: z.string().describe("Unique identifier of the knowledge base to delete"),
      }),
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async (params) => {
      try {
        const result = await api("DELETE", `knowledge-bases/${params.id}`);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // 6. Create Knowledge Base Entry
  server.registerTool(
    "neuron_create_kb_entry",
    {
      title: "Create Knowledge Base Entry",
      description: "Add a new entry (note, document, or information piece) to a knowledge base.",
      inputSchema: z.object({
        id: z.string().describe("Unique identifier of the knowledge base"),
        title: z.string().describe("Title of the entry"),
        content: z.string().describe("Content or body of the entry"),
        source: z.enum(["manual", "document", "url"]).optional().describe("Source type of the entry (default: manual)"),
        folder: z.string().optional().describe("Folder to organize the entry: 'general', 'skills', 'contexts', 'documents', or 'faqs' (default: general)"),
        metadata: z.record(z.unknown()).optional().describe("Optional metadata key-value pairs for the entry"),
      }),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    async (params) => {
      try {
        const result = await api("POST", `knowledge-bases/${params.id}/entries`, {
          title: params.title,
          content: params.content,
          source: params.source,
          folder: params.folder,
          metadata: params.metadata,
        });
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // 7. List Knowledge Base Entries
  server.registerTool(
    "neuron_list_kb_entries",
    {
      title: "List Knowledge Base Entries",
      description: "Retrieve entries from a knowledge base with optional filtering and pagination.",
      inputSchema: z.object({
        id: z.string().describe("Unique identifier of the knowledge base"),
        page: z.number().optional().describe("Page number for pagination (starts at 1)"),
        limit: z.number().optional().describe("Maximum number of entries to return per page"),
        folder: z.string().optional().describe("Filter entries by folder ('general', 'skills', 'contexts', 'documents', 'faqs')"),
        source: z.string().optional().describe("Filter entries by source type ('manual', 'document', 'url')"),
      }),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async (params) => {
      try {
        const queryParams: Record<string, string> = {};
        if (params.page !== undefined) queryParams.page = String(params.page);
        if (params.limit !== undefined) queryParams.limit = String(params.limit);
        if (params.folder) queryParams.folder = params.folder;
        if (params.source) queryParams.source = params.source;

        const result = await api("GET", `knowledge-bases/${params.id}/entries`, undefined, queryParams);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // 8. Update Knowledge Base Entry
  server.registerTool(
    "neuron_update_kb_entry",
    {
      title: "Update Knowledge Base Entry",
      description: "Update the content, title, folder, or source of an existing knowledge base entry.",
      inputSchema: z.object({
        kbId: z.string().describe("Unique identifier of the knowledge base"),
        entryId: z.string().describe("Unique identifier of the entry to update"),
        title: z.string().optional().describe("New title for the entry"),
        content: z.string().optional().describe("New content for the entry"),
        source: z.enum(["manual", "document", "url"]).optional().describe("New source type for the entry"),
        folder: z.string().optional().describe("New folder: 'general', 'skills', 'contexts', 'documents', or 'faqs'"),
        metadata: z.record(z.unknown()).optional().describe("New metadata key-value pairs"),
      }),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async (params) => {
      try {
        const result = await api("PUT", `knowledge-bases/${params.kbId}/entries/${params.entryId}`, {
          title: params.title,
          content: params.content,
          source: params.source,
          folder: params.folder,
          metadata: params.metadata,
        });
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // 9. Delete Knowledge Base Entry
  server.registerTool(
    "neuron_delete_kb_entry",
    {
      title: "Delete Knowledge Base Entry",
      description: "Permanently delete a specific entry from a knowledge base.",
      inputSchema: z.object({
        kbId: z.string().describe("Unique identifier of the knowledge base"),
        entryId: z.string().describe("Unique identifier of the entry to delete"),
      }),
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async (params) => {
      try {
        const result = await api("DELETE", `knowledge-bases/${params.kbId}/entries/${params.entryId}`);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // 10. Upload Document
  server.registerTool(
    "neuron_upload_document",
    {
      title: "Upload Document",
      description: "Upload a text document to a knowledge base. The document will be automatically chunked and indexed for semantic search.",
      inputSchema: z.object({
        id: z.string().describe("Unique identifier of the knowledge base"),
        content: z.string().describe("Text content of the document to upload"),
        filename: z.string().describe("Name of the file being uploaded"),
        folder: z.string().optional().describe("Folder path to organize the document within the knowledge base"),
      }),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    async (params) => {
      try {
        const result = await api("POST", `knowledge-bases/${params.id}/upload`, {
          content: params.content,
          filename: params.filename,
          folder: params.folder,
        });
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // 11. Search Knowledge
  server.registerTool(
    "neuron_search_knowledge",
    {
      title: "Search Knowledge",
      description: "Perform semantic search across all entries and documents in a knowledge base to find relevant information.",
      inputSchema: z.object({
        id: z.string().describe("Unique identifier of the knowledge base to search"),
        q: z.string().describe("Search query text to find relevant entries"),
        limit: z.number().optional().describe("Maximum number of search results to return"),
      }),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async (params) => {
      try {
        const queryParams: Record<string, string> = {
          q: params.q,
        };
        if (params.limit !== undefined) queryParams.limit = String(params.limit);

        const result = await api("GET", `knowledge-bases/${params.id}/search`, undefined, queryParams);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // 12. List Knowledge Base Bots
  server.registerTool(
    "neuron_list_kb_bots",
    {
      title: "List Knowledge Base Bots",
      description: "Retrieve all bots that are connected to or using a specific knowledge base.",
      inputSchema: z.object({
        id: z.string().describe("Unique identifier of the knowledge base"),
      }),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async (params) => {
      try {
        const result = await api("GET", `knowledge-bases/${params.id}/bots`);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // 13. Ingest Knowledge
  server.registerTool(
    "neuron_ingest_knowledge",
    {
      title: "Ingest Knowledge",
      description: "Ingest content into a knowledge base. Supports deduplication via externalId and optional LLM processing (summarize, extract_facts, or custom instruction).",
      inputSchema: z.object({
        knowledgeBaseId: z.string().describe("Knowledge base ID to ingest into"),
        title: z.string().describe("Title for the knowledge entry"),
        content: z.string().describe("Content to ingest"),
        externalId: z.string().optional().describe("Unique external ID for deduplication (e.g. file path, URL)"),
        sourceUrl: z.string().optional().describe("Source URL for reference"),
        source: z.enum(["api", "mcp"]).default("mcp").describe("Source type (default: mcp)"),
        folder: z.string().optional().describe("Folder: 'general', 'skills', 'contexts', 'documents', or 'faqs' (default: general)"),
        processing: z.object({
          mode: z.enum(["raw", "summarize", "extract_facts", "custom"]).default("raw").describe("Processing mode"),
          instruction: z.string().optional().describe("Custom instruction (only used with 'custom' mode)"),
        }).optional().describe("Optional LLM processing before storage"),
      }),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async (params) => {
      try {
        const result = await api("POST", `knowledge-bases/${params.knowledgeBaseId}/entries`, {
          title: params.title,
          content: params.content,
          source: params.source || "mcp",
          folder: params.folder || "general",
          metadata: {
            ...(params.externalId ? { externalId: params.externalId } : {}),
            ...(params.sourceUrl ? { sourceUrl: params.sourceUrl } : {}),
          },
        });
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // 14. Sync Knowledge
  server.registerTool(
    "neuron_sync_knowledge",
    {
      title: "Sync Knowledge",
      description: "Trigger a synchronization operation to refresh embeddings, reindex content, or update the knowledge base state.",
      inputSchema: z.object({
        id: z.string().describe("Unique identifier of the knowledge base to synchronize"),
      }),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async (params) => {
      try {
        const result = await api("POST", `knowledge-bases/${params.id}/sync`);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );
}

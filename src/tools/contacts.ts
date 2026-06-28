import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { api, jsonResult, errorResult, getAuthToken } from "../client.js";

export function registerContactsTools(server: McpServer): void {
  // List contacts
  server.registerTool(
    "neuron_list_contacts",
    {
      title: "List Contacts",
      description: "List contacts with optional filtering by search term, tag, and pagination",
      inputSchema: z.object({
        search: z.string().optional().describe("Search term to filter contacts by name, phone, or email"),
        tag: z.string().optional().describe("Filter contacts by tag"),
        page: z.number().int().positive().optional().describe("Page number for pagination"),
        limit: z.number().int().positive().optional().describe("Number of contacts per page"),
      }),
      annotations: { readOnlyHint: true },
    },
    async (params) => {
      try {
        const result = await api("GET", "/contacts", undefined, {
          search: params.search,
          tag: params.tag,
          page: params.page,
          limit: params.limit,
        });
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // Search contacts
  server.registerTool(
    "neuron_search_contacts",
    {
      title: "Search Contacts",
      description: "Search contacts by a query string across name, phone, and email fields",
      inputSchema: z.object({
        q: z.string().describe("Search query string"),
      }),
      annotations: { readOnlyHint: true },
    },
    async (params) => {
      try {
        const result = await api("GET", "/contacts/search", undefined, { q: params.q });
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // Get contact
  server.registerTool(
    "neuron_get_contact",
    {
      title: "Get Contact",
      description: "Get detailed information about a specific contact by ID",
      inputSchema: z.object({
        id: z.string().describe("The unique identifier of the contact"),
      }),
      annotations: { readOnlyHint: true },
    },
    async (params) => {
      try {
        const result = await api("GET", `/contacts/${params.id}`);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // Create contact
  server.registerTool(
    "neuron_create_contact",
    {
      title: "Create Contact",
      description: "Create a new contact. If notes are provided, they are saved as a structured note entry with source tracking.",
      inputSchema: z.object({
        name: z.string().describe("Full name of the contact"),
        phone: z.string().describe("Phone number of the contact"),
        email: z.string().optional().describe("Email address of the contact"),
        tags: z.array(z.string()).optional().describe("Tags to categorize the contact"),
        notes: z.string().optional().describe("Additional notes about the contact"),
      }),
    },
    async (params) => {
      try {
        const result = await api("POST", "/contacts", params);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // Update contact
  server.registerTool(
    "neuron_update_contact",
    {
      title: "Update Contact",
      description: "Update an existing contact. If notes are provided, they are added as a new structured note entry (does not overwrite existing notes).",
      inputSchema: z.object({
        id: z.string().describe("The unique identifier of the contact to update"),
        name: z.string().optional().describe("New name for the contact"),
        phone: z.string().optional().describe("New phone number for the contact"),
        email: z.string().optional().describe("New email address for the contact"),
        tags: z.array(z.string()).optional().describe("New tags for the contact"),
        notes: z.string().optional().describe("New notes about the contact"),
      }),
    },
    async (params) => {
      try {
        const { id, ...body } = params;
        const result = await api("PUT", `/contacts/${id}`, body);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // Delete contact
  server.registerTool(
    "neuron_delete_contact",
    {
      title: "Delete Contact",
      description: "Permanently delete a contact. This action cannot be undone.",
      inputSchema: z.object({
        id: z.string().describe("The unique identifier of the contact to delete"),
      }),
      annotations: { destructiveHint: true },
    },
    async (params) => {
      try {
        const result = await api("DELETE", `/contacts/${params.id}`);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // Export contacts
  server.registerTool(
    "neuron_export_contacts",
    {
      title: "Export Contacts",
      description: "Export all contacts from the system",
      inputSchema: z.object({}),
      annotations: { readOnlyHint: true },
    },
    async () => {
      try {
        const result = await api("GET", "/contacts/export");
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // Import contacts
  server.registerTool(
    "neuron_import_contacts",
    {
      title: "Import Contacts",
      description: "Import multiple contacts at once. Provide an array of contact objects.",
      inputSchema: z.object({
        contacts: z.array(z.object({
          name: z.string().describe("Full name of the contact"),
          phone: z.string().describe("Phone number of the contact"),
          email: z.string().optional().describe("Email address"),
          tags: z.array(z.string()).optional().describe("Tags to categorize the contact"),
          notes: z.string().optional().describe("Additional notes"),
        })).describe("Array of contacts to import"),
      }),
    },
    async (params) => {
      try {
        const result = await api("POST", "/contacts/import", { contacts: params.contacts });
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // Populate contacts
  server.registerTool(
    "neuron_populate_contacts",
    {
      title: "Populate Contacts",
      description: "Populate contacts with additional data from connected channels",
      inputSchema: z.object({}),
    },
    async () => {
      try {
        const result = await api("POST", "/contacts/populate");
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // Sync WhatsApp contacts
  server.registerTool(
    "neuron_sync_whatsapp_contacts",
    {
      title: "Sync WhatsApp Contacts",
      description: "Synchronize contacts from connected WhatsApp channels into the contacts database",
      inputSchema: z.object({}),
    },
    async () => {
      try {
        const result = await api("POST", "/contacts/sync-whatsapp");
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // Semantic search contacts
  server.registerTool(
    "neuron_semantic_search_contacts",
    {
      title: "Semantic Search Contacts",
      description:
        "Search contacts using natural language AI-powered semantic search. Finds contacts based on the meaning of their notes — skills, services, schedules, preferences, etc. Returns ranked results with relevance scores and AI-generated match reasons.",
      inputSchema: z.object({
        query: z.string().describe("Natural language search query (e.g. 'who can deliver to Lagos on Monday?')"),
        limit: z.number().int().positive().max(20).optional().describe("Maximum number of results to return (default 10, max 20)"),
      }),
      annotations: { readOnlyHint: true },
    },
    async (params) => {
      try {
        const queryParams: Record<string, string | number> = { q: params.query };
        if (params.limit) queryParams.limit = params.limit;
        const result = await api("GET", "/contacts/semantic-search", undefined, queryParams);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // Audio-to-contact extraction
  server.registerTool(
    "neuron_audio_contact",
    {
      title: "Extract Contact from Audio",
      description:
        "Transcribe an audio recording and extract contact information (name, phone, email, notes, tags). " +
        "Auto-saves the contact. Provide base64-encoded audio data.",
      inputSchema: z.object({
        audioBase64: z.string().describe("Base64-encoded audio data"),
        audioFormat: z
          .string()
          .optional()
          .default("webm")
          .describe("Audio format hint (default: webm)"),
      }),
    },
    async (params) => {
      try {
        // Decode base64 to buffer and create a File-like object for the API
        const buffer = Buffer.from(params.audioBase64, "base64");
        const blob = new Blob([buffer], { type: `audio/${params.audioFormat || "webm"}` });

        // Create FormData and send to extract-audio endpoint
        const formData = new FormData();
        formData.append("audio", blob, `recording.${params.audioFormat || "webm"}`);

        // Use raw fetch since api() doesn't handle FormData
        const baseUrl = process.env.NEURON_API_URL || "https://api.neuron.ng";
        const response = await fetch(`${baseUrl}/api/v1/contacts/extract-audio`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
          body: formData,
        });

        const extractResult: any = await response.json();
        if (!extractResult.success || extractResult.data?.extracted?.error) {
          return errorResult(
            new Error(extractResult.data?.extracted?.error || extractResult.error?.message || "Extraction failed"),
          );
        }

        const { extracted, transcript } = extractResult.data;

        // Auto-save the contact
        const saveResult = await api("POST", "/contacts", {
          name: extracted.name,
          phone: extracted.phone,
          email: extracted.email,
          tags: extracted.tags || [],
          notes: extracted.notes,
        });

        return jsonResult({
          success: true,
          data: {
            transcript,
            extracted,
            contact: (saveResult as any).data,
          },
        });
      } catch (error) {
        return errorResult(error);
      }
    },
  );
}

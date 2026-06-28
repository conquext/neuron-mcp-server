import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { api, jsonResult, errorResult } from "../client.js";

export function registerContactListsTools(server: McpServer): void {
  server.registerTool(
    "neuron_list_contact_lists",
    {
      title: "List Contact Lists",
      description: "List all contact lists with optional search, type filter, and pagination",
      inputSchema: z.object({
        search: z.string().optional().describe("Search by name or slug"),
        type: z.string().optional().describe("Filter by type: static, dynamic, merged"),
        page: z.number().int().positive().optional().describe("Page number"),
        limit: z.number().int().positive().optional().describe("Items per page"),
      }),
      annotations: { readOnlyHint: true },
    },
    async (params) => {
      try {
        const result = await api("GET", "/contact-lists", undefined, {
          search: params.search,
          type: params.type,
          page: params.page,
          limit: params.limit,
        });
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    "neuron_get_contact_list",
    {
      title: "Get Contact List",
      description: "Get a contact list by ID or slug, including member count",
      inputSchema: z.object({
        idOrSlug: z.string().describe("The list ID (UUID) or slug"),
      }),
      annotations: { readOnlyHint: true },
    },
    async (params) => {
      try {
        const result = await api("GET", `/contact-lists/${params.idOrSlug}`);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    "neuron_create_contact_list",
    {
      title: "Create Contact List",
      description: "Create a new contact list. Slug is auto-generated from name if not provided. For dynamic lists, provide criteria with rules and/or aiPrompt.",
      inputSchema: z.object({
        name: z.string().describe("Display name for the list"),
        slug: z.string().optional().describe("URL-friendly identifier (auto-generated if omitted)"),
        description: z.string().optional().describe("Optional description"),
        type: z.enum(["static", "dynamic", "merged"]).optional().describe("List type (default: static)"),
        criteria: z.record(z.unknown()).optional().describe("For dynamic lists: { rules?: { operator, conditions }, aiPrompt?, aiMaxResults? }"),
        refreshSchedule: z.enum(["manual", "daily", "weekly", "on_access"]).optional().describe("Refresh schedule for dynamic lists (default: manual)"),
      }),
    },
    async (params) => {
      try {
        const result = await api("POST", "/contact-lists", params);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    "neuron_update_contact_list",
    {
      title: "Update Contact List",
      description: "Update a contact list's name, slug, description, criteria, or refresh schedule",
      inputSchema: z.object({
        idOrSlug: z.string().describe("The list ID (UUID) or slug"),
        name: z.string().optional().describe("New name"),
        slug: z.string().optional().describe("New slug"),
        description: z.string().optional().describe("New description"),
        criteria: z.record(z.unknown()).optional().nullable().describe("For dynamic lists: criteria rules/AI prompt. Set to null to clear."),
        refreshSchedule: z.enum(["manual", "daily", "weekly", "on_access"]).optional().describe("Refresh schedule for dynamic lists"),
      }),
    },
    async (params) => {
      try {
        const { idOrSlug, ...body } = params;
        const result = await api("PUT", `/contact-lists/${idOrSlug}`, body);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    "neuron_delete_contact_list",
    {
      title: "Delete Contact List",
      description: "Delete a contact list. System lists (like 'Do Not Contact') cannot be deleted.",
      inputSchema: z.object({
        idOrSlug: z.string().describe("The list ID (UUID) or slug"),
      }),
      annotations: { destructiveHint: true },
    },
    async (params) => {
      try {
        const result = await api("DELETE", `/contact-lists/${params.idOrSlug}`);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    "neuron_get_contact_list_members",
    {
      title: "Get Contact List Members",
      description: "List members of a contact list with search and pagination",
      inputSchema: z.object({
        idOrSlug: z.string().describe("The list ID (UUID) or slug"),
        search: z.string().optional().describe("Search members by name or phone"),
        page: z.number().int().positive().optional().describe("Page number"),
        limit: z.number().int().positive().optional().describe("Items per page"),
      }),
      annotations: { readOnlyHint: true },
    },
    async (params) => {
      try {
        const result = await api("GET", `/contact-lists/${params.idOrSlug}/members`, undefined, {
          search: params.search,
          page: params.page,
          limit: params.limit,
        });
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    "neuron_add_to_contact_list",
    {
      title: "Add to Contact List",
      description: "Add contacts to a list by contact ID or phone number. Phone numbers without existing contacts are auto-created as minimal contacts.",
      inputSchema: z.object({
        idOrSlug: z.string().describe("The list ID (UUID) or slug"),
        entries: z.array(
          z.object({
            contactId: z.string().optional().describe("Contact UUID"),
            phone: z.string().optional().describe("Phone number (creates contact if needed)"),
          }),
        ).describe("Contacts to add"),
      }),
    },
    async (params) => {
      try {
        const result = await api("POST", `/contact-lists/${params.idOrSlug}/members`, {
          entries: params.entries,
        });
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    "neuron_remove_from_contact_list",
    {
      title: "Remove from Contact List",
      description: "Remove contacts from a list by their contact IDs",
      inputSchema: z.object({
        idOrSlug: z.string().describe("The list ID (UUID) or slug"),
        contactIds: z.array(z.string()).describe("Contact UUIDs to remove"),
      }),
      annotations: { destructiveHint: true },
    },
    async (params) => {
      try {
        const result = await api("DELETE", `/contact-lists/${params.idOrSlug}/members`, {
          contactIds: params.contactIds,
        });
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    "neuron_merge_contact_lists",
    {
      title: "Merge Contact Lists",
      description: "Create a new list by merging multiple source lists. Window merge creates a virtual union; materialized merge creates a static copy.",
      inputSchema: z.object({
        name: z.string().describe("Name for the merged list"),
        sourceListIds: z.array(z.string()).min(2).describe("IDs or slugs of lists to merge"),
        mergeType: z.enum(["window", "materialized"]).describe("Merge type: window (virtual union) or materialized (static copy)"),
        slug: z.string().optional().describe("Optional slug for the merged list"),
      }),
    },
    async (params) => {
      try {
        const result = await api("POST", "/contact-lists/merge", params);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    "neuron_find_contact_lists_for_contact",
    {
      title: "Find Contact Lists for Contact",
      description: "Find which contact lists a specific contact belongs to",
      inputSchema: z.object({
        contactId: z.string().describe("The contact UUID"),
      }),
      annotations: { readOnlyHint: true },
    },
    async (params) => {
      try {
        const result = await api("GET", `/contact-lists/by-contact/${params.contactId}`);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    "neuron_refresh_contact_list",
    {
      title: "Refresh Contact List",
      description: "Trigger a refresh of a dynamic contact list. Re-evaluates criteria rules and/or AI prompt, materializes updated members.",
      inputSchema: z.object({
        idOrSlug: z.string().describe("The dynamic list ID (UUID) or slug"),
      }),
    },
    async (params) => {
      try {
        const result = await api("POST", `/contact-lists/${params.idOrSlug}/refresh`);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    },
  );
}

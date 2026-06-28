import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { api, jsonResult, errorResult } from "../client.js";

export function registerOrganizationTools(server: McpServer): void {
  // Get Organization
  server.registerTool(
    "neuron_get_organization",
    {
      title: "Get Organization",
      description: "Get details of a specific organization by ID",
      inputSchema: z.object({
        orgId: z.string().describe("ID of the organization to retrieve"),
      }),
      annotations: {
        readOnlyHint: true,
      },
    },
    async (params) => {
      try {
        const result = await api("GET", `/organizations/${params.orgId}`);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // Update Organization
  server.registerTool(
    "neuron_update_organization",
    {
      title: "Update Organization",
      description: "Update organization details such as name",
      inputSchema: z.object({
        orgId: z.string().describe("ID of the organization to update"),
        name: z.string().optional().describe("New name for the organization"),
      }),
      annotations: {
        destructiveHint: false,
      },
    },
    async (params) => {
      try {
        const { orgId, ...body } = params;
        const result = await api("PUT", `/organizations/${orgId}`, body);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // Update WhatsApp Credentials
  server.registerTool(
    "neuron_update_whatsapp_credentials",
    {
      title: "Update WhatsApp Credentials",
      description: "Update WhatsApp Business API credentials for the organization",
      inputSchema: z.object({
        orgId: z.string().describe("ID of the organization"),
        whatsappPhoneNumberId: z.string().describe("WhatsApp phone number ID from Meta Business"),
        whatsappBusinessAccountId: z.string().describe("WhatsApp Business Account ID from Meta"),
        whatsappAccessToken: z.string().describe("WhatsApp access token for API authentication"),
      }),
      annotations: {
        destructiveHint: false,
      },
    },
    async (params) => {
      try {
        const { orgId, ...body } = params;
        const result = await api("PUT", `/organizations/${orgId}/whatsapp`, body);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // Set Default Channel
  server.registerTool(
    "neuron_set_default_channel",
    {
      title: "Set Default WhatsApp Channel",
      description:
        "Set the default WhatsApp channel for the organization. Used by neuron_send_whatsapp for auto-resolving " +
        "which channel to send through. Pass null to clear.",
      inputSchema: z.object({
        orgId: z.string().describe("ID of the organization"),
        channelId: z.string().nullable().describe("Channel ID to set as default, or null to clear"),
      }),
    },
    async (params) => {
      try {
        const result = await api("PUT", `/organizations/${params.orgId}/default-channel`, {
          channelId: params.channelId,
        });
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // List Members
  server.registerTool(
    "neuron_list_members",
    {
      title: "List Organization Members",
      description: "Get a list of all members in the organization",
      inputSchema: z.object({
        orgId: z.string().describe("ID of the organization"),
      }),
      annotations: {
        readOnlyHint: true,
      },
    },
    async (params) => {
      try {
        const result = await api("GET", `/organizations/${params.orgId}/members`);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // Invite Member
  server.registerTool(
    "neuron_invite_member",
    {
      title: "Invite Organization Member",
      description: "Invite a new member to the organization with email, name, and optional role",
      inputSchema: z.object({
        orgId: z.string().describe("ID of the organization"),
        email: z.string().email().describe("Email address of the member to invite"),
        name: z.string().describe("Full name of the member"),
        role: z.string().optional().describe("Role of the member (e.g., 'admin', 'agent', 'viewer')"),
        canViewConversations: z.boolean().optional().describe("Whether the member can view conversations (default: true)"),
      }),
      annotations: {
        destructiveHint: false,
      },
    },
    async (params) => {
      try {
        const { orgId, ...body } = params;
        const result = await api("POST", `/organizations/${orgId}/members`, body);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // List Invitations
  server.registerTool(
    "neuron_list_invitations",
    {
      title: "List Invitations",
      description: "List all pending invitations for the organization",
      inputSchema: z.object({
        orgId: z.string().describe("ID of the organization"),
      }),
      annotations: { readOnlyHint: true },
    },
    async (params) => {
      try {
        const result = await api("GET", `/organizations/${params.orgId}/invitations`);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // Revoke Invitation
  server.registerTool(
    "neuron_revoke_invitation",
    {
      title: "Revoke Invitation",
      description: "Revoke a pending invitation so it can no longer be accepted",
      inputSchema: z.object({
        orgId: z.string().describe("ID of the organization"),
        invitationId: z.string().describe("ID of the invitation to revoke"),
      }),
      annotations: { destructiveHint: true },
    },
    async (params) => {
      try {
        const result = await api("DELETE", `/organizations/${params.orgId}/invitations/${params.invitationId}`);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // Update Member Permissions
  server.registerTool(
    "neuron_update_member",
    {
      title: "Update Member Permissions",
      description: "Update a member's permissions such as conversation access",
      inputSchema: z.object({
        orgId: z.string().describe("ID of the organization"),
        userId: z.string().describe("ID of the member to update"),
        canViewConversations: z.boolean().describe("Whether the member can view conversations"),
      }),
    },
    async (params) => {
      try {
        const { orgId, userId, ...body } = params;
        const result = await api("PATCH", `/organizations/${orgId}/members/${userId}`, body);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // Remove Member
  server.registerTool(
    "neuron_remove_member",
    {
      title: "Remove Organization Member",
      description: "Remove a member from the organization",
      inputSchema: z.object({
        orgId: z.string().describe("ID of the organization"),
        userId: z.string().describe("ID of the user to remove from the organization"),
      }),
      annotations: {
        destructiveHint: true,
      },
    },
    async (params) => {
      try {
        const result = await api("DELETE", `/organizations/${params.orgId}/members/${params.userId}`);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );
}

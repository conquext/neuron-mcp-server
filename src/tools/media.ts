import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { jsonResult, errorResult, getAuthToken } from "../client.js";
import axios from "axios";
import FormData from "form-data";

const BASE_URL = process.env.NEURON_API_URL || "https://api.neuron.ng/api/v1";

export function registerMediaTools(server: McpServer): void {
  // Upload media
  server.registerTool(
    "neuron_upload_media",
    {
      title: "Upload Media",
      description: "Upload a media file (image, document, audio, video) by providing its base64-encoded content. Returns a URL that can be used in messages and broadcasts.",
      inputSchema: z.object({
        base64: z.string().describe("Base64-encoded file content"),
        filename: z.string().describe("Original filename including extension (e.g., 'photo.jpg')"),
        mimetype: z.string().describe("MIME type of the file (e.g., 'image/jpeg', 'application/pdf')"),
      }),
    },
    async (params) => {
      try {
        const buffer = Buffer.from(params.base64, "base64");
        const form = new FormData();
        form.append("file", buffer, {
          filename: params.filename,
          contentType: params.mimetype,
        });

        const token = getAuthToken();
        const response = await axios.post(`${BASE_URL}/media/upload`, form, {
          headers: {
            ...form.getHeaders(),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          timeout: 60000,
        });

        return jsonResult(response.data);
      } catch (error) {
        return errorResult(error);
      }
    }
  );
}

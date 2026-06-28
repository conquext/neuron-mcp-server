import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { api, jsonResult, errorResult } from "../client.js";

export function registerBlogTools(server: McpServer): void {
  // Create blog post
  server.registerTool(
    "neuron_create_blog_post",
    {
      title: "Create Blog Post",
      description: "Create a new blog post (draft or published)",
      inputSchema: z.object({
        title: z.string().describe("Post title (max 500 chars)"),
        content: z.string().describe("Post content (markdown)"),
        excerpt: z.string().optional().describe("Short summary (optional)"),
        authorType: z
          .enum(["user", "organization"])
          .describe("Author type"),
        coverImageUrl: z.string().optional().describe("Cover image URL (optional)"),
        tags: z
          .array(z.string())
          .optional()
          .describe("Tag names or slugs"),
        status: z
          .enum(["draft", "published"])
          .default("draft")
          .describe("Post status"),
        seoTitle: z
          .string()
          .optional()
          .describe("SEO title override (optional)"),
        seoDescription: z
          .string()
          .optional()
          .describe("Meta description (optional)"),
        seoKeywords: z
          .array(z.string())
          .optional()
          .describe("SEO keywords (optional)"),
      }),
    },
    async (params) => {
      try {
        const result = await api("POST", "blog/posts", {
          title: params.title,
          content: params.content,
          excerpt: params.excerpt,
          authorType: params.authorType,
          coverImageUrl: params.coverImageUrl,
          tags: params.tags,
          status: params.status,
          seoTitle: params.seoTitle,
          seoDescription: params.seoDescription,
          seoKeywords: params.seoKeywords,
        });
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // List blog posts
  server.registerTool(
    "neuron_list_blog_posts",
    {
      title: "List Blog Posts",
      description: "List blog posts with filters",
      inputSchema: z.object({
        status: z
          .enum(["draft", "published", "hidden"])
          .optional()
          .describe("Filter by status"),
        authorType: z
          .enum(["user", "organization"])
          .optional()
          .describe("Filter by author type"),
        authorId: z
          .string()
          .optional()
          .describe("Filter by author UUID"),
        tag: z.string().optional().describe("Filter by tag slug"),
        page: z.number().default(1).describe("Page number"),
        limit: z.number().default(20).describe("Results per page"),
      }),
    },
    async (params) => {
      try {
        const result = await api("GET", "blog/posts", undefined, {
          status: params.status,
          authorType: params.authorType,
          authorId: params.authorId,
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

  // Get blog post
  server.registerTool(
    "neuron_get_blog_post",
    {
      title: "Get Blog Post",
      description: "Get a blog post by slug",
      inputSchema: z.object({
        slug: z.string().describe("Post slug"),
      }),
    },
    async (params) => {
      try {
        const result = await api("GET", `blog/posts/${params.slug}`);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // Update blog post
  server.registerTool(
    "neuron_update_blog_post",
    {
      title: "Update Blog Post",
      description: "Update an existing blog post",
      inputSchema: z.object({
        id: z.string().describe("Post UUID"),
        title: z.string().optional().describe("Post title"),
        content: z.string().optional().describe("Post content"),
        excerpt: z.string().optional().describe("Short summary"),
        coverImageUrl: z.string().optional().describe("Cover image URL"),
        status: z
          .enum(["draft", "published", "hidden"])
          .optional()
          .describe("Post status"),
        seoTitle: z.string().optional().describe("SEO title"),
        seoDescription: z.string().optional().describe("Meta description"),
        seoKeywords: z
          .array(z.string())
          .optional()
          .describe("SEO keywords"),
      }),
    },
    async (params) => {
      try {
        const { id, ...body } = params;
        const result = await api("PUT", `blog/posts/${id}`, body);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // Delete blog post
  server.registerTool(
    "neuron_delete_blog_post",
    {
      title: "Delete Blog Post",
      description: "Delete a blog post",
      inputSchema: z.object({
        id: z.string().describe("Post UUID"),
      }),
    },
    async (params) => {
      try {
        await api("DELETE", `blog/posts/${params.id}`);
        return { content: [{ type: "text" as const, text: "Post deleted successfully" }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // Publish post
  server.registerTool(
    "neuron_publish_blog_post",
    {
      title: "Publish Blog Post",
      description: "Publish a draft post",
      inputSchema: z.object({
        id: z.string().describe("Post UUID"),
      }),
    },
    async (params) => {
      try {
        const result = await api("POST", `blog/posts/${params.id}/publish`);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );
}

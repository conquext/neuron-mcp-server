# Neuron MCP Server

> WhatsApp automation platform with 120+ MCP tools for AI-powered chatbots, broadcasts, campaigns, and more.

[![npm version](https://img.shields.io/npm/v/neuron-mcp-server)](https://www.npmjs.com/package/neuron-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## What is Neuron?

[Neuron](https://neuron.ng) is an AI-powered WhatsApp automation platform. This MCP server exposes **120+ tools** that let AI coding assistants — Claude Code, Cursor, Windsurf, and other MCP-compatible clients — manage your entire WhatsApp business programmatically.

Build chatbots, send broadcasts, manage contacts, create campaigns, publish newsletters, and more — all through natural language with your AI assistant.

## Quick Start

### Option 1: Remote Server (Recommended — zero install)

Add to your MCP client config:

```json
{
  "mcpServers": {
    "neuron": {
      "type": "url",
      "url": "https://mcp.neuron.ng/mcp"
    }
  }
}
```

No installation required. Works immediately with any MCP client that supports Streamable HTTP.

### Option 2: Local Server (via npm)

Run directly with npx:

```bash
npx neuron-mcp-server
```

Or install globally:

```bash
npm install -g neuron-mcp-server
```

Claude Code config (`~/.claude/mcp.json`):

```json
{
  "mcpServers": {
    "neuron": {
      "command": "npx",
      "args": ["-y", "neuron-mcp-server"]
    }
  }
}
```

## Authentication

Three ways to authenticate:

### 1. Browser Login (Recommended)

Call `neuron_login()` with no arguments. The server returns a URL — open it in your browser to authorize securely. No credentials are shared with the AI.

### 2. MCP Token

Generate a token from your Neuron dashboard (**Settings > MCP Tokens**), then:

```
neuron_login({ token: "your-mcp-token" })
```

### 3. Environment Variable

Set `NEURON_AUTH_TOKEN` for unattended/CI use:

```bash
NEURON_AUTH_TOKEN=your-token npx neuron-mcp-server
```

## Available Tools (120+)

| Category | Tools | Description |
|----------|-------|-------------|
| **Authentication** | 8 | Login, register, org switching, profile management |
| **Bot Management** | 7 | Create and manage AI chatbots with configurable LLM models |
| **Conversations** | 11 | Message management, human takeover, send WhatsApp messages |
| **Knowledge Bases** | 14 | Upload documents, semantic search, sync, ingest content |
| **Contacts** | 12 | CRUD operations, import/export, semantic search, sync |
| **Contact Lists** | 11 | Segmentation, merge, membership management |
| **Channels** | 17 | WhatsApp connections, QR pairing, session management |
| **Broadcasts** | 7 | Bulk messaging to contact lists |
| **Campaigns** | 14 | Sponsored campaigns, marketplace, funding |
| **Newsletters** | 8 | WhatsApp Channel/newsletter management |
| **Webhooks** | 8 | Inbound and outbound webhook management |
| **Custom Tools** | 6 | HTTP API tools for bots with secret injection |
| **Blog** | 6 | Content publishing |
| **Organizations** | 7 | Team management, audit logs, member invitations |
| **Billing & Wallet** | 12 | Subscriptions, wallet, payouts, bank accounts |
| **Marketplace** | 8 | Publish and install bots and contact lists |
| **Reflections** | 4 | Self-learning bot improvement suggestions |
| **Media & AI** | 2 | Upload media, AI text rewriting |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEURON_API_URL` | API base URL | `https://api.neuron.ng/api/v1` |
| `NEURON_AUTH_TOKEN` | Pre-set auth token | — |
| `MCP_TRANSPORT` | Transport mode: `stdio` or `http` | `stdio` |
| `PORT` | HTTP server port (when using `http` transport) | `3001` |

## IDE Setup

### Claude Code

Add to `~/.claude/mcp.json`:

```json
{
  "mcpServers": {
    "neuron": {
      "command": "npx",
      "args": ["-y", "neuron-mcp-server"]
    }
  }
}
```

Or use the remote server:

```json
{
  "mcpServers": {
    "neuron": {
      "type": "url",
      "url": "https://mcp.neuron.ng/mcp"
    }
  }
}
```

### Cursor

**Settings > MCP Servers > Add Streamable HTTP**

URL: `https://mcp.neuron.ng/mcp`

### Windsurf

**Settings > AI > MCP Servers > Add**

Use either the remote URL or local npx command.

## Development

```bash
git clone https://github.com/conquext/neuron-mcp-server.git
cd neuron-mcp-server
npm install
npm run dev
```

## Links

- **Website:** [neuron.ng](https://neuron.ng)
- **Documentation:** [neuron.ng/docs](https://neuron.ng/docs)
- **MCP Server Docs:** [neuron.ng/docs/mcp-server](https://neuron.ng/docs/mcp-server)
- **npm:** [npmjs.com/package/neuron-mcp-server](https://www.npmjs.com/package/neuron-mcp-server)

Free to start — no credit card required.

## License

[MIT](LICENSE)

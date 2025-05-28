# Appfolio MCP Server (@fluegeldao/appfolio-mcp-server)
[![smithery badge](https://smithery.ai/badge/@CryptoCultCurt/appfolio-mcp-server)](https://smithery.ai/server/@CryptoCultCurt/appfolio-mcp-server)

A Model Context Protocol (MCP) server providing tools to interact with the Appfolio Property Manager Reporting API.

## Installation

### Installing via Smithery

To install appfolio-mcp-server for Claude Desktop automatically via [Smithery](https://smithery.ai/server/@CryptoCultCurt/appfolio-mcp-server):

```bash
npx -y @smithery/cli install @CryptoCultCurt/appfolio-mcp-server --client claude
```

### Manual Installation
Install the package using npm:

```bash
npm install @fluegeldao/appfolio-mcp-server
```

## Usage

### Configuration as an MCP Server

```bash
{
  // ... other server configurations
  "appfolio": {
    "command": "npx",
    "args": ["@fluegeldao/appfolio-mcp-server"],
    "env": {
      "NODE_OPTIONS": "--experimental-vm-modules", // Optional, may depend on your Node version/setup
      "VHOST": "YOUR_APPFOLIO_HOSTNAME", // e.g., "yourcompany"
      "USERNAME": "YOUR_APPFOLIO_API_USERNAME",
      "PASSWORD": "YOUR_APPFOLIO_API_PASSWORD"
    },
    "restart": true // Optional: Restart the server if it crashes
  }
  // ... other server configurations
}
```

### As a Tool

```bash
npx @fluegeldao/appfolio-mcp-server
```

[![smithery badge](https://smithery.ai/badge/@CryptoCultCurt/appfolio-mcp-server)](https://smithery.ai/server/@CryptoCultCurt/appfolio-mcp-server)
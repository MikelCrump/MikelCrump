#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createCrumpMcpServer } from "@/mcp/server";

async function main() {
  const server = createCrumpMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Crump Studio MCP server running on stdio");
}

main().catch((error) => {
  console.error("MCP server failed", error);
  process.exit(1);
});

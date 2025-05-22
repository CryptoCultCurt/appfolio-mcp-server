import axios from 'axios';
import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import dotenv from 'dotenv';
import { appfolioLimiter } from '../appfolio';

dotenv.config();

const { VHOST, USERNAME, PASSWORD } = process.env;

// Originally from src/appfolio.ts (lines 63-73)
export type FixedAssetsArgs = {
  property_visibility?: "active" | "hidden" | "all";
  unit_ids?: string[];
  property?: {
    property_id?: string;
  };
  include_property_level_fixed_assets?: "0" | "1";
  asset_types?: string;
  status?: string;
  columns?: string[];
};

// Originally from src/appfolio.ts (lines 75-90)
export type FixedAssetsResult = {
  results: Array<{
    asset_id: string;
    serial_number: string;
    asset_type: string;
    property_name: string;
    property_id: number;
    unit: string;
    unit_id: number;
    warranty_expiration: string;
    placed_in_service: string;
    status: string;
    cost: string;
  }>;
  next_page_url: string;
};

// Originally from src/index.ts (line 75), with defaults added
const fixedAssetsArgsSchema = z.object({
  property_visibility: z.enum(["active", "hidden", "all"]).default("active").optional().describe('Filter properties by status. Defaults to "active"'),
  unit_ids: z.array(z.string()).optional().describe('Array of unit IDs to filter by'),
  property: z.object({
    property_id: z.string().optional()
  }).optional().describe('Filter by a specific property ID'),
  include_property_level_fixed_assets: z.enum(["0", "1"]).default("1").optional().describe('Include assets linked directly to the property. Defaults to "1" (true)'),
  asset_types: z.string().default("All").optional().describe('Filter by specific asset type name. Defaults to "All"'),
  status: z.string().default("all").optional().describe('Filter by asset status. Defaults to "all"'),
  columns: z.array(z.string()).optional().describe('Array of specific columns to include in the report')
});

// Originally from src/appfolio.ts (function starting line 1546)
export async function getFixedAssetsReport(args: FixedAssetsArgs): Promise<FixedAssetsResult> {
  if (!VHOST || !USERNAME || !PASSWORD) {
    throw new Error('Missing AppFolio API credentials');
  }

  // Defaults are now handled by Zod schema
  const payload = args;

  const url = `https://${VHOST}.appfolio.com/api/v2/reports/fixed_assets.json`;
  const response = await appfolioLimiter.schedule(() => axios.post(url, payload, {
    auth: { username: USERNAME, password: PASSWORD },
    headers: { 'Content-Type': 'application/json' },
  }));

  return response.data;
}

// New registration function for MCP
export function registerFixedAssetsReportTool(server: McpServer) {
  server.tool(
    "get_fixed_assets_report",
    "Returns a report of fixed assets based on the provided filters.", // Description from original registration
    fixedAssetsArgsSchema.shape,
    async (toolArgs: z.infer<typeof fixedAssetsArgsSchema>) => {
      const data = await getFixedAssetsReport(toolArgs as FixedAssetsArgs);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data),
            mimeType: "application/json"
          }
        ]
      };
    }
  );
}

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { makeAppfolioApiCall } from '../appfolio';

// --- Fixed Assets Report Types ---
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

// --- Fixed Assets Report Result ---
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

// --- Fixed Assets Report Args Schema ---
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

// --- Fixed Assets Report Function ---
export async function getFixedAssetsReport(args: FixedAssetsArgs): Promise<FixedAssetsResult> {
  const { property_visibility = "active", ...rest } = args;
  const payload = { property_visibility, ...rest };

  return makeAppfolioApiCall<FixedAssetsResult>('fixed_assets.json', payload);
}

// --- Fixed Assets Report Tool Registration ---
export function registerFixedAssetsReportTool(server: McpServer) {
  server.tool(
    "get_fixed_assets_report",
    "Returns a report of fixed assets based on the provided filters.",
    fixedAssetsArgsSchema.shape as any,
    async (args, _extra: unknown) => {
      try {
        // Validate arguments against schema
        const parseResult = fixedAssetsArgsSchema.safeParse(args);
        if (!parseResult.success) {
          const errorMessages = parseResult.error.errors.map(err => 
            `${err.path.join('.')}: ${err.message}`
          ).join('; ');
          throw new Error(`Invalid arguments: ${errorMessages}`);
        }

        const result = await getFixedAssetsReport(parseResult.data as FixedAssetsArgs);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
              mimeType: "application/json"
            }
          ]
        };
      } catch (error) {
        // Enhanced error reporting for debugging
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Fixed Assets Report Error:`, errorMessage);
        throw error;
      }
    }
  );
}

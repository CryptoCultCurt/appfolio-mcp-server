import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { makeAppfolioApiCall } from '../appfolio';

// Zod schema for Property Directory Report arguments
export const propertyDirectoryArgsSchema = z.object({
  property_visibility: z.enum(["active", "hidden", "all"]).default("active").describe('Filter properties by status. Defaults to "active"'),
  properties: z.object({
    properties_ids: z.array(z.string()).optional(),
    property_groups_ids: z.array(z.string()).optional(),
    portfolios_ids: z.array(z.string()).optional(),
    owners_ids: z.array(z.string()).optional(),
  }).optional().describe('Filter results based on properties, groups, portfolios, or owners'),
  columns: z.array(z.string()).optional().describe('Array of specific columns to include in the report')
});

// Type definitions for Property Directory Report
export type PropertyDirectoryArgs = z.infer<typeof propertyDirectoryArgsSchema>;

export type PropertyDirectoryResult = {
  results: Array<{
    property_id: number;
    property_name: string;
    property_address: string;
    property_city: string;
    property_state: string;
    property_zip: string;
    property_status: string;
    property_type: string;
    property_subtype: string;
    units_count: number;
    occupied_units_count: number;
    vacant_units_count: number;
    market_rent: string;
    actual_rent: string;
    owner_name: string;
    manager_name: string;
    created_at: string;
    updated_at: string;
  }>;
  next_page_url: string | null;
};

// --- Property Directory Report Function ---
export async function getPropertyDirectoryReport(args: PropertyDirectoryArgs): Promise<PropertyDirectoryResult> {
  const { property_visibility = "active", ...rest } = args;
  const payload = { property_visibility, ...rest };

  return makeAppfolioApiCall<PropertyDirectoryResult>('property_directory.json', payload);
}

// Registration function for the tool
export function registerPropertyDirectoryReportTool(server: McpServer) {
  server.tool(
    "get_property_directory_report",
    "Retrieves a property directory report with details about properties, including status, address, units count, and owner information.",
    propertyDirectoryArgsSchema.shape,
    async (args: PropertyDirectoryArgs) => {
      const result = await getPropertyDirectoryReport(args);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
            mimeType: "application/json"
          }
        ]
      };
    }
  );
}
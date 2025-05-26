import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { makeAppfolioApiCall } from '../appfolio';

// --- Occupancy Summary Report Types ---
export type OccupancySummaryArgs = {
  properties?: {
    properties_ids?: string[];
    property_groups_ids?: string[];
    portfolios_ids?: string[];
    owners_ids?: string[];
  };
  unit_visibility?: "active" | "hidden" | "all";
  as_of_date: string; // Required (YYYY-MM-DD)
  columns?: string[];
};

export type OccupancySummaryResultItem = {
  unit_type: string;
  number_of_units: number;
  occupied: number;
  percent_occupied: string;
  average_square_feet: number;
  average_market_rent: string | null;
  vacant_rented: number;
  vacant_unrented: number;
  notice_rented: number;
  notice_unrented: number;
  average_rent: string | null;
  property: string;
  property_id: number;
};

export type OccupancySummaryResult = {
  results: OccupancySummaryResultItem[];
  next_page_url: string | null;
};

// Zod schema for Occupancy Summary Report arguments
export const occupancySummaryArgsSchema = z.object({
  properties: z.object({
    properties_ids: z.array(z.string()).optional(),
    property_groups_ids: z.array(z.string()).optional(),
    portfolios_ids: z.array(z.string()).optional(),
    owners_ids: z.array(z.string()).optional()
  }).optional().describe('Filter results based on properties, groups, portfolios, or owners'),
  unit_visibility: z.enum(["active", "hidden", "all"]).optional().default("active").describe('Filter units by status. Defaults to "active"'),
  as_of_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The "as of" date for the report (YYYY-MM-DD). Required.'),
  columns: z.array(z.string()).optional().describe('Array of specific columns to include in the report')
});

// --- Occupancy Summary Report Function ---
export async function getOccupancySummaryReport(args: OccupancySummaryArgs): Promise<OccupancySummaryResult> {
  if (!args.as_of_date) {
    throw new Error('Missing required argument: as_of_date (format YYYY-MM-DD)');
  }

  const { unit_visibility = "active", ...rest } = args;
  const payload = { unit_visibility, ...rest };

  return makeAppfolioApiCall<OccupancySummaryResult>('occupancy_summary.json', payload);
}

// --- Register Occupancy Summary Report Tool ---
export function registerOccupancySummaryReportTool(server: McpServer) {
  server.tool(
    "get_occupancy_summary_report",
    "Generates a summary of property occupancy, including number of units, occupied units, and vacancy rates.",
    occupancySummaryArgsSchema.shape,
    async (args, _extra: unknown) => {
      try {
        // Validate arguments against schema
        const parseResult = occupancySummaryArgsSchema.safeParse(args);
        if (!parseResult.success) {
          const errorMessages = parseResult.error.errors.map(err => 
            `${err.path.join('.')}: ${err.message}`
          ).join('; ');
          throw new Error(`Invalid arguments: ${errorMessages}`);
        }

        const result = await getOccupancySummaryReport(parseResult.data);
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
        console.error(`Occupancy Summary Report Error:`, errorMessage);
        throw error;
      }
    }
  );
}

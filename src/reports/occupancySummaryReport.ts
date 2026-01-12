import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { makeAppfolioApiCall } from '../appfolio';
import { validatePropertiesIds, throwOnValidationErrors, getIdFieldDescription } from '../validation';

// Available columns extracted from the OccupancySummaryResultItem type
export const OCCUPANCY_SUMMARY_COLUMNS = [
  'unit_type',
  'number_of_units',
  'occupied',
  'percent_occupied',
  'average_square_feet',
  'average_market_rent',
  'vacant_rented',
  'vacant_unrented',
  'notice_rented',
  'notice_unrented',
  'average_rent',
  'property',
  'property_id'
] as const;

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
    properties_ids: z.array(z.string()).optional()
      .describe(getIdFieldDescription('property', 'Property Directory Report')),
    property_groups_ids: z.array(z.string()).optional()
      .describe(getIdFieldDescription('property group', 'Property Group Directory Report')),
    portfolios_ids: z.array(z.string()).optional()
      .describe(getIdFieldDescription('portfolio', 'Portfolio Directory Report')),
    owners_ids: z.array(z.string()).optional()
      .describe(getIdFieldDescription('owner', 'Owner Directory Report'))
  }).optional().describe('Filter results based on properties, groups, portfolios, or owners'),
  unit_visibility: z.enum(["active", "hidden", "all"]).optional().default("active").describe('Filter units by status. Defaults to "active"'),
  as_of_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The "as of" date for the report (YYYY-MM-DD). Required.'),
  columns: z.array(z.enum(OCCUPANCY_SUMMARY_COLUMNS)).optional()
    .describe(`Array of specific columns to include in the report. Valid columns: ${OCCUPANCY_SUMMARY_COLUMNS.join(', ')}. If not specified, all columns are returned. NOTE: Use 'occupied' for occupied units count, 'vacant_rented' and 'vacant_unrented' for vacancy details.`)
});

// --- Occupancy Summary Report Function ---
export async function getOccupancySummaryReport(args: OccupancySummaryArgs): Promise<OccupancySummaryResult> {
  // Validate properties IDs if provided
  if (args.properties) {
    const validationErrors = validatePropertiesIds(args.properties);
    throwOnValidationErrors(validationErrors);
  }

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
    "Generates a summary of property occupancy, including number of units, occupied units, and vacancy rates. IMPORTANT: All ID parameters must be numeric strings (e.g. '123'), NOT names. Use directory reports to lookup IDs by name if needed. Common columns: 'number_of_units', 'occupied', 'vacant_rented', 'vacant_unrented', 'percent_occupied'.",
    occupancySummaryArgsSchema.shape as any,
    async (args, _extra: unknown) => {
      try {
        console.log('Occupancy Summary Report - received arguments:', JSON.stringify(args, null, 2));
        
        // Validate arguments against schema
        const parseResult = occupancySummaryArgsSchema.safeParse(args);
        if (!parseResult.success) {
          const errorMessages = parseResult.error.errors.map(err => 
            `${err.path.join('.')}: ${err.message}`
          ).join('; ');
          console.error('Occupancy Summary Report - validation errors:', errorMessages);
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

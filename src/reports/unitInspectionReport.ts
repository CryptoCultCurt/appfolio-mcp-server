import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { makeAppfolioApiCall } from '../appfolio';

// --- Unit Inspection Report Types ---
export type UnitInspectionArgs = {
    properties?: {
      properties_ids?: string[];
      property_groups_ids?: string[];
      portfolios_ids?: string[];
      owners_ids?: string[];
    };
    unit_visibility?: "active" | "hidden" | "all"; // Defaults to "active"
    last_inspection_on_from?: string; // Optional (YYYY-MM-DD)
    include_blank_inspection_date?: "1" | "0"; // Defaults to "0"
    columns?: string[];
  };
  
  export type UnitInspectionResult = {
    results: Array<{
      property: string | null;
      property_name: string | null;
      property_id: number | null;
      property_address: string | null;
      property_street: string | null;
      property_street2: string | null;
      property_city: string | null;
      property_state: string | null;
      property_zip: string | null;
      unit_name: string | null;
      last_inspection_date: string | null;
      tenant_name: string | null;
      tenant_primary_phone_number: string | null;
      move_in_date: string | null;
      move_out_date: string | null;
      unit_id: number | null;
      occupancy_id: number | null;
      rentable: string | null;
      unit_tags: string | null;
    }>;
    next_page_url: string | null;
  };

  // Zod schema for Unit Inspection Report arguments
const unitInspectionArgsSchema = z.object({
    properties: z.object({
      properties_ids: z.array(z.string()).optional(),
      property_groups_ids: z.array(z.string()).optional(),
      portfolios_ids: z.array(z.string()).optional(),
      owners_ids: z.array(z.string()).optional()
    }).optional().describe('Filter results based on properties, groups, portfolios, or owners'),
    unit_visibility: z.enum(["active", "hidden", "all"]).optional().default("active").describe('Filter units by status. Defaults to "active"'),
    last_inspection_on_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional().describe('Optional. Filter units last inspected on or after this date (YYYY-MM-DD).'),
    include_blank_inspection_date: z.boolean().optional().default(false).transform(val => val ? "1" : "0").describe('Include units with no inspection date. Defaults to false.'),
    columns: z.array(z.string()).optional().describe('Array of specific columns to include in the report')
  });

  // --- Unit Inspection Report Function ---
export async function getUnitInspectionReport(args: UnitInspectionArgs): Promise<UnitInspectionResult> {
    const {
      unit_visibility = "active",
      include_blank_inspection_date = "0",
      ...rest
    } = args;

    const payload = {
      unit_visibility,
      include_blank_inspection_date,
      ...rest
    };

    return makeAppfolioApiCall<UnitInspectionResult>('unit_inspection.json', payload);
  }

  // MCP Tool Registration Function
  export function registerUnitInspectionReportTool(server: McpServer) {
    server.tool(
      "get_unit_inspection_report",
      "Generates a report on unit inspections.",
      unitInspectionArgsSchema.shape,
      async (args: any, _extra: any) => {
        const data = await getUnitInspectionReport(args as UnitInspectionArgs);
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
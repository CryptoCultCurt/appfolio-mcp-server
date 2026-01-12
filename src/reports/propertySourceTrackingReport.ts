import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { makeAppfolioApiCall } from '../appfolio';
import { validatePropertiesIds, throwOnValidationErrors, getIdFieldDescription } from '../validation';

// --- Property Source Tracking Report Types ---
export type PropertySourceTrackingArgs = {
  properties?: {
    properties_ids?: string[];
    property_groups_ids?: string[];
    portfolios_ids?: string[];
    owners_ids?: string[];
  };
  unit_visibility?: "active" | "hidden" | "all"; // Defaults to "active"
  received_on_from: string; // Required (YYYY-MM-DD)
  received_on_to: string; // Required (YYYY-MM-DD)
  columns?: string[];
};

export type PropertySourceTrackingResult = {
  results: Array<{
    source: string;
    guest_card_inquiries: number;
    showings: number;
    applications: number;
    approved_applications: number;
    converted_tenants: number;
  }>;
  next_page_url: string | null;
};

// --- Property Source Tracking Report Function ---
export async function getPropertySourceTrackingReport(args: PropertySourceTrackingArgs): Promise<PropertySourceTrackingResult> {
  if (!args.received_on_from || !args.received_on_to) {
    throw new Error('Missing required arguments: received_on_from and received_on_to (format YYYY-MM-DD)');
  }

  // Validate ID fields
  if (args.properties) {
    const validationErrors = validatePropertiesIds(args.properties);
    throwOnValidationErrors(validationErrors);
  }

  const { unit_visibility = "active", ...rest } = args;
  const payload = { unit_visibility, ...rest };

  return makeAppfolioApiCall<PropertySourceTrackingResult>('prospect_source_tracking.json', payload);
}

// Zod schema for Property Source Tracking Report arguments
const propertySourceTrackingInputSchema = z.object({
  properties: z.object({
    properties_ids: z.array(z.string()).optional().describe(getIdFieldDescription('properties_ids', 'Property', 'Property Directory Report')),
    property_groups_ids: z.array(z.string()).optional().describe(getIdFieldDescription('property_groups_ids', 'Property Group')),
    portfolios_ids: z.array(z.string()).optional().describe(getIdFieldDescription('portfolios_ids', 'Portfolio')),
    owners_ids: z.array(z.string()).optional().describe(getIdFieldDescription('owners_ids', 'Owner', 'Owner Directory Report'))
  }).optional().describe('Filter results based on properties, groups, portfolios, or owners. All ID fields must be numeric strings, not names.'),
  unit_visibility: z.enum(["active", "hidden", "all"]).optional().describe('Filter units by status. Defaults to "active"'),
  received_on_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The start date for the reporting period based on received date (YYYY-MM-DD). Required.'),
  received_on_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The end date for the reporting period based on received date (YYYY-MM-DD). Required.'),
  columns: z.array(z.string()).optional().describe('Array of specific columns to include in the report')
});

// MCP Tool Registration Function
export function registerPropertySourceTrackingReportTool(server: McpServer) {
  server.tool(
    "get_property_source_tracking_report",
    "Returns property source tracking report for the given filters. IMPORTANT: All ID parameters (owners_ids, properties_ids, etc.) must be numeric strings (e.g. '123'), NOT names. Use respective directory reports first to lookup IDs by name if needed.",
    propertySourceTrackingInputSchema.shape as any,
    async (args: any, _extra: any) => {
      const data = await getPropertySourceTrackingReport(args as PropertySourceTrackingArgs);
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

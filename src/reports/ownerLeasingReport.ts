import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { makeAppfolioApiCall } from '../appfolio';
import { validatePropertiesIds, throwOnValidationErrors, getIdFieldDescription } from '../validation';

// --- Owner Leasing Report Types ---
export type OwnerLeasingArgs = {
  properties?: {
    properties_ids?: string[];
    property_groups_ids?: string[];
    portfolios_ids?: string[];
    owners_ids?: string[];
  };
  received_on_from: string; // Required (YYYY-MM-DD)
  received_on_to: string; // Required (YYYY-MM-DD)
  unit_visibility?: "active" | "hidden" | "all";
  include_units_which_are_not_rent_ready?: "0" | "1";
  include_units_which_are_hidden_from_the_vacancies_dashboard?: "0" | "1";
  columns?: string[];
};

export type OwnerLeasingResultItem = {
  property: string;
  unit: string;
  applied_to: string | null;
  unit_type: string;
  market_rent: string | null;
  inquiries: number;
  showings: number;
  applications: number;
  approved_applications: number;
  converted_tenants: number;
  property_id: string; // Note: API doc says string, but example shows number. Using string as per doc.
  unit_id: number;
  computed_market_rent: string | null;
};

export type OwnerLeasingResult = {
  results: OwnerLeasingResultItem[];
  next_page_url: string | null;
};

// Zod schema for Owner Leasing Report arguments
export const ownerLeasingArgsSchema = z.object({
  properties: z.object({
    properties_ids: z.array(z.string()).optional().describe(getIdFieldDescription('properties_ids', 'Property', 'Property Directory Report')),
    property_groups_ids: z.array(z.string()).optional().describe(getIdFieldDescription('property_groups_ids', 'Property Group')),
    portfolios_ids: z.array(z.string()).optional().describe(getIdFieldDescription('portfolios_ids', 'Portfolio')),
    owners_ids: z.array(z.string()).optional().describe(getIdFieldDescription('owners_ids', 'Owner', 'Owner Directory Report'))
  }).optional().describe('Filter results based on properties, groups, portfolios, or owners. All ID fields must be numeric strings, not names.'),
  received_on_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The start date for the reporting period based on received date (YYYY-MM-DD). Required.'),
  received_on_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The end date for the reporting period based on received date (YYYY-MM-DD). Required.'),
  unit_visibility: z.enum(["active", "hidden", "all"]).optional().default("active").describe('Filter units by status. Defaults to "active"'),
  include_units_which_are_not_rent_ready: z.enum(["0", "1"]).optional().default("0").describe('Include units that are not marked as rent ready. Defaults to "0" (false)'),
  include_units_which_are_hidden_from_the_vacancies_dashboard: z.enum(["0", "1"]).optional().default("0").describe('Include units hidden from the vacancies dashboard. Defaults to "0" (false)'),
  columns: z.array(z.string()).optional().describe('Array of specific columns to include in the report')
});

// --- Owner Leasing Report Function ---
export async function getOwnerLeasingReport(args: OwnerLeasingArgs): Promise<OwnerLeasingResult> {
  if (!args.received_on_from || !args.received_on_to) {
    throw new Error('Missing required arguments: received_on_from and received_on_to (format YYYY-MM-DD)');
  }

  // Validate ID fields
  if (args.properties) {
    const validationErrors = validatePropertiesIds(args.properties);
    throwOnValidationErrors(validationErrors);
  }

  const payload = args;

  return makeAppfolioApiCall<OwnerLeasingResult>('owner_leasing.json', payload);
}

// --- Register Owner Leasing Report Tool ---
export function registerOwnerLeasingReportTool(server: McpServer) {
  server.tool(
    "get_owner_leasing_report",
    "Provides a leasing report tailored for property owners, showing leasing activity within a specified date range. IMPORTANT: All ID parameters (owners_ids, properties_ids, etc.) must be numeric strings (e.g. '123'), NOT names. Use respective directory reports first to lookup IDs by name if needed.",
    ownerLeasingArgsSchema.shape as any,
    async (args: OwnerLeasingArgs) => {
      const data = await getOwnerLeasingReport(args);
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

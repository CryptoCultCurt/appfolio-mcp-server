import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import dotenv from 'dotenv';
import { makeAppfolioApiCall } from '../appfolio';
import { validatePropertiesIds, throwOnValidationErrors, getIdFieldDescription } from '../validation';

dotenv.config();

// Available columns extracted from the RenewalSummaryResult type
export const RENEWAL_SUMMARY_COLUMNS = [
  'unit_name',
  'property',
  'property_name',
  'property_id',
  'property_address',
  'property_street',
  'property_street2',
  'property_city',
  'property_state',
  'property_zip',
  'unit_type',
  'unit_id',
  'occupancy_id',
  'tenant_name',
  'lease_start',
  'lease_end',
  'previous_lease_start',
  'previous_lease_end',
  'previous_rent',
  'rent',
  'respond_by_date',
  'renewal_sent_date',
  'countersigned_date',
  'automatic_renewal_date',
  'percent_difference',
  'dollar_difference',
  'status',
  'term',
  'lease_start_month',
  'tenant_id',
  'tenant_tags',
  'tenant_agent',
  'lease_uuid',
  'lease_document_uuid',
  'notice_given_date',
  'move_out'
] as const;

// TODO: Update RenewalSummaryArgs to use expiring_from and expiring_to instead of start_on_from and start_on_to
export type RenewalStatus = "all" | "Renewed" | "Did Not Renew" | "Month To Month" | "Pending" | "Cancelled by User";

export type RenewalSummaryArgs = {
  properties?: {
    properties_ids?: string[];
    property_groups_ids?: string[];
    portfolios_ids?: string[];
    owners_ids?: string[];
  };
  unit_visibility?: "active" | "hidden" | "all"; // Defaults to "active"
  start_on_from: string; // Required (YYYY-MM)
  start_on_to: string; // Required (YYYY-MM)
  statuses?: RenewalStatus[]; // Defaults to ["all"]
  include_tenant_transfers?: "0" | "1"; // Defaults to "0"
  columns?: string[];
};

export type RenewalSummaryResult = {
  results: Array<{
    unit_name: string;
    property: string;
    property_name: string;
    property_id: number;
    property_address: string;
    property_street: string;
    property_street2: string | null;
    property_city: string;
    property_state: string;
    property_zip: string;
    unit_type: string;
    unit_id: number;
    occupancy_id: number;
    tenant_name: string;
    lease_start: string | null;
    lease_end: string | null;
    previous_lease_start: string | null;
    previous_lease_end: string | null;
    previous_rent: string | null;
    rent: string | null;
    respond_by_date: string | null;
    renewal_sent_date: string | null;
    countersigned_date: string | null;
    automatic_renewal_date: string | null;
    percent_difference: string | null;
    dollar_difference: string | null;
    status: string;
    term: string | null;
    lease_start_month: string | null;
    tenant_id: number;
    tenant_tags: string | null;
    tenant_agent: string | null;
    lease_uuid: string | null;
    lease_document_uuid: string | null;
    notice_given_date: string | null;
    move_out: string | null;
  }>;
  next_page_url: string | null;
};

// Zod schema for Renewal Summary Report arguments
const renewalStatusSchema = z.enum(["all", "Renewed", "Did Not Renew", "Month To Month", "Pending", "Cancelled by User"]);
const renewalSummaryArgsSchema = z.object({
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
  unit_visibility: z.enum(["active", "hidden", "all"]).default("active").describe('Filter units by status. Defaults to "active"'),
  start_on_from: z.string().regex(/^\d{4}-\d{2}$/, "Date must be in YYYY-MM format").describe('The start month for the reporting period based on lease start date (YYYY-MM). Required.'),
  start_on_to: z.string().regex(/^\d{4}-\d{2}$/, "Date must be in YYYY-MM format").describe('The end month for the reporting period based on lease start date (YYYY-MM). Required.'),
  statuses: z.array(renewalStatusSchema).optional().default(["all"]).describe('Filter by renewal status. Defaults to ["all"]'),
  include_tenant_transfers: z.enum(["0", "1"]).optional().describe('Include tenant transfers in the report. Defaults to "0" (false)'),
  columns: z.array(z.enum(RENEWAL_SUMMARY_COLUMNS)).optional()
    .describe(`Array of specific columns to include in the report. Valid columns: ${RENEWAL_SUMMARY_COLUMNS.join(', ')}. If not specified, all columns are returned.`)
});

// --- Renewal Summary Report Function ---
export async function getRenewalSummaryReport(args: RenewalSummaryArgs): Promise<RenewalSummaryResult> {
  // Validate properties IDs if provided
  if (args.properties) {
    const validationErrors = validatePropertiesIds(args.properties);
    throwOnValidationErrors(validationErrors);
  }

  if (!args.start_on_from || !args.start_on_to) {
    throw new Error('Missing required arguments: start_on_from and start_on_to (format YYYY-MM)');
  }

  const { unit_visibility = "active", statuses = ["all"], include_tenant_transfers = "0", ...rest } = args;

  const payload = {
    unit_visibility,
    statuses,
    include_tenant_transfers,
    ...rest
  };

  return makeAppfolioApiCall<RenewalSummaryResult>('renewal_summary.json', payload);
}

// --- Renewal Summary Report Tool ---
export function registerRenewalSummaryReportTool(server: McpServer) {
  server.tool(
    "get_renewal_summary_report",
    "Provides a summary of lease renewals. IMPORTANT: All ID parameters (properties_ids, property_groups_ids, portfolios_ids, owners_ids) must be numeric strings (e.g. '123'), NOT names. Use respective directory reports first to lookup IDs by name if needed. NOTE: All string parameters should be properly quoted JSON strings (e.g. \"active\", not active).",
    renewalSummaryArgsSchema.shape as any,
    async (args, _extra: unknown) => {
      try {
        // Log the raw arguments to help debug parsing issues
        console.log('Renewal Summary Report - Raw args received:', JSON.stringify(args, null, 2));
        
        // Validate arguments against schema
        const parseResult = renewalSummaryArgsSchema.safeParse(args);
        if (!parseResult.success) {
          const errorMessages = parseResult.error.errors.map(err => 
            `${err.path.join('.')}: ${err.message}`
          ).join('; ');
          console.error('Renewal Summary Report - Schema validation failed:', errorMessages);
          throw new Error(`Invalid arguments: ${errorMessages}. Note: All string values should be properly quoted in JSON format (e.g. "active", not active).`);
        }

        const result = await getRenewalSummaryReport(parseResult.data);
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
        console.error(`Renewal Summary Report Error:`, errorMessage);
        throw error;
      }
    }
  );
}

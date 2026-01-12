import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import dotenv from 'dotenv';
import { makeAppfolioApiCall } from '../appfolio';
import { validatePropertiesIds, throwOnValidationErrors, getIdFieldDescription } from '../validation';

dotenv.config();

// Available columns extracted from the LeaseExpirationDetailResult type
export const LEASE_EXPIRATION_DETAIL_COLUMNS = [
  'property',
  'property_name',
  'property_id',
  'property_address',
  'property_street',
  'property_street2',
  'property_city',
  'property_state',
  'property_zip',
  'unit',
  'unit_tags',
  'unit_type',
  'move_in',
  'lease_expires',
  'lease_expires_month',
  'market_rent',
  'sqft',
  'tenant_name',
  'deposit',
  'rent',
  'phone_numbers',
  'unit_id',
  'occupancy_id',
  'tenant_id',
  'owner_agent',
  'tenant_agent',
  'rent_status',
  'legal_rent',
  'owners_phone_number',
  'owners',
  'last_rent_increase',
  'next_rent_adjustment',
  'next_rent_increase',
  'lease_sign_date',
  'last_lease_renewal',
  'notice_given_date',
  'move_out',
  'tenant_tags',
  'affordable_program',
  'computed_market_rent'
] as const;

// Zod schema for Lease Expiration Detail By Month Report arguments
export const leaseExpirationDetailArgsSchema = z.object({
  from_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The start date for the reporting period (YYYY-MM-DD). Required.'),
  to_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The end date for the reporting period (YYYY-MM-DD). Required.'),
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
  tags: z.string().optional().describe('Filter by unit tags (comma-separated string)'),
  filter_lease_date_range_by: z.enum(["Lease Expiration Date", "Lease Start Date", "Move-in Date"]).default("Lease Expiration Date").describe('Which date field to use for the date range filter. Defaults to "Lease Expiration Date"'),
  exclude_occupancies_with_move_out: z.enum(["0", "1"]).default("0").describe('Exclude occupancies that have a move-out date. Defaults to "0" (false)'),
  exclude_month_to_month: z.enum(["0", "1"]).default("0").describe('Exclude occupancies that are month-to-month. Defaults to "0" (false)'),
  columns: z.array(z.enum(LEASE_EXPIRATION_DETAIL_COLUMNS)).optional()
    .describe(`Array of specific columns to include in the report. Valid columns: ${LEASE_EXPIRATION_DETAIL_COLUMNS.join(', ')}. If not specified, all columns are returned.`)
});

// Type definitions for Lease Expiration Detail By Month Report
export type LeaseExpirationDetailArgs = z.infer<typeof leaseExpirationDetailArgsSchema>;

export type LeaseExpirationDetailResult = {
  results: Array<{
    property: string;
    property_name: string;
    property_id: number;
    property_address: string;
    property_street: string;
    property_street2: string | null;
    property_city: string;
    property_state: string;
    property_zip: string;
    unit: string;
    unit_tags: string | null;
    unit_type: string;
    move_in: string;
    lease_expires: string;
    lease_expires_month: string;
    market_rent: string | null;
    sqft: number | null;
    tenant_name: string;
    deposit: string | null;
    rent: string | null;
    phone_numbers: string | null;
    unit_id: number;
    occupancy_id: number;
    tenant_id: number;
    owner_agent: string | null;
    tenant_agent: string | null;
    rent_status: string | null;
    legal_rent: string | null;
    owners_phone_number: string | null;
    owners: string | null;
    last_rent_increase: string | null;
    next_rent_adjustment: string | null;
    next_rent_increase: string | null;
    lease_sign_date: string | null;
    last_lease_renewal: string | null;
    notice_given_date: string | null;
    move_out: string | null;
    tenant_tags: string | null;
    affordable_program: string | null;
    computed_market_rent: string | null;
  }>;
  next_page_url: string | null;
};

// --- Lease Expiration Detail By Month Report Function ---
export async function getLeaseExpirationDetailReport(args: LeaseExpirationDetailArgs): Promise<LeaseExpirationDetailResult> {
  // Validate properties IDs if provided
  if (args.properties) {
    const validationErrors = validatePropertiesIds(args.properties);
    throwOnValidationErrors(validationErrors);
  }

  if (!args.from_date || !args.to_date) {
    throw new Error('Missing required arguments: from_date and to_date (format YYYY-MM-DD)');
  }

  const { unit_visibility = "active", ...rest } = args;
  const payload = { unit_visibility, ...rest };

  return makeAppfolioApiCall<LeaseExpirationDetailResult>('lease_expiration_detail.json', payload);
}

// Registration function for the tool
export function registerLeaseExpirationDetailReportTool(server: McpServer) {
  server.tool(
    "get_lease_expiration_detail_by_month_report",
    "Retrieves a report detailing lease expirations by month, filterable by properties, date range, and other criteria. IMPORTANT: All ID parameters (properties_ids, property_groups_ids, portfolios_ids, owners_ids) must be numeric strings (e.g. '123'), NOT names. Use respective directory reports first to lookup IDs by name if needed.",
    leaseExpirationDetailArgsSchema.shape as any,
    async (args, _extra: unknown) => {
      try {
        // Validate arguments against schema
        const parseResult = leaseExpirationDetailArgsSchema.safeParse(args);
        if (!parseResult.success) {
          const errorMessages = parseResult.error.errors.map(err => 
            `${err.path.join('.')}: ${err.message}`
          ).join('; ');
          throw new Error(`Invalid arguments: ${errorMessages}`);
        }

        const result = await getLeaseExpirationDetailReport(parseResult.data);
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
        console.error(`Lease Expiration Detail Report Error:`, errorMessage);
        throw error;
      }
    }
  );
}

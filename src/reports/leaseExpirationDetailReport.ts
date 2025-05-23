import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { makeAppfolioApiCall } from '../appfolio';

// Zod schema for Lease Expiration Detail By Month Report arguments
export const leaseExpirationDetailArgsSchema = z.object({
  from_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The start date for the reporting period (YYYY-MM-DD). Required.'),
  to_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The end date for the reporting period (YYYY-MM-DD). Required.'),
  properties: z.object({
    properties_ids: z.array(z.string()).optional(),
    property_groups_ids: z.array(z.string()).optional(),
    portfolios_ids: z.array(z.string()).optional(),
    owners_ids: z.array(z.string()).optional()
  }).optional().describe('Filter results based on properties, groups, portfolios, or owners'),
  unit_visibility: z.enum(["active", "hidden", "all"]).default("active").describe('Filter units by status. Defaults to "active"'),
  tags: z.string().optional().describe('Filter by unit tags (comma-separated string)'),
  filter_lease_date_range_by: z.enum(["Lease Expiration Date", "Lease Start Date", "Move-in Date"]).default("Lease Expiration Date").describe('Which date field to use for the date range filter. Defaults to "Lease Expiration Date"'),
  exclude_occupancies_with_move_out: z.enum(["0", "1"]).default("0").describe('Exclude occupancies that have a move-out date. Defaults to "0" (false)'),
  exclude_month_to_month: z.enum(["0", "1"]).default("0").describe('Exclude occupancies that are month-to-month. Defaults to "0" (false)'),
  columns: z.array(z.string()).optional().describe('Array of specific columns to include in the report')
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
    "Retrieves a report detailing lease expirations by month, filterable by properties, date range, and other criteria.",
    leaseExpirationDetailArgsSchema.shape,
    async (args: LeaseExpirationDetailArgs) => {
      const result = await getLeaseExpirationDetailReport(args);
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

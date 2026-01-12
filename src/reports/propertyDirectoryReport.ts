import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { makeAppfolioApiCall } from '../appfolio';
import { validatePropertiesIds, throwOnValidationErrors } from '../validation';

// Valid column names for Property Directory Report
const PROPERTY_DIRECTORY_COLUMNS = [
  'property',
  'property_name',
  'property_id',
  'property_integration_id',
  'property_address',
  'property_street',
  'property_street2',
  'property_city',
  'property_state',
  'property_zip',
  'property_county',
  'market_rent',
  'units',
  'sqft',
  'management_flat_fee',
  'management_fee_percent',
  'minimum_fee',
  'maximum_fee',
  'waive_fees_when_vacant',
  'reserve',
  'home_warranty_expiration',
  'insurance_expiration',
  'tax_year_end',
  'tax_authority',
  'owners_phone_number',
  'payer_name',
  'description',
  'portfolio',
  'premium_leads_status',
  'premium_leads_monthly_cap',
  'premium_leads_activation_date',
  'owner_i_ds',
  'property_group_id',
  'portfolio_id',
  'portfolio_uuid',
  'visibility',
  'maintenance_limit',
  'maintenance_notes',
  'site_manager_name',
  'site_manager_phone_number',
  'management_fee_type',
  'lease_fee_type',
  'lease_flat_fee',
  'lease_fee_percent',
  'renewal_fee_type',
  'renewal_flat_fee',
  'renewal_fee_percent',
  'future_management_fee_start_date',
  'future_management_fee_percent',
  'future_management_flat_fee',
  'future_minimum_fee',
  'future_maximum_fee',
  'future_management_fee_type',
  'future_waive_fees_when_vacant',
  'owner_payment_type',
  'property_type',
  'property_created_on',
  'property_created_by',
  'owners',
  'prepayment_type',
  'late_fee_type',
  'late_fee_base_amount',
  'late_fee_daily_amount',
  'late_fee_grace_period',
  'late_fee_grace_period_fixed_day',
  'late_fee_grace_balance',
  'max_daily_late_fees_amount',
  'ignore_partial_payments',
  'admin_fee_amount',
  'year_built',
  'contract_expirations',
  'management_start_date',
  'management_end_date',
  'management_end_reason',
  'agent_of_record',
  'tax_region_code',
  'property_class',
  'online_maintenance_request_instructions',
  'amenities',
  'listing_type'
] as const;

// Zod schema for Property Directory Report arguments
export const propertyDirectoryArgsSchema = z.object({
  property_visibility: z.enum(["active", "hidden", "all"]).default("active").describe('Filter properties by status. Defaults to "active"'),
  properties: z.object({
    properties_ids: z.array(z.string()).optional().describe('Array of property IDs (numeric strings, NOT property names)'),
    property_groups_ids: z.array(z.string()).optional().describe('Array of property group IDs (numeric strings, NOT group names)'),
    portfolios_ids: z.array(z.string()).optional().describe('Array of portfolio IDs (numeric strings, NOT portfolio names)'),
    owners_ids: z.array(z.string()).optional().describe('Array of owner IDs (numeric strings, NOT owner names). Use Owner Directory Report to lookup owner IDs by name first if needed.'),
  }).optional().describe('Filter results based on property, group, portfolio, or owner IDs. All values must be numeric ID strings, not names.'),
  columns: z.array(z.enum(PROPERTY_DIRECTORY_COLUMNS)).optional().describe(`Array of specific columns to include in the report. Valid columns: ${PROPERTY_DIRECTORY_COLUMNS.join(', ')}. If not specified, all columns are returned.`)
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
  // Validate that IDs are numeric strings, not names
  const validationErrors = validatePropertiesIds(args.properties);
  throwOnValidationErrors(validationErrors);

  const { property_visibility = "active", ...rest } = args;
  const payload = { property_visibility, ...rest };

  return makeAppfolioApiCall<PropertyDirectoryResult>('property_directory.json', payload);
}

// Registration function for the tool
export function registerPropertyDirectoryReportTool(server: McpServer) {
  server.tool(
    "get_property_directory_report",
    "Retrieves a property directory report with details about properties, including status, address, units count, and owner information. IMPORTANT: All ID parameters (owners_ids, properties_ids, etc.) must be numeric strings (e.g. '123'), NOT names. Use Owner Directory Report first to lookup owner IDs by name if needed.",
    propertyDirectoryArgsSchema.shape as any,
    async (args, _extra: unknown) => {
      try {
        // Validate arguments against schema
        const parseResult = propertyDirectoryArgsSchema.safeParse(args);
        if (!parseResult.success) {
          const errorMessages = parseResult.error.errors.map(err => 
            `${err.path.join('.')}: ${err.message}`
          ).join('; ');
          throw new Error(`Invalid arguments: ${errorMessages}`);
        }

        const result = await getPropertyDirectoryReport(parseResult.data);
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
        console.error(`Property Directory Report Error:`, errorMessage);
        throw error;
      }
    }
  );
}
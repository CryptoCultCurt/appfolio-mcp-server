import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import dotenv from 'dotenv';
import { makeAppfolioApiCall } from '../appfolio';
import { validatePropertiesIds, throwOnValidationErrors, getIdFieldDescription } from '../validation';

dotenv.config();

// Available columns extracted from the RentRollItemizedResult type
export const RENT_ROLL_ITEMIZED_COLUMNS = [
  'property',
  'property_name',
  'property_id',
  'property_address',
  'property_street',
  'property_street2',
  'property_city',
  'property_state',
  'property_zip',
  'property_type',
  'occupancy_id',
  'unit_id',
  'unit',
  'unit_tags',
  'unit_type',
  'bd_ba',
  'tenant',
  'status',
  'sqft',
  'market_rent',
  'computed_market_rent',
  'advertised_rent',
  'total',
  'other_charges',
  'monthly_rent_square_ft',
  'annual_rent_square_ft',
  'deposit',
  'lease_from',
  'lease_to',
  'last_rent_increase',
  'next_rent_adjustment',
  'next_rent_increase_amount',
  'next_rent_increase',
  'move_in',
  'move_out',
  'past_due',
  'nsf',
  'late',
  'amenities',
  'additional_tenants',
  'monthly_charges',
  'rent_ready',
  'rent_status',
  'legal_rent',
  'preferential_rent',
  'tenant_tags',
  'tenant_agent',
  'property_group_id',
  'portfolio_id'
] as const;

export type RentRollItemizedArgs = {
  properties?: {
    properties_ids?: string[];
    property_groups_ids?: string[];
    portfolios_ids?: string[];
    owners_ids?: string[];
  };
  unit_visibility?: string; // Default handled by Zod schema
  tags?: string;
  gl_account_ids?: string[];
  as_of_date: string;
  columns?: string[];
};

export type RentRollItemizedResult = {
  results: Array<{
    property: string;
    property_name: string;
    property_id: number;
    property_address: string;
    property_street: string;
    property_street2: string;
    property_city: string;
    property_state: string;
    property_zip: string;
    property_type: string;
    occupancy_id: number;
    unit_id: number;
    unit: string;
    unit_tags: string;
    unit_type: string;
    bd_ba: string;
    tenant: string;
    status: string;
    sqft: number;
    market_rent: string;
    computed_market_rent: string;
    advertised_rent: string;
    total: string;
    other_charges: string;
    monthly_rent_square_ft: string;
    annual_rent_square_ft: string;
    deposit: string;
    lease_from: string;
    lease_to: string;
    last_rent_increase: string;
    next_rent_adjustment: string;
    next_rent_increase_amount: string;
    next_rent_increase: string;
    move_in: string;
    move_out: string;
    past_due: string;
    nsf: number;
    late: number;
    amenities: string;
    additional_tenants: string;
    monthly_charges: string;
    rent_ready: string;
    rent_status: string;
    legal_rent: string;
    preferential_rent: string;
    tenant_tags: string;
    tenant_agent: string;
    property_group_id: string;
    portfolio_id: number;
  }>;
  next_page_url: string;
};

// Custom validation for GL account IDs
const validateGlAccountIds = (glAccountIds: string[]): string[] => {
  const errors: string[] = [];
  
  for (const id of glAccountIds) {
    // Check if it looks like a GL account number (4-digit codes like 4630, 4635)
    if (/^\d{4}$/.test(id)) {
      errors.push(`GL account ID "${id}" appears to be a GL account number, not an ID. GL account IDs are internal database IDs (e.g. "123", "456"). Use the Chart of Accounts Report to lookup the correct gl_account_id for GL account number "${id}".`);
    }
    // Check if it's not numeric
    else if (!/^\d+$/.test(id)) {
      errors.push(`GL account ID "${id}" must be a numeric string (e.g. "123"). Use the Chart of Accounts Report to lookup gl_account_ids by GL account number or name.`);
    }
  }
  
  return errors;
};

// Zod schema copied from src/index.ts
const rentRollItemizedInputSchema = z.object({
  properties: z.object({
    properties_ids: z.array(z.string()).optional()
      .describe(getIdFieldDescription('property', 'Property Directory Report')),
    property_groups_ids: z.array(z.string()).optional()
      .describe(getIdFieldDescription('property group', 'Property Group Directory Report')),
    portfolios_ids: z.array(z.string()).optional()
      .describe(getIdFieldDescription('portfolio', 'Portfolio Directory Report')),
    owners_ids: z.array(z.string()).optional()
      .describe(getIdFieldDescription('owner', 'Owner Directory Report')),
  }).optional(),
  unit_visibility: z.enum(["active", "hidden", "all"]).default("active").describe('Filter units by status. Defaults to "active".'),
  tags: z.string().optional().describe('Tags filter'),
  gl_account_ids: z.union([
    z.array(z.string()),
    z.string().transform((str) => {
      try {
        const parsed = JSON.parse(str);
        return Array.isArray(parsed) ? parsed : [str];
      } catch {
        return [str];
      }
    })
  ]).optional()
    .describe('Array of GL account IDs (internal database IDs, NOT GL account numbers). These are numeric strings like "123", "456". Do NOT use GL account numbers like "4630", "4635". Use the Chart of Accounts Report to lookup gl_account_ids by GL account number or name.'),
  as_of_date: z.string().describe('Report date in YYYY-MM-DD format'),
  columns: z.array(z.enum(RENT_ROLL_ITEMIZED_COLUMNS)).optional()
    .describe(`Array of specific columns to include in the report. Valid columns: ${RENT_ROLL_ITEMIZED_COLUMNS.join(', ')}. If not specified, all columns are returned.`),
});

// Function definition copied from src/appfolio.ts
export async function getRentRollItemizedReport(args: RentRollItemizedArgs): Promise<RentRollItemizedResult> {
  // Validate properties IDs if provided
  if (args.properties) {
    const validationErrors = validatePropertiesIds(args.properties);
    throwOnValidationErrors(validationErrors);
  }

  // Validate GL account IDs if provided
  if (args.gl_account_ids && args.gl_account_ids.length > 0) {
    const glAccountErrors = validateGlAccountIds(args.gl_account_ids);
    if (glAccountErrors.length > 0) {
      throw new Error(`Invalid GL account IDs: ${glAccountErrors.join(' ')}`);
    }
  }

  if (!args.as_of_date) {
    throw new Error('Missing required argument: as_of_date (format YYYY-MM-DD)');
  }

  const { unit_visibility = "active", ...rest } = args;
  const payload = { unit_visibility, ...rest };

  return makeAppfolioApiCall<RentRollItemizedResult>('rent_roll_itemized.json', payload);
}

// MCP Tool Registration Function
export function registerRentRollItemizedReportTool(server: McpServer) {
  server.tool(
    "get_rent_roll_itemized_report",
    "Returns rent roll itemized report for the given filters. IMPORTANT: All ID parameters (properties_ids, property_groups_ids, portfolios_ids, owners_ids, gl_account_ids) must be numeric strings (e.g. '123'), NOT names. CRITICAL: gl_account_ids are internal database IDs, NOT GL account numbers! Do not use GL account numbers like '4630', '4635' - use the Chart of Accounts Report first to lookup the correct gl_account_ids.",
    rentRollItemizedInputSchema.shape as any,
    async (args, _extra: unknown) => {
      try {
        console.log('Rent Roll Itemized Report - Received args:', JSON.stringify(args, null, 2));
        
        // Debug GL account IDs specifically
        if ((args as any).gl_account_ids) {
          console.log('GL Account IDs type:', typeof (args as any).gl_account_ids);
          console.log('GL Account IDs value:', (args as any).gl_account_ids);
          console.log('GL Account IDs is array:', Array.isArray((args as any).gl_account_ids));
        }
        
        // Validate arguments against schema
        const parseResult = rentRollItemizedInputSchema.safeParse(args);
        if (!parseResult.success) {
          const errorMessages = parseResult.error.errors.map(err => 
            `${err.path.join('.')}: ${err.message}`
          ).join('; ');
          console.error('Rent Roll Itemized Report - Schema validation failed:', errorMessages);
          throw new Error(`Invalid arguments: ${errorMessages}`);
        }

        console.log('Rent Roll Itemized Report - Schema validation passed, calling function');
        const result = await getRentRollItemizedReport(parseResult.data);
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
        console.error(`Rent Roll Itemized Report Error:`, errorMessage);
        throw error;
      }
    }
  );
}

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { makeAppfolioApiCall } from '../appfolio';
import { validatePropertiesIds, throwOnValidationErrors, getIdFieldDescription } from '../validation';

export type DelinquencyColumn =
  | 'unit'
  | 'name'
  | 'tenant_status'
  | 'tags'
  | 'phone_numbers'
  | 'move_in'
  | 'move_out'
  | 'primary_tenant_email'
  | 'unit_type'
  | 'property'
  | 'property_name'
  | 'property_id'
  | 'property_address'
  | 'property_street'
  | 'property_street2'
  | 'property_city'
  | 'property_state'
  | 'property_zip'
  | 'amount_receivable'
  | 'delinquent_subsidy_amount'
  | '00_to30'
  | '30_plus'
  | '30_to60'
  | '60_plus'
  | '60_to90'
  | '90_plus'
  | 'this_month'
  | 'last_month'
  | 'month_before_last'
  | 'delinquent_rent'
  | 'delinquency_notes'
  | 'certified_funds_only'
  | 'in_collections'
  | 'collections_agency'
  | 'unit_id'
  | 'occupancy_id'
  | 'property_group_id';

export const delinquencyColumnsList: DelinquencyColumn[] = [
  'unit', 'name', 'tenant_status', 'tags', 'phone_numbers', 'move_in', 'move_out',
  'primary_tenant_email', 'unit_type', 'property', 'property_name', 'property_id',
  'property_address', 'property_street', 'property_street2', 'property_city',
  'property_state', 'property_zip', 'amount_receivable', 'delinquent_subsidy_amount',
  '00_to30', '30_plus', '30_to60', '60_plus', '60_to90', '90_plus', 'this_month',
  'last_month', 'month_before_last', 'delinquent_rent', 'delinquency_notes',
  'certified_funds_only', 'in_collections', 'collections_agency', 'unit_id',
  'occupancy_id', 'property_group_id'
];

// Tenant status mapping for clarity
export type TenantStatus = "0" | "1" | "2" | "3" | "4";

export const TENANT_STATUS_MAP = {
  "0": "Current",
  "1": "Past", 
  "2": "Future",
  "3": "Evict",
  "4": "Notice"
} as const;

export type DelinquencyAsOfArgs = {
  property_visibility?: string; 
  properties?: {
    properties_ids?: string[];
    property_groups_ids?: string[];
    portfolios_ids?: string[];
    owners_ids?: string[];
  };
  occurred_on_to: string; 
  delinquency_note_range?: string;
  tenant_statuses?: TenantStatus[]; 
  tags?: string;
  amount_owed_in_account?: string; 
  balance_operator?: {
    amount?: string;
    comparator?: string;
  };
  columns?: DelinquencyColumn[];
};

export type DelinquencyAsOfResult = {
  results: Array<{
    unit: string;
    name: string;
    tenant_status: string;
    tags: string;
    phone_numbers: string;
    move_in: string;
    move_out: string;
    primary_tenant_email: string;
    unit_type: string;
    property: string;
    property_name: string;
    property_id: number;
    property_address: string;
    property_street: string;
    property_street2: string;
    property_city: string;
    property_state: string;
    property_zip: string;
    amount_receivable: string;
    delinquent_subsidy_amount: string;
    "00_to30": string;
    "30_plus": string;
    "30_to60": string;
    "60_plus": string;
    "60_to90": string;
    "90_plus": string;
    this_month: string;
    last_month: string;
    month_before_last: string;
    delinquent_rent: string;
    delinquency_notes: string;
    certified_funds_only: string;
    in_collections: string;
    collections_agency: string;
    unit_id: number;
    occupancy_id: number;
    property_group_id: string;
  }>;
  next_page_url: string;
};

// Base schema for shape compatibility
export const delinquencyAsOfBaseSchema = z.object({
  property_visibility: z.enum(["active", "hidden", "all"]).default("active").describe('Filter properties by status. Defaults to "active".'),
  properties: z.object({
    properties_ids: z.array(z.string()).optional().describe(getIdFieldDescription('properties_ids', 'Property', 'property directory report')),
    property_groups_ids: z.array(z.string()).optional().describe(getIdFieldDescription('property_groups_ids', 'Property Group', 'property group directory report')),
    portfolios_ids: z.array(z.string()).optional().describe(getIdFieldDescription('portfolios_ids', 'Portfolio', 'portfolio directory report')),
    owners_ids: z.array(z.string()).optional().describe(getIdFieldDescription('owners_ids', 'Owner', 'owner directory report')),
  }).optional().describe('Optional. Filter by specific property-related IDs.'),
  occurred_on_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe("Required. Date to run the report as of in YYYY-MM-DD format."), 
  delinquency_note_range: z.string().optional().describe('Optional. Filter by delinquency note range.'),
  tenant_statuses: z.array(z.enum(["0", "1", "2", "3", "4"])).default(["0", "4"]).optional().describe('Filter by tenant status. Valid values: "0"=Current, "1"=Past, "2"=Future, "3"=Evict, "4"=Notice. Defaults to ["0", "4"] (Current and Notice tenants).'), 
  tags: z.string().optional().describe('Optional. Filter by property tags.'),
  amount_owed_in_account: z.string().default("all").optional().describe('Filter by amount owed in account. Defaults to "all".'), 
  balance_operator: z.object({
    amount: z.string().optional().describe('Optional. Balance amount to compare against.'),
    comparator: z.string().optional().describe('Optional. Comparison operator for balance amount.')
  }).optional().describe('Optional. Filter by balance amount with comparison operator.'),
  columns: z.array(z.enum(delinquencyColumnsList as [DelinquencyColumn, ...DelinquencyColumn[]])).optional().describe(`Array of specific columns to include in the report. Valid columns: ${delinquencyColumnsList.join(', ')}`)
});

// Schema with validation
export const delinquencyAsOfInputSchema = delinquencyAsOfBaseSchema.superRefine((data, ctx) => {
  // Validate property-related IDs if provided
  if (data.properties) {
    const validationErrors = validatePropertiesIds(data.properties);
    throwOnValidationErrors(validationErrors);
  }
});

export async function getDelinquencyAsOfReport(args: z.infer<typeof delinquencyAsOfInputSchema>): Promise<DelinquencyAsOfResult> {
  if (!args.occurred_on_to) {
    throw new Error('Missing required argument: occurred_on_to (format YYYY-MM-DD)');
  }

  const { 
    property_visibility = "active",
    tenant_statuses = ["0", "4"],
    amount_owed_in_account = "all",
    ...rest 
  } = args;

  // Build payload, filtering out empty strings and empty objects
  const payload: any = {
    property_visibility,
    tenant_statuses,
    amount_owed_in_account,
  };

  // Add non-empty fields from rest
  Object.entries(rest).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      // Skip empty objects (like balance_operator with empty amount/comparator)
      if (typeof value === 'object' && !Array.isArray(value)) {
        const filteredObj = Object.fromEntries(
          Object.entries(value).filter(([_, v]) => v !== undefined && v !== null && v !== "")
        );
        if (Object.keys(filteredObj).length > 0) {
          payload[key] = filteredObj;
        }
      } else {
        payload[key] = value;
      }
    }
  });

  return makeAppfolioApiCall<DelinquencyAsOfResult>('delinquency_as_of.json', payload);
}

export function registerDelinquencyAsOfReportTool(server: McpServer) {
  server.tool(
    "get_delinquency_as_of_report",
    "Returns delinquency as of report for the given filters. IMPORTANT: All ID parameters (properties_ids, etc.) must be numeric strings (e.g. '123'), NOT names. Use respective directory reports first to lookup IDs by name if needed. NOTE: tenant_statuses uses numeric codes: 0=Current, 1=Past, 2=Future, 3=Evict, 4=Notice.",
    delinquencyAsOfBaseSchema.shape as any,
    async (args: unknown, _extra: unknown) => {
      try {
        // Validate arguments against schema
        const parseResult = delinquencyAsOfInputSchema.safeParse(args);
        if (!parseResult.success) {
          const errorMessages = parseResult.error.errors.map(err => 
            `${err.path.join('.')}: ${err.message}`
          ).join('; ');
          throw new Error(`Invalid arguments: ${errorMessages}`);
        }

        const result = await getDelinquencyAsOfReport(parseResult.data);
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
        console.error(`Delinquency As Of Report Error:`, errorMessage);
        throw error;
      }
    }
  );
}

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { makeAppfolioApiCall } from '../appfolio';
import { validatePropertiesIds, throwOnValidationErrors, getIdFieldDescription } from '../validation';

// --- Aged Receivables Detail Report Types ---
export type AgedReceivablesDetailArgs = {
  property_visibility?: string; // Zod default will handle this for tool input
  properties?: {
    properties_ids?: string[];
    property_groups_ids?: string[];
    portfolios_ids?: string[];
    owners_ids?: string[];
  };
  tags?: string;
  balance_operator?: {
    amount?: string;
    comparator?: string;
  };
  tenant_statuses?: string[];
  occurred_on_to: string;
  gl_account_map_id?: string;
  columns?: string[];
  as_of: string;
};

// Originally from src/appfolio.ts (lines 38-81)
export type AgedReceivablesDetailResult = {
  results: Array<{
    payer_name: string;
    property: string;
    property_name: string;
    property_id: number;
    property_address: string;
    property_street: string;
    property_street2: string;
    property_city: string;
    property_state: string;
    property_zip: string;
    invoice_occurred_on: string;
    account_number: string;
    account_name: string;
    account_id: number;
    total_amount: string;
    amount_receivable: string;
    future_charges: string;
    "0_to30": string;
    "30_to60": string;
    "60_to90": string;
    "90_plus": string;
    "30_plus": string;
    "60_plus": string;
    occupancy_name: string;
    account: string;
    unit_address: string;
    unit_street: string;
    unit_street2: string;
    unit_city: string;
    unit_state: string;
    unit_zip: string;
    unit_name: string;
    unit_type: string;
    unit_tags: string;
    tenant_status: string;
    payment_plan: string;
    txn_id: number;
    occupancy_id: number;
    unit_id: number;
  }>;
  next_page_url: string;
};

// Valid columns for the aged receivables detail report
const VALID_AGED_RECEIVABLES_COLUMNS = [
  "payer_name",
  "property", 
  "property_name",
  "property_id",
  "property_address",
  "property_street",
  "property_street2", 
  "property_city",
  "property_state",
  "property_zip",
  "invoice_occurred_on",
  "account_number",
  "account_name",
  "account_id",
  "total_amount",
  "amount_receivable",
  "future_charges",
  "0_to30",
  "30_to60", 
  "60_to90",
  "90_plus",
  "30_plus",
  "60_plus",
  "occupancy_name",
  "account",
  "unit_address",
  "unit_street",
  "unit_street2",
  "unit_city",
  "unit_state", 
  "unit_zip",
  "unit_name",
  "unit_type",
  "unit_tags",
  "tenant_status",
  "payment_plan",
  "txn_id",
  "occupancy_id",
  "unit_id"
] as const;

// Base schema for shape compatibility
const agedReceivablesDetailBaseSchema = z.object({
  property_visibility: z.string().default("active").describe('Filter properties by status. Defaults to "active".'),
  properties: z.object({
    properties_ids: z.array(z.string()).optional().describe(getIdFieldDescription('properties_ids', 'Property', 'property directory report')),
    property_groups_ids: z.array(z.string()).optional().describe(getIdFieldDescription('property_groups_ids', 'Property Group', 'property group directory report')),
    portfolios_ids: z.array(z.string()).optional().describe(getIdFieldDescription('portfolios_ids', 'Portfolio', 'portfolio directory report')),
    owners_ids: z.array(z.string()).optional().describe(getIdFieldDescription('owners_ids', 'Owner', 'owner directory report')),
  }).optional().describe('Optional. Filter by specific property-related IDs.'),
  tags: z.string().optional().describe('Optional. Filter by property tags.'),
  balance_operator: z.object({
    amount: z.string().optional().describe('Optional. Balance amount to compare against.'),
    comparator: z.string().optional().describe('Optional. Comparison operator for balance amount.')
  }).optional().describe('Optional. Filter by balance amount with comparison operator.'),
  tenant_statuses: z.array(z.string()).optional().describe('Optional. Filter by tenant status.'),
  occurred_on_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('End date for transaction occurrence filter (YYYY-MM-DD format).'),
  gl_account_map_id: z.string().optional().describe('Optional. General ledger account map ID.'),
  columns: z.array(z.enum(VALID_AGED_RECEIVABLES_COLUMNS as readonly [string, ...string[]])).optional().describe(`Array of specific columns to include in the report. Valid columns: ${VALID_AGED_RECEIVABLES_COLUMNS.join(', ')}`),
  as_of: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('As-of date for the aged receivables report (YYYY-MM-DD format).'),
});

// Schema with validation
const agedReceivablesDetailInputSchema = agedReceivablesDetailBaseSchema.superRefine((data, ctx) => {
  // Validate property-related IDs if provided
  if (data.properties) {
    const validationErrors = validatePropertiesIds(data.properties);
    throwOnValidationErrors(validationErrors);
  }
  
  // Validate GL account map ID if provided
  if (data.gl_account_map_id && data.gl_account_map_id !== "" && !/^\d+$/.test(data.gl_account_map_id)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['gl_account_map_id'],
      message: 'GL Account Map ID must be a numeric string'
    });
  }
});

// Originally from src/appfolio.ts (function starting line 1664)
export async function getAgedReceivablesDetailReport(args: z.infer<typeof agedReceivablesDetailInputSchema>): Promise<AgedReceivablesDetailResult> {
  if (!args.as_of) {
    throw new Error('Missing required argument: as_of (format YYYY-MM-DD)');
  }

  const { property_visibility = "active", ...rest } = args;
  const payload = { property_visibility, ...rest };

  return makeAppfolioApiCall<AgedReceivablesDetailResult>('aged_receivables_detail.json', payload);
}

// New registration function for MCP
export function registerAgedReceivablesDetailReportTool(server: McpServer) {
  server.tool(
    "get_aged_receivables_detail_report",
    "Returns aged receivables detail for the given filters. IMPORTANT: All ID parameters (properties_ids, etc.) must be numeric strings (e.g. '123'), NOT names. Use respective directory reports first to lookup IDs by name if needed.",
    agedReceivablesDetailBaseSchema.shape as any,
    async (args: unknown, _extra: unknown) => {
      try {
        // Validate arguments against schema
        const parseResult = agedReceivablesDetailInputSchema.safeParse(args);
        if (!parseResult.success) {
          const errorMessages = parseResult.error.errors.map(err => 
            `${err.path.join('.')}: ${err.message}`
          ).join('; ');
          throw new Error(`Invalid arguments: ${errorMessages}`);
        }

        const result = await getAgedReceivablesDetailReport(parseResult.data);
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
        console.error(`Aged Receivables Detail Report Error:`, errorMessage);
        throw error;
      }
    }
  );
}

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { makeAppfolioApiCall } from '../appfolio';

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

export type DelinquencyAsOfArgs = {
  property_visibility?: string; 
  properties?: {
    properties_ids?: string[];
    property_groups_ids?: string[];
    portfolios_ids?: string[];
    owners_ids?: string[];
  };
  as_of: string; 
  delinquency_note_range?: string;
  tenant_statuses?: string[]; 
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

export async function getDelinquencyAsOfReport(args: DelinquencyAsOfArgs): Promise<DelinquencyAsOfResult> {
  if (!args.as_of) {
    throw new Error('Missing required argument: as_of (format YYYY-MM-DD)');
  }

  const { 
    property_visibility = "active",
    tenant_statuses = ["0", "4"],
    amount_owed_in_account = "all",
    ...rest 
  } = args;

  const payload = {
    property_visibility,
    tenant_statuses,
    amount_owed_in_account,
    ...rest
  };

  return makeAppfolioApiCall<DelinquencyAsOfResult>('delinquency_as_of.json', payload);
}

export const delinquencyAsOfInputSchema = z.object({
  property_visibility: z.string().default("active").optional(),
  properties: z.object({
    properties_ids: z.array(z.string()).optional(),
    property_groups_ids: z.array(z.string()).optional(),
    portfolios_ids: z.array(z.string()).optional(),
    owners_ids: z.array(z.string()).optional(),
  }).optional(),
  as_of: z.string().describe("Required. Date to run the report as of in YYYY-MM-DD format."), 
  delinquency_note_range: z.string().optional(),
  tenant_statuses: z.array(z.string()).default(["0", "4"].slice()).optional(), 
  tags: z.string().optional(),
  amount_owed_in_account: z.string().default("all").optional(), 
  balance_operator: z.object({
    amount: z.string().optional(),
    comparator: z.string().optional()
  }).optional(),
  columns: z.array(z.nativeEnum(Object.fromEntries(delinquencyColumnsList.map(col => [col, col])))).optional()
});

export function registerDelinquencyAsOfReportTool(server: McpServer) {
  server.tool(
    "get_delinquency_as_of_report",
    "Returns delinquency as of report for the given filters.",
    delinquencyAsOfInputSchema.shape,
    async (args: DelinquencyAsOfArgs, _extra: unknown) => {
      const data = await getDelinquencyAsOfReport(args as DelinquencyAsOfArgs); // Cast args
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

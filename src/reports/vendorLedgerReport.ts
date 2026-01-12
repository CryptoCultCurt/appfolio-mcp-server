import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { makeAppfolioApiCall } from '../appfolio';

// Type definitions moved from src/appfolio.ts
export type VendorLedgerArgs = {
  vendor_id: string; // Required Vendor ID
  property_visibility?: "active" | "hidden" | "all";
  properties?: {
    properties_ids?: string[];
    property_groups_ids?: string[];
    portfolios_ids?: string[];
    owners_ids?: string[];
  };
  occurred_on_from: string; // Required (YYYY-MM-DD)
  occurred_on_to: string; // Required (YYYY-MM-DD)
  reverse_transaction?: "1" | "0";
  columns?: string[];
};

export type VendorLedgerResult = {
  results: Array<{
    reference_number: string | null;
    bill_date: string | null;
    due_date: string | null;
    account: string | null;
    account_name: string | null;
    account_number: string | null;
    property: string | null;
    property_name: string | null;
    property_id: number | null;
    property_address: string | null;
    property_street: string | null;
    property_street2: string | null;
    property_city: string | null;
    property_state: string | null;
    property_zip: string | null;
    vendor: string | null;
    vendor_name: string | null;
    vendor_id: number | null;
    vendor_address: string | null;
    vendor_street: string | null;
    vendor_street2: string | null;
    vendor_city: string | null;
    vendor_state: string | null;
    vendor_zip: string | null;
    vendor_email: string | null;
    vendor_phone: string | null;
    vendor_fax: string | null;
    vendor_website: string | null;
    vendor_notes: string | null;
    vendor_terms: string | null;
    vendor_tax_id: string | null;
    vendor_1099: string | null;
    vendor_1099_name: string | null;
    vendor_1099_address: string | null;
    vendor_1099_street: string | null;
    vendor_1099_street2: string | null;
    vendor_1099_city: string | null;
    vendor_1099_state: string | null;
    vendor_1099_zip: string | null;
    memo: string | null;
    amount: string | null;
    balance: string | null;
    status: string | null;
    bill_status: string | null;
    payment_status: string | null;
    payment_type: string | null;
    payment_method: string | null;
    check_number: string | null;
    check_date: string | null;
    check_amount: string | null;
    check_memo: string | null;
    check_status: string | null;
    check_void_reason: string | null;
    check_void_date: string | null;
    check_void_by: string | null;
    check_void_notes: string | null;
    check_printed: string | null;
    check_printed_by: string | null;
    check_printed_date: string | null;
    check_printed_notes: string | null;
    check_mailed: string | null;
    check_mailed_by: string | null;
    check_mailed_date: string | null;
    check_mailed_notes: string | null;
    check_emailed: string | null;
    check_emailed_by: string | null;
    check_emailed_date: string | null;
    check_emailed_notes: string | null;
    check_ach: string | null;
    check_ach_status: string | null;
    check_ach_date: string | null;
    check_ach_notes: string | null;
    check_ach_trace_number: string | null;
    check_ach_return_code: string | null;
    check_ach_return_date: string | null;
    check_ach_return_notes: string | null;
    other_payment_type: string | null;
    purchase_order_number: string | null;
    purchase_order_id: number | null;
    project: string | null;
    project_id: number | null;
    service_request_id: number | null;
    cost_center_name: string | null;
    cost_center_number: string | null;
    work_order_issue: string | null;
    work_order_id: number | null;
    party_id: number | null;
    party_type: string | null;
  }>;
  next_page_url: string | null;
};

// Zod schema moved from src/index.ts
const vendorLedgerInputSchema = z.object({
  vendor_id: z.string().describe('Required. The ID of the vendor (company).'),
  property_visibility: z.enum(["active", "hidden", "all"]).optional().default("active").describe('Filter properties by status. Defaults to "active"'),
  properties: z.object({
    properties_ids: z.array(z.string()).optional().describe('Filter by specific property IDs'),
    property_groups_ids: z.array(z.string()).optional().describe('Filter by property group IDs'),
    portfolios_ids: z.array(z.string()).optional().describe('Filter by portfolio IDs'),
    owners_ids: z.array(z.string()).optional().describe('Filter by owner IDs')
  }).optional(),
  occurred_on_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('Required. The start date for the reporting period (YYYY-MM-DD).'),
  occurred_on_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('Required. The end date for the reporting period (YYYY-MM-DD).'),
      reverse_transaction: z.union([z.boolean(), z.string()]).optional().default(false).transform(val => {
      if (typeof val === 'string') return val === 'true' || val === '1' ? "1" : "0";
      return val ? "1" : "0";
    }).describe('Include reversed transactions. Defaults to false.'),
  columns: z.array(z.string()).optional().describe('Array of specific columns to include in the report')
});

// Function moved from src/appfolio.ts
export async function getVendorLedgerReport(args: VendorLedgerArgs): Promise<VendorLedgerResult> {
  if (!args.vendor_id) {
    throw new Error('Missing required argument: vendor_id');
  }

  const { occurred_on_from, occurred_on_to, ...rest } = args;
  const payload = { occurred_on_from, occurred_on_to, ...rest };

  return makeAppfolioApiCall<VendorLedgerResult>('vendor_ledger.json', payload);
}

// MCP Tool Registration Function
export function registerVendorLedgerReportTool(server: McpServer) {
  server.tool(
    "get_vendor_ledger_report",
    "Generates a report on vendor ledgers.",
    vendorLedgerInputSchema.shape as any,
    async (args, _extra: unknown) => {
      try {
        // Validate arguments against schema
        const parseResult = vendorLedgerInputSchema.safeParse(args);
        if (!parseResult.success) {
          const errorMessages = parseResult.error.errors.map(err => 
            `${err.path.join('.')}: ${err.message}`
          ).join('; ');
          throw new Error(`Invalid arguments: ${errorMessages}`);
        }

        const result = await getVendorLedgerReport(parseResult.data);
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
        console.error(`Vendor Ledger Report Error:`, errorMessage);
        throw error;
      }
    }
  );
}

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { makeAppfolioApiCall } from '../appfolio';
import { validatePropertiesIds, throwOnValidationErrors, getIdFieldDescription } from '../validation';

// --- Receivables Activity Report Types ---
export type ReceivablesActivityArgs = {
    tenant_visibility?: "active" | "inactive" | "all"; // Defaults to "active"
    tenant_statuses?: string[]; // e.g., ["0", "4"]
    property_visibility?: "active" | "hidden" | "all"; // Defaults to "active"
    properties?: {
      properties_ids?: string[];
      property_groups_ids?: string[];
      portfolios_ids?: string[];
      owners_ids?: string[];
    };
    receipt_date_from: string; // Required (YYYY-MM-DD)
    receipt_date_to: string; // Required (YYYY-MM-DD)
    manually_entered_only?: "0" | "1"; // Defaults to "0"
    columns?: string[];
  };
  
  export type ReceivablesActivityResult = {
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
      party: string;
      status: string;
      txn_amount: string;
      txn_remarks: string | null;
      txn_reference: string | null;
      txn_receipt_date: string;
      portal_activated: string;
      last_online_receipt_date: string | null;
      online_payments_recurring_count: number;
      online_payments_recurring_total: string;
      move_in: string;
      emails: string | null;
      phone_numbers: string | null;
      certified_funds_only: string;
      opted_out_of_portal: string;
      payment_type: string;
      must_pay_balance_in_full: string;
      property_list: string;
      txn_id: number;
      occupancy_id: number;
      selected_tenant_id: number;
      unit_id: number;
    }>;
    next_page_url: string | null;
  };

  // Zod schema for Receivables Activity Report arguments
const receivablesActivityArgsSchema = z.object({
    tenant_visibility: z.enum(["active", "inactive", "all"]).optional().describe('Filter tenants by status. Defaults to "active"'),
    tenant_statuses: z.array(z.string()).optional().describe('Filter by specific tenant statuses (e.g., [\"0\", \"4\"] for Current and Notice)'),
    property_visibility: z.enum(["active", "hidden", "all"]).optional().describe('Filter properties by status. Defaults to "active"'),
    properties: z.object({
      properties_ids: z.array(z.string()).optional().describe(getIdFieldDescription('properties_ids', 'Property', 'Property Directory Report')),
      property_groups_ids: z.array(z.string()).optional().describe(getIdFieldDescription('property_groups_ids', 'Property Group')),
      portfolios_ids: z.array(z.string()).optional().describe(getIdFieldDescription('portfolios_ids', 'Portfolio')),
      owners_ids: z.array(z.string()).optional().describe(getIdFieldDescription('owners_ids', 'Owner', 'Owner Directory Report'))
    }).optional().describe('Filter results based on properties, groups, portfolios, or owners. All ID fields must be numeric strings, not names.'),
    receipt_date_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The start date for the reporting period based on receipt date (YYYY-MM-DD). Required.'),
    receipt_date_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The end date for the reporting period based on receipt date (YYYY-MM-DD). Required.'),
    manually_entered_only: z.enum(["0", "1"]).optional().describe('Include only manually entered receipts. Defaults to "0" (false)'),
    columns: z.array(z.string()).optional().describe('Array of specific columns to include in the report')
  });

// --- Receivables Activity Report Function ---
export async function getReceivablesActivityReport(args: ReceivablesActivityArgs): Promise<ReceivablesActivityResult> {
    if (!args.receipt_date_from || !args.receipt_date_to) {
      throw new Error('Missing required arguments: receipt_date_from and receipt_date_to (format YYYY-MM-DD)');
    }

    // Validate ID fields
    if (args.properties) {
      const validationErrors = validatePropertiesIds(args.properties);
      throwOnValidationErrors(validationErrors);
    }
  
    const {
      property_visibility = "active",
      manually_entered_only = "0",
      ...rest
    } = args;
  
    const payload = {
      property_visibility,
      manually_entered_only,
      ...rest
    };
  
    return makeAppfolioApiCall<ReceivablesActivityResult>('receivables_activity.json', payload);
  }

  // MCP Tool Registration Function
  export function registerReceivablesActivityReportTool(server: McpServer) {
    server.tool(
      "get_receivables_activity_report",
      "Returns receivables activity report for the given filters. IMPORTANT: All ID parameters (owners_ids, properties_ids, etc.) must be numeric strings (e.g. '123'), NOT names. Use respective directory reports first to lookup IDs by name if needed.",
      receivablesActivityArgsSchema.shape as any,
      async (args, _extra: unknown) => {
        try {
          // Validate arguments against schema
          const parseResult = receivablesActivityArgsSchema.safeParse(args);
          if (!parseResult.success) {
            const errorMessages = parseResult.error.errors.map(err => 
              `${err.path.join('.')}: ${err.message}`
            ).join('; ');
            throw new Error(`Invalid arguments: ${errorMessages}`);
          }

          const result = await getReceivablesActivityReport(parseResult.data);
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
          console.error(`Receivables Activity Report Error:`, errorMessage);
          throw error;
        }
      }
    );
  }
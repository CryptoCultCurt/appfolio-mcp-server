import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import axios from 'axios';
import { appfolioLimiter } from '../appfolio';

const { VHOST, USERNAME, PASSWORD } = process.env;

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
      properties_ids: z.array(z.string()).optional(),
      property_groups_ids: z.array(z.string()).optional(),
      portfolios_ids: z.array(z.string()).optional(),
      owners_ids: z.array(z.string()).optional()
    }).optional().describe('Filter results based on properties, groups, portfolios, or owners'),
    receipt_date_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The start date for the reporting period based on receipt date (YYYY-MM-DD). Required.'),
    receipt_date_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The end date for the reporting period based on receipt date (YYYY-MM-DD). Required.'),
    manually_entered_only: z.enum(["0", "1"]).optional().describe('Include only manually entered receipts. Defaults to "0" (false)'),
    columns: z.array(z.string()).optional().describe('Array of specific columns to include in the report')
  });

// --- Receivables Activity Report Function ---
export async function getReceivablesActivityReport(args: ReceivablesActivityArgs): Promise<ReceivablesActivityResult> {
    if (!VHOST || !USERNAME || !PASSWORD) throw new Error('Missing AppFolio API credentials');
    if (!args.receipt_date_from || !args.receipt_date_to) {
      throw new Error('Missing required arguments: receipt_date_from and receipt_date_to (format YYYY-MM-DD)');
    }
  
    const {
      tenant_visibility = "active",
      property_visibility = "active",
      manually_entered_only = "0",
      ...rest
    } = args;
  
    const payload = {
      tenant_visibility,
      property_visibility,
      manually_entered_only,
      ...rest
    };
  
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/receivables_activity.json`;
    const response = await appfolioLimiter.schedule(() => axios.post(url, payload, {
      auth: { username: USERNAME, password: PASSWORD },
      headers: { 'Content-Type': 'application/json' },
    }));
  
    return response.data;
  }

  // MCP Tool Registration Function
  export function registerReceivablesActivityReportTool(server: McpServer) {
    server.tool(
      "get_receivables_activity_report",
      "Returns receivables activity report for the given filters.",
      receivablesActivityArgsSchema.shape,
      async (args: any, _extra: any) => {
        const data = await getReceivablesActivityReport(args as ReceivablesActivityArgs);
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
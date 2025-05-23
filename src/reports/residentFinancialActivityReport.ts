import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { makeAppfolioApiCall } from '../appfolio';

// --- Resident Financial Activity Report Types ---
export type ResidentFinancialActivityArgs = {
  property_visibility?: "active" | "hidden" | "all";
  properties?: {
    properties_ids?: string[];
    property_groups_ids?: string[];
    portfolios_ids?: string[];
    owners_ids?: string[];
  };
  occurred_on_from: string;
  occurred_on_to: string;
  include_voided?: boolean;
  columns?: string[];
};

export type ResidentFinancialActivityResult = {
  results: Array<{
    property_id: number;
    property_name: string;
    unit_id: number;
    unit_number: string;
    resident_id: number;
    resident_name: string;
    transaction_id: number;
    transaction_type: string;
    transaction_date: string;
    transaction_description: string;
    transaction_amount: string;
    transaction_balance: string;
    transaction_status: string;
    payment_method: string | null;
    check_number: string | null;
    reference_number: string | null;
    created_by: string | null;
    created_at: string;
    updated_at: string;
    is_void: boolean;
    voided_at: string | null;
    voided_by: string | null;
    void_reason: string | null;
    reversed_transaction_id: number | null;
    reversal_transaction_id: number | null;
  }>;
  next_page_url: string | null;
};

const residentFinancialActivityInputSchema = z.object({
  property_visibility: z.enum(["active", "hidden", "all"]).optional().default("active"),
  properties: z.object({
    properties_ids: z.array(z.string()).optional(),
    property_groups_ids: z.array(z.string()).optional(),
    portfolios_ids: z.array(z.string()).optional(),
    owners_ids: z.array(z.string()).optional()
  }).optional(),
  occurred_on_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  occurred_on_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  include_voided: z.boolean().optional().default(false),
  columns: z.array(z.string()).optional()
});

export async function getResidentFinancialActivityReport(args: ResidentFinancialActivityArgs): Promise<ResidentFinancialActivityResult> {
  if (!args.occurred_on_from || !args.occurred_on_to) {
    throw new Error('Missing required arguments: occurred_on_from and occurred_on_to (format YYYY-MM-DD)');
  }

  const { property_visibility = "active", ...rest } = args;
  const payload = { property_visibility, ...rest };

  return makeAppfolioApiCall<ResidentFinancialActivityResult>('resident_financial_activity.json', payload);
}

export function registerResidentFinancialActivityReportTool(server: McpServer) {
  server.tool(
    "get_resident_financial_activity_report",
    "Returns resident financial activity report for the given filters.",
    residentFinancialActivityInputSchema.shape,
    async (args: any, _extra: any) => {
      const data = await getResidentFinancialActivityReport(args as ResidentFinancialActivityArgs);
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

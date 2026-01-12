import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { makeAppfolioApiCall } from '../appfolio';

// --- Expense Distribution Report Types ---
export type ExpenseDistributionArgs = {
  property_visibility?: string;
  properties?: {
    properties_ids?: string[];
    property_groups_ids?: string[];
    portfolios_ids?: string[];
    owners_ids?: string[];
  };
  party_contact_info?: {
    company_id?: string;
  };
  posted_on_from: string;
  posted_on_to: string;
  gl_account_map_id?: string;
  columns?: string[];
};

export type ExpenseDistributionResult = {
  results: Array<{
    account: string;
    account_name: string;
    account_number: string;
    invoice_num: string;
    invoice_date: string;
    property_name: string;
    unit: string;
    property_address: string;
    payee: string;
    payable_account: string;
    amount: string;
    unpaid_amount: string;
    check_num: string;
    check_date: string;
    description: string;
  }>;
  next_page_url: string;
};

export async function getExpenseDistributionReport(args: ExpenseDistributionArgs): Promise<ExpenseDistributionResult> {
  if (!args.posted_on_from || !args.posted_on_to) {
    throw new Error('Missing required arguments: posted_on_from and posted_on_to (format YYYY-MM-DD)');
  }

  const { property_visibility = "active", ...rest } = args;
  const payload = { property_visibility, ...rest };

  return makeAppfolioApiCall<ExpenseDistributionResult>('expense_distribution.json', payload);
}

export const expenseDistributionInputSchema = z.object({
  property_visibility: z.string().default("active").optional(),
  properties: z.object({
    properties_ids: z.array(z.string()).optional(),
    property_groups_ids: z.array(z.string()).optional(),
    portfolios_ids: z.array(z.string()).optional(),
    owners_ids: z.array(z.string()).optional(),
  }).optional(),
  party_contact_info: z.object({
    company_id: z.string().optional(),
  }).optional(),
  posted_on_from: z.string().describe("Required. Start date for posted_on range in YYYY-MM-DD format."),
  posted_on_to: z.string().describe("Required. End date for posted_on range in YYYY-MM-DD format."),
  gl_account_map_id: z.string().optional(),
  columns: z.array(z.string()).optional(),
});

export function registerExpenseDistributionReportTool(server: McpServer) {
  server.tool(
    "get_expense_distribution_report",
    "Returns expense distribution report for the given filters.",
    expenseDistributionInputSchema.shape as any,
    async (args, _extra: unknown) => {
      try {
        // Validate arguments against schema
        const parseResult = expenseDistributionInputSchema.safeParse(args);
        if (!parseResult.success) {
          const errorMessages = parseResult.error.errors.map(err => 
            `${err.path.join('.')}: ${err.message}`
          ).join('; ');
          throw new Error(`Invalid arguments: ${errorMessages}`);
        }

        const result = await getExpenseDistributionReport(parseResult.data as ExpenseDistributionArgs);
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
        console.error(`Expense Distribution Report Error:`, errorMessage);
        throw error;
      }
    }
  );
}

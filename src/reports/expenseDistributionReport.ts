import { z } from "zod";
import axios from 'axios';
import Bottleneck from "bottleneck";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const { VHOST, USERNAME, PASSWORD } = process.env;

// Limiter, assuming it's used by this report function or similar ones
const appfolioLimiter = new Bottleneck({
  reservoir: 7, 
  reservoirRefreshAmount: 7,
  reservoirRefreshInterval: 15 * 1000, 
  maxConcurrent: 1
});

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
  if (!VHOST || !USERNAME || !PASSWORD) throw new Error('Missing AppFolio API credentials');
  const payload = { ...args, property_visibility: args.property_visibility ?? "active" };
  const url = `https://${VHOST}.appfolio.com/api/v2/reports/expense_distribution.json`;
  const response = await appfolioLimiter.schedule(() => axios.post(url, payload, {
    auth: { username: USERNAME, password: PASSWORD },
    headers: { 'Content-Type': 'application/json' },
  }));
  return response.data;
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
    expenseDistributionInputSchema.shape,
    async (args: ExpenseDistributionArgs, _extra: unknown) => {
      const data = await getExpenseDistributionReport(args as ExpenseDistributionArgs);
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

import axios from 'axios';
import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import dotenv from 'dotenv';
import { appfolioLimiter } from '../appfolio';

dotenv.config();

const { VHOST, USERNAME, PASSWORD } = process.env;

// --- 12 Month Income Statement Report Types ---
export type IncomeStatement12MonthArgs = {
    property_visibility?: "active" | "hidden" | "all"; // Defaults to "active"
    properties?: {
      properties_ids?: string[];
      property_groups_ids?: string[];
      portfolios_ids?: string[];
      owners_ids?: string[];
    };
    fund_type?: "all" | "operating" | "escrow"; // Defaults to "all"
    posted_on_from: string; // Required (YYYY-MM)
    posted_on_to: string; // Required (YYYY-MM)
    gl_account_map_id?: string;
    level_of_detail?: "detail_view" | "summary_view"; // Defaults to "detail_view"
    include_zero_balance_gl_accounts?: "1" | "0"; // Defaults to "0"
    columns?: string[];
  };
  
  export type IncomeStatement12MonthResult = Array<{
    account_name: string | null;
    account_code: string | null;
    months: Array<{
      id: string | null;
      value: string | null;
    }>;
    total: string | null;
  }>;

  // Zod schema for 12 Month Income Statement Report arguments
const incomeStatement12MonthArgsSchema = z.object({
    property_visibility: z.enum(["active", "hidden", "all"]).optional().default("active").describe('Filter properties by status. Defaults to "active"'),
    properties: z.object({
      properties_ids: z.array(z.string()).optional(),
      property_groups_ids: z.array(z.string()).optional(),
      portfolios_ids: z.array(z.string()).optional(),
      owners_ids: z.array(z.string()).optional()
    }).optional().describe('Filter results based on properties, groups, portfolios, or owners'),
    fund_type: z.enum(["all", "operating", "escrow"]).optional().default("all").describe('Filter by fund type. Defaults to "all"'),
    posted_on_from: z.string().regex(/^\d{4}-\d{2}$/, "Date must be in YYYY-MM format").describe('Required. The start month for the reporting period (YYYY-MM).'),
    posted_on_to: z.string().regex(/^\d{4}-\d{2}$/, "Date must be in YYYY-MM format").describe('Required. The end month for the reporting period (YYYY-MM).'),
    gl_account_map_id: z.string().optional().describe('Optional. Filter by a specific GL Account Map ID.'),
    level_of_detail: z.enum(["detail_view", "summary_view"]).optional().default("detail_view").describe('Level of detail. Defaults to "detail_view"'),
    include_zero_balance_gl_accounts: z.boolean().optional().default(false).transform(val => val ? "1" : "0").describe('Include GL accounts with zero balance. Defaults to false.'),
    columns: z.array(z.string()).optional().describe('Array of specific columns to include in the report')
  });

  // --- 12 Month Income Statement Report Function ---
export async function getIncomeStatement12MonthReport(args: IncomeStatement12MonthArgs): Promise<IncomeStatement12MonthResult> {
    if (!VHOST || !USERNAME || !PASSWORD) throw new Error('Missing AppFolio API credentials');
    if (!args.posted_on_from || !args.posted_on_to) {
      throw new Error('Missing required arguments: posted_on_from and posted_on_to (format YYYY-MM)');
    }
  
    const {
      property_visibility = "active",
      fund_type = "all",
      level_of_detail = "detail_view",
      include_zero_balance_gl_accounts = "0",
      ...rest
    } = args;
  
    const payload = {
      property_visibility,
      fund_type,
      level_of_detail,
      include_zero_balance_gl_accounts,
      ...rest
    };
  
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/twelve_month_income_statement.json`;
    const response = await appfolioLimiter.schedule(() => axios.post(url, payload, {
      auth: { username: USERNAME, password: PASSWORD },
      headers: { 'Content-Type': 'application/json' },
    }));
  
    return response.data;
  }

  // --- 12 Month Income Statement Report Tool ---
export function registerIncomeStatement12MonthReportTool(server: McpServer) {
  server.tool(
    "get_income_statement_12_month_report",
    "Generates a 12-month income statement report.",
    incomeStatement12MonthArgsSchema.shape,
    async (args, _extra: unknown) => {
      const data = await getIncomeStatement12MonthReport(args);
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

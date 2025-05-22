import axios from 'axios';
import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import dotenv from 'dotenv';
import { appfolioLimiter } from '../appfolio';

dotenv.config();

const { VHOST, USERNAME, PASSWORD } = process.env;

// Originally from src/appfolio.ts (lines 65-79)
export type IncomeStatementDateRangeArgs = {
  property_visibility?: "active" | "hidden" | "all";
  properties?: {
    properties_ids?: string[];
    property_groups_ids?: string[];
    portfolios_ids?: string[];
    owners_ids?: string[];
  };
  posted_on_from: string; // Required
  posted_on_to: string; // Required
  gl_account_map_id?: string;
  level_of_detail?: "detail_view" | "summary_view";
  include_zero_balance_gl_accounts?: "0" | "1";
  columns?: string[];
};

// Originally from src/appfolio.ts (lines 81-86)
// Corrected to match original array type definition
export type IncomeStatementDateRangeResult = Array<{
  account_name: string;
  selected_period: string;
  account_number: string;
  gl_account_id: number;
  // Any other fields that are part of each item in the array
}>;

// Originally from src/index.ts (line 77), with defaults added
const incomeStatementDateRangeArgsSchema = z.object({
  property_visibility: z.enum(["active", "hidden", "all"]).default("active").optional().describe('Filter properties by status. Defaults to "active"'),
  properties: z.object({
    properties_ids: z.array(z.string()).optional(),
    property_groups_ids: z.array(z.string()).optional(),
    portfolios_ids: z.array(z.string()).optional(),
    owners_ids: z.array(z.string()).optional()
  }).optional().describe('Filter results based on properties, groups, or portfolios'),
  posted_on_from: z.string().describe('Start date for the posting period (YYYY-MM-DD) - Required'),
  posted_on_to: z.string().describe('End date for the posting period (YYYY-MM-DD) - Required'),
  gl_account_map_id: z.string().optional().describe('Filter by a specific GL account map ID'),
  level_of_detail: z.enum(["detail_view", "summary_view"]).default("detail_view").optional().describe('Specify the level of detail. Defaults to "detail_view"'),
  include_zero_balance_gl_accounts: z.enum(["0", "1"]).default("0").optional().describe('Include GL accounts with zero balance. Defaults to "0" (false)'),
  columns: z.array(z.string()).optional().describe('Array of specific columns to include in the report')
});

// Originally from src/appfolio.ts (function starting line 1479)
export async function getIncomeStatementDateRangeReport(args: IncomeStatementDateRangeArgs): Promise<IncomeStatementDateRangeResult> {
  if (!VHOST || !USERNAME || !PASSWORD) {
    throw new Error('Missing AppFolio API credentials');
  }
  // Required fields posted_on_from and posted_on_to are enforced by Zod schema

  // Defaults are now handled by Zod schema
  const payload = args;

  const url = `https://${VHOST}.appfolio.com/api/v2/reports/income_statement_date_range.json`;
  const response = await appfolioLimiter.schedule(() => axios.post(url, payload, {
    auth: { username: USERNAME, password: PASSWORD },
    headers: { 'Content-Type': 'application/json' },
  }));

  return response.data;
}

// New registration function for MCP
export function registerIncomeStatementDateRangeReportTool(server: McpServer) {
  server.tool(
    "get_income_statement_date_range_report",
    "Returns the income statement report for a specified date range.", // Description from original registration
    incomeStatementDateRangeArgsSchema.shape,
    async (toolArgs: z.infer<typeof incomeStatementDateRangeArgsSchema>) => {
      const data = await getIncomeStatementDateRangeReport(toolArgs as IncomeStatementDateRangeArgs);
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

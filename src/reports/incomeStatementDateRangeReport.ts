import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { makeAppfolioApiCall } from '../appfolio';

// --- Income Statement Date Range Report Types ---
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
  fund_type?: "all" | "operating" | "capital";
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
  fund_type: z.enum(["all", "operating", "capital"]).default("all").optional().describe('Filter by fund type. Defaults to "all"'),
  columns: z.array(z.string()).optional().describe('Array of specific columns to include in the report')
});

// Originally from src/appfolio.ts (function starting line 1479)
export async function getIncomeStatementDateRangeReport(args: IncomeStatementDateRangeArgs): Promise<IncomeStatementDateRangeResult> {
  if (!args.posted_on_from || !args.posted_on_to) {
    throw new Error('Missing required arguments: posted_on_from and posted_on_to (format YYYY-MM-DD)');
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

  return makeAppfolioApiCall<IncomeStatementDateRangeResult>('income_statement_date_range.json', payload);
}

// New registration function for MCP
export function registerIncomeStatementDateRangeReportTool(server: McpServer) {
  server.tool(
    "get_income_statement_date_range_report",
    "Returns the income statement report for a specified date range.", // Description from original registration
    incomeStatementDateRangeArgsSchema.shape,
    async (args, _extra: unknown) => {
      try {
        // Validate arguments against schema
        const parseResult = incomeStatementDateRangeArgsSchema.safeParse(args);
        if (!parseResult.success) {
          const errorMessages = parseResult.error.errors.map(err => 
            `${err.path.join('.')}: ${err.message}`
          ).join('; ');
          throw new Error(`Invalid arguments: ${errorMessages}`);
        }

        const result = await getIncomeStatementDateRangeReport(parseResult.data as IncomeStatementDateRangeArgs);
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
        console.error(`Income Statement Date Range Report Error:`, errorMessage);
        throw error;
      }
    }
  );
}

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { makeAppfolioApiCall } from '../appfolio';
import { flatPropertyFilterSchema, transformToNestedProperties } from './sharedSchemas';

export type IncomeStatementDateRangeArgs = {
  property_visibility?: "active" | "hidden" | "all";
  properties?: {
    properties_ids?: string[];
    property_groups_ids?: string[];
    portfolios_ids?: string[];
    owners_ids?: string[];
  };
  posted_on_from: string;
  posted_on_to: string;
  gl_account_map_id?: string;
  level_of_detail?: "detail_view" | "summary_view";
  include_zero_balance_gl_accounts?: "0" | "1";
  fund_type?: "all" | "operating" | "capital";
  columns?: string[];
};

export type IncomeStatementDateRangeResult = Array<{
  account_name: string;
  selected_period: string;
  account_number: string;
  gl_account_id: number;
}>;

// Flattened schema for MCP tool registration
const incomeStatementDateRangeToolSchema = {
  property_visibility: z.enum(["active", "hidden", "all"]).default("active").optional()
    .describe('Filter properties by status. Defaults to "active"'),
  ...flatPropertyFilterSchema,
  posted_on_from: z.string().describe('Start date for the posting period (YYYY-MM-DD) - Required'),
  posted_on_to: z.string().describe('End date for the posting period (YYYY-MM-DD) - Required'),
  gl_account_map_id: z.string().optional().describe('Filter by a specific GL account map ID'),
  level_of_detail: z.enum(["detail_view", "summary_view"]).default("detail_view").optional()
    .describe('Specify the level of detail. Defaults to "detail_view"'),
  include_zero_balance_gl_accounts: z.enum(["0", "1"]).default("0").optional()
    .describe('Include GL accounts with zero balance. Defaults to "0"'),
  fund_type: z.enum(["all", "operating", "capital"]).default("all").optional()
    .describe('Filter by fund type. Defaults to "all"'),
  columns: z.array(z.string()).optional().describe('Array of specific columns to include'),
};

const incomeStatementDateRangeValidationSchema = z.object({
  property_visibility: z.enum(["active", "hidden", "all"]).default("active").optional(),
  properties_ids: z.array(z.string()).optional(),
  property_groups_ids: z.array(z.string()).optional(),
  portfolios_ids: z.array(z.string()).optional(),
  owners_ids: z.array(z.string()).optional(),
  posted_on_from: z.string(),
  posted_on_to: z.string(),
  gl_account_map_id: z.string().optional(),
  level_of_detail: z.enum(["detail_view", "summary_view"]).default("detail_view").optional(),
  include_zero_balance_gl_accounts: z.enum(["0", "1"]).default("0").optional(),
  fund_type: z.enum(["all", "operating", "capital"]).default("all").optional(),
  columns: z.array(z.string()).optional(),
});

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

export function registerIncomeStatementDateRangeReportTool(server: McpServer) {
  server.tool(
    "get_income_statement_date_range_report",
    "Returns the income statement report for a specified date range.",
    incomeStatementDateRangeToolSchema,
    async (args, _extra: unknown) => {
      try {
        const parseResult = incomeStatementDateRangeValidationSchema.safeParse(args);
        if (!parseResult.success) {
          const errorMessages = parseResult.error.errors.map(err => 
            `${err.path.join('.')}: ${err.message}`
          ).join('; ');
          throw new Error(`Invalid arguments: ${errorMessages}`);
        }

        const apiArgs = transformToNestedProperties(parseResult.data) as IncomeStatementDateRangeArgs;
        const result = await getIncomeStatementDateRangeReport(apiArgs);
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
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Income Statement Date Range Report Error:`, errorMessage);
        throw error;
      }
    }
  );
}

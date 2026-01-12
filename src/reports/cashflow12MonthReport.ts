import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { makeAppfolioApiCall } from '../appfolio';
import { flatPropertyFilterSchema, transformToNestedProperties } from './sharedSchemas';

export type Cashflow12MonthArgs = {
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
  include_zero_balance_gl_accounts?: "1" | "0";
  exclude_suppressed_fees?: "1" | "0";
  columns?: string[];
};

export type Cashflow12MonthResult = Array<{
  account_name: string | null;
  account_code: string | null;
  months: Array<{
    id: string | null;
    value: string | null;
  }>;
  total: string | null;
}>;

// Flattened schema for MCP tool registration
const cashflow12MonthToolSchema = {
  property_visibility: z.enum(["active", "hidden", "all"]).optional().default("active")
    .describe('Filter properties by status. Defaults to "active"'),
  ...flatPropertyFilterSchema,
  posted_on_from: z.string().regex(/^\d{4}-\d{2}$/, "Date must be in YYYY-MM format")
    .describe('Required. The start month for the reporting period (YYYY-MM).'),
  posted_on_to: z.string().regex(/^\d{4}-\d{2}$/, "Date must be in YYYY-MM format")
    .describe('Required. The end month for the reporting period (YYYY-MM).'),
  gl_account_map_id: z.string().optional().describe('Optional. Filter by a specific GL Account Map ID.'),
  level_of_detail: z.enum(["detail_view", "summary_view"]).optional().default("detail_view")
    .describe('Level of detail. Defaults to "detail_view"'),
  include_zero_balance_gl_accounts: z.enum(["0", "1"]).optional().default("0")
    .describe('Include GL accounts with zero balance. Defaults to "0"'),
  exclude_suppressed_fees: z.enum(["0", "1"]).optional().default("0")
    .describe('Exclude suppressed fees. Defaults to "0"'),
  columns: z.array(z.string()).optional().describe('Array of specific columns to include'),
};

const cashflow12MonthValidationSchema = z.object({
  property_visibility: z.enum(["active", "hidden", "all"]).optional().default("active"),
  properties_ids: z.array(z.string()).optional(),
  property_groups_ids: z.array(z.string()).optional(),
  portfolios_ids: z.array(z.string()).optional(),
  owners_ids: z.array(z.string()).optional(),
  posted_on_from: z.string(),
  posted_on_to: z.string(),
  gl_account_map_id: z.string().optional(),
  level_of_detail: z.enum(["detail_view", "summary_view"]).optional().default("detail_view"),
  include_zero_balance_gl_accounts: z.enum(["0", "1"]).optional().default("0"),
  exclude_suppressed_fees: z.enum(["0", "1"]).optional().default("0"),
  columns: z.array(z.string()).optional(),
});

export async function getCashflow12MonthReport(args: Cashflow12MonthArgs): Promise<Cashflow12MonthResult> {
  if (!args.posted_on_from || !args.posted_on_to) {
    throw new Error('Missing required arguments: posted_on_from and posted_on_to (format YYYY-MM)');
  }

  const {
    property_visibility = "active",
    level_of_detail = "detail_view",
    include_zero_balance_gl_accounts = "0",
    exclude_suppressed_fees = "0",
    ...rest
  } = args;

  const payload = {
    property_visibility,
    level_of_detail,
    include_zero_balance_gl_accounts,
    exclude_suppressed_fees,
    ...rest
  };

  return makeAppfolioApiCall<Cashflow12MonthResult>('twelve_month_cash_flow.json', payload);
}

export function registerCashflow12MonthReportTool(server: McpServer) {
  server.tool(
    "get_cashflow_12_month_report",
    "Generates a 12-month cash flow report.",
    cashflow12MonthToolSchema,
    async (args, _extra: unknown) => {
      try {
        const parseResult = cashflow12MonthValidationSchema.safeParse(args);
        if (!parseResult.success) {
          const errorMessages = parseResult.error.errors.map(err => 
            `${err.path.join('.')}: ${err.message}`
          ).join('; ');
          throw new Error(`Invalid arguments: ${errorMessages}`);
        }

        const apiArgs = transformToNestedProperties(parseResult.data) as Cashflow12MonthArgs;
        const result = await getCashflow12MonthReport(apiArgs);
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
        console.error(`Cashflow 12 Month Report Error:`, errorMessage);
        throw error;
      }
    }
  );
}
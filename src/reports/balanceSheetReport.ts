import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { makeAppfolioApiCall } from '../appfolio';
import { flatPropertyFilterSchema, transformToNestedProperties } from './sharedSchemas';

export type BalanceSheetArgs = {
  property_visibility?: "active" | "hidden" | "all";
  properties?: {
    properties_ids?: string[];
    property_groups_ids?: string[];
    portfolios_ids?: string[];
    owners_ids?: string[];
  };
  posted_on_to: string;
  gl_account_map_id?: string;
  level_of_detail?: "detail_view" | "summary_view";
  include_zero_balance_gl_accounts?: "0" | "1";
  columns?: string[];
};

export type BalanceSheetResult = {
  account_name: string;
  balance: string;
  account_number: string;
}[];

export async function getBalanceSheetReport(args: BalanceSheetArgs): Promise<BalanceSheetResult> {
  if (!args.posted_on_to) {
    throw new Error('posted_on_to is required');
  }

  const {
    property_visibility = "active",
    level_of_detail = "detail_view",
    include_zero_balance_gl_accounts = "0",
    ...rest
  } = args;

  const payload = {
    property_visibility,
    level_of_detail,
    include_zero_balance_gl_accounts,
    ...rest
  };

  return makeAppfolioApiCall<BalanceSheetResult>('balance_sheet.json', payload);
}

// Flattened schema for MCP tool registration (avoids TypeScript type depth issues)
const balanceSheetToolSchema = {
  property_visibility: z.enum(["active", "hidden", "all"]).default("active").optional()
    .describe('Filter properties by status. Defaults to "active"'),
  ...flatPropertyFilterSchema,
  posted_on_to: z.string().describe("Required. Date to run the report as of in YYYY-MM-DD format."),
  gl_account_map_id: z.string().optional().describe('Filter by GL account map ID'),
  level_of_detail: z.enum(["detail_view", "summary_view"]).default("detail_view").optional()
    .describe('Level of detail. Defaults to "detail_view"'),
  include_zero_balance_gl_accounts: z.enum(["0", "1"]).default("0").optional()
    .describe('Include GL accounts with zero balance. Defaults to "0"'),
  columns: z.array(z.string()).optional().describe('Specific columns to include'),
};

// Validation schema
const balanceSheetValidationSchema = z.object({
  property_visibility: z.enum(["active", "hidden", "all"]).default("active").optional(),
  properties_ids: z.array(z.string()).optional(),
  property_groups_ids: z.array(z.string()).optional(),
  portfolios_ids: z.array(z.string()).optional(),
  owners_ids: z.array(z.string()).optional(),
  posted_on_to: z.string(),
  gl_account_map_id: z.string().optional(),
  level_of_detail: z.enum(["detail_view", "summary_view"]).default("detail_view").optional(),
  include_zero_balance_gl_accounts: z.enum(["0", "1"]).default("0").optional(),
  columns: z.array(z.string()).optional(),
});

export function registerBalanceSheetReportTool(server: McpServer) {
  server.tool(
    "get_balance_sheet_report",
    "Returns the balance sheet report for the given filters.",
    balanceSheetToolSchema,
    async (args, _extra: unknown) => {
      try {
        // Validate arguments against schema
        const parseResult = balanceSheetValidationSchema.safeParse(args);
        if (!parseResult.success) {
          const errorMessages = parseResult.error.errors.map(err => 
            `${err.path.join('.')}: ${err.message}`
          ).join('; ');
          throw new Error(`Invalid arguments: ${errorMessages}`);
        }

        const apiArgs = transformToNestedProperties(parseResult.data) as BalanceSheetArgs;
        const result = await getBalanceSheetReport(apiArgs);
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
        console.error(`Balance Sheet Report Error:`, errorMessage);
        throw error;
      }
    }
  );
}

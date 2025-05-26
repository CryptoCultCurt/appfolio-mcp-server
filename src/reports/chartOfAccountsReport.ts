import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { makeAppfolioApiCall } from '../appfolio';

// Originally from src/appfolio.ts (lines 61-63)
export type ChartOfAccountsArgs = {
  columns?: string[];
};

// Originally from src/appfolio.ts (lines 65-79)
export type ChartOfAccountsResult = {
  results: Array<{
    number: string;
    account_name: string;
    account_type: string;
    sub_accountof: string;
    offset_account: string;
    subject_to_tax_authority: string;
    options: string;
    fund_account: string;
    hidden: string;
    gl_account_id: number;
    sub_account_of_id: number | null;
    offset_account_id: number | null;
  }>;
  next_page_url: string;
};

// Originally from src/index.ts (line 73)
const chartOfAccountsArgsSchema = z.object({
  columns: z.array(z.string()).optional().describe('Array of specific columns to include in the report')
});

// Originally from src/appfolio.ts (function starting line 1603)
export async function getChartOfAccountsReport(args: ChartOfAccountsArgs): Promise<ChartOfAccountsResult> {
  return makeAppfolioApiCall<ChartOfAccountsResult>('chart_of_accounts.json', args);
}

// New registration function for MCP
export function registerChartOfAccountsReportTool(server: McpServer) {
  server.tool(
    "get_chart_of_accounts_report",
    "Returns the chart of accounts.", // Description from original registration
    chartOfAccountsArgsSchema.shape,
    async (args, _extra: unknown) => {
      try {
        // Validate arguments against schema
        const parseResult = chartOfAccountsArgsSchema.safeParse(args);
        if (!parseResult.success) {
          const errorMessages = parseResult.error.errors.map(err => 
            `${err.path.join('.')}: ${err.message}`
          ).join('; ');
          throw new Error(`Invalid arguments: ${errorMessages}`);
        }

        const result = await getChartOfAccountsReport(parseResult.data as ChartOfAccountsArgs);
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
        console.error(`Chart of Accounts Report Error:`, errorMessage);
        throw error;
      }
    }
  );
}

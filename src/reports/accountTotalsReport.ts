import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { makeAppfolioApiCall } from '../appfolio';
import { flatPropertyFilterSchema, transformToNestedProperties } from './sharedSchemas';

export type AccountTotalsReportArgs = {
  property_visibility: string;
  properties?: {
    properties_ids?: string[];
    property_groups_ids?: string[];
    portfolios_ids?: string[];
    owners_ids?: string[];
  };
  gl_account_ids?: string;
  posted_on_from: string;
  posted_on_to: string;
  columns?: string[];
};

export type AccountTotalsReportResult = {
  results: Array<{
    property: string;
    property_name: string;
    property_id: number;
    property_address: string;
    property_street: string;
    property_street2: string;
    property_city: string;
    property_state: string;
    property_zip: string;
    reserve_amount: string;
    net_amount: string;
    ending_balance: string;
  }>;
  next_page_url: string;
};

export async function getAccountTotalsReport(args: AccountTotalsReportArgs): Promise<AccountTotalsReportResult> {
  const payload = { ...args };
  if (args.gl_account_ids === undefined) {
    payload.gl_account_ids = "1";
  }
  return makeAppfolioApiCall<AccountTotalsReportResult>('account_totals.json', payload);
}

// Flattened schema for MCP tool registration
const accountTotalsToolSchema = {
  property_visibility: z.string().describe('Property visibility filter'),
  ...flatPropertyFilterSchema,
  gl_account_ids: z.string().default("1").describe('GL account IDs'),
  posted_on_from: z.string().describe('Start date (YYYY-MM-DD)'),
  posted_on_to: z.string().describe('End date (YYYY-MM-DD)'),
  columns: z.array(z.string()).optional().describe('Specific columns to include'),
};

const accountTotalsValidationSchema = z.object({
  property_visibility: z.string(),
  properties_ids: z.array(z.string()).optional(),
  property_groups_ids: z.array(z.string()).optional(),
  portfolios_ids: z.array(z.string()).optional(),
  owners_ids: z.array(z.string()).optional(),
  gl_account_ids: z.string().default("1"),
  posted_on_from: z.string(),
  posted_on_to: z.string(),
  columns: z.array(z.string()).optional(),
});

export function registerAccountTotalsReportTool(server: McpServer) {
  server.tool(
    "get_account_totals_report",
    "Returns account totals for given filters and date range.",
    accountTotalsToolSchema,
    async (args, _extra: unknown) => {
      try {
        const parseResult = accountTotalsValidationSchema.safeParse(args);
        if (!parseResult.success) {
          const errorMessages = parseResult.error.errors.map(err => 
            `${err.path.join('.')}: ${err.message}`
          ).join('; ');
          throw new Error(`Invalid arguments: ${errorMessages}`);
        }

        const apiArgs = transformToNestedProperties(parseResult.data) as AccountTotalsReportArgs;
        const result = await getAccountTotalsReport(apiArgs);
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
        console.error(`Account Totals Report Error:`, errorMessage);
        throw error;
      }
    }
  );
}

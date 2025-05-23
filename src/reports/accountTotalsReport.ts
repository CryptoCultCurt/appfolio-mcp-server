import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { makeAppfolioApiCall } from '../appfolio';

export type AccountTotalsReportArgs = {
  property_visibility: string;
  properties?: {
    properties_ids?: string[];
    property_groups_ids?: string[];
    portfolios_ids?: string[];
    owners_ids?: string[];
  };
  gl_account_ids?: string; // default handled in function
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
  // Handle default for gl_account_ids
  const payload = { ...args };
  if (args.gl_account_ids === undefined) {
    payload.gl_account_ids = "1"; // Explicitly set default if not provided, matching original server.tool logic
  }

  return makeAppfolioApiCall<AccountTotalsReportResult>('account_totals.json', payload);
}

const accountTotalsInputSchema = z.object({
  property_visibility: z.string(),
  properties: z.object({
    properties_ids: z.array(z.string()).optional(),
    property_groups_ids: z.array(z.string()).optional(),
    portfolios_ids: z.array(z.string()).optional(),
    owners_ids: z.array(z.string()).optional(),
  }).optional(),
  gl_account_ids: z.string().default("1"), // Defaulting to "1" as per original logic, can also be '[1,2]' if that was intended
  posted_on_from: z.string(),
  posted_on_to: z.string(),
  columns: z.array(z.string()).optional(),
});

export function registerAccountTotalsReportTool(server: McpServer) {
  server.tool(
    "get_account_totals_report",
    "Returns account totals for given filters and date range.",
    accountTotalsInputSchema.shape,
    async (args: any, _extra: any) => {
      // The Zod schema now handles the default for gl_account_ids
      const data = await getAccountTotalsReport(args as AccountTotalsReportArgs);
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

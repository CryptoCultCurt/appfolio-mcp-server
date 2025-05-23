import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { makeAppfolioApiCall } from '../appfolio';

export type CashflowReportArgs = {
  property_visibility: string;
  properties?: {
    properties_ids?: string[];
    property_groups_ids?: string[];
    portfolios_ids?: string[];
    owners_ids?: string[];
  };
  posted_on_from: string;
  posted_on_to: string;
  gl_account_map_id?: string;
  exclude_suppressed_fees?: string;
  columns?: string[];
};

export async function getCashflowReport(args: CashflowReportArgs) {
  return makeAppfolioApiCall('cash_flow_detail.json', args);
}

// Zod schema for Cash Flow Report arguments
const cashflowInputSchema = z.object({
  property_visibility: z.string(),
  properties: z.object({
    properties_ids: z.array(z.string()).optional(),
    property_groups_ids: z.array(z.string()).optional(),
    portfolios_ids: z.array(z.string()).optional(),
    owners_ids: z.array(z.string()).optional(),
  }).optional(),
  posted_on_from: z.string(),
  posted_on_to: z.string(),
  gl_account_map_id: z.string().optional(),
  exclude_suppressed_fees: z.string().optional(),
  columns: z.array(z.string()).optional(),
});

export function registerCashflowReportTool(server: McpServer) {
  server.tool(
    "get_cashflow_report",
    "Returns Cash Flow Details including income and expenses for given time period.",
    cashflowInputSchema.shape,
    async (args: any, _extra: any) => { // Using 'any' for args for now, can be refined if needed
      const data = await getCashflowReport(args as CashflowReportArgs);
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
import { z } from "zod";
import axios from 'axios';
import Bottleneck from "bottleneck";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const { VHOST, USERNAME, PASSWORD } = process.env;

const appfolioLimiter = new Bottleneck({
  reservoir: 7, 
  reservoirRefreshAmount: 7,
  reservoirRefreshInterval: 15 * 1000, 
  maxConcurrent: 1
});

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
}[]; // Assuming it's an array based on typical report structures

export async function getBalanceSheetReport(args: BalanceSheetArgs): Promise<BalanceSheetResult> {
  if (!VHOST || !USERNAME || !PASSWORD) throw new Error('Missing AppFolio API credentials');
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

  const url = `https://${VHOST}.appfolio.com/api/v2/reports/balance_sheet.json`;
  const response = await appfolioLimiter.schedule(() => axios.post(url, payload, {
    auth: { username: USERNAME, password: PASSWORD },
    headers: { 'Content-Type': 'application/json' },
  }));

  return response.data;
}

export const balanceSheetInputSchema = z.object({
  property_visibility: z.enum(["active", "hidden", "all"]).default("active").optional(),
  properties: z.object({
    properties_ids: z.array(z.string()).optional(),
    property_groups_ids: z.array(z.string()).optional(),
    portfolios_ids: z.array(z.string()).optional(),
    owners_ids: z.array(z.string()).optional(),
  }).optional(),
  posted_on_to: z.string().describe("Required. Date to run the report as of in YYYY-MM-DD format."),
  gl_account_map_id: z.string().optional(),
  level_of_detail: z.enum(["detail_view", "summary_view"]).default("detail_view").optional(),
  include_zero_balance_gl_accounts: z.enum(["0", "1"]).default("0").optional(),
  columns: z.array(z.string()).optional(),
});

export function registerBalanceSheetReportTool(server: McpServer) {
  server.tool(
    "get_balance_sheet_report",
    "Returns the balance sheet report for the given filters.",
    balanceSheetInputSchema.shape,
    async (args: BalanceSheetArgs, _extra: unknown) => {
      const data = await getBalanceSheetReport(args as BalanceSheetArgs);
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

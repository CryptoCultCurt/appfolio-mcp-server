import axios from 'axios';
import dotenv from 'dotenv';
import { appfolioLimiter } from '../appfolio';
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

dotenv.config();

const { VHOST, USERNAME, PASSWORD } = process.env;

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
  if (!VHOST || !USERNAME || !PASSWORD) throw new Error('Missing AppFolio API credentials');
  const url = `https://${VHOST}.appfolio.com/api/v2/reports/cash_flow_detail.json`;
  const response = await appfolioLimiter.schedule(() => axios.post(url, args, {
    auth: { username: USERNAME, password: PASSWORD },
    headers: { 'Content-Type': 'application/json' },
  }));
  return response.data;
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
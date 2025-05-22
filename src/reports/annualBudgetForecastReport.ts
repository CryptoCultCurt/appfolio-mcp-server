import axios from 'axios';
import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { appfolioLimiter } from '../appfolio';
import dotenv from 'dotenv';

dotenv.config();
const { VHOST, USERNAME, PASSWORD } = process.env;

export type AnnualBudgetForecastArgs = {
  property_visibility?: "active" | "hidden" | "all";
  properties?: {
    properties_ids?: string[];
    property_groups_ids?: string[];
    portfolios_ids?: string[];
    owners_ids?: string[];
  };
  period_from: string; // Required, format YYYY-MM
  period_to: string;   // Required, format YYYY-MM
  consolidate?: "0" | "1";
  gl_account_map_id?: string;
  columns?: string[];
};

export type AnnualBudgetForecastResult = Array<{
  account_name: string;
  account_code: string;
  months: Array<{
    id: string; // e.g., "2023-06"
    value: string;
  }>;
  total: string;
  property_name: string;
  property_id: number;
  account_id: number;
  note: string;
}>;

export const annualBudgetForecastInputSchema = z.object({
  property_visibility: z.enum(["active", "hidden", "all"]).optional().default("active"),
  properties: z.object({
    properties_ids: z.array(z.string()).optional(),
    property_groups_ids: z.array(z.string()).optional(),
    portfolios_ids: z.array(z.string()).optional(),
    owners_ids: z.array(z.string()).optional(),
  }).optional(),
  period_from: z.string().describe('Start period for the forecast (YYYY-MM). Required.'),
  period_to: z.string().describe('End period for the forecast (YYYY-MM). Required.'),
  consolidate: z.enum(["0", "1"]).optional().default("0"),
  gl_account_map_id: z.string().optional(),
  columns: z.array(z.string()).optional(),
});

export async function getAnnualBudgetForecastReport(args: AnnualBudgetForecastArgs): Promise<AnnualBudgetForecastResult> {
  if (!VHOST || !USERNAME || !PASSWORD) throw new Error('Missing AppFolio API credentials');
  // period_from and period_to are marked as required in Zod schema

  // Defaults are handled by Zod schema
  const payload = args;

  const url = `https://${VHOST}.appfolio.com/api/v2/reports/annual_budget_forecast.json`;
  const response = await appfolioLimiter.schedule(() => axios.post(url, payload, {
    auth: { username: USERNAME, password: PASSWORD },
    headers: { 'Content-Type': 'application/json' },
  }));

  return response.data;
}

export function registerAnnualBudgetForecastReportTool(server: McpServer) {
  type AnnualBudgetForecastArgsFromSchema = z.infer<typeof annualBudgetForecastInputSchema>;
  server.tool(
    "get_annual_budget_forecast_report",
    "Returns annual budget forecast report for the given filters.",
    annualBudgetForecastInputSchema.shape,
    async (args: AnnualBudgetForecastArgsFromSchema, _extra: unknown) => {
      const data = await getAnnualBudgetForecastReport(args as AnnualBudgetForecastArgs);
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

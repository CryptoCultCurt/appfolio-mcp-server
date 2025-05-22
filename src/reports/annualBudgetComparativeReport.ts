import axios from 'axios';
import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { appfolioLimiter } from '../appfolio'; // Assuming appfolioLimiter is exported from appfolio.ts
import dotenv from 'dotenv';

dotenv.config();
const { VHOST, USERNAME, PASSWORD } = process.env;

export type AnnualBudgetCompArgsV2 = {
  property_visibility?: string;
  properties?: {
    properties_ids?: string[];
    property_groups_ids?: string[];
    portfolios_ids?: string[];
    owners_ids?: string[];
  };
  occurred_on_to: string;
  additional_account_types?: string[];
  gl_account_map_id?: string;
  level_of_detail?: string;
  columns?: string[];
};

export type AnnualBudgetComparativeResult = Array<{
  account_name: string;
  mtd_actual: string;
  mtd_budget: string;
  mtd_amount_variance: string;
  mtd_percent_variance: string;
  ytd_actual: string;
  ytd_budget: string;
  ytd_amount_variance: string;
  ytd_percent_variance: string;
  annual: string;
  account_number: string;
  note: string;
  variance_note: string;
}>;

export const annualBudgetComparativeInputSchema = z.object({
  property_visibility: z.string().optional().default("active").describe('Filter properties by status. Defaults to "active"'),
  properties: z.object({
    properties_ids: z.array(z.string()).optional(),
    property_groups_ids: z.array(z.string()).optional(),
    portfolios_ids: z.array(z.string()).optional(),
    owners_ids: z.array(z.string()).optional(),
  }).optional(),
  occurred_on_to: z.string().describe('The end date for the report period (YYYY-MM-DD)'),
  additional_account_types: z.array(z.string()).optional().default([]).describe('Array of additional account types to include'),
  gl_account_map_id: z.string().optional().describe('Filter by GL account map ID'),
  level_of_detail: z.enum(["detail_view", "summary_view"]).optional().default("detail_view").describe('Specify the level of detail. Defaults to "detail_view"'),
  columns: z.array(z.string()).optional().describe('Array of specific columns to include in the report')
});

export async function getAnnualBudgetComparativeReport(args: AnnualBudgetCompArgsV2): Promise<AnnualBudgetComparativeResult> {
  if (!VHOST || !USERNAME || !PASSWORD) throw new Error('Missing AppFolio API credentials');
  // occurred_on_to is marked as required in the Zod schema, so no need to check here

  // Defaults are handled by Zod schema
  const payload = args;

  const url = `https://${VHOST}.appfolio.com/api/v2/reports/annual_budget_comparative.json`;
  const response = await appfolioLimiter.schedule(() => axios.post(url, payload, {
    auth: { username: USERNAME, password: PASSWORD },
    headers: { 'Content-Type': 'application/json' },
  }));
  return response.data;
}

export function registerAnnualBudgetComparativeReportTool(server: McpServer) {
  type AnnualBudgetComparativeArgsFromSchema = z.infer<typeof annualBudgetComparativeInputSchema>;
  server.tool(
    "get_annual_budget_comparative_report",
    "Returns annual budget comparative report for the given filters.",
    annualBudgetComparativeInputSchema.shape,
    async (args: AnnualBudgetComparativeArgsFromSchema, _extra: unknown) => {
      const data = await getAnnualBudgetComparativeReport(args as AnnualBudgetCompArgsV2); // Cast because Zod default might add properties not in original type
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

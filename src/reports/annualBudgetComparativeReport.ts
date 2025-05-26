import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { makeAppfolioApiCall } from '../appfolio';

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
  periods: any;
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
  columns: z.array(z.string()).optional().describe('Array of specific columns to include in the report'),
  periods: z.any().describe('Periods')
});

export async function getAnnualBudgetComparativeReport(args: AnnualBudgetCompArgsV2): Promise<AnnualBudgetComparativeResult> {
  if (!args.periods) {
    throw new Error('Missing required argument: periods');
  }

  const { property_visibility = "active", ...rest } = args;
  const payload = { property_visibility, ...rest };

  return makeAppfolioApiCall<AnnualBudgetComparativeResult>('annual_budget_comparative.json', payload);
}

export function registerAnnualBudgetComparativeReportTool(server: McpServer) {
  server.tool(
    "get_annual_budget_comparative_report",
    "Returns annual budget comparative report for the given filters.",
    annualBudgetComparativeInputSchema.shape,
    async (args, _extra: unknown) => {
      try {
        // Validate arguments against schema
        const parseResult = annualBudgetComparativeInputSchema.safeParse(args);
        if (!parseResult.success) {
          const errorMessages = parseResult.error.errors.map(err => 
            `${err.path.join('.')}: ${err.message}`
          ).join('; ');
          throw new Error(`Invalid arguments: ${errorMessages}`);
        }

        const result = await getAnnualBudgetComparativeReport(parseResult.data as AnnualBudgetCompArgsV2);
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
        console.error(`Annual Budget Comparative Report Error:`, errorMessage);
        throw error;
      }
    }
  );
}

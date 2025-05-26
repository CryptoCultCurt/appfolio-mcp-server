import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { makeAppfolioApiCall } from '../appfolio';

// --- Annual Budget Forecast Report Types ---
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
  if (!args.period_from || !args.period_to) {
    throw new Error('Missing required arguments: period_from and period_to (format YYYY-MM-DD)');
  }

  const { property_visibility = "active", ...rest } = args;
  const payload = { property_visibility, ...rest };

  return makeAppfolioApiCall<AnnualBudgetForecastResult>('annual_budget_forecast.json', payload);
}

export function registerAnnualBudgetForecastReportTool(server: McpServer) {
  server.tool(
    "get_annual_budget_forecast_report",
    "Returns annual budget forecast report for the given filters.",
    annualBudgetForecastInputSchema.shape,
    async (args, _extra: unknown) => {
      try {
        // Validate arguments against schema
        const parseResult = annualBudgetForecastInputSchema.safeParse(args);
        if (!parseResult.success) {
          const errorMessages = parseResult.error.errors.map(err => 
            `${err.path.join('.')}: ${err.message}`
          ).join('; ');
          throw new Error(`Invalid arguments: ${errorMessages}`);
        }

        const result = await getAnnualBudgetForecastReport(parseResult.data as AnnualBudgetForecastArgs);
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
        console.error(`Annual Budget Forecast Report Error:`, errorMessage);
        throw error;
      }
    }
  );
}

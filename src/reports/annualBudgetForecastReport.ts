import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { makeAppfolioApiCall } from '../appfolio';
import { flatPropertyFilterSchema, transformToNestedProperties } from './sharedSchemas';

export type AnnualBudgetForecastArgs = {
  property_visibility?: "active" | "hidden" | "all";
  properties?: {
    properties_ids?: string[];
    property_groups_ids?: string[];
    portfolios_ids?: string[];
    owners_ids?: string[];
  };
  period_from: string;
  period_to: string;
  consolidate?: "0" | "1";
  gl_account_map_id?: string;
  columns?: string[];
};

export type AnnualBudgetForecastResult = Array<{
  account_name: string;
  account_code: string;
  months: Array<{
    id: string;
    value: string;
  }>;
  total: string;
  property_name: string;
  property_id: number;
  account_id: number;
  note: string;
}>;

// Flattened schema for MCP tool registration
const annualBudgetForecastToolSchema = {
  property_visibility: z.enum(["active", "hidden", "all"]).optional().default("active")
    .describe('Filter properties by status. Defaults to "active"'),
  ...flatPropertyFilterSchema,
  period_from: z.string().describe('Start period for the forecast (YYYY-MM). Required.'),
  period_to: z.string().describe('End period for the forecast (YYYY-MM). Required.'),
  consolidate: z.enum(["0", "1"]).optional().default("0").describe('Consolidate results'),
  gl_account_map_id: z.string().optional().describe('Filter by GL account map ID'),
  columns: z.array(z.string()).optional().describe('Specific columns to include'),
};

const annualBudgetForecastValidationSchema = z.object({
  property_visibility: z.enum(["active", "hidden", "all"]).optional().default("active"),
  properties_ids: z.array(z.string()).optional(),
  property_groups_ids: z.array(z.string()).optional(),
  portfolios_ids: z.array(z.string()).optional(),
  owners_ids: z.array(z.string()).optional(),
  period_from: z.string(),
  period_to: z.string(),
  consolidate: z.enum(["0", "1"]).optional().default("0"),
  gl_account_map_id: z.string().optional(),
  columns: z.array(z.string()).optional(),
});

export async function getAnnualBudgetForecastReport(args: AnnualBudgetForecastArgs): Promise<AnnualBudgetForecastResult> {
  if (!args.period_from || !args.period_to) {
    throw new Error('Missing required arguments: period_from and period_to (format YYYY-MM)');
  }

  const { property_visibility = "active", ...rest } = args;
  const payload = { property_visibility, ...rest };

  return makeAppfolioApiCall<AnnualBudgetForecastResult>('annual_budget_forecast.json', payload);
}

export function registerAnnualBudgetForecastReportTool(server: McpServer) {
  server.tool(
    "get_annual_budget_forecast_report",
    "Returns annual budget forecast report for the given filters.",
    annualBudgetForecastToolSchema,
    async (args, _extra: unknown) => {
      try {
        const parseResult = annualBudgetForecastValidationSchema.safeParse(args);
        if (!parseResult.success) {
          const errorMessages = parseResult.error.errors.map(err => 
            `${err.path.join('.')}: ${err.message}`
          ).join('; ');
          throw new Error(`Invalid arguments: ${errorMessages}`);
        }

        const apiArgs = transformToNestedProperties(parseResult.data) as AnnualBudgetForecastArgs;
        const result = await getAnnualBudgetForecastReport(apiArgs);
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
        console.error(`Annual Budget Forecast Report Error:`, errorMessage);
        throw error;
      }
    }
  );
}

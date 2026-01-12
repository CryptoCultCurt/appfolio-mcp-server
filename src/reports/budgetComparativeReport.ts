import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { makeAppfolioApiCall } from '../appfolio';

// --- Budget Comparative Report Types ---
export type BudgetComparativeArgs = {
  property_visibility?: string; // Zod default will handle this for tool input
  properties?: {
    properties_ids?: string[];
    property_groups_ids?: string[];
    portfolios_ids?: string[];
    owners_ids?: string[];
  };
  period_from: string;
  period_to: string;
  comparison_period_from: string;
  comparison_period_to: string;
  additional_account_types?: string[]; // Added from schema
  gl_account_map_id?: string;
  level_of_detail?: string; // Added from schema
  columns?: string[];
};

// Originally from src/appfolio.ts (line 37)
export type BudgetComparativeResult = Array<{
  account_number: string;
  account_name: string;
  period_actual: string;
  comparison_actual: string;
  period_var: string;
  percent_var: string;
  period_budget: string;
  comparison_budget: string;
  budget_period_var: string;
  budget_percent_var: string;
  comparison_period_var: string;
  comparison_percent_var: string;
}>;

// Reconstructed from previous src/index.ts diff
const budgetComparativeInputSchema = z.object({
  property_visibility: z.string().default("active"),
  properties: z.object({
    properties_ids: z.array(z.string()).optional(),
    property_groups_ids: z.array(z.string()).optional(),
    portfolios_ids: z.array(z.string()).optional(),
    owners_ids: z.array(z.string()).optional(),
  }).optional(),
  period_from: z.string(),
  period_to: z.string(),
  comparison_period_from: z.string(),
  comparison_period_to: z.string(),
  additional_account_types: z.array(z.string()).optional(),
  gl_account_map_id: z.string().optional(),
  level_of_detail: z.string().optional(),
  columns: z.array(z.string()).optional(),
});

// Originally from src/appfolio.ts (function starting line 1602)
export async function getBudgetComparativeReport(args: BudgetComparativeArgs): Promise<BudgetComparativeResult> {
  if (!args.period_from || !args.period_to || !args.comparison_period_from || !args.comparison_period_to) {
    throw new Error('Missing required arguments: period_from, period_to, comparison_period_from, and comparison_period_to (format YYYY-MM-DD)');
  }

  const { property_visibility = "active", ...rest } = args;
  const payload = { property_visibility, ...rest };

  return makeAppfolioApiCall<BudgetComparativeResult>('budget_comparative.json', payload);
}

// New registration function for MCP
export function registerBudgetComparativeReportTool(server: McpServer) {
  server.tool(
    "get_budget_comparative_report",
    "Returns budget comparative report for the given filters.",
    budgetComparativeInputSchema.shape as any,
    async (args, _extra: unknown) => {
      try {
        // Validate arguments against schema
        const parseResult = budgetComparativeInputSchema.safeParse(args);
        if (!parseResult.success) {
          const errorMessages = parseResult.error.errors.map(err => 
            `${err.path.join('.')}: ${err.message}`
          ).join('; ');
          throw new Error(`Invalid arguments: ${errorMessages}`);
        }

        const result = await getBudgetComparativeReport(parseResult.data);
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
        console.error(`Budget Comparative Report Error:`, errorMessage);
        throw error;
      }
    }
  );
}

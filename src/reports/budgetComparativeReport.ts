import axios from 'axios';
import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import dotenv from 'dotenv';
import { appfolioLimiter } from '../appfolio'; // Assuming appfolioLimiter is exported from the main appfolio.ts

dotenv.config();

const { VHOST, USERNAME, PASSWORD } = process.env;

// Originally from src/appfolio.ts (line 21)
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
  if (!VHOST || !USERNAME || !PASSWORD) {
    throw new Error('Missing AppFolio API credentials');
  }
  // Zod schema handles the default for property_visibility, so args can be used directly.
  const payload = args;

  const url = `https://${VHOST}.appfolio.com/api/v2/reports/budget_comparative.json`;
  const response = await appfolioLimiter.schedule(() => axios.post(url, payload, {
    auth: { username: USERNAME, password: PASSWORD },
    headers: { 'Content-Type': 'application/json' },
  }));
  return response.data;
}

// New registration function for MCP
export function registerBudgetComparativeReportTool(server: McpServer) {
  server.tool(
    "get_budget_comparative_report",
    "Returns budget comparative report for the given filters.", // Description from original registration
    budgetComparativeInputSchema.shape,
    async (toolArgs: z.infer<typeof budgetComparativeInputSchema>) => {
      // Cast toolArgs to BudgetComparativeArgs. Ensure properties match or handle discrepancies.
      const data = await getBudgetComparativeReport(toolArgs as BudgetComparativeArgs);
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

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { makeAppfolioApiCall } from '../appfolio';

// --- Trial Balance By Property Report Types ---
export type TrialBalanceByPropertyArgs = {
    property_visibility?: "active" | "hidden" | "all"; // Defaults to "active"
    properties?: {
      properties_ids?: string[];
      property_groups_ids?: string[];
      portfolios_ids?: string[];
      owners_ids?: string[];
    };
    posted_on_from: string; // Required (YYYY-MM-DD)
    posted_on_to: string; // Required (YYYY-MM-DD)
    gl_account_map_id?: string;
    columns?: string[];
  };
  
  export type TrialBalanceByPropertyResult = {
    results: Array<{
      property_name: string | null;
      account_name: string | null;
      balance_forward: string | null;
      debit: string | null;
      credit: string | null;
      ending_balance: string | null;
      property_id: number | null;
    }>;
    next_page_url: string | null;
  };

  // Zod schema for Trial Balance By Property Report arguments
const trialBalanceByPropertyArgsSchema = z.object({
    property_visibility: z.enum(["active", "hidden", "all"]).optional().default("active").describe('Filter properties by status. Defaults to "active"'),
    properties: z.object({
      properties_ids: z.array(z.string()).optional(),
      property_groups_ids: z.array(z.string()).optional(),
      portfolios_ids: z.array(z.string()).optional(),
      owners_ids: z.array(z.string()).optional()
    }).optional().describe('Filter results based on properties, groups, portfolios, or owners'),
    posted_on_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('Required. The start date for the reporting period (YYYY-MM-DD).'),
    posted_on_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('Required. The end date for the reporting period (YYYY-MM-DD).'),
    gl_account_map_id: z.string().optional().describe('Optional. Filter by a specific GL Account Map ID.'),
    columns: z.array(z.string()).optional().describe('Array of specific columns to include in the report')
  });

// --- Trial Balance By Property Report Function ---
export async function getTrialBalanceByPropertyReport(args: TrialBalanceByPropertyArgs): Promise<TrialBalanceByPropertyResult> {
  if (!args.posted_on_from || !args.posted_on_to) {
    throw new Error('Missing required arguments: posted_on_from and posted_on_to (format YYYY-MM-DD)');
  }

  const { property_visibility = "active", ...rest } = args;
  const payload = { property_visibility, ...rest };

  return makeAppfolioApiCall<TrialBalanceByPropertyResult>('trial_balance_by_property.json', payload);
}

// --- Trial Balance By Property Report Tool ---
export function registerTrialBalanceByPropertyReportTool(server: McpServer) {
  server.tool(
    "get_trial_balance_by_property_report",
    "Generates a trial balance report by property.",
    trialBalanceByPropertyArgsSchema.shape as any,
    async (args, _extra: unknown) => {
      try {
        // Validate arguments against schema
        const parseResult = trialBalanceByPropertyArgsSchema.safeParse(args);
        if (!parseResult.success) {
          const errorMessages = parseResult.error.errors.map(err => 
            `${err.path.join('.')}: ${err.message}`
          ).join('; ');
          throw new Error(`Invalid arguments: ${errorMessages}`);
        }

        const result = await getTrialBalanceByPropertyReport(parseResult.data);
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
        console.error(`Trial Balance By Property Report Error:`, errorMessage);
        throw error;
      }
    }
  );
}

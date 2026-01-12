import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { makeAppfolioApiCall } from '../appfolio';

// --- Loans Report Types ---
export type LoansArgs = {
  property_visibility?: "active" | "hidden" | "all";
  properties?: {
    properties_ids?: string[];
    property_groups_ids?: string[];
    portfolios_ids?: string[];
    owners_ids?: string[];
  };
  reference_to: string; // Required
  show_hidden_loans?: "0" | "1";
  columns?: string[];
};

export type LoansResultItem = {
  property: string;
  property_name: string;
  property_id: number;
  property_address: string;
  property_street: string;
  property_street2: string | null;
  property_city: string;
  property_state: string;
  property_zip: string;
  loan_id: number;
  loan_number: string;
  vendor: string;
  loan_type: string;
  status: string;
  original_balance: string;
  current_balance: string;
  interest_rate_type: string;
  interest_rate: string | null;
  next_interest_rate: string | null;
  next_interest_rate_date: string | null;
  escrow: string | null;
  prepayment_penalty: string | null;
  balloon_amount: string | null;
};

export type LoansResult = {
  results: LoansResultItem[];
  next_page_url: string | null;
};

// Zod schema for Loans Report arguments
export const loansArgsSchema = z.object({
  property_visibility: z.enum(["active", "hidden", "all"]).optional().default("active").describe('Filter properties by status. Defaults to "active"'),
  properties: z.object({
    properties_ids: z.array(z.string()).optional(),
    property_groups_ids: z.array(z.string()).optional(),
    portfolios_ids: z.array(z.string()).optional(),
    owners_ids: z.array(z.string()).optional()
  }).optional().describe('Filter results based on properties, groups, portfolios, or owners'),
  reference_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The reference date for the report (YYYY-MM-DD). Required.'),
  show_hidden_loans: z.enum(["0", "1"]).optional().default("0").describe('Include loans marked as hidden. Defaults to "0" (false)'),
  columns: z.array(z.string()).optional().describe('Array of specific columns to include in the report')
});

// --- Loans Report Function ---
export async function getLoansReport(args: LoansArgs): Promise<LoansResult> {
  if (!args.reference_to) {
    throw new Error('Missing required argument: reference_to (format YYYY-MM-DD)');
  }

  const { property_visibility = "active", ...rest } = args;
  const payload = { property_visibility, ...rest };

  return makeAppfolioApiCall<LoansResult>('loans.json', payload);
}

// --- Register Loans Report Tool ---
export function registerLoansReportTool(server: McpServer) {
  server.tool(
    "get_loans_report",
    "Retrieves a report on loans associated with properties.",
    loansArgsSchema.shape as any,
    async (args, _extra: unknown) => {
      try {
        // Validate arguments against schema
        const parseResult = loansArgsSchema.safeParse(args);
        if (!parseResult.success) {
          const errorMessages = parseResult.error.errors.map(err => 
            `${err.path.join('.')}: ${err.message}`
          ).join('; ');
          throw new Error(`Invalid arguments: ${errorMessages}`);
        }

        const result = await getLoansReport(parseResult.data);
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
        console.error(`Loans Report Error:`, errorMessage);
        throw error;
      }
    }
  );
}

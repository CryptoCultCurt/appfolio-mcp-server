import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import dotenv from 'dotenv';
import { makeAppfolioApiCall } from '../appfolio';
import { validatePropertiesIds, throwOnValidationErrors, getIdFieldDescription } from '../validation';

dotenv.config();

// Available columns extracted from the LeasingSummaryResult type
export const LEASING_SUMMARY_COLUMNS = [
  'unit_type',
  'number_of_units',
  'number_of_model_units',
  'inquiries_received',
  'showings_completed',
  'applications_received',
  'move_ins',
  'move_outs',
  'leased',
  'vacancy_postings',
  'number_of_active_campaigns',
  'number_of_ended_campaigns'
] as const;

// --- Leasing Summary Report Types ---
export type LeasingSummaryArgs = {
  properties?: {
    properties_ids?: string[];
    property_groups_ids?: string[];
    portfolios_ids?: string[];
    owners_ids?: string[];
  };
  unit_visibility?: "active" | "hidden" | "all"; // Will be defaulted by Zod
  posted_on_from: string; // Required (YYYY-MM-DD)
  posted_on_to: string; // Required (YYYY-MM-DD)
  columns?: string[];
};

export type LeasingSummaryResult = {
  results: Array<{
    unit_type: string;
    number_of_units: number;
    number_of_model_units: number;
    inquiries_received: number;
    showings_completed: number;
    applications_received: number;
    move_ins: number;
    move_outs: number;
    leased: number;
    vacancy_postings: number;
    number_of_active_campaigns: number;
    number_of_ended_campaigns: number;
  }>;
  next_page_url: string | null;
};

// Zod schema for Leasing Summary Report arguments
export const leasingSummaryArgsSchema = z.object({
  properties: z.object({
    properties_ids: z.array(z.string()).optional()
      .describe(getIdFieldDescription('property', 'Property Directory Report')),
    property_groups_ids: z.array(z.string()).optional()
      .describe(getIdFieldDescription('property group', 'Property Group Directory Report')),
    portfolios_ids: z.array(z.string()).optional()
      .describe(getIdFieldDescription('portfolio', 'Portfolio Directory Report')),
    owners_ids: z.array(z.string()).optional()
      .describe(getIdFieldDescription('owner', 'Owner Directory Report')),
  }).optional().describe('Filter results based on properties, groups, portfolios, or owners'),
  unit_visibility: z.enum(["active", "hidden", "all"]).default("active").describe('Filter units by status. Defaults to "active"'),
  posted_on_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The start date for the reporting period (YYYY-MM-DD). Required.'),
  posted_on_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The end date for the reporting period (YYYY-MM-DD). Required.'),
  columns: z.array(z.enum(LEASING_SUMMARY_COLUMNS)).optional()
    .describe(`Array of specific columns to include in the report. Valid columns: ${LEASING_SUMMARY_COLUMNS.join(', ')}. If not specified, all columns are returned.`)
});

// --- Leasing Summary Report Function ---
export async function getLeasingSummaryReport(args: LeasingSummaryArgs): Promise<LeasingSummaryResult> {
  // Validate properties IDs if provided
  if (args.properties) {
    const validationErrors = validatePropertiesIds(args.properties);
    throwOnValidationErrors(validationErrors);
  }

  if (!args.posted_on_from || !args.posted_on_to) {
    throw new Error('Missing required arguments: posted_on_from and posted_on_to (format YYYY-MM-DD)');
  }

  const { unit_visibility = "active", ...rest } = args;
  const payload = { unit_visibility, ...rest };

  return makeAppfolioApiCall<LeasingSummaryResult>('leasing_summary.json', payload);
}

// --- Register Leasing Summary Report Tool ---
export function registerLeasingSummaryReportTool(server: McpServer) {
  server.tool(
    "get_leasing_summary_report",
    "Provides a summary of leasing activities, including inquiries, showings, applications, and move-ins/outs. IMPORTANT: All ID parameters (properties_ids, property_groups_ids, portfolios_ids, owners_ids) must be numeric strings (e.g. '123'), NOT names. Use respective directory reports first to lookup IDs by name if needed.",
    leasingSummaryArgsSchema.shape as any,
    async (args, _extra: unknown) => {
      try {
        // Validate arguments against schema
        const parseResult = leasingSummaryArgsSchema.safeParse(args);
        if (!parseResult.success) {
          const errorMessages = parseResult.error.errors.map(err => 
            `${err.path.join('.')}: ${err.message}`
          ).join('; ');
          throw new Error(`Invalid arguments: ${errorMessages}`);
        }

        const result = await getLeasingSummaryReport(parseResult.data);
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
        console.error(`Leasing Summary Report Error:`, errorMessage);
        throw error;
      }
    }
  );
}

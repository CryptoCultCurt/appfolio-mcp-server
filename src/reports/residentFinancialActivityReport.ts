import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { makeAppfolioApiCall } from '../appfolio';
import { validatePropertiesIds, throwOnValidationErrors, getIdFieldDescription } from '../validation';

// --- Resident Financial Activity Report Types ---
export type ResidentFinancialActivityArgs = {
  property_visibility?: "active" | "hidden" | "all";
  properties?: {
    properties_ids?: string[];
    property_groups_ids?: string[];
    portfolios_ids?: string[];
    owners_ids?: string[];
  };
  occurred_on_from: string;
  occurred_on_to: string;
  include_voided?: boolean;
  columns?: string[];
};

export type ResidentFinancialActivityResult = {
  results: Array<{
    property_id: number;
    property_name: string;
    unit_id: number;
    unit_number: string;
    resident_id: number;
    resident_name: string;
    transaction_id: number;
    transaction_type: string;
    transaction_date: string;
    transaction_description: string;
    transaction_amount: string;
    transaction_balance: string;
    transaction_status: string;
    payment_method: string | null;
    check_number: string | null;
    reference_number: string | null;
    created_by: string | null;
    created_at: string;
    updated_at: string;
    is_void: boolean;
    voided_at: string | null;
    voided_by: string | null;
    void_reason: string | null;
    reversed_transaction_id: number | null;
    reversal_transaction_id: number | null;
  }>;
  next_page_url: string | null;
};

const residentFinancialActivityInputSchema = z.object({
  property_visibility: z.enum(["active", "hidden", "all"]).optional().default("active"),
  properties: z.object({
    properties_ids: z.array(z.string()).optional().describe(getIdFieldDescription('properties_ids', 'Property', 'Property Directory Report')),
    property_groups_ids: z.array(z.string()).optional().describe(getIdFieldDescription('property_groups_ids', 'Property Group')),
    portfolios_ids: z.array(z.string()).optional().describe(getIdFieldDescription('portfolios_ids', 'Portfolio')),
    owners_ids: z.array(z.string()).optional().describe(getIdFieldDescription('owners_ids', 'Owner', 'Owner Directory Report'))
  }).optional().describe('Filter results based on properties, groups, portfolios, or owners. All ID fields must be numeric strings, not names.'),
  occurred_on_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  occurred_on_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  include_voided: z.boolean().optional().default(false),
  columns: z.array(z.string()).optional()
});

export async function getResidentFinancialActivityReport(args: ResidentFinancialActivityArgs): Promise<ResidentFinancialActivityResult> {
  if (!args.occurred_on_from || !args.occurred_on_to) {
    throw new Error('Missing required arguments: occurred_on_from and occurred_on_to (format YYYY-MM-DD)');
  }

  // Validate ID fields
  if (args.properties) {
    const validationErrors = validatePropertiesIds(args.properties);
    throwOnValidationErrors(validationErrors);
  }

  const { property_visibility = "active", ...rest } = args;
  const payload = { property_visibility, ...rest };

  return makeAppfolioApiCall<ResidentFinancialActivityResult>('resident_financial_activity.json', payload);
}

export function registerResidentFinancialActivityReportTool(server: McpServer) {
  server.tool(
    "get_resident_financial_activity_report",
    "Returns resident financial activity report for the given filters. IMPORTANT: All ID parameters (owners_ids, properties_ids, etc.) must be numeric strings (e.g. '123'), NOT names. Use respective directory reports first to lookup IDs by name if needed.",
    residentFinancialActivityInputSchema.shape as any,
    async (args, _extra: unknown) => {
      try {
        // Validate arguments against schema
        const parseResult = residentFinancialActivityInputSchema.safeParse(args);
        if (!parseResult.success) {
          const errorMessages = parseResult.error.errors.map(err => 
            `${err.path.join('.')}: ${err.message}`
          ).join('; ');
          throw new Error(`Invalid arguments: ${errorMessages}`);
        }

        const result = await getResidentFinancialActivityReport(parseResult.data);
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
        console.error(`Resident Financial Activity Report Error:`, errorMessage);
        throw error;
      }
    }
  );
}

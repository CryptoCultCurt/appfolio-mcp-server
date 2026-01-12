import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { makeAppfolioApiCall } from '../appfolio';
import { validatePropertiesIds, throwOnValidationErrors, getIdFieldDescription } from '../validation';
import { flatPropertyFilterSchema, transformToNestedProperties } from './sharedSchemas';

export type AgedPayablesSummaryArgs = {
  property_visibility?: string;
  properties?: {
    properties_ids?: string[];
    property_groups_ids?: string[];
    portfolios_ids?: string[];
    owners_ids?: string[];
  };
  occurred_on?: string;
  party_contact_info?: {
    company_id?: string;
  };
  balance_operator?: {
    amount?: string;
    comparator?: string;
  };
  columns?: string[];
};

export type AgedPayablesSummaryResult = {
  results: Array<{
    property: string;
    property_name: string;
    property_id: number;
    property_address: string;
    property_street: string;
    property_street2: string;
    property_city: string;
    property_state: string;
    property_zip: string;
    payee_name: string;
    unit_id: number;
    amount_payable: string;
    not_yet_due: string;
    "0_to30": string;
    "30_to60": string;
    "60_to90": string;
    "90_plus": string;
    "30_plus": string;
    "60_plus": string;
    party_id: string;
    party_type: string;
  }>;
  next_page_url: string;
};

// Flattened schema for MCP tool registration
const agedPayablesSummaryToolSchema = {
  property_visibility: z.string().default("active").describe('Filter properties by status'),
  ...flatPropertyFilterSchema,
  occurred_on: z.string().describe('As-of date (YYYY-MM-DD)'),
  party_company_id: z.string().optional().describe('Filter by company ID'),
  balance_amount: z.string().optional().describe('Balance amount to compare against'),
  balance_comparator: z.string().optional().describe('Comparison operator (e.g. "gt", "lt")'),
  columns: z.array(z.string()).optional().describe('Specific columns to include'),
};

const agedPayablesSummaryValidationSchema = z.object({
  property_visibility: z.string().default("active"),
  properties_ids: z.array(z.string()).optional(),
  property_groups_ids: z.array(z.string()).optional(),
  portfolios_ids: z.array(z.string()).optional(),
  owners_ids: z.array(z.string()).optional(),
  occurred_on: z.string(),
  party_company_id: z.string().optional(),
  balance_amount: z.string().optional(),
  balance_comparator: z.string().optional(),
  columns: z.array(z.string()).optional(),
});

function transformToApiArgs(input: z.infer<typeof agedPayablesSummaryValidationSchema>): AgedPayablesSummaryArgs {
  const { party_company_id, balance_amount, balance_comparator, ...rest } = input;
  const baseArgs = transformToNestedProperties(rest);
  
  return {
    ...baseArgs,
    ...(party_company_id && { party_contact_info: { company_id: party_company_id } }),
    ...((balance_amount || balance_comparator) && {
      balance_operator: {
        ...(balance_amount && { amount: balance_amount }),
        ...(balance_comparator && { comparator: balance_comparator }),
      }
    }),
  };
}

export async function getAgedPayablesSummaryReport(args: AgedPayablesSummaryArgs): Promise<AgedPayablesSummaryResult> {
  if (!args.occurred_on) {
    throw new Error('Missing required argument: occurred_on (format YYYY-MM-DD)');
  }

  if (args.properties) {
    const validationErrors = validatePropertiesIds(args.properties);
    throwOnValidationErrors(validationErrors);
  }

  const { property_visibility = "active", ...rest } = args;
  const payload = { property_visibility, ...rest };

  return makeAppfolioApiCall<AgedPayablesSummaryResult>('aged_payables_summary.json', payload);
}

export function registerAgedPayablesSummaryReportTool(server: McpServer) {
  server.tool(
    "get_aged_payables_summary_report",
    "Returns aged payables summary for the given filters. IMPORTANT: All ID parameters must be numeric strings (e.g. '123'), NOT names.",
    agedPayablesSummaryToolSchema,
    async (args, _extra: unknown) => {
      try {
        const parseResult = agedPayablesSummaryValidationSchema.safeParse(args);
        if (!parseResult.success) {
          const errorMessages = parseResult.error.errors.map(err => 
            `${err.path.join('.')}: ${err.message}`
          ).join('; ');
          throw new Error(`Invalid arguments: ${errorMessages}`);
        }

        const apiArgs = transformToApiArgs(parseResult.data);
        const data = await getAgedPayablesSummaryReport(apiArgs);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(data),
              mimeType: "application/json"
            }
          ]
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Aged Payables Summary Report Error:`, errorMessage);
        throw error;
      }
    }
  );
}

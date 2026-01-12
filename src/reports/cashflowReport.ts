import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { makeAppfolioApiCall } from '../appfolio';

export type CashflowReportArgs = {
  property_visibility: string;
  properties?: {
    properties_ids?: string[];
    property_groups_ids?: string[];
    portfolios_ids?: string[];
    owners_ids?: string[];
  };
  posted_on_from: string;
  posted_on_to: string;
  gl_account_map_id?: string;
  exclude_suppressed_fees?: string;
  columns?: string[];
};

export async function getCashflowReport(args: CashflowReportArgs) {
  return makeAppfolioApiCall('cash_flow_detail.json', args);
}

// Flattened Zod schema for Cash Flow Report arguments
// (Nested objects cause TypeScript type depth issues with MCP SDK)
const cashflowInputSchema = {
  property_visibility: z.string().describe('Property visibility filter'),
  properties_ids: z.array(z.string()).optional().describe('Filter by specific property IDs'),
  property_groups_ids: z.array(z.string()).optional().describe('Filter by property group IDs'),
  portfolios_ids: z.array(z.string()).optional().describe('Filter by portfolio IDs'),
  owners_ids: z.array(z.string()).optional().describe('Filter by owner IDs'),
  posted_on_from: z.string().describe('Start date for the posting period (YYYY-MM-DD) - Required'),
  posted_on_to: z.string().describe('End date for the posting period (YYYY-MM-DD) - Required'),
  gl_account_map_id: z.string().optional().describe('Filter by GL account map ID'),
  exclude_suppressed_fees: z.string().optional().describe('Exclude suppressed fees ("0" or "1")'),
  columns: z.array(z.string()).optional().describe('Specific columns to include'),
};

// Schema for internal validation (with nested properties structure)
const cashflowValidationSchema = z.object({
  property_visibility: z.string(),
  properties_ids: z.array(z.string()).optional(),
  property_groups_ids: z.array(z.string()).optional(),
  portfolios_ids: z.array(z.string()).optional(),
  owners_ids: z.array(z.string()).optional(),
  posted_on_from: z.string(),
  posted_on_to: z.string(),
  gl_account_map_id: z.string().optional(),
  exclude_suppressed_fees: z.string().optional(),
  columns: z.array(z.string()).optional(),
});

// Transform flat input to nested API format
function transformToApiArgs(input: z.infer<typeof cashflowValidationSchema>): CashflowReportArgs {
  const { properties_ids, property_groups_ids, portfolios_ids, owners_ids, ...rest } = input;
  
  const hasProperties = properties_ids || property_groups_ids || portfolios_ids || owners_ids;
  
  return {
    ...rest,
    ...(hasProperties && {
      properties: {
        ...(properties_ids && { properties_ids }),
        ...(property_groups_ids && { property_groups_ids }),
        ...(portfolios_ids && { portfolios_ids }),
        ...(owners_ids && { owners_ids }),
      }
    })
  };
}

export function registerCashflowReportTool(server: McpServer) {
  server.tool(
    "get_cashflow_report",
    "Returns Cash Flow Details including income and expenses for given time period.",
    cashflowInputSchema,
    async (args, _extra: unknown) => {
      try {
        // Validate arguments against schema
        const parseResult = cashflowValidationSchema.safeParse(args);
        if (!parseResult.success) {
          const errorMessages = parseResult.error.errors.map(err => 
            `${err.path.join('.')}: ${err.message}`
          ).join('; ');
          throw new Error(`Invalid arguments: ${errorMessages}`);
        }

        const apiArgs = transformToApiArgs(parseResult.data);
        const result = await getCashflowReport(apiArgs);
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
        console.error(`Cashflow Report Error:`, errorMessage);
        throw error;
      }
    }
  );
}
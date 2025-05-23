import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { makeAppfolioApiCall } from '../appfolio';

// Type definitions copied from src/appfolio.ts
export type AgedPayablesSummaryArgs = {
  property_visibility?: string; // Default handled by Zod schema
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

// Zod schema copied from src/index.ts
const agedPayablesSummaryInputSchema = z.object({
  property_visibility: z.string().default("active"),
  properties: z.object({
    properties_ids: z.array(z.string()).optional(),
    property_groups_ids: z.array(z.string()).optional(),
    portfolios_ids: z.array(z.string()).optional(),
    owners_ids: z.array(z.string()).optional(),
  }).optional(),
  occurred_on: z.string(),
  party_contact_info: z.object({
    company_id: z.string().optional()
  }).optional(),
  balance_operator: z.object({
    amount: z.string().optional(),
    comparator: z.string().optional()
  }).optional(),
  columns: z.array(z.string()).optional(),
});

// Function definition copied from src/appfolio.ts
export async function getAgedPayablesSummaryReport(args: AgedPayablesSummaryArgs): Promise<AgedPayablesSummaryResult> {
  if (!args.occurred_on) {
    throw new Error('Missing required argument: occurred_on (format YYYY-MM-DD)');
  }

  const { property_visibility = "active", ...rest } = args;
  const payload = { property_visibility, ...rest };

  return makeAppfolioApiCall<AgedPayablesSummaryResult>('aged_payables_summary.json', payload);
}

// MCP Tool Registration Function
export function registerAgedPayablesSummaryReportTool(server: McpServer) {
  server.tool(
    "get_aged_payables_summary_report",
    "Returns aged payables summary for the given filters.",
    agedPayablesSummaryInputSchema.shape,
    async (args: any, _extra: any) => {
      // Zod schema handles defaults
      const data = await getAgedPayablesSummaryReport(args as AgedPayablesSummaryArgs);
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

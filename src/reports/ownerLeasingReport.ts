import axios from 'axios';
import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { appfolioLimiter } from '../appfolio';

const { VHOST, USERNAME, PASSWORD } = process.env;

// --- Owner Leasing Report Types ---
export type OwnerLeasingArgs = {
  properties?: {
    properties_ids?: string[];
    property_groups_ids?: string[];
    portfolios_ids?: string[];
    owners_ids?: string[];
  };
  received_on_from: string; // Required (YYYY-MM-DD)
  received_on_to: string; // Required (YYYY-MM-DD)
  include_units_which_are_not_rent_ready?: "0" | "1";
  include_units_which_are_hidden_from_the_vacancies_dashboard?: "0" | "1";
  columns?: string[];
};

export type OwnerLeasingResultItem = {
  property: string;
  unit: string;
  applied_to: string | null;
  unit_type: string;
  market_rent: string | null;
  inquiries: number;
  showings: number;
  applications: number;
  approved_applications: number;
  converted_tenants: number;
  property_id: string; // Note: API doc says string, but example shows number. Using string as per doc.
  unit_id: number;
  computed_market_rent: string | null;
};

export type OwnerLeasingResult = {
  results: OwnerLeasingResultItem[];
  next_page_url: string | null;
};

// Zod schema for Owner Leasing Report arguments
export const ownerLeasingArgsSchema = z.object({
  properties: z.object({
    properties_ids: z.array(z.string()).optional(),
    property_groups_ids: z.array(z.string()).optional(),
    portfolios_ids: z.array(z.string()).optional(),
    owners_ids: z.array(z.string()).optional()
  }).optional().describe('Filter results based on properties, groups, portfolios, or owners'),
  received_on_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The start date for the reporting period based on received date (YYYY-MM-DD). Required.'),
  received_on_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The end date for the reporting period based on received date (YYYY-MM-DD). Required.'),
  include_units_which_are_not_rent_ready: z.enum(["0", "1"]).optional().default("0").describe('Include units that are not marked as rent ready. Defaults to "0" (false)'),
  include_units_which_are_hidden_from_the_vacancies_dashboard: z.enum(["0", "1"]).optional().default("0").describe('Include units hidden from the vacancies dashboard. Defaults to "0" (false)'),
  columns: z.array(z.string()).optional().describe('Array of specific columns to include in the report')
});

// --- Owner Leasing Report Function ---
export async function getOwnerLeasingReport(args: OwnerLeasingArgs): Promise<OwnerLeasingResult> {
  if (!VHOST || !USERNAME || !PASSWORD) throw new Error('Missing AppFolio API credentials');
  if (!args.received_on_from || !args.received_on_to) {
    throw new Error('Missing required arguments: received_on_from and received_on_to (format YYYY-MM-DD)');
  }

  // Defaults are handled by Zod now
  const payload = { ...args };

  const url = `https://${VHOST}.appfolio.com/api/v2/reports/owner_leasing.json`;
  const response = await appfolioLimiter.schedule(() => axios.post(url, payload, {
    auth: { username: USERNAME, password: PASSWORD },
    headers: { 'Content-Type': 'application/json' },
  }));

  return response.data;
}

// --- Register Owner Leasing Report Tool ---
export function registerOwnerLeasingReportTool(server: McpServer) {
  server.tool(
    "get_owner_leasing_report",
    "Provides a leasing report tailored for property owners, showing leasing activity within a specified date range.",
    ownerLeasingArgsSchema.shape,
    async (args: OwnerLeasingArgs) => {
      const data = await getOwnerLeasingReport(args);
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

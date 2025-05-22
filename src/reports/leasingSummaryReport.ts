import axios from 'axios';
import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { appfolioLimiter } from '../appfolio'; // Assuming appfolioLimiter is exported from appfolio.ts

const { VHOST, USERNAME, PASSWORD } = process.env;

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
    properties_ids: z.array(z.string()).optional(),
    property_groups_ids: z.array(z.string()).optional(),
    portfolios_ids: z.array(z.string()).optional(),
    owners_ids: z.array(z.string()).optional()
  }).optional().describe('Filter results based on properties, groups, portfolios, or owners'),
  unit_visibility: z.enum(["active", "hidden", "all"]).default("active").describe('Filter units by status. Defaults to "active"'),
  posted_on_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The start date for the reporting period (YYYY-MM-DD). Required.'),
  posted_on_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The end date for the reporting period (YYYY-MM-DD). Required.'),
  columns: z.array(z.string()).optional().describe('Array of specific columns to include in the report')
});

// --- Leasing Summary Report Function ---
export async function getLeasingSummaryReport(args: LeasingSummaryArgs): Promise<LeasingSummaryResult> {
  if (!VHOST || !USERNAME || !PASSWORD) throw new Error('Missing AppFolio API credentials');
  // Validation for posted_on_from and posted_on_to is handled by Zod schema regex

  // Default for unit_visibility is handled by Zod schema
  const payload = {
    ...args
  };

  const url = `https://${VHOST}.appfolio.com/api/v2/reports/leasing_summary.json`;
  const response = await appfolioLimiter.schedule(() => axios.post(url, payload, {
    auth: { username: USERNAME, password: PASSWORD },
    headers: { 'Content-Type': 'application/json' },
  }));

  return response.data;
}

// --- Register Leasing Summary Report Tool ---
export function registerLeasingSummaryReportTool(server: McpServer) {
  server.tool(
    "get_leasing_summary_report",
    "Provides a summary of leasing activities, including inquiries, showings, applications, and move-ins/outs.",
    leasingSummaryArgsSchema.shape,
    async (args: LeasingSummaryArgs, _extra: unknown) => {
      const data = await getLeasingSummaryReport(args);
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

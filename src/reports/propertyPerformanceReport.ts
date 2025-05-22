import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import axios from 'axios';
import { appfolioLimiter } from '../appfolio';

const { VHOST, USERNAME, PASSWORD } = process.env;

// --- Property Performance Report Types ---
export type PropertyPerformanceArgs = {
  property_visibility?: "active" | "hidden" | "all";
  properties?: {
    properties_ids?: string[];
    property_groups_ids?: string[];
    portfolios_ids?: string[];
    owners_ids?: string[];
  };
  gl_account_ids?: string[];
  posted_on_from: string; 
  posted_on_to: string; 
  columns?: string[];
};

export type PropertyPerformanceResult = {
  results: Array<{
    property: string;
    property_name: string;
    property_id: number;
    property_address: string;
    property_street: string;
    property_street2: string | null;
    property_city: string;
    property_state: string;
    property_zip: string;
    units: number;
    gl_accounts: Array<{ id: number; value: string }>;
    commission_percent: string | null;
    site_manager: string | null;
    property_group_id: string | null;
    portfolio_id: number | null;
  }>;
  next_page_url: string | null;
};

// Zod schema for Property Performance Report arguments
export const propertyPerformanceArgsSchema = z.object({
  property_visibility: z.enum(["active", "hidden", "all"]).default("active").describe('Filter properties by status. Defaults to "active"'),
  properties: z.object({
    properties_ids: z.array(z.string()).optional(),
    property_groups_ids: z.array(z.string()).optional(),
    portfolios_ids: z.array(z.string()).optional(),
    owners_ids: z.array(z.string()).optional()
  }).optional().describe('Filter results based on properties, groups, portfolios, or owners'),
  gl_account_ids: z.array(z.string()).optional().describe('Filter results by specific GL Account IDs'),
  posted_on_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The start date for the reporting period (YYYY-MM-DD). Required.'),
  posted_on_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The end date for the reporting period (YYYY-MM-DD). Required.'),
  columns: z.array(z.string()).optional().describe('Array of specific columns to include in the report')
});

// --- Property Performance Report Function ---
export async function getPropertyPerformanceReport(args: PropertyPerformanceArgs): Promise<PropertyPerformanceResult> {
  if (!VHOST || !USERNAME || !PASSWORD) throw new Error('Missing AppFolio API credentials');
  // Validation for posted_on_from and posted_on_to is now handled by Zod schema

  const payload = { ...args };

  const url = `https://${VHOST}.appfolio.com/api/v2/reports/property_performance.json`;
  const response = await appfolioLimiter.schedule(() => axios.post(url, payload, {
    auth: { username: USERNAME, password: PASSWORD },
    headers: { 'Content-Type': 'application/json' },
  }));

  return response.data;
}

export function registerPropertyPerformanceReportTool(server: McpServer) {
  server.tool(
    'get_property_performance_report',
    'Retrieves the Property Performance report, showing financial performance metrics for properties within a specified date range.',
    propertyPerformanceArgsSchema.shape,
    async (args: PropertyPerformanceArgs) => {
      const reportData = await getPropertyPerformanceReport(args);
      return {
        content: [{ type: 'text', text: JSON.stringify(reportData, null, 2) }],
      };
    }
  );
}

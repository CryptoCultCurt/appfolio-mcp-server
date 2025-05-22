import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import axios from 'axios';
import { appfolioLimiter } from '../appfolio';

const { VHOST, USERNAME, PASSWORD } = process.env;

// --- Property Source Tracking Report Types ---
export type PropertySourceTrackingArgs = {
  properties?: {
    properties_ids?: string[];
    property_groups_ids?: string[];
    portfolios_ids?: string[];
    owners_ids?: string[];
  };
  unit_visibility?: "active" | "hidden" | "all"; // Defaults to "active"
  received_on_from: string; // Required (YYYY-MM-DD)
  received_on_to: string; // Required (YYYY-MM-DD)
  columns?: string[];
};

export type PropertySourceTrackingResult = {
  results: Array<{
    source: string;
    guest_card_inquiries: number;
    showings: number;
    applications: number;
    approved_applications: number;
    converted_tenants: number;
  }>;
  next_page_url: string | null;
};

// --- Property Source Tracking Report Function ---
export async function getPropertySourceTrackingReport(args: PropertySourceTrackingArgs): Promise<PropertySourceTrackingResult> {
  if (!VHOST || !USERNAME || !PASSWORD) throw new Error('Missing AppFolio API credentials');
  if (!args.received_on_from || !args.received_on_to) {
    throw new Error('Missing required arguments: received_on_from and received_on_to (format YYYY-MM-DD)');
  }

  const { unit_visibility = "active", ...rest } = args;

  const payload = {
    unit_visibility,
    ...rest
  };

  const url = `https://${VHOST}.appfolio.com/api/v2/reports/prospect_source_tracking.json`;
  const response = await appfolioLimiter.schedule(() => axios.post(url, payload, {
    auth: { username: USERNAME, password: PASSWORD },
    headers: { 'Content-Type': 'application/json' },
  }));

  return response.data;
}

// Zod schema for Property Source Tracking Report arguments
const propertySourceTrackingInputSchema = z.object({
  properties: z.object({
    properties_ids: z.array(z.string()).optional(),
    property_groups_ids: z.array(z.string()).optional(),
    portfolios_ids: z.array(z.string()).optional(),
    owners_ids: z.array(z.string()).optional()
  }).optional().describe('Filter results based on properties, groups, portfolios, or owners'),
  unit_visibility: z.enum(["active", "hidden", "all"]).optional().describe('Filter units by status. Defaults to "active"'),
  received_on_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The start date for the reporting period based on received date (YYYY-MM-DD). Required.'),
  received_on_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The end date for the reporting period based on received date (YYYY-MM-DD). Required.'),
  columns: z.array(z.string()).optional().describe('Array of specific columns to include in the report')
});

// MCP Tool Registration Function
export function registerPropertySourceTrackingReportTool(server: McpServer) {
  server.tool(
    "get_property_source_tracking_report",
    "Returns property source tracking report for the given filters.",
    propertySourceTrackingInputSchema.shape,
    async (args: any, _extra: any) => {
      const data = await getPropertySourceTrackingReport(args as PropertySourceTrackingArgs);
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

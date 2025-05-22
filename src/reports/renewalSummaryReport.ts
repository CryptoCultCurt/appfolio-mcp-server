import axios from 'axios';
import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { appfolioLimiter } from '../appfolio';

const { VHOST, USERNAME, PASSWORD } = process.env;

// --- Renewal Summary Report Types ---
export type RenewalStatus = "all" | "awaiting_response" | "countersigned" | "pending" | "skipped" | "notice_to_vacate";


export type RenewalSummaryArgs = {
    properties?: {
      properties_ids?: string[];
      property_groups_ids?: string[];
      portfolios_ids?: string[];
      owners_ids?: string[];
    };
    unit_visibility?: "active" | "hidden" | "all"; // Defaults to "active"
    start_on_from: string; // Required (YYYY-MM)
    start_on_to: string; // Required (YYYY-MM)
    statuses?: RenewalStatus[]; // Defaults to ["all"]
    include_tenant_transfers?: "0" | "1"; // Defaults to "0"
    columns?: string[];
  };
  
  export type RenewalSummaryResult = {
    results: Array<{
      unit_name: string;
      property: string;
      property_name: string;
      property_id: number;
      property_address: string;
      property_street: string;
      property_street2: string | null;
      property_city: string;
      property_state: string;
      property_zip: string;
      unit_type: string;
      unit_id: number;
      occupancy_id: number;
      tenant_name: string;
      lease_start: string | null;
      lease_end: string | null;
      previous_lease_start: string | null;
      previous_lease_end: string | null;
      previous_rent: string | null;
      rent: string | null;
      respond_by_date: string | null;
      renewal_sent_date: string | null;
      countersigned_date: string | null;
      automatic_renewal_date: string | null;
      percent_difference: string | null;
      dollar_difference: string | null;
      status: string;
      term: string | null;
      lease_start_month: string | null;
      tenant_id: number;
      tenant_tags: string | null;
      tenant_agent: string | null;
      lease_uuid: string | null;
      lease_document_uuid: string | null;
      notice_given_date: string | null;
      move_out: string | null;
    }>;
    next_page_url: string | null;
  };

  // Zod schema for Renewal Summary Report arguments
const renewalStatusSchema = z.enum(["all", "awaiting_response", "countersigned", "pending", "skipped", "notice_to_vacate"]);
const renewalSummaryArgsSchema = z.object({
  properties: z.object({
    properties_ids: z.array(z.string()).optional(),
    property_groups_ids: z.array(z.string()).optional(),
    portfolios_ids: z.array(z.string()).optional(),
    owners_ids: z.array(z.string()).optional()
  }).optional().describe('Filter results based on properties, groups, portfolios, or owners'),
  unit_visibility: z.enum(["active", "hidden", "all"]).optional().describe('Filter units by status. Defaults to "active"'),
  start_on_from: z.string().regex(/^\d{4}-\d{2}$/, "Date must be in YYYY-MM format").describe('The start month for the reporting period based on lease start date (YYYY-MM). Required.'),
  start_on_to: z.string().regex(/^\d{4}-\d{2}$/, "Date must be in YYYY-MM format").describe('The end month for the reporting period based on lease start date (YYYY-MM). Required.'),
  statuses: z.array(renewalStatusSchema).optional().default(["all"]).describe('Filter by renewal status. Defaults to [\"all\"]'),
  include_tenant_transfers: z.enum(["0", "1"]).optional().describe('Include tenant transfers in the report. Defaults to "0" (false)'),
  columns: z.array(z.string()).optional().describe('Array of specific columns to include in the report')
});

// --- Renewal Summary Report Function ---
export async function getRenewalSummaryReport(args: RenewalSummaryArgs): Promise<RenewalSummaryResult> {
    if (!VHOST || !USERNAME || !PASSWORD) throw new Error('Missing AppFolio API credentials');
    if (!args.start_on_from || !args.start_on_to) {
      throw new Error('Missing required arguments: start_on_from and start_on_to (format YYYY-MM)');
    }
  
    const {
      unit_visibility = "active",
      statuses = ["all"],
      include_tenant_transfers = "0",
      ...rest
    } = args;
  
    const payload = {
      unit_visibility,
      statuses,
      include_tenant_transfers,
      ...rest
    };
  
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/renewal_summary.json`;
    const response = await appfolioLimiter.schedule(() => axios.post(url, payload, {
      auth: { username: USERNAME, password: PASSWORD },
      headers: { 'Content-Type': 'application/json' },
    }));
  
    return response.data;
  }

  // --- Renewal Summary Report Tool ---
export function registerRenewalSummaryReportTool(server: McpServer) {
  server.tool(
    "get_renewal_summary_report",
    "Provides a summary of lease renewals.",
    renewalSummaryArgsSchema.shape,
    async (args, _extra: unknown) => {
      const data = await getRenewalSummaryReport(args);
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

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import axios from 'axios';
import dotenv from 'dotenv';
import { appfolioLimiter } from '../appfolio'; // Assuming appfolioLimiter is exported from appfolio.ts

dotenv.config();
const { VHOST, USERNAME, PASSWORD } = process.env;

// Zod schema for Cancelled Workflows Report arguments
export const cancelledWorkflowsArgsSchema = z.object({
  attachables: z.object({
    properties_ids: z.array(z.string()).optional(),
    units_ids: z.array(z.string()).optional(),
    tenants_ids: z.array(z.string()).optional(),
    owners_ids: z.array(z.string()).optional(),
    rental_applications_ids: z.array(z.string()).optional(),
    guest_cards_ids: z.array(z.string()).optional(),
    guest_card_interests_ids: z.array(z.string()).optional(),
    service_requests_ids: z.array(z.string()).optional(),
    vendors_ids: z.array(z.string()).optional()
  }).optional().describe('Filter results based on specific attached entities'),
  property_visibility: z.enum(["active", "hidden", "all"]).default("active").describe('Filter properties by status. Defaults to "active"'),
  properties: z.object({
    properties_ids: z.array(z.string()).optional(),
    property_groups_ids: z.array(z.string()).optional(),
    portfolios_ids: z.array(z.string()).optional()
  }).optional().describe('Filter results based on properties, groups, or portfolios'),
  process_template: z.string().default("All").describe('Filter by specific process template name. Defaults to "All"'),
  workflow_step: z.string().default("All").describe('Filter by specific workflow step name. Defaults to "All"'),
  assigned_user: z.string().default("All").describe('Filter by assigned user name. Defaults to "All"'),
  date_range_from: z.string().optional().describe('Start date for the cancellation date range (YYYY-MM-DD)'),
  date_range_to: z.string().optional().describe('End date for the cancellation date range (YYYY-MM-DD)'),
  cancelled_by: z.string().default("All").describe('Filter by the user who cancelled the workflow. Defaults to "All"'),
  columns: z.array(z.string()).optional().describe('Array of specific columns to include in the report')
});

// Type definitions for Cancelled Workflows Report
export type CancelledWorkflowsArgs = z.infer<typeof cancelledWorkflowsArgsSchema>;

export type CancelledWorkflowsResult = {
  results: Array<{
    attachable_for: string;
    property: string;
    workflow_name: string;
    cancelled_date: string;
    cancelled_by: string;
    cancellation_reason: string;
  }>;
  next_page_url: string;
};

// --- Cancelled Workflows Report Function ---
export async function getCancelledWorkflowsReport(args: CancelledWorkflowsArgs): Promise<CancelledWorkflowsResult> {
  if (!VHOST || !USERNAME || !PASSWORD) throw new Error('Missing AppFolio API credentials');

  // Defaults are handled by Zod schema now
  const payload = { ...args };

  const url = `https://${VHOST}.appfolio.com/api/v2/reports/cancelled_processes.json`;
  const response = await appfolioLimiter.schedule(() => axios.post(url, payload, {
    auth: { username: USERNAME, password: PASSWORD },
    headers: { 'Content-Type': 'application/json' },
  }));

  return response.data;
}

// Registration function for the tool
export function registerCancelledWorkflowsReportTool(server: McpServer) {
  server.tool(
    "get_cancelled_workflows_report",
    "Retrieves a report of cancelled workflows, allowing filtering by various criteria such as properties, process templates, and date ranges.",
    cancelledWorkflowsArgsSchema.shape,
    async (args: CancelledWorkflowsArgs) => {
      const result = await getCancelledWorkflowsReport(args);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
            mimeType: "application/json"
          }
        ]
      };
    }
  );
}

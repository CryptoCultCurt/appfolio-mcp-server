import axios from 'axios';
import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import dotenv from 'dotenv';
import { appfolioLimiter } from '../appfolio';

dotenv.config();

const { VHOST, USERNAME, PASSWORD } = process.env;

// Originally from src/appfolio.ts (lines 64-88)
export type InProgressWorkflowsArgs = {
  attachables?: {
    properties_ids?: string[];
    units_ids?: string[];
    tenants_ids?: string[];
    owners_ids?: string[];
    rental_applications_ids?: string[];
    guest_cards_ids?: string[];
    guest_card_interests_ids?: string[];
    service_requests_ids?: string[];
    vendors_ids?: string[];
  };
  property_visibility?: "active" | "hidden" | "all";
  properties?: {
    properties_ids?: string[];
    property_groups_ids?: string[];
    portfolios_ids?: string[];
  };
  process_template?: string;
  workflow_step?: string;
  assigned_user?: string;
  date_range_from?: string;
  date_range_to?: string;
  columns?: string[];
};

// Originally from src/appfolio.ts (lines 90-101)
export type InProgressWorkflowsResult = {
  results: Array<{
    attachable_for: string;
    property: string;
    workflow_name: string;
    current_step: string;
    status: string;
    due_date: string;
    assigned_to: string;
  }>;
  next_page_url: string;
};

// Originally from src/index.ts (line 76), with defaults added
const inProgressWorkflowsArgsSchema = z.object({
  attachables: z.object({
    properties_ids: z.array(z.string()).optional(),
    units_ids: z.array(z.string()).optional(),
    tenants_ids: z.array(z.string()).optional(),
    owners_ids: z.array(z.string()).optional(),
    rental_applications_ids: z.array(z.string()).optional(),
    guest_cards_ids: z.array(z.string()).optional(),
    guest_card_interests_ids: z.array(z.string()).optional(),
    service_requests_ids: z.array(z.string()).optional(),
    vendors_ids: z.array(z.string()).optional(),
  }).optional().describe('Filter results based on specific attached entities'),
  property_visibility: z.enum(["active", "hidden", "all"]).default("active").optional().describe('Filter properties by status. Defaults to "active"'),
  properties: z.object({
    properties_ids: z.array(z.string()).optional(),
    property_groups_ids: z.array(z.string()).optional(),
    portfolios_ids: z.array(z.string()).optional(),
  }).optional().describe('Filter results based on properties, groups, or portfolios'),
  process_template: z.string().default("All").optional().describe('Filter by specific process template name. Defaults to "All"'),
  workflow_step: z.string().default("All").optional().describe('Filter by specific workflow step name. Defaults to "All"'),
  assigned_user: z.string().default("All").optional().describe('Filter by assigned user name. Defaults to "All"'),
  date_range_from: z.string().optional().describe('Start date for the due date range (YYYY-MM-DD)'),
  date_range_to: z.string().optional().describe('End date for the due date range (YYYY-MM-DD)'),
  columns: z.array(z.string()).optional().describe('Array of specific columns to include in the report')
});

// Originally from src/appfolio.ts (function starting line 1517)
export async function getInProgressWorkflowsReport(args: InProgressWorkflowsArgs): Promise<InProgressWorkflowsResult> {
  if (!VHOST || !USERNAME || !PASSWORD) {
    throw new Error('Missing AppFolio API credentials');
  }

  // Defaults are now handled by Zod schema
  const payload = args;

  const url = `https://${VHOST}.appfolio.com/api/v2/reports/in_progress_workflows.json`;
  const response = await appfolioLimiter.schedule(() => axios.post(url, payload, {
    auth: { username: USERNAME, password: PASSWORD },
    headers: { 'Content-Type': 'application/json' },
  }));

  return response.data;
}

// New registration function for MCP
export function registerInProgressWorkflowsReportTool(server: McpServer) {
  server.tool(
    "get_in_progress_workflows_report",
    "Returns a report of in-progress workflows based on the provided filters.", // Description from original registration
    inProgressWorkflowsArgsSchema.shape,
    async (toolArgs: z.infer<typeof inProgressWorkflowsArgsSchema>) => {
      const data = await getInProgressWorkflowsReport(toolArgs as InProgressWorkflowsArgs);
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

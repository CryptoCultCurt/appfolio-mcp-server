import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { makeAppfolioApiCall } from '../appfolio';

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
    portfolios_id: z.array(z.string()).optional()
  }).optional().describe('Filter results based on properties, groups, or portfolios'),
  process_template: z.string().default("All").describe('Filter by specific process template name. Defaults to "All"'),
  workflow_step: z.string().default("All").describe('Filter by specific workflow step name. Defaults to "All"'),
  assigned_user: z.string().default("All").describe('Filter by assigned user ID or "All". Defaults to "All". NOTE: Expects numeric user IDs (e.g. "4"), not user names. There is no user directory report available to lookup IDs by name.'),
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
  const { property_visibility = "active", ...rest } = args;
  const payload = { property_visibility, ...rest };

  return makeAppfolioApiCall<CancelledWorkflowsResult>('cancelled_processes.json', payload);
}

// Registration function for the tool
export function registerCancelledWorkflowsReportTool(server: McpServer) {
  server.tool(
    "get_cancelled_workflows_report",
    "Retrieves a report of cancelled workflows, allowing filtering by various criteria such as properties, process templates, and date ranges.",
    cancelledWorkflowsArgsSchema.shape as any,
    async (args, _extra: unknown) => {
      try {
        // Validate arguments against schema
        const parseResult = cancelledWorkflowsArgsSchema.safeParse(args);
        if (!parseResult.success) {
          const errorMessages = parseResult.error.errors.map(err => 
            `${err.path.join('.')}: ${err.message}`
          ).join('; ');
          throw new Error(`Invalid arguments: ${errorMessages}`);
        }

        const result = await getCancelledWorkflowsReport(parseResult.data);
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
        console.error(`Cancelled Workflows Report Error:`, errorMessage);
        throw error;
      }
    }
  );
}

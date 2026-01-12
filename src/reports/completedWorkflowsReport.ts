import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { makeAppfolioApiCall } from '../appfolio';
import { validateWorkflowIds, validatePropertiesIds, throwOnValidationErrors, getIdFieldDescription } from '../validation';

// Originally from src/appfolio.ts (lines 62-86)
export type CompletedWorkflowsArgs = {
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
  assigned_user?: string; // User ID or "All", defaults to "All"
  date_range_from?: string;
  date_range_to?: string;
  columns?: string[];
};

// Originally from src/appfolio.ts (lines 88-95)
export type CompletedWorkflowsResult = {
  results: Array<{
    attachable_for: string;
    property: string;
    workflow_name: string;
    completed_date: string;
  }>;
  next_page_url: string;
};

// Originally from src/index.ts (line 74), with defaults added
const completedWorkflowsArgsSchema = z.object({
  attachables: z.object({
    properties_ids: z.array(z.string()).optional().describe(getIdFieldDescription('properties_ids', 'Property', 'Property Directory Report')),
    units_ids: z.array(z.string()).optional().describe(getIdFieldDescription('units_ids', 'Unit', 'Unit Directory Report')),
    tenants_ids: z.array(z.string()).optional().describe(getIdFieldDescription('tenants_ids', 'Tenant', 'Tenant Directory Report')),
    owners_ids: z.array(z.string()).optional().describe(getIdFieldDescription('owners_ids', 'Owner', 'Owner Directory Report')),
    rental_applications_ids: z.array(z.string()).optional().describe(getIdFieldDescription('rental_applications_ids', 'Rental Application')),
    guest_cards_ids: z.array(z.string()).optional().describe(getIdFieldDescription('guest_cards_ids', 'Guest Card')),
    guest_card_interests_ids: z.array(z.string()).optional().describe(getIdFieldDescription('guest_card_interests_ids', 'Guest Card Interest')),
    service_requests_ids: z.array(z.string()).optional().describe(getIdFieldDescription('service_requests_ids', 'Service Request')),
    vendors_ids: z.array(z.string()).optional().describe(getIdFieldDescription('vendors_ids', 'Vendor', 'Vendor Directory Report')),
  }).optional().describe('Filter results based on specific attached entities. All ID fields must be numeric strings, not names.'),
  property_visibility: z.enum(["active", "hidden", "all"]).default("active").describe('Filter by property visibility. Defaults to "active"'),
  properties: z.object({
    properties_ids: z.array(z.string()).optional().describe(getIdFieldDescription('properties_ids', 'Property', 'Property Directory Report')),
    property_groups_ids: z.array(z.string()).optional().describe(getIdFieldDescription('property_groups_ids', 'Property Group')),
    portfolios_ids: z.array(z.string()).optional().describe(getIdFieldDescription('portfolios_ids', 'Portfolio')),
  }).optional().describe('Filter results based on properties, groups, or portfolios. All ID fields must be numeric strings, not names.'),
  process_template: z.string().default("All").optional().describe('Filter by specific process template name. Defaults to "All"'),
  workflow_step: z.string().default("All").optional().describe('Filter by specific workflow step name. Defaults to "All"'),
  assigned_user: z.string().default("All").optional().describe('Filter by assigned user ID or "All". Defaults to "All". NOTE: Expects numeric user IDs (e.g. "4"), not user names. There is no user directory report available to lookup IDs by name.'),
  date_range_from: z.string().optional().describe('Start date for the completion date range (YYYY-MM-DD)'),
  date_range_to: z.string().optional().describe('End date for the completion date range (YYYY-MM-DD)'),
  columns: z.array(z.string()).optional().describe('Array of specific columns to include in the report')
});

// Originally from src/appfolio.ts (function starting line 1582)
export async function getCompletedWorkflowsReport(args: CompletedWorkflowsArgs): Promise<CompletedWorkflowsResult> {
  // Validate ID fields
  const validationErrors: any[] = [];
  
  if (args.attachables) {
    validationErrors.push(...validateWorkflowIds(args.attachables));
  }
  
  if (args.properties) {
    validationErrors.push(...validatePropertiesIds(args.properties));
  }
  
  throwOnValidationErrors(validationErrors);

  const { property_visibility = "active", ...rest } = args;
  const payload = { property_visibility, ...rest };

  return makeAppfolioApiCall<CompletedWorkflowsResult>('completed_processes.json', payload);
}

// New registration function for MCP
export function registerCompletedWorkflowsReportTool(server: McpServer) {
  server.tool(
    "get_completed_workflows_report",
    "Returns a report of completed workflows (processes) based on the provided filters. IMPORTANT: All ID parameters (owners_ids, properties_ids, units_ids, etc.) must be numeric strings (e.g. '123'), NOT names. Use directory reports first to lookup IDs by name if needed.",
    completedWorkflowsArgsSchema.shape as any,
    async (toolArgs: z.infer<typeof completedWorkflowsArgsSchema>) => {
      const data = await getCompletedWorkflowsReport(toolArgs as CompletedWorkflowsArgs);
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

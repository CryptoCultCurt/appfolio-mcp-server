import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { makeAppfolioApiCall } from '../appfolio';

// --- Work Order Labor Summary Report Types ---
export type WorkOrderLaborSummaryArgs = {
  property_visibility?: "active" | "hidden" | "all";
  properties?: {
    properties_ids?: string[];
    property_groups_ids?: string[];
    portfolios_ids?: string[];
    owners_ids?: string[];
  };
  maintenance_tech?: string;
  work_order_statuses?: string[];
  unit_turn?: "1" | "0";
  labor_performed_from: string;
  labor_performed_to: string;
  columns?: string[];
};

export type WorkOrderLaborSummaryResult = {
  results: Array<{
    work_order_number: string | null;
    date: string | null;
    maintenance_tech: string | null;
    property_name: string | null;
    unit_name: string | null;
    start_time: string | null;
    end_time: string | null;
    worked_hours: string | null;
    hours: string | null;
    marked_after_hours: string | null;
    hours_difference: string | null;
    work_order_status: string | null;
    description: string | null;
    last_edited_by: string | null;
    unit_turn_id: string | null;
    timer_start: string | null;
    timer_stop: string | null;
    gl_account: string | null;
    last_bill_created_at: string | null;
    work_order_issue: string | null;
    property_id: number | null;
    unit_id: number | null;
    work_order_id: number | null;
    service_request_id: number | null;
    labor_detail_id: number | null;
  }>;
  next_page_url: string | null;
};

// --- Zod Schema for Work Order Labor Summary Report arguments ---
export const workOrderLaborSummaryInputSchema = z.object({
  property_visibility: z.enum(["active", "hidden", "all"]).optional().default("active").describe('Filter properties by status. Defaults to "active"'),
  maintenance_tech: z.string().optional().default("All").describe('Filter by maintenance technician. Defaults to "All"'),
  labor_performed_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "labor_performed_from must be in YYYY-MM-DD format" }).describe('Start date for labor performed (YYYY-MM-DD)'),
  labor_performed_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "labor_performed_to must be in YYYY-MM-DD format" }).describe('End date for labor performed (YYYY-MM-DD)'),
  unit_turn: z.enum(["0", "1"]).optional().default("0").describe('Filter by unit turn. Defaults to "0" (false)'),
  properties: z.object({
    properties_ids: z.array(z.string()).optional(),
    property_groups_ids: z.array(z.string()).optional(),
    portfolios_ids: z.array(z.string()).optional(),
    owners_ids: z.array(z.string()).optional()
  }).optional().describe('Filter by specific properties, groups, portfolios, or owners'),
  columns: z.array(z.string()).optional().describe('Array of specific columns to include in the report'),
  // work_order_statuses is in WorkOrderLaborSummaryArgs but not in the original Zod schema from index.ts. Adding it as optional.
  work_order_statuses: z.array(z.string()).optional().describe('Filter by work order status IDs'),
});

// --- Work Order Labor Summary Report Function ---
export async function getWorkOrderLaborSummaryReport(args: WorkOrderLaborSummaryArgs): Promise<WorkOrderLaborSummaryResult> {
  if (!args.labor_performed_from || !args.labor_performed_to) {
    throw new Error('Missing required arguments: labor_performed_from and labor_performed_to (format YYYY-MM-DD)');
  }

  const { property_visibility = "active", ...rest } = args;
  const payload = { property_visibility, ...rest };

  return makeAppfolioApiCall<WorkOrderLaborSummaryResult>('work_order_labor_summary.json', payload);
}

// --- MCP Tool Registration Function ---
export function registerWorkOrderLaborSummaryReportTool(server: McpServer) {
  server.tool(
    "get_work_order_labor_summary_report",
    "Returns a report detailing work order labor based on specified filters.",
    workOrderLaborSummaryInputSchema.shape as any,
    async (args, _extra: unknown) => {
      try {
        // Validate arguments against schema
        const parseResult = workOrderLaborSummaryInputSchema.safeParse(args);
        if (!parseResult.success) {
          const errorMessages = parseResult.error.errors.map(err => 
            `${err.path.join('.')}: ${err.message}`
          ).join('; ');
          throw new Error(`Invalid arguments: ${errorMessages}`);
        }

        const result = await getWorkOrderLaborSummaryReport(parseResult.data);
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
        console.error(`Work Order Labor Summary Report Error:`, errorMessage);
        throw error;
      }
    }
  );
}

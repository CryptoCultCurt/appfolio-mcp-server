import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import axios from "axios";
import dotenv from "dotenv";
import { appfolioLimiter } from "../appfolio"; // Assuming appfolioLimiter is exported from appfolio.ts or a central place

dotenv.config();
const { VHOST, USERNAME, PASSWORD } = process.env;

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
export async function getWorkOrderLaborSummaryReport(args: z.infer<typeof workOrderLaborSummaryInputSchema>): Promise<WorkOrderLaborSummaryResult> {
  if (!VHOST || !USERNAME || !PASSWORD) throw new Error('Missing AppFolio API credentials');
  // Validation for labor_performed_from and labor_performed_to is handled by Zod schema

  // Defaults are handled by Zod schema
  const payload = { ...args };

  const url = `https://${VHOST}.appfolio.com/api/v2/reports/work_order_labor_summary.json`;
  const response = await appfolioLimiter.schedule(() => axios.post(url, payload, {
    auth: { username: USERNAME, password: PASSWORD },
    headers: { 'Content-Type': 'application/json' },
  }));

  return response.data;
}

// --- MCP Tool Registration Function ---
export function registerWorkOrderLaborSummaryReportTool(server: McpServer) {
  server.tool(
    "get_work_order_labor_summary_report",
    "Returns a report detailing work order labor based on specified filters.",
    workOrderLaborSummaryInputSchema.shape,
    async (args: z.infer<typeof workOrderLaborSummaryInputSchema>, _extra: unknown) => {
      const data = await getWorkOrderLaborSummaryReport(args);
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

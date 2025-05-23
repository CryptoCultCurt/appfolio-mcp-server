import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { makeAppfolioApiCall } from '../appfolio';

// Type definitions based on src/appfolio.ts (Step 180)
export type LeasingFunnelPerformanceArgs = {
  property_visibility?: string; 
  properties?: {
    properties_ids?: string[];
    property_groups_ids?: string[];
    portfolios_ids?: string[];
    owners_ids?: string[];
  };
  date_from: string; 
  date_to: string;   
  assigned_user_visibility?: string; 
  assigned_user?: string;            
  columns?: string[];
};

export type LeasingFunnelPerformanceResult = {
  results: Array<{
    assigned_inquiry_owner: string;
    assigned_inquiry_owner_id: number;
    property_name: string;
    property_id: number;
    inquiries: number;
    completed_showings: number;
    cancelled_showings: number;
    rental_apps: number;
    decision_pending: number;
    approved: number;
    denied: number;
    cancelled: number;
    signed_leases: number;
    move_ins: number;
    inquiries_to_completed_showings: string;
    completed_showings_to_apps: string;
    approved_app_rate: string;
    apps_to_signed_leases: string;
    inquiries_to_leases: string;
  }>;
  next_page_url: string;
};

// Zod schema based on src/index.ts (Step 184) and function defaults (Step 177)
const leasingFunnelPerformanceInputSchema = z.object({
  property_visibility: z.string().default("all"),
  properties: z.object({
    properties_ids: z.array(z.string()).optional(),
    property_groups_ids: z.array(z.string()).optional(),
    portfolios_ids: z.array(z.string()).optional(),
    owners_ids: z.array(z.string()).optional(),
  }).optional(),
  date_from: z.string(),
  date_to: z.string(),
  assigned_user_visibility: z.string().default("active"),
  assigned_user: z.string().default("All"),
  columns: z.array(z.string()).optional(),
});

// Function definition from src/appfolio.ts (Step 177)
export async function getLeasingFunnelPerformanceReport(args: LeasingFunnelPerformanceArgs): Promise<LeasingFunnelPerformanceResult> {
  if (!args.date_from || !args.date_to) {
    throw new Error('Missing required arguments: date_from and date_to (format YYYY-MM-DD)');
  }

  const { property_visibility = "active", ...rest } = args;
  const payload = { property_visibility, ...rest };

  return makeAppfolioApiCall<LeasingFunnelPerformanceResult>('leasing_funnel_performance.json', payload);
}

// MCP Tool Registration Function
export function registerLeasingFunnelPerformanceReportTool(server: McpServer) {
  server.tool(
    "get_leasing_funnel_performance_report",
    "Returns leasing funnel performance report for the given filters.",
    leasingFunnelPerformanceInputSchema.shape,
    async (args: any, _extra: any) => {
      const data = await getLeasingFunnelPerformanceReport(args as LeasingFunnelPerformanceArgs);
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

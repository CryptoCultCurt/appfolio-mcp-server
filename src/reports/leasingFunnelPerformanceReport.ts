import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { makeAppfolioApiCall } from '../appfolio';
import { validatePropertiesIds, throwOnValidationErrors, getIdFieldDescription } from '../validation';

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
    properties_ids: z.array(z.string()).optional().describe(getIdFieldDescription('properties_ids', 'Property', 'Property Directory Report')),
    property_groups_ids: z.array(z.string()).optional().describe(getIdFieldDescription('property_groups_ids', 'Property Group')),
    portfolios_ids: z.array(z.string()).optional().describe(getIdFieldDescription('portfolios_ids', 'Portfolio')),
    owners_ids: z.array(z.string()).optional().describe(getIdFieldDescription('owners_ids', 'Owner', 'Owner Directory Report')),
  }).optional().describe('Filter results based on properties, groups, portfolios, or owners. All ID fields must be numeric strings, not names.'),
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

  // Validate ID fields
  if (args.properties) {
    const validationErrors = validatePropertiesIds(args.properties);
    throwOnValidationErrors(validationErrors);
  }

  const { property_visibility = "active", ...rest } = args;
  const payload = { property_visibility, ...rest };

  return makeAppfolioApiCall<LeasingFunnelPerformanceResult>('leasing_funnel_performance.json', payload);
}

// MCP Tool Registration Function
export function registerLeasingFunnelPerformanceReportTool(server: McpServer) {
  server.tool(
    "get_leasing_funnel_performance_report",
    "Returns leasing funnel performance report for the given filters. IMPORTANT: All ID parameters (owners_ids, properties_ids, etc.) must be numeric strings (e.g. '123'), NOT names. Use respective directory reports first to lookup IDs by name if needed.",
    leasingFunnelPerformanceInputSchema.shape as any,
    async (args, _extra: unknown) => {
      try {
        // Validate arguments against schema
        const parseResult = leasingFunnelPerformanceInputSchema.safeParse(args);
        if (!parseResult.success) {
          const errorMessages = parseResult.error.errors.map(err => 
            `${err.path.join('.')}: ${err.message}`
          ).join('; ');
          throw new Error(`Invalid arguments: ${errorMessages}`);
        }

        const result = await getLeasingFunnelPerformanceReport(parseResult.data);
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
        console.error(`Leasing Funnel Performance Report Error:`, errorMessage);
        throw error;
      }
    }
  );
}

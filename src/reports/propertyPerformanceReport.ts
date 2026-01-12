import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { makeAppfolioApiCall } from '../appfolio';
import { validatePropertiesIds, throwOnValidationErrors, getIdFieldDescription } from '../validation';

// --- Property Performance Report Types ---
export type PropertyPerformanceArgs = {
  property_visibility?: "active" | "hidden" | "all";
  properties?: {
    properties_ids?: string[];
    property_groups_ids?: string[];
    portfolios_ids?: string[];
    owners_ids?: string[];
  };
  gl_account_ids?: string[];
  period_from: string; 
  period_to: string; 
  columns?: string[];
  report_format: "Current Year Actual" | "Last Year Actual" | "Prior Year Actual" | "Budget Comparison";
};

export type PropertyPerformanceResult = {
  results: Array<{
    property: string;
    property_name: string;
    property_id: number;
    property_address: string;
    property_street: string;
    property_street2: string | null;
    property_city: string;
    property_state: string;
    property_zip: string;
    units: number;
    gl_accounts: Array<{ id: number; value: string }>;
    commission_percent: string | null;
    site_manager: string | null;
    property_group_id: string | null;
    portfolio_id: number | null;
  }>;
  next_page_url: string | null;
};

// Zod schema for Property Performance Report arguments
export const propertyPerformanceArgsSchema = z.object({
  property_visibility: z.enum(["active", "hidden", "all"]).default("active").describe('Filter properties by status. Defaults to "active"'),
  properties: z.object({
    properties_ids: z.array(z.string()).optional().describe(getIdFieldDescription('properties_ids', 'Property', 'Property Directory Report')),
    property_groups_ids: z.array(z.string()).optional().describe(getIdFieldDescription('property_groups_ids', 'Property Group')),
    portfolios_ids: z.array(z.string()).optional().describe(getIdFieldDescription('portfolios_ids', 'Portfolio')),
    owners_ids: z.array(z.string()).optional().describe(getIdFieldDescription('owners_ids', 'Owner', 'Owner Directory Report'))
  }).optional().describe('Filter results based on properties, groups, portfolios, or owners. All ID fields must be numeric strings, not names.'),
  report_format: z.enum(["Current Year Actual", "Last Year Actual", "Prior Year Actual", "Budget Comparison"]).describe('Format for the property performance report. Required.'),
  period_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The start date for the reporting period (YYYY-MM-DD). Required.'),
  period_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The end date for the reporting period (YYYY-MM-DD). Required.'),
  columns: z.array(z.string()).optional().describe('Array of specific columns to include in the report. Note: Available columns depend on the report_format selected. Avoid generic names like "total_income" - check the API documentation for valid column names for this report.')
});

// --- Property Performance Report Function ---
export async function getPropertyPerformanceReport(args: PropertyPerformanceArgs): Promise<PropertyPerformanceResult> {
  if (!args.period_from || !args.period_to) {
    throw new Error('Missing required arguments: period_from and period_to (format YYYY-MM-DD)');
  }

  // Validate ID fields
  if (args.properties) {
    const validationErrors = validatePropertiesIds(args.properties);
    throwOnValidationErrors(validationErrors);
  }

  const { property_visibility = "active", ...rest } = args;
  
  // Filter out empty arrays and undefined/null values to clean up the payload
  const cleanPayload = {
    property_visibility,
    ...Object.fromEntries(
      Object.entries(rest).filter(([key, value]) => {
        if (value === null || value === undefined) return false;
        if (Array.isArray(value) && value.length === 0) return false;
        if (typeof value === 'object' && value !== null) {
          const filteredObj = Object.fromEntries(
            Object.entries(value).filter(([, val]) => {
              if (Array.isArray(val) && val.length === 0) return false;
              return val !== null && val !== undefined;
            })
          );
          return Object.keys(filteredObj).length > 0;
        }
        return true;
      })
    )
  };

  return makeAppfolioApiCall<PropertyPerformanceResult>('property_performance.json', cleanPayload);
}

export function registerPropertyPerformanceReportTool(server: McpServer) {
  server.tool(
    'get_property_performance_report',
    'Retrieves the Property Performance report, showing financial performance metrics for properties within a specified date range. IMPORTANT: All ID parameters (owners_ids, properties_ids, etc.) must be numeric strings (e.g. \'123\'), NOT names. Use respective directory reports first to lookup IDs by name if needed.',
    propertyPerformanceArgsSchema.shape as any,
    async (args: PropertyPerformanceArgs) => {
      const reportData = await getPropertyPerformanceReport(args);
      return {
        content: [{ type: 'text', text: JSON.stringify(reportData, null, 2) }],
      };
    }
  );
}

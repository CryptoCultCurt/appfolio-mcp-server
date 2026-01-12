import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { makeAppfolioApiCall } from '../appfolio';
import { validatePropertiesIds, throwOnValidationErrors, getIdFieldDescription } from '../validation';

// --- Unit Directory Report Types ---
export type UnitDirectoryArgs = {
    properties?: {
      properties_ids?: string[];
      property_groups_ids?: string[];
      portfolios_ids?: string[];
      owners_ids?: string[];
    };
    unit_visibility?: "active" | "hidden" | "all"; // Defaults to "active"
    tags?: string; // Comma-separated list of tags
    columns?: string[];
  };
  
  export type UnitDirectoryResult = {
    results: Array<{
      property: string | null;
      property_name: string | null;
      property_id: number | null;
      unit_address: string | null;
      unit_street: string | null;
      unit_street2: string | null;
      unit_city: string | null;
      unit_state: string | null;
      unit_zip: string | null;
      unit_name: string | null;
      market_rent: string | null;
      marketing_title: string | null;
      marketing_description: string | null;
      advertised_rent: string | null;
      posted_to_website: string | null;
      posted_to_internet: string | null;
      you_tube_url: string | null;
      default_deposit: string | null;
      sqft: number | null;
      bedrooms: number | null;
      bathrooms: string | null;
      unit_tags: string | null;
      unit_type: string | null;
      created_on: string | null;
      rentable: string | null;
      rubs_enabled: string | null;
      rubs_enabled_on: string | null;
      description: string | null;
      rent_status: string | null;
      legal_rent: string | null;
      application_fee: string | null;
      rent_ready: string | null;
      unit_id: number | null;
      computed_market_rent: string | null;
      ready_for_showing_on: string | null;
      visibility: string | null;
      rentable_uid: string | null;
      portfolio_id: number | null;
      unit_integration_id: string | null;
      unit_amenities: string | null;
      unit_appliances: string | null;
      unit_utilities: string | null;
      billed_as: string | null;
    }>;
    next_page_url: string | null;
  };

  // Zod schema for Unit Directory Report arguments
const unitDirectoryArgsSchema = z.object({
    properties: z.object({
      properties_ids: z.array(z.string()).optional().describe(getIdFieldDescription('properties_ids', 'Property', 'Property Directory Report')),
      property_groups_ids: z.array(z.string()).optional().describe(getIdFieldDescription('property_groups_ids', 'Property Group')),
      portfolios_ids: z.array(z.string()).optional().describe(getIdFieldDescription('portfolios_ids', 'Portfolio')),
      owners_ids: z.array(z.string()).optional().describe(getIdFieldDescription('owners_ids', 'Owner', 'Owner Directory Report'))
    }).optional().describe('Filter results based on properties, groups, portfolios, or owners. All ID fields must be numeric strings, not names.'),
    unit_visibility: z.enum(["active", "hidden", "all"]).optional().default("active").describe('Filter units by status. Defaults to "active"'),
    tags: z.string().optional().describe('Optional. Filter by a comma-separated list of tags (e.g., "bbq,deck").'),
    columns: z.array(z.string()).optional().describe('Array of specific columns to include in the report')
  });

// --- Unit Directory Report Function ---
export async function getUnitDirectoryReport(args: UnitDirectoryArgs): Promise<UnitDirectoryResult> {
    // Validate ID fields
    if (args.properties) {
      const validationErrors = validatePropertiesIds(args.properties);
      throwOnValidationErrors(validationErrors);
    }

    const { unit_visibility = "active", ...rest } = args;
    const payload = { unit_visibility, ...rest };
  
    return makeAppfolioApiCall<UnitDirectoryResult>('unit_directory.json', payload);
}

  // MCP Tool Registration Function
  export function registerUnitDirectoryReportTool(server: McpServer) {
    server.tool(
      "get_unit_directory_report",
      "Retrieves a unit directory report with details about units in properties. IMPORTANT: All ID parameters (owners_ids, properties_ids, etc.) must be numeric strings (e.g. '123'), NOT names. Use respective directory reports first to lookup IDs by name if needed.",
      unitDirectoryArgsSchema.shape as any,
      async (args, _extra: unknown) => {
        try {
          // Validate arguments against schema
          const parseResult = unitDirectoryArgsSchema.safeParse(args);
          if (!parseResult.success) {
            const errorMessages = parseResult.error.errors.map(err => 
              `${err.path.join('.')}: ${err.message}`
            ).join('; ');
            throw new Error(`Invalid arguments: ${errorMessages}`);
          }

          const result = await getUnitDirectoryReport(parseResult.data);
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
          console.error(`Unit Directory Report Error:`, errorMessage);
          throw error;
        }
      }
    );
  }
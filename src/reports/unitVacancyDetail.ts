import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { makeAppfolioApiCall } from '../appfolio';
import { validatePropertiesIds, throwOnValidationErrors, getIdFieldDescription } from '../validation';

// --- Unit Vacancy Detail Report Types ---
export type UnitVacancyDetailArgs = {
    properties?: {
      properties_ids?: string[];
      property_groups_ids?: string[];
      portfolios_ids?: string[];
      owners_ids?: string[];
    };
    property_visibility?: "active" | "hidden" | "all"; // Defaults to "active"
    tags?: string; // Comma-separated list of tags
    columns?: string[];
  };
  
  export type UnitVacancyDetailResult = {
    results: Array<{
      advertised_rent: string | null;
      posted_to_website: string | null;
      posted_to_internet: string | null;
      property: string | null;
      property_name: string | null;
      amenities: string | null;
      lockbox_enabled: string | null;
      affordable_program: string | null;
      address: string | null;
      street: string | null;
      street2: string | null;
      city: string | null;
      state: string | null;
      zip: string | null;
      unit: string | null;
      unit_tags: string | null;
      unit_type: string | null;
      bed_and_bath: string | null;
      sqft: number | null;
      unit_status: string | null;
      rent_ready: string | null;
      days_vacant: number | null;
      last_rent: string | null;
      schd_rent: string | null;
      new_rent: string | null;
      last_move_in: string | null;
      last_move_out: string | null;
      available_on: string | null;
      next_move_in: string | null;
      description: string | null;
      amenities_price: string | null;
      computed_market_rent: string | null;
      ready_for_showing_on: string | null;
      unit_turn_target_date: string | null;
      advertised_rent_months: Array<Record<string, unknown>>; // Array of objects, structure not fully defined
      property_id: number | null;
      unit_id: number | null;
    }>;
    next_page_url: string | null;
  };

  // Valid column names for Unit Vacancy Detail Report
  const UNIT_VACANCY_DETAIL_COLUMNS = [
    'advertised_rent',
    'posted_to_website', 
    'posted_to_internet',
    'property',
    'property_name',
    'amenities',
    'lockbox_enabled',
    'affordable_program',
    'address',
    'street',
    'street2',
    'city',
    'state',
    'zip',
    'unit',
    'unit_tags',
    'unit_type',
    'bed_and_bath',
    'sqft',
    'unit_status',
    'rent_ready',
    'days_vacant',
    'last_rent',
    'schd_rent',
    'new_rent',
    'last_move_in',
    'last_move_out',
    'available_on',
    'next_move_in',
    'description',
    'amenities_price',
    'computed_market_rent',
    'ready_for_showing_on',
    'unit_turn_target_date',
    'advertised_rent_months',
    'property_id',
    'unit_id'
  ] as const;

  // Zod schema for Unit Vacancy Detail Report arguments
const unitVacancyDetailArgsSchema = z.object({
    properties: z.object({
      properties_ids: z.array(z.string()).optional().describe(getIdFieldDescription('properties_ids', 'Property', 'Property Directory Report')),
      property_groups_ids: z.array(z.string()).optional().describe(getIdFieldDescription('property_groups_ids', 'Property Group')),
      portfolios_ids: z.array(z.string()).optional().describe(getIdFieldDescription('portfolios_ids', 'Portfolio')),
      owners_ids: z.array(z.string()).optional().describe(getIdFieldDescription('owners_ids', 'Owner', 'Owner Directory Report'))
    }).optional().describe('Filter results based on properties, groups, portfolios, or owners. All ID fields must be numeric strings, not names.'),
    property_visibility: z.enum(["active", "hidden", "all"]).optional().default("active").describe('Filter units by status. Defaults to "active"'),
    tags: z.string().optional().describe('Optional. Filter by a comma-separated list of tags (e.g., "bbq,deck").'),
    columns: z.array(z.enum(UNIT_VACANCY_DETAIL_COLUMNS)).optional().describe(`Array of specific columns to include in the report. Valid columns: ${UNIT_VACANCY_DETAIL_COLUMNS.join(', ')}. If not specified, all columns are returned.`)
  });
// --- Unit Vacancy Detail Report Function ---
export async function getUnitVacancyDetailReport(args: UnitVacancyDetailArgs): Promise<UnitVacancyDetailResult> {
  // Validate ID fields
  if (args.properties) {
    const validationErrors = validatePropertiesIds(args.properties);
    throwOnValidationErrors(validationErrors);
  }

  const { property_visibility = "active", ...rest } = args;
  const payload = { property_visibility, ...rest };

  return makeAppfolioApiCall<UnitVacancyDetailResult>('unit_vacancy.json', payload);
}

// MCP Tool Registration Function
export function registerUnitVacancyDetailReportTool(server: McpServer) {
  server.tool(
    "get_unit_vacancy_detail_report",
    "Generates a report on unit vacancies. IMPORTANT: All ID parameters (owners_ids, properties_ids, etc.) must be numeric strings (e.g. '123'), NOT names. Use respective directory reports first to lookup IDs by name if needed.",
    unitVacancyDetailArgsSchema.shape as any,
    async (args, _extra: unknown) => {
      try {
        // Validate arguments against schema
        const parseResult = unitVacancyDetailArgsSchema.safeParse(args);
        if (!parseResult.success) {
          const errorMessages = parseResult.error.errors.map(err => 
            `${err.path.join('.')}: ${err.message}`
          ).join('; ');
          throw new Error(`Invalid arguments: ${errorMessages}`);
        }

        const data = await getUnitVacancyDetailReport(parseResult.data);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(data),
              mimeType: "application/json"
            }
          ]
        };
      } catch (error) {
        // Enhanced error reporting for debugging
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Unit Vacancy Detail Report Error:`, errorMessage);
        throw error;
      }
    }
  );
}

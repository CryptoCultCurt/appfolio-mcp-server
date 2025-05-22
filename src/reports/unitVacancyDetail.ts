import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { appfolioLimiter } from '../appfolio';
import axios from 'axios';

const { VHOST, USERNAME, PASSWORD } = process.env;

// --- Unit Vacancy Detail Report Types ---
export type UnitVacancyDetailArgs = {
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

  // Zod schema for Unit Vacancy Detail Report arguments
const unitVacancyDetailArgsSchema = z.object({
    properties: z.object({
      properties_ids: z.array(z.string()).optional(),
      property_groups_ids: z.array(z.string()).optional(),
      portfolios_ids: z.array(z.string()).optional(),
      owners_ids: z.array(z.string()).optional()
    }).optional().describe('Filter results based on properties, groups, portfolios, or owners'),
    unit_visibility: z.enum(["active", "hidden", "all"]).optional().default("active").describe('Filter units by status. Defaults to "active"'),
    tags: z.string().optional().describe('Optional. Filter by a comma-separated list of tags (e.g., "bbq,deck").'),
    columns: z.array(z.string()).optional().describe('Array of specific columns to include in the report')
  });
// --- Unit Vacancy Detail Report Function ---
export async function getUnitVacancyDetailReport(args: UnitVacancyDetailArgs): Promise<UnitVacancyDetailResult> {
  if (!VHOST || !USERNAME || !PASSWORD) throw new Error('Missing AppFolio API credentials');

  const { unit_visibility = "active", ...rest } = args;
  const payload = { unit_visibility, ...rest };

  const url = `https://${VHOST}.appfolio.com/api/v2/reports/unit_vacancy.json`;
  const response = await appfolioLimiter.schedule(() => axios.post(url, payload, {
    auth: { username: USERNAME, password: PASSWORD },
    headers: { 'Content-Type': 'application/json' },
  }));

  return response.data;
}

// MCP Tool Registration Function
export function registerUnitVacancyDetailReportTool(server: McpServer) {
  server.tool(
    "get_unit_vacancy_detail_report",
    "Generates a report on unit vacancies.",
    unitVacancyDetailArgsSchema.shape,
    async (args, _extra: unknown) => {
      const data = await getUnitVacancyDetailReport(args);
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

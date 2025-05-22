import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { appfolioLimiter, getVendorLedgerReport } from '../appfolio';
import axios from 'axios';

const { VHOST, USERNAME, PASSWORD } = process.env;

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
      properties_ids: z.array(z.string()).optional(),
      property_groups_ids: z.array(z.string()).optional(),
      portfolios_ids: z.array(z.string()).optional(),
      owners_ids: z.array(z.string()).optional()
    }).optional().describe('Filter results based on properties, groups, portfolios, or owners'),
    unit_visibility: z.enum(["active", "hidden", "all"]).optional().default("active").describe('Filter units by status. Defaults to "active"'),
    tags: z.string().optional().describe('Optional. Filter by a comma-separated list of tags (e.g., "bbq,deck").'),
    columns: z.array(z.string()).optional().describe('Array of specific columns to include in the report')
  });

// --- Unit Directory Report Function ---
export async function getUnitDirectoryReport(args: UnitDirectoryArgs): Promise<UnitDirectoryResult> {
    if (!VHOST || !USERNAME || !PASSWORD) throw new Error('Missing AppFolio API credentials');
  
    const { unit_visibility = "active", ...rest } = args;
    const payload = { unit_visibility, ...rest };
  
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/unit_directory.json`;
    const response = await appfolioLimiter.schedule(() => axios.post(url, payload, {
      auth: { username: USERNAME, password: PASSWORD },
      headers: { 'Content-Type': 'application/json' },
    }));
  
    return response.data;
  }

  // MCP Tool Registration Function
  export function registerUnitDirectoryReportTool(server: McpServer) {
    server.tool(
      "get_unit_directory_report",
      "Retrieves a directory of units.",
      unitDirectoryArgsSchema.shape,
      async (args: any, _extra: any) => {
        const data = await getUnitDirectoryReport(args as UnitDirectoryArgs);
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
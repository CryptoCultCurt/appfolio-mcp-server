import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { makeAppfolioApiCall } from '../appfolio';

// Type definitions copied from src/appfolio.ts
export type RentRollItemizedArgs = {
  properties?: {
    properties_ids?: string[];
    property_groups_ids?: string[];
    portfolios_ids?: string[];
    owners_ids?: string[];
  };
  unit_visibility?: string; // Default handled by Zod schema
  tags?: string;
  gl_account_ids?: string[];
  as_of_date: string;
  columns?: string[];
};

export type RentRollItemizedResult = {
  results: Array<{
    property: string;
    property_name: string;
    property_id: number;
    property_address: string;
    property_street: string;
    property_street2: string;
    property_city: string;
    property_state: string;
    property_zip: string;
    property_type: string;
    occupancy_id: number;
    unit_id: number;
    unit: string;
    unit_tags: string;
    unit_type: string;
    bd_ba: string;
    tenant: string;
    status: string;
    sqft: number;
    market_rent: string;
    computed_market_rent: string;
    advertised_rent: string;
    gl_accounts: Array<{ id: number; value: string }>;
    total: string;
    other_charges: string;
    monthly_rent_square_ft: string;
    annual_rent_square_ft: string;
    deposit: string;
    lease_from: string;
    lease_to: string;
    last_rent_increase: string;
    next_rent_adjustment: string;
    next_rent_increase_amount: string;
    next_rent_increase: string;
    move_in: string;
    move_out: string;
    past_due: string;
    nsf: number;
    late: number;
    amenities: string;
    additional_tenants: string;
    monthly_charges: string;
    rent_ready: string;
    rent_status: string;
    legal_rent: string;
    preferential_rent: string;
    tenant_tags: string;
    tenant_agent: string;
    property_group_id: string;
    portfolio_id: number;
  }>;
  next_page_url: string;
};

// Zod schema copied from src/index.ts
const rentRollItemizedInputSchema = z.object({
  properties: z.object({
    properties_ids: z.array(z.string()).optional(),
    property_groups_ids: z.array(z.string()).optional(),
    portfolios_ids: z.array(z.string()).optional(),
    owners_ids: z.array(z.string()).optional(),
  }).optional(),
  unit_visibility: z.string().default("active"), // Defaulting to active
  tags: z.string().optional(),
  gl_account_ids: z.array(z.string()).optional(),
  as_of_date: z.string(),
  columns: z.array(z.string()).optional(),
});

// Function definition copied from src/appfolio.ts
export async function getRentRollItemizedReport(args: RentRollItemizedArgs): Promise<RentRollItemizedResult> {
  if (!args.as_of_date) {
    throw new Error('Missing required argument: as_of_date (format YYYY-MM-DD)');
  }

  const { unit_visibility = "active", ...rest } = args;
  const payload = { unit_visibility, ...rest };

  return makeAppfolioApiCall<RentRollItemizedResult>('rent_roll_itemized.json', payload);
}

// MCP Tool Registration Function
export function registerRentRollItemizedReportTool(server: McpServer) {
  server.tool(
    "get_rent_roll_itemized_report",
    "Returns rent roll itemized report for the given filters.",
    rentRollItemizedInputSchema.shape,
    async (args, _extra: unknown) => {
      try {
        // Validate arguments against schema
        const parseResult = rentRollItemizedInputSchema.safeParse(args);
        if (!parseResult.success) {
          const errorMessages = parseResult.error.errors.map(err => 
            `${err.path.join('.')}: ${err.message}`
          ).join('; ');
          throw new Error(`Invalid arguments: ${errorMessages}`);
        }

        const result = await getRentRollItemizedReport(parseResult.data);
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
        console.error(`Rent Roll Itemized Report Error:`, errorMessage);
        throw error;
      }
    }
  );
}

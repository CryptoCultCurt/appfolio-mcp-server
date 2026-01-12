import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { makeAppfolioApiCall } from '../appfolio';

// --- Owner Directory Report Types ---
export type OwnerDirectoryReportPropertiesArgs = {
  properties_ids?: string[];
  property_groups_ids?: string[];
  portfolios_ids?: string[];
  owners_ids?: string[];
};

export type OwnerDirectoryReportArgs = {
  property_visibility?: string; // defaulted by Zod
  properties?: OwnerDirectoryReportPropertiesArgs;
  tags?: string; // Comma-separated e.g., "bbq,deck"
  owner_visibility?: string; // defaulted by Zod
  created_by?: string; // defaulted by Zod
  columns?: string[];
};

export type OwnerDirectoryReportResultItem = {
  name: string;
  phone_numbers: string;
  email: string;
  alternative_payee: string;
  payment_type: string;
  last_payment_date: string;
  hold_payments: string;
  owner_packet_reports: string;
  send_owner_packets_by_email: string;
  properties_owned: string;
  tags: string;
  last_packet_sent: string;
  address: string;
  street: string;
  street2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  owner_id: number;
  properties_owned_i_ds: string;
  notes_for_the_owner: string;
  first_name: string;
  last_name: string;
  owner_integration_id: string;
  created_by: string;
};

export type OwnerDirectoryResult = {
  results: OwnerDirectoryReportResultItem[];
  next_page_url: string | null;
};

// Zod schema for Owner Directory Report arguments
export const ownerDirectoryColumnEnum = z.enum([
  "name", "phone_numbers", "email", "alternative_payee", "payment_type",
  "last_payment_date", "hold_payments", "owner_packet_reports",
  "send_owner_packets_by_email", "properties_owned", "tags", "last_packet_sent",
  "address", "street", "street2", "city", "state", "zip", "country",
  "owner_id", "properties_owned_i_ds", "notes_for_the_owner", "first_name",
  "last_name", "owner_integration_id", "created_by"
]);

export const ownerDirectoryArgsSchema = z.object({
  property_visibility: z.string().optional().transform(val => val === "" ? undefined : val).default("active").describe("Filter properties by visibility. Defaults to 'active'."),
  properties: z.object({
    properties_ids: z.array(z.string()).optional(),
    property_groups_ids: z.array(z.string()).optional(),
    portfolios_ids: z.array(z.string()).optional(),
    owners_ids: z.array(z.string()).optional(),
  }).optional().describe("Filter results based on properties, groups, portfolios, or owners."),
  tags: z.string().optional().transform(val => val === "" ? undefined : val).describe("FILTER BY SYSTEM TAGS ONLY: Comma-separated list of actual tags assigned to owners in the system (e.g., 'vip,corporate'). NOT for searching by owner names - use the full report results for name searching."),
  owner_visibility: z.string().optional().transform(val => val === "" ? undefined : val).default("active").describe("Filter owners by visibility. Defaults to 'active'."),
  created_by: z.string().optional().transform(val => val === "" ? undefined : val).default("All").describe("Filter by who created the owner. Defaults to 'All'."),
  columns: z.array(ownerDirectoryColumnEnum).optional().describe("List of columns to include in the report. If omitted, default columns are used."),
});

// --- Owner Directory Report Function ---
export async function getOwnerDirectoryReport(args: z.infer<typeof ownerDirectoryArgsSchema>): Promise<OwnerDirectoryResult> {
  return makeAppfolioApiCall<OwnerDirectoryResult>('owner_directory.json', args);
}

// --- Register Owner Directory Report Tool ---
export function registerOwnerDirectoryReportTool(server: McpServer) {
  server.tool(
    "get_owner_directory_report",
    "Retrieves a DIRECTORY report with details about property owners. This returns ALL owners (with optional filters) - to find specific owners by name, call this report and search the results client-side. IMPORTANT: All ID parameters must be numeric strings, NOT names. The 'tags' parameter is for filtering by actual system tags, NOT for text search.",
    ownerDirectoryArgsSchema.shape as any,
    async (args, _extra: unknown) => {
      try {
        // Validate arguments against schema
        const parseResult = ownerDirectoryArgsSchema.safeParse(args);
        if (!parseResult.success) {
          const errorMessages = parseResult.error.errors.map(err => 
            `${err.path.join('.')}: ${err.message}`
          ).join('; ');
          throw new Error(`Invalid arguments: ${errorMessages}`);
        }

        const result = await getOwnerDirectoryReport(parseResult.data);
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
        console.error(`Owner Directory Report Error:`, errorMessage);
        throw error;
      }
    }
  );
}

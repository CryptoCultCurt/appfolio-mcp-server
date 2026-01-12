import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { makeAppfolioApiCall } from '../appfolio';

// --- Vendor Directory Report Types ---
export type VendorDirectoryArgs = {
    workers_comp_expiration_to?: string; // Optional (YYYY-MM-DD)
    liability_expiration_to?: string; // Optional (YYYY-MM-DD)
    epa_expiration_to?: string; // Optional (YYYY-MM-DD)
    auto_insurance_expiration_to?: string; // Optional (YYYY-MM-DD)
    state_license_expiration_to?: string; // Optional (YYYY-MM-DD)
    contract_expiration_to?: string; // Optional (YYYY-MM-DD)
    tags?: string; // Comma-separated list of tags
    vendor_visibility?: "active" | "inactive" | "all"; // Defaults to "active"
    payment_type?: "eCheck" | "Check" | "all"; // Defaults to "all" if not specified, needs check
    created_by?: string; // Defaults to "All"
    vendor_type?: string; // Defaults to "All"
    columns?: string[];
  };
  
  export type VendorDirectoryResult = {
    results: Array<{
      company_name: string | null;
      name: string | null;
      address: string | null;
      street: string | null;
      street2: string | null;
      city: string | null;
      state: string | null;
      zip: string | null;
      phone_numbers: string | null;
      email: string | null;
      default_gl_account: string | null;
      payment_type: string | null;
      send1099: string | null;
      workers_comp_expires: string | null;
      liability_ins_expires: string | null;
      epa_cert_expires: string | null;
      auto_ins_expires: string | null;
      state_lic_expires: string | null;
      contract_expires: string | null;
      tags: string | null;
      vendor_id: number | null;
      vendor_trades: string | null;
      do_not_use_for_work_order: string | null;
      terms: string | null;
      first_name: string | null;
      last_name: string | null;
      vendor_integration_id: string | null;
      created_by: string | null;
      vendor_type: string | null;
      portal_activated: string | null;
    }>;
    next_page_url: string | null;
  };

  // Zod schema for Vendor Directory Report arguments
const vendorDirectoryArgsSchema = z.object({
    workers_comp_expiration_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional().describe('Optional. Filter vendors whose Workers Comp expires on or before this date (YYYY-MM-DD).'),
    liability_expiration_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional().describe('Optional. Filter vendors whose Liability Insurance expires on or before this date (YYYY-MM-DD).'),
    epa_expiration_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional().describe('Optional. Filter vendors whose EPA Certification expires on or before this date (YYYY-MM-DD).'),
    auto_insurance_expiration_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional().describe('Optional. Filter vendors whose Auto Insurance expires on or before this date (YYYY-MM-DD).'),
    state_license_expiration_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional().describe('Optional. Filter vendors whose State License expires on or before this date (YYYY-MM-DD).'),
    contract_expiration_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional().describe('Optional. Filter vendors whose Contract expires on or before this date (YYYY-MM-DD).'),
    tags: z.string().optional().describe('Optional. Filter by a comma-separated list of tags (e.g., "plumbing,hvac").'),
    vendor_visibility: z.enum(["active", "inactive", "all"]).optional().default("active").describe('Filter vendors by status. Defaults to "active"'),
    payment_type: z.enum(["eCheck", "Check", "all"]).optional().describe('Optional. Filter by payment type (eCheck, Check, or all). Defaults to all if not specified.'),
    created_by: z.string().optional().default("All").describe('Filter by who created the vendor. Defaults to "All".'), // User ID or 'All'
    vendor_type: z.string().optional().default("All").describe('Filter by vendor type. Defaults to "All".'), // Vendor Type name or 'All'
    columns: z.array(z.string()).optional().describe('Array of specific columns to include in the report')
  });

// --- Vendor Directory Report Function ---
export async function getVendorDirectoryReport(args: VendorDirectoryArgs): Promise<VendorDirectoryResult> {
  return makeAppfolioApiCall<VendorDirectoryResult>('vendor_directory.json', args);
}

// MCP Tool Registration Function
export function registerVendorDirectoryReportTool(server: McpServer) {
  server.tool(
    "get_vendor_directory_report",
    "Retrieves a directory of vendors. IMPORTANT: All ID parameters must be numeric strings (e.g. '123'), NOT names.",
    vendorDirectoryArgsSchema.shape as any,
    async (args, _extra: unknown) => {
      try {
        // Validate arguments against schema
        const parseResult = vendorDirectoryArgsSchema.safeParse(args);
        if (!parseResult.success) {
          const errorMessages = parseResult.error.errors.map(err => 
            `${err.path.join('.')}: ${err.message}`
          ).join('; ');
          throw new Error(`Invalid arguments: ${errorMessages}`);
        }

        const result = await getVendorDirectoryReport(parseResult.data);
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
        console.error(`Vendor Directory Report Error:`, errorMessage);
        throw error;
      }
    }
  );
}

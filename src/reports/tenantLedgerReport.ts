import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { makeAppfolioApiCall } from '../appfolio';

// --- Tenant Ledger Report Types ---
export type TenantLedgerArgs = {
    parties_ids: {
      occupancies_ids: string[]; // Required
    };
    occurred_on_from: string; // Required (YYYY-MM-DD)
    occurred_on_to: string; // Required (YYYY-MM-DD)
    transactions_shown?: "tenant" | "owner" | "all"; // Defaults to "tenant"
    columns?: string[];
  };
  
  export type TenantLedgerResult = {
    results: Array<{
      date: string | null;
      payer: string | null;
      description: string | null;
      debit: string | null;
      credit: string | null;
      credit_debit_balance: string | null;
    }>;
    next_page_url: string | null;
  };


// Zod schema for Tenant Ledger Report arguments
const tenantLedgerArgsSchema = z.object({
    parties_ids: z.object({
      occupancies_ids: z.array(z.string()).nonempty("At least one occupancy ID is required").describe('Required. Array of occupancy IDs to filter by.')
    }).describe('Required. Specify the occupancies to include.'),
    occurred_on_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('Required. The start date for the reporting period (YYYY-MM-DD).'),
    occurred_on_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('Required. The end date for the reporting period (YYYY-MM-DD).'),
    transactions_shown: z.enum(["tenant", "owner", "all"]).optional().default("tenant").describe('Filter transactions shown. Defaults to "tenant"'),
    columns: z.array(z.string()).optional().describe('Array of specific columns to include in the report')
  });

// --- Tenant Ledger Report Function ---
export async function getTenantLedgerReport(args: TenantLedgerArgs): Promise<TenantLedgerResult> {
  // Validation logic still needed before API call
  if (!args.parties_ids?.occupancies_ids || args.parties_ids.occupancies_ids.length === 0) {
    throw new Error('Missing required argument: parties_ids.occupancies_ids must contain at least one ID');
  }
  if (!args.occurred_on_from || !args.occurred_on_to) {
    throw new Error('Missing required arguments: occurred_on_from and occurred_on_to (format YYYY-MM-DD)');
  }

  const { transactions_shown = "tenant", ...rest } = args;
  const payload = { transactions_shown, ...rest };

  return makeAppfolioApiCall<TenantLedgerResult>('tenant_ledger.json', payload);
}

  // --- Tenant Ledger Report Tool ---
  export function registerTenantLedgerReportTool(server: McpServer) {
    server.tool(
      "get_tenant_ledger_report",
      "Generates a report on tenant ledgers.",
      tenantLedgerArgsSchema.shape as any,
      async (args, _extra: unknown) => {
        try {
          // Validate arguments against schema
          const parseResult = tenantLedgerArgsSchema.safeParse(args);
          if (!parseResult.success) {
            const errorMessages = parseResult.error.errors.map(err => 
              `${err.path.join('.')}: ${err.message}`
            ).join('; ');
            throw new Error(`Invalid arguments: ${errorMessages}`);
          }

          const result = await getTenantLedgerReport(parseResult.data);
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
          console.error(`Tenant Ledger Report Error:`, errorMessage);
          throw error;
        }
      }
    );
  }
import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { makeAppfolioApiCall } from '../appfolio';

// --- Security Deposit Funds Detail Report Types ---
export type SecurityDepositFundsDetailArgs = {
  property_visibility?: "active" | "hidden" | "all";
  properties?: {
    properties_ids?: string[];
    property_groups_ids?: string[];
    portfolios_ids?: string[];
    owners_ids?: string[];
  };
  as_of_date: string;
  include_voided?: boolean;
  columns?: string[];
};

export type SecurityDepositFundsDetailResult = {
  results: Array<{
    property_id: number;
    property_name: string;
    unit_id: number;
    unit_number: string;
    lease_id: number;
    lease_number: string;
    lease_status: string;
    lease_type: string;
    lease_start_date: string;
    lease_end_date: string;
    lease_termination_date: string | null;
    lease_termination_reason: string | null;
    lease_termination_notes: string | null;
    lease_termination_fee: string | null;
    lease_termination_fee_paid: string | null;
    lease_termination_fee_waived: string | null;
    lease_termination_fee_waived_reason: string | null;
    lease_termination_fee_waived_notes: string | null;
    lease_termination_fee_waived_by: string | null;
    lease_termination_fee_waived_at: string | null;
    lease_termination_fee_paid_date: string | null;
    lease_termination_fee_paid_by: string | null;
    lease_termination_fee_paid_notes: string | null;
    lease_termination_fee_paid_amount: string | null;
    lease_termination_fee_paid_payment_id: number | null;
    lease_termination_fee_paid_payment_type: string | null;
    lease_termination_fee_paid_payment_method: string | null;
    lease_termination_fee_paid_payment_status: string | null;
    lease_termination_fee_paid_payment_date: string | null;
    lease_termination_fee_paid_payment_amount: string | null;
    lease_termination_fee_paid_payment_notes: string | null;
    lease_termination_fee_paid_payment_created_by: string | null;
    lease_termination_fee_paid_payment_created_at: string | null;
    lease_termination_fee_paid_payment_updated_at: string | null;
    lease_termination_fee_paid_payment_deleted_at: string | null;
    lease_termination_fee_paid_payment_deleted_by: string | null;
    lease_termination_fee_paid_payment_deleted_reason: string | null;
    lease_termination_fee_paid_payment_deleted_notes: string | null;
    security_deposit_amount: string;
    security_deposit_paid: string;
    security_deposit_refunded: string;
    security_deposit_balance: string;
    security_deposit_held: string;
    security_deposit_held_reason: string | null;
    security_deposit_held_notes: string | null;
    security_deposit_held_by: string | null;
    security_deposit_held_at: string | null;
    security_deposit_released: string;
    security_deposit_released_date: string | null;
    security_deposit_released_by: string | null;
    security_deposit_released_notes: string | null;
    security_deposit_refund_amount: string | null;
    security_deposit_refund_date: string | null;
    security_deposit_refund_method: string | null;
    security_deposit_refund_status: string | null;
    security_deposit_refund_id: number | null;
    security_deposit_refund_notes: string | null;
    security_deposit_forfeited: string | null;
    security_deposit_forfeited_date: string | null;
    security_deposit_forfeited_by: string | null;
    security_deposit_forfeited_reason: string | null;
    security_deposit_forfeited_notes: string | null;
    security_deposit_transferred: string | null;
    security_deposit_transferred_date: string | null;
    security_deposit_transferred_by: string | null;
    security_deposit_transferred_notes: string | null;
    security_deposit_transferred_to_lease_id: number | null;
    security_deposit_transferred_to_lease_number: string | null;
    security_deposit_transferred_to_lease_status: string | null;
    security_deposit_transferred_to_lease_type: string | null;
    security_deposit_transferred_to_lease_start_date: string | null;
    security_deposit_transferred_to_lease_end_date: string | null;
    security_deposit_transferred_to_lease_termination_date: string | null;
    security_deposit_transferred_to_lease_termination_reason: string | null;
    security_deposit_transferred_to_lease_termination_notes: string | null;
    security_deposit_transferred_to_lease_termination_fee: string | null;
    security_deposit_transferred_to_lease_termination_fee_paid: string | null;
    security_deposit_transferred_to_lease_termination_fee_waived: string | null;
    security_deposit_transferred_to_lease_termination_fee_waived_reason: string | null;
    security_deposit_transferred_to_lease_termination_fee_waived_notes: string | null;
    security_deposit_transferred_to_lease_termination_fee_waived_by: string | null;
    security_deposit_transferred_to_lease_termination_fee_waived_at: string | null;
    security_deposit_transferred_to_lease_termination_fee_paid_date: string | null;
    security_deposit_transferred_to_lease_termination_fee_paid_by: string | null;
    security_deposit_transferred_to_lease_termination_fee_paid_notes: string | null;
    security_deposit_transferred_to_lease_termination_fee_paid_amount: string | null;
    security_deposit_transferred_to_lease_termination_fee_paid_payment_id: number | null;
    security_deposit_transferred_to_lease_termination_fee_paid_payment_type: string | null;
    security_deposit_transferred_to_lease_termination_fee_paid_payment_method: string | null;
    security_deposit_transferred_to_lease_termination_fee_paid_payment_status: string | null;
    security_deposit_transferred_to_lease_termination_fee_paid_payment_date: string | null;
    security_deposit_transferred_to_lease_termination_fee_paid_payment_amount: string | null;
    security_deposit_transferred_to_lease_termination_fee_paid_payment_notes: string | null;
    security_deposit_transferred_to_lease_termination_fee_paid_payment_created_by: string | null;
    security_deposit_transferred_to_lease_termination_fee_paid_payment_created_at: string | null;
    security_deposit_transferred_to_lease_termination_fee_paid_payment_updated_at: string | null;
    security_deposit_transferred_to_lease_termination_fee_paid_payment_deleted_at: string | null;
    security_deposit_transferred_to_lease_termination_fee_paid_payment_deleted_by: string | null;
    security_deposit_transferred_to_lease_termination_fee_paid_payment_deleted_reason: string | null;
    security_deposit_transferred_to_lease_termination_fee_paid_payment_deleted_notes: string | null;
    created_by: string | null;
    created_at: string;
    updated_at: string;
  }>;
  next_page_url: string | null;
};

const securityDepositFundsDetailInputSchema = z.object({
  property_visibility: z.enum(["active", "hidden", "all"]).optional().default("active"),
  properties: z.object({
    properties_ids: z.array(z.string()).optional(),
    property_groups_ids: z.array(z.string()).optional(),
    portfolios_ids: z.array(z.string()).optional(),
    owners_ids: z.array(z.string()).optional()
  }).optional(),
  as_of_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  include_voided: z.boolean().optional().default(false),
  columns: z.array(z.string()).optional()
});

export async function getSecurityDepositFundsDetailReport(args: SecurityDepositFundsDetailArgs): Promise<SecurityDepositFundsDetailResult> {
  return makeAppfolioApiCall<SecurityDepositFundsDetailResult>('security_deposit_funds_detail.json', args);
}

export function registerSecurityDepositFundsDetailReportTool(server: McpServer) {
  server.tool(
    "get_security_deposit_funds_detail_report",
    "Returns security deposit funds detail report for the given filters.",
    securityDepositFundsDetailInputSchema.shape as any,
    async (args, _extra: unknown) => {
      try {
        // Validate arguments against schema
        const parseResult = securityDepositFundsDetailInputSchema.safeParse(args);
        if (!parseResult.success) {
          const errorMessages = parseResult.error.errors.map(err => 
            `${err.path.join('.')}: ${err.message}`
          ).join('; ');
          throw new Error(`Invalid arguments: ${errorMessages}`);
        }

        const result = await getSecurityDepositFundsDetailReport(parseResult.data);
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
        console.error(`Security Deposit Funds Detail Report Error:`, errorMessage);
        throw error;
      }
    }
  );
}

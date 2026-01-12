import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { makeAppfolioApiCall } from '../appfolio';
import { validatePropertiesIds, throwOnValidationErrors, getIdFieldDescription } from '../validation';

// --- Rental Applications Report Types ---
export type RentalApplicationsArgs = {
  property_visibility?: "active" | "hidden" | "all";
  properties?: {
    properties_ids?: string[];
    property_groups_ids?: string[];
    portfolios_ids?: string[];
    owners_ids?: string[];
  };
  received_on_from?: string;
  received_on_to?: string;
  statuses?: string[];
  sources?: string[];
  columns?: string[];
};

export type RentalApplicationsResult = {
  results: Array<{
    application_id: number;
    status: string;
    received_date: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    property_name: string;
    property_id: number;
    unit_number: string;
    unit_id: number;
    move_in_date: string | null;
    lease_term: number | null;
    lease_start_date: string | null;
    lease_end_date: string | null;
    monthly_rent: string | null;
    security_deposit: string | null;
    application_fee: string | null;
    admin_fee: string | null;
    other_fees: string | null;
    total_move_in_cost: string | null;
    co_signer: string | null;
    co_signer_first_name: string | null;
    co_signer_last_name: string | null;
    co_signer_email: string | null;
    co_signer_phone: string | null;
    emergency_contact_name: string | null;
    emergency_contact_phone: string | null;
    emergency_contact_relation: string | null;
    notes: string | null;
    created_by: string | null;
    created_at: string;
    updated_at: string;
    source: string | null;
    referral_source: string | null;
    lease_id: number | null;
    lease_number: string | null;
    lease_status: string | null;
    lease_type: string | null;
    lease_term_months: number | null;
    lease_start_date_formatted: string | null;
    lease_end_date_formatted: string | null;
    lease_signed_date: string | null;
    lease_approved_date: string | null;
    lease_rejected_date: string | null;
    lease_cancelled_date: string | null;
    lease_terminated_date: string | null;
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
  }>;
  next_page_url: string | null;
};

const rentalApplicationsInputSchema = z.object({
  property_visibility: z.enum(["active", "hidden", "all"]).optional().default("active"),
  properties: z.object({
    properties_ids: z.array(z.string()).optional().describe(getIdFieldDescription('properties_ids', 'Property', 'Property Directory Report')),
    property_groups_ids: z.array(z.string()).optional().describe(getIdFieldDescription('property_groups_ids', 'Property Group')),
    portfolios_ids: z.array(z.string()).optional().describe(getIdFieldDescription('portfolios_ids', 'Portfolio')),
    owners_ids: z.array(z.string()).optional().describe(getIdFieldDescription('owners_ids', 'Owner', 'Owner Directory Report'))
  }).optional().describe('Filter results based on properties, groups, portfolios, or owners. All ID fields must be numeric strings, not names.'),
  received_on_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional(),
  received_on_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional(),
  statuses: z.array(z.string()).optional(),
  sources: z.array(z.string()).optional(),
  columns: z.array(z.string()).optional()
});

export async function getRentalApplicationsReport(args: RentalApplicationsArgs): Promise<RentalApplicationsResult> {
  if (!args.received_on_from || !args.received_on_to) {
    throw new Error('Missing required arguments: received_on_from and received_on_to (format YYYY-MM-DD)');
  }

  // Validate ID fields
  if (args.properties) {
    const validationErrors = validatePropertiesIds(args.properties);
    throwOnValidationErrors(validationErrors);
  }

  const { property_visibility = "active", ...rest } = args;
  const payload = { property_visibility, ...rest };

  return makeAppfolioApiCall<RentalApplicationsResult>('rental_applications.json', payload);
}

export function registerRentalApplicationsReportTool(server: McpServer) {
  server.tool(
    "get_rental_applications_report",
    "Returns rental applications report for the given filters. IMPORTANT: All ID parameters (owners_ids, properties_ids, etc.) must be numeric strings (e.g. '123'), NOT names. Use respective directory reports first to lookup IDs by name if needed.",
    rentalApplicationsInputSchema.shape as any,
    async (args: any, _extra: any) => {
      const data = await getRentalApplicationsReport(args as RentalApplicationsArgs);
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

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { makeAppfolioApiCall } from '../appfolio';

// --- Screening Assessment Report Types ---
export type ScreeningAssessmentArgs = {
  property_visibility?: "active" | "hidden" | "all";
  properties?: {
    properties_ids?: string[];
    property_groups_ids?: string[];
    portfolios_ids?: string[];
    owners_ids?: string[];
  };
  screening_date_from?: string;
  screening_date_to?: string;
  statuses?: string[];
  decision_statuses?: string[];
  columns?: string[];
};

export type ScreeningAssessmentResult = {
  results: Array<{
    screening_id: number;
    screening_type: string;
    screening_status: string;
    decision_status: string;
    screening_date: string;
    completed_date: string | null;
    applicant_name: string;
    applicant_email: string;
    applicant_phone: string;
    property_name: string;
    property_id: number;
    unit_number: string;
    unit_id: number;
    move_in_date: string | null;
    lease_term: number | null;
    monthly_rent: string | null;
    security_deposit: string | null;
    application_fee: string | null;
    screening_fee: string | null;
    screening_fee_paid: string | null;
    screening_fee_payment_date: string | null;
    screening_fee_payment_method: string | null;
    screening_fee_payment_status: string | null;
    screening_fee_payment_id: number | null;
    screening_fee_payment_notes: string | null;
    screening_fee_refunded: string | null;
    screening_fee_refund_date: string | null;
    screening_fee_refund_amount: string | null;
    screening_fee_refund_method: string | null;
    screening_fee_refund_status: string | null;
    screening_fee_refund_id: number | null;
    screening_fee_refund_notes: string | null;
    screening_fee_waived: string | null;
    screening_fee_waived_date: string | null;
    screening_fee_waived_by: string | null;
    screening_fee_waived_reason: string | null;
    screening_fee_waived_notes: string | null;
    created_by: string | null;
    created_at: string;
    updated_at: string;
  }>;
  next_page_url: string | null;
};

const screeningAssessmentInputSchema = z.object({
  property_visibility: z.enum(["active", "hidden", "all"]).optional().default("active"),
  properties: z.object({
    properties_ids: z.array(z.string()).optional(),
    property_groups_ids: z.array(z.string()).optional(),
    portfolios_ids: z.array(z.string()).optional(),
    owners_ids: z.array(z.string()).optional()
  }).optional(),
  screening_date_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional(),
  screening_date_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional(),
  statuses: z.array(z.string()).optional(),
  decision_statuses: z.array(z.string()).optional(),
  columns: z.array(z.string()).optional()
});

export async function getScreeningAssessmentReport(args: ScreeningAssessmentArgs): Promise<ScreeningAssessmentResult> {
  const { property_visibility = "active", ...rest } = args;
  const payload = { property_visibility, ...rest };

  return makeAppfolioApiCall<ScreeningAssessmentResult>('screening_assessment.json', payload);
}

export function registerScreeningAssessmentReportTool(server: McpServer) {
  server.tool(
    "get_screening_assessment_report",
    "Returns screening assessment report for the given filters.",
    screeningAssessmentInputSchema.shape as any,
    async (args, _extra: unknown) => {
      try {
        // Validate arguments against schema
        const parseResult = screeningAssessmentInputSchema.safeParse(args);
        if (!parseResult.success) {
          const errorMessages = parseResult.error.errors.map(err => 
            `${err.path.join('.')}: ${err.message}`
          ).join('; ');
          throw new Error(`Invalid arguments: ${errorMessages}`);
        }

        const result = await getScreeningAssessmentReport(parseResult.data);
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
        console.error(`Screening Assessment Report Error:`, errorMessage);
        throw error;
      }
    }
  );
}

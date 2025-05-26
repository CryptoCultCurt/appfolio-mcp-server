import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { makeAppfolioApiCall } from '../appfolio';
import { validatePropertiesIds, throwOnValidationErrors, getIdFieldDescription } from '../validation';

// Type definitions based on src/appfolio.ts (Steps 155 & 107)
export type GuestCardInquiriesArgs = {
  property_visibility?: string;
  properties?: {
    properties_ids?: string[];
    property_groups_ids?: string[];
    portfolios_ids?: string[];
    owners_ids?: string[];
  };
  guest_card_sources?: string[];
  guest_card_statuses?: string[]; // Note: function defaults to 'open' for guest_card_status
  guest_card_lead_types?: string[];
  assigned_user?: string;
  assigned_user_visibility?: string;
  guest_card_status?: string; // This specific field is used in the function with a default
  filter_date_range_by?: string;
  received_on_from: string;
  received_on_to: string;
  columns?: string[];
};

export type GuestCardInquiriesResult = {
  results: Array<{
    name: string;
    email_address: string;
    phone_number: string;
    received: string;
    last_activity_date: string;
    last_activity_type: string;
    latest_interest_date: string;
    latest_interest_source: string;
    status: string;
    move_in_preference: string;
    max_rent: string;
    bed_bath_preference: string;
    pet_preference: string;
    monthly_income: string;
    credit_score: string;
    lead_type: string;
    source: string;
    property: string;
    unit: string;
    assigned_user: string;
    assigned_user_id: number;
    guest_card_id: number;
    inquiry_id: number;
    occupancy_id: number;
    property_id: string; // Changed from number based on recent file view
    unit_id: string;     // Changed from number based on recent file view
    notes: string;
    tenant_id: number;
    rental_application_id: number;
    rental_application_group_id: number;
    applicants: string;
    inquiry_type: string;
    total_interests_received: number;
    interests_received_in_range: number;
    showings: number;
    interest_to_showing_scheduled: string;
    showing_to_application_received: string;
    application_received_to_decision: string;
    application_submission_to_lease_signed: string;
    inquiry_to_lease_signed: string;
    inactive_reason: string;
    crm: string;
  }>;
  next_page_url: string;
};

// Zod schema based on src/index.ts (Step 163) and function defaults (Step 153)
const guestCardInquiriesInputSchema = z.object({
  property_visibility: z.string().default("active"),
  properties: z.object({
    properties_ids: z.array(z.string()).optional().describe(getIdFieldDescription('properties_ids', 'Property', 'Property Directory Report')),
    property_groups_ids: z.array(z.string()).optional().describe(getIdFieldDescription('property_groups_ids', 'Property Group')),
    portfolios_ids: z.array(z.string()).optional().describe(getIdFieldDescription('portfolios_ids', 'Portfolio')),
    owners_ids: z.array(z.string()).optional().describe(getIdFieldDescription('owners_ids', 'Owner', 'Owner Directory Report')),
  }).optional().describe('Filter results based on properties, groups, portfolios, or owners. All ID fields must be numeric strings, not names.'),
  guest_card_sources: z.array(z.string()).default(["All"]),
  guest_card_statuses: z.array(z.string()).default(["All"]),
  guest_card_lead_types: z.array(z.string()).default(["All"]),
  assigned_user: z.string().default("All"),
  assigned_user_visibility: z.string().default("active"),
  guest_card_status: z.string().default("open"),
  filter_date_range_by: z.string().default("received_on"),
  received_on_from: z.string(),
  received_on_to: z.string(),
  columns: z.array(z.string()).optional(),
});

// Function definition from src/appfolio.ts (Step 153)
export async function getGuestCardInquiriesReport(args: GuestCardInquiriesArgs): Promise<GuestCardInquiriesResult> {
  if (!args.received_on_from || !args.received_on_to) {
    throw new Error('Missing required arguments: received_on_from and received_on_to (format YYYY-MM-DD)');
  }

  // Validate ID fields
  if (args.properties) {
    const validationErrors = validatePropertiesIds(args.properties);
    throwOnValidationErrors(validationErrors);
  }

  const { guest_card_status = "open", ...rest } = args;
  const payload = { guest_card_status, ...rest };

  return makeAppfolioApiCall<GuestCardInquiriesResult>('guest_card_inquiries.json', payload);
}

// MCP Tool Registration Function
export function registerGuestCardInquiriesReportTool(server: McpServer) {
  server.tool(
    "get_guest_card_inquiries_report",
    "Returns guest card inquiries report for the given filters.",
    guestCardInquiriesInputSchema.shape,
    async (args: any, _extra: any) => {
      const data = await getGuestCardInquiriesReport(args as GuestCardInquiriesArgs);
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

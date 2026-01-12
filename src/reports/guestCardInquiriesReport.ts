import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import dotenv from 'dotenv';
import { makeAppfolioApiCall } from '../appfolio';
import { validatePropertiesIds, throwOnValidationErrors, getIdFieldDescription } from '../validation';

dotenv.config();

// Available columns extracted from the GuestCardInquiriesResult type
export const GUEST_CARD_INQUIRIES_COLUMNS = [
  'name',
  'email_address',
  'phone_number',
  'received',
  'last_activity_date',
  'last_activity_type',
  'latest_interest_date',
  'latest_interest_source',
  'status',
  'move_in_preference',
  'max_rent',
  'bed_bath_preference',
  'pet_preference',
  'monthly_income',
  'credit_score',
  'lead_type',
  'source',
  'property',
  'unit',
  'assigned_user',
  'assigned_user_id',
  'guest_card_id',
  'guest_card_uuid',
  'inquiry_id',
  'occupancy_id',
  'property_id',
  'unit_id',
  'notes',
  'tenant_id',
  'rental_application_id',
  'rental_application_group_id',
  'applicants',
  'inquiry_type',
  'total_interests_received',
  'interests_received_in_range',
  'showings',
  'interest_to_showing_scheduled',
  'showing_to_application_received',
  'application_received_to_decision',
  'application_submission_to_lease_signed',
  'inquiry_to_lease_signed',
  'inactive_reason',
  'crm'
] as const;

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
  property_visibility: z.enum(["active", "inactive", "all"]).default("active").describe('Filter properties by visibility status. Defaults to "active"'),
  properties: z.object({
    properties_ids: z.array(z.string()).optional()
      .describe(getIdFieldDescription('property', 'Property Directory Report')),
    property_groups_ids: z.array(z.string()).optional()
      .describe(getIdFieldDescription('property group', 'Property Group Directory Report')),
    portfolios_ids: z.array(z.string()).optional()
      .describe(getIdFieldDescription('portfolio', 'Portfolio Directory Report')),
    owners_ids: z.array(z.string()).optional()
      .describe(getIdFieldDescription('owner', 'Owner Directory Report'))
  }).optional().describe('Filter results based on properties, groups, portfolios, or owners'),
  guest_card_sources: z.array(z.string()).default(["all"]).describe('Filter by guest card sources. Defaults to ["all"]'),
  guest_card_statuses: z.array(z.string()).default(["all"]).describe('Filter by guest card statuses. Defaults to ["all"]'),
  guest_card_lead_types: z.array(z.string()).default(["all"]).describe('Filter by guest card lead types. Defaults to ["all"]'),
  assigned_user: z.string().default("All").describe('Filter by assigned user. Defaults to "All"'),
  assigned_user_visibility: z.enum(["active", "inactive", "all"]).default("active").describe('Filter assigned users by visibility. Defaults to "active"'),
  guest_card_status: z.string().default("open").describe('Filter by guest card status. Defaults to "open"'),
  filter_date_range_by: z.enum(["received_on", "inquiry"]).default("inquiry").describe('Which date field to use for filtering. Defaults to "inquiry"'),
  received_on_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('Start date for the reporting period (YYYY-MM-DD). Required.'),
  received_on_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('End date for the reporting period (YYYY-MM-DD). Required.'),
  columns: z.array(z.enum(GUEST_CARD_INQUIRIES_COLUMNS)).optional()
    .describe(`Array of specific columns to include in the report. Valid columns: ${GUEST_CARD_INQUIRIES_COLUMNS.join(', ')}. If not specified, all columns are returned.`)
});

// Function definition from src/appfolio.ts (Step 153)
export async function getGuestCardInquiriesReport(args: GuestCardInquiriesArgs): Promise<GuestCardInquiriesResult> {
  // Validate properties IDs if provided
  if (args.properties) {
    const validationErrors = validatePropertiesIds(args.properties);
    throwOnValidationErrors(validationErrors);
  }

  if (!args.received_on_from || !args.received_on_to) {
    throw new Error('Missing required arguments: received_on_from and received_on_to (format YYYY-MM-DD)');
  }

  const { guest_card_status = "open", property_visibility = "active", filter_date_range_by = "inquiry", ...rest } = args;
  const payload = { guest_card_status, property_visibility, filter_date_range_by, ...rest };

  return makeAppfolioApiCall<GuestCardInquiriesResult>('guest_card_inquiries.json', payload);
}

// MCP Tool Registration Function
export function registerGuestCardInquiriesReportTool(server: McpServer) {
  server.tool(
    "get_guest_card_inquiries_report",
    "Returns guest card inquiries report for the given filters. IMPORTANT: All ID parameters (properties_ids, property_groups_ids, portfolios_ids, owners_ids) must be numeric strings (e.g. '123'), NOT names. Use respective directory reports first to lookup IDs by name if needed.",
    guestCardInquiriesInputSchema.shape as any,
    async (args, _extra: unknown) => {
      try {
        // Validate arguments against schema
        const parseResult = guestCardInquiriesInputSchema.safeParse(args);
        if (!parseResult.success) {
          const errorMessages = parseResult.error.errors.map(err => 
            `${err.path.join('.')}: ${err.message}`
          ).join('; ');
          throw new Error(`Invalid arguments: ${errorMessages}`);
        }

        const result = await getGuestCardInquiriesReport(parseResult.data);
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
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Guest Card Inquiries Report Error:`, errorMessage);
        throw error;
      }
    }
  );
}

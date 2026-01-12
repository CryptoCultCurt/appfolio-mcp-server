import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { makeAppfolioApiCall } from "../appfolio";
import { validatePropertiesIds, throwOnValidationErrors, getIdFieldDescription } from '../validation';

// --- Work Order Report Types ---
export type WorkOrderArgs = {
  property_visibility?: "active" | "hidden" | "all"; // Defaults to "active"
  unit_ids?: string[];
  property?: { property_id: string }; // Filter by a single property ID
  parties_ids?: {
    occupancies_ids?: string[];
  };
  party_contact_info?: {
    company_id: string; // Vendor ID
  };
  assigned_user?: string; // User ID or "All", defaults to "All"
  created_by?: string; // User ID or "All", defaults to "All"
  priority?: "All" | "Low" | "Medium" | "High" | "Urgent"; // Defaults to "All"
  from_inspection?: boolean; // Defaults to false
  current_estimate_approval_status?: "All" | "Pending" | "Approved" | "Declined"; // Defaults to "All"
  work_order_statuses?: string[]; // List of status IDs
  work_order_types?: Array<"unit_turn" | "tenant_requested" | "other">; // List of types
  unit_turn_category?: Array<"all" | string>; // List of categories, defaults to ["all"]
  status_date_range_from?: string; // YYYY-MM-DD
  status_date_range_to?: string; // YYYY-MM-DD
  status_date?: "all" | "created_at" | "completed_on"; // Defaults to "all"
  columns?: string[];
};

export type WorkOrderResult = {
  results: Array<{
    property: string | null;
    property_name: string | null;
    property_id: number | null;
    property_address: string | null;
    property_street: string | null;
    property_street2: string | null;
    property_city: string | null;
    property_state: string | null;
    property_zip: string | null;
    unit_address: string | null;
    unit_street: string | null;
    unit_street2: string | null;
    unit_city: string | null;
    unit_state: string | null;
    unit_zip: string | null;
    priority: string | null;
    work_order_type: string | null;
    service_request_number: string | null;
    service_request_description: string | null;
    home_warranty_expiration: string | null;
    work_order_number: string | null;
    job_description: string | null;
    instructions: string | null;
    status: string | null;
    vendor_id: number | null;
    vendor: string | null;
    unit_id: number | null;
    unit_name: string | null;
    occupancy_id: number | null;
    primary_tenant: string | null;
    primary_tenant_email: string | null;
    primary_tenant_phone_number: string | null;
    created_at: string | null;
    created_by: string | null;
    assigned_user: string | null;
    estimate_req_on: string | null;
    estimated_on: string | null;
    estimate_amount: string | null;
    estimate_approval_status: string | null;
    estimate_approved_on: string | null;
    estimate_approval_last_requested_on: string | null;
    scheduled_start: string | null;
    scheduled_end: string | null;
    work_completed_on: string | null;
    completed_on: string | null;
    last_billed_on: string | null;
    canceled_on: string | null;
    amount: string | null;
    invoice: string | null;
    unit_turn_id: string | null;
    corporate_charge_amount: string | null;
    corporate_charge_id: number | null;
    discount_amount: string | null;
    discount_bill_id: number | null;
    markup_amount: string | null;
    markup_bill_id: number | null;
    tenant_total_charge_amount: string | null;
    tenant_charge_ids: string | null; // Comma-separated IDs?
    vendor_bill_amount: string | null;
    vendor_bill_id: number | null;
    vendor_charge_amount: string | null;
    vendor_charge_id: number | null;
    inspection_id: number | null;
    inspection_date: string | null;
    work_order_id: number | null;
    service_request_id: number | null;
    recurring: string | null;
    submitted_by_tenant: string | null;
    requesting_tenant: string | null;
    maintenance_limit: string | null;
    status_notes: string | null;
    follow_up_on: string | null;
    vendor_trade: string | null;
    unit_turn_category: string | null;
    work_order_issue: string | null;
    survey_id: number | null;
    vendor_portal_invoices: number | null;
  }>;
  next_page_url: string | null;
};

// Valid columns for the work order report
const VALID_WORK_ORDER_COLUMNS = [
  "property",
  "property_name", 
  "property_id",
  "property_address",
  "property_street",
  "property_street2", 
  "property_city",
  "property_state",
  "property_zip",
  "unit_address",
  "unit_street",
  "unit_street2",
  "unit_city", 
  "unit_state",
  "unit_zip",
  "priority",
  "work_order_type",
  "service_request_number",
  "service_request_description",
  "home_warranty_expiration",
  "work_order_number",
  "job_description",
  "instructions",
  "status",
  "vendor_id",
  "vendor",
  "unit_id",
  "unit_name",
  "occupancy_id",
  "primary_tenant",
  "primary_tenant_email",
  "primary_tenant_phone_number",
  "created_at",
  "created_by",
  "assigned_user",
  "estimate_req_on",
  "estimated_on",
  "estimate_amount",
  "estimate_approval_status",
  "estimate_approved_on",
  "estimate_approval_last_requested_on",
  "scheduled_start",
  "scheduled_end", 
  "work_completed_on",
  "completed_on",
  "last_billed_on",
  "canceled_on",
  "amount",
  "invoice",
  "unit_turn_id",
  "corporate_charge_amount",
  "corporate_charge_id",
  "discount_amount",
  "discount_bill_id",
  "markup_amount",
  "markup_bill_id",
  "tenant_total_charge_amount",
  "tenant_charge_ids",
  "vendor_bill_amount",
  "vendor_bill_id",
  "vendor_charge_amount",
  "vendor_charge_id",
  "inspection_id",
  "inspection_date",
  "work_order_id",
  "service_request_id",
  "recurring",
  "submitted_by_tenant",
  "requesting_tenant",
  "maintenance_limit",
  "status_notes",
  "follow_up_on",
  "vendor_trade",
  "unit_turn_category",
  "work_order_issue",
  "survey_id",
  "vendor_portal_invoices"
] as const;

// Zod schema for Work Order Report arguments  
const workOrderArgsBaseSchema = z.object({
  property_visibility: z.enum(["active", "hidden", "all"]).optional().default("active").describe('Filter properties by status. Defaults to "active".'),
  unit_ids: z.array(z.string()).optional().describe('Optional. Filter by specific unit IDs.'),
  property: z.object({ 
    property_id: z.string().describe(getIdFieldDescription('property_id', 'Property', 'property directory report'))
  }).optional().describe('Optional. Filter by a single property ID.'),
  parties_ids: z.object({ occupancies_ids: z.array(z.string()).optional() }).optional().describe('Optional. Filter by specific occupancy IDs.'),
  party_contact_info: z.object({ company_id: z.string() }).optional().describe('Optional. Filter by a specific vendor ID (company).'),
  assigned_user: z.string().optional().default("All").describe('Filter by assigned user ID or "All". Defaults to "All".'),
  created_by: z.string().optional().default("All").describe('Filter by creator user ID or "All". Defaults to "All".'),
  priority: z.enum(["All", "Low", "Medium", "High", "Urgent"]).optional().default("All").describe('Filter by priority. Defaults to "All".'),
  from_inspection: z.boolean().optional().default(false).describe('Optional. Filter by whether the work order originated from an inspection. Defaults to false.'),
  current_estimate_approval_status: z.enum(["All", "Pending", "Approved", "Declined"]).optional().default("All").describe('Filter by estimate approval status. Defaults to "All".'),
  work_order_statuses: z.array(z.string()).optional().describe('Optional. Filter by specific work order status IDs.'),
  work_order_types: z.array(z.enum(["unit_turn", "tenant_requested", "other"])).optional().describe('Optional. Filter by specific work order types.'),
  unit_turn_category: z.array(z.string()).optional().default(["all"]).describe('Filter by unit turn category. Defaults to [\"all\"].'),
  status_date_range_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional().describe('Optional. Start date for status date range filter (YYYY-MM-DD).'),
  status_date_range_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional().describe('Optional. End date for status date range filter (YYYY-MM-DD).'),
  status_date: z.enum(["all", "created_at", "completed_on"]).optional().default("all").describe('Field to use for status date range filtering. Defaults to "all".'),
  columns: z.array(z.enum(VALID_WORK_ORDER_COLUMNS as readonly [string, ...string[]])).optional().describe(`Array of specific columns to include in the report. Valid columns: ${VALID_WORK_ORDER_COLUMNS.join(', ')}`)
});

const workOrderArgsSchema = workOrderArgsBaseSchema.superRefine((data, ctx) => {
  // Validate property ID if provided
  if (data.property?.property_id) {
    const validationErrors = validatePropertiesIds({ properties_ids: [data.property.property_id] });
    throwOnValidationErrors(validationErrors);
  }
  
  // Validate unit IDs if provided
  if (data.unit_ids) {
    for (let i = 0; i < data.unit_ids.length; i++) {
      if (!/^\d+$/.test(data.unit_ids[i])) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['unit_ids', i],
          message: 'Unit ID must be a numeric string'
        });
      }
    }
  }
  
  // Validate occupancy IDs if provided
  if (data.parties_ids?.occupancies_ids) {
    for (let i = 0; i < data.parties_ids.occupancies_ids.length; i++) {
      if (!/^\d+$/.test(data.parties_ids.occupancies_ids[i])) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['parties_ids', 'occupancies_ids', i],
          message: 'Occupancy ID must be a numeric string'
        });
      }
    }
  }
  
  // Validate company ID if provided
  if (data.party_contact_info?.company_id && !/^\d+$/.test(data.party_contact_info.company_id)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['party_contact_info', 'company_id'],
      message: 'Company ID must be a numeric string'
    });
  }
});

export async function getWorkOrderReport(args: z.infer<typeof workOrderArgsSchema>): Promise<WorkOrderResult> {
  const {
    property_visibility = "active",
    assigned_user = "All",
    created_by = "All",
    priority = "All",
    current_estimate_approval_status = "All",
    status_date = "all",
    unit_turn_category = ["all"], // Default based on API description
    from_inspection = false, // Explicitly set default
    ...rest
  } = args;

  const payload: any = {
    property_visibility,
    assigned_user,
    created_by,
    priority,
    current_estimate_approval_status,
    status_date,
    unit_turn_category,
    ...rest
  };

  // Only include from_inspection if it's not false
  if (from_inspection) {
    payload.from_inspection = from_inspection;
  }

  return makeAppfolioApiCall<WorkOrderResult>('work_order.json', payload);
}

export function registerWorkOrderReportTool(server: McpServer) {
  server.tool(
    "get_work_order_report",
    "Generates a report on work orders. IMPORTANT: All ID parameters (unit_ids, property_id, etc.) must be numeric strings (e.g. '123'), NOT names. Use respective directory reports first to lookup IDs by name if needed.",
    workOrderArgsBaseSchema.shape as any,
    async (args: unknown, _extra: unknown) => {
      try {
        // Validate arguments against schema
        const parseResult = workOrderArgsSchema.safeParse(args);
        if (!parseResult.success) {
          const errorMessages = parseResult.error.errors.map(err => 
            `${err.path.join('.')}: ${err.message}`
          ).join('; ');
          throw new Error(`Invalid arguments: ${errorMessages}`);
        }

        const result = await getWorkOrderReport(parseResult.data);
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
        console.error(`Work Order Report Error:`, errorMessage);
        throw error;
      }
    }
  );
}

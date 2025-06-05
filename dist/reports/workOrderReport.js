"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWorkOrderReport = getWorkOrderReport;
exports.registerWorkOrderReportTool = registerWorkOrderReportTool;
const zod_1 = require("zod");
const appfolio_1 = require("../appfolio");
const validation_1 = require("../validation");
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
];
// Zod schema for Work Order Report arguments  
const workOrderArgsBaseSchema = zod_1.z.object({
    property_visibility: zod_1.z.enum(["active", "hidden", "all"]).optional().default("active").describe('Filter properties by status. Defaults to "active".'),
    unit_ids: zod_1.z.array(zod_1.z.string()).optional().describe('Optional. Filter by specific unit IDs.'),
    property: zod_1.z.object({
        property_id: zod_1.z.string().describe((0, validation_1.getIdFieldDescription)('property_id', 'Property', 'property directory report'))
    }).optional().describe('Optional. Filter by a single property ID.'),
    parties_ids: zod_1.z.object({ occupancies_ids: zod_1.z.array(zod_1.z.string()).optional() }).optional().describe('Optional. Filter by specific occupancy IDs.'),
    party_contact_info: zod_1.z.object({ company_id: zod_1.z.string() }).optional().describe('Optional. Filter by a specific vendor ID (company).'),
    assigned_user: zod_1.z.string().optional().default("All").describe('Filter by assigned user ID or "All". Defaults to "All".'),
    created_by: zod_1.z.string().optional().default("All").describe('Filter by creator user ID or "All". Defaults to "All".'),
    priority: zod_1.z.enum(["All", "Low", "Medium", "High", "Urgent"]).optional().default("All").describe('Filter by priority. Defaults to "All".'),
    from_inspection: zod_1.z.boolean().optional().default(false).describe('Optional. Filter by whether the work order originated from an inspection. Defaults to false.'),
    current_estimate_approval_status: zod_1.z.enum(["All", "Pending", "Approved", "Declined"]).optional().default("All").describe('Filter by estimate approval status. Defaults to "All".'),
    work_order_statuses: zod_1.z.array(zod_1.z.string()).optional().describe('Optional. Filter by specific work order status IDs.'),
    work_order_types: zod_1.z.array(zod_1.z.enum(["unit_turn", "tenant_requested", "other"])).optional().describe('Optional. Filter by specific work order types.'),
    unit_turn_category: zod_1.z.array(zod_1.z.string()).optional().default(["all"]).describe('Filter by unit turn category. Defaults to [\"all\"].'),
    status_date_range_from: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional().describe('Optional. Start date for status date range filter (YYYY-MM-DD).'),
    status_date_range_to: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional().describe('Optional. End date for status date range filter (YYYY-MM-DD).'),
    status_date: zod_1.z.enum(["all", "created_at", "completed_on"]).optional().default("all").describe('Field to use for status date range filtering. Defaults to "all".'),
    columns: zod_1.z.array(zod_1.z.enum(VALID_WORK_ORDER_COLUMNS)).optional().describe(`Array of specific columns to include in the report. Valid columns: ${VALID_WORK_ORDER_COLUMNS.join(', ')}`)
});
const workOrderArgsSchema = workOrderArgsBaseSchema.superRefine((data, ctx) => {
    // Validate property ID if provided
    if (data.property?.property_id) {
        const validationErrors = (0, validation_1.validatePropertiesIds)({ properties_ids: [data.property.property_id] });
        (0, validation_1.throwOnValidationErrors)(validationErrors);
    }
    // Validate unit IDs if provided
    if (data.unit_ids) {
        for (let i = 0; i < data.unit_ids.length; i++) {
            if (!/^\d+$/.test(data.unit_ids[i])) {
                ctx.addIssue({
                    code: zod_1.z.ZodIssueCode.custom,
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
                    code: zod_1.z.ZodIssueCode.custom,
                    path: ['parties_ids', 'occupancies_ids', i],
                    message: 'Occupancy ID must be a numeric string'
                });
            }
        }
    }
    // Validate company ID if provided
    if (data.party_contact_info?.company_id && !/^\d+$/.test(data.party_contact_info.company_id)) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            path: ['party_contact_info', 'company_id'],
            message: 'Company ID must be a numeric string'
        });
    }
});
async function getWorkOrderReport(args) {
    const { property_visibility = "active", assigned_user = "All", created_by = "All", priority = "All", current_estimate_approval_status = "All", status_date = "all", unit_turn_category = ["all"], // Default based on API description
    from_inspection = false, // Explicitly set default
    ...rest } = args;
    const payload = {
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
    return (0, appfolio_1.makeAppfolioApiCall)('work_order.json', payload);
}
function registerWorkOrderReportTool(server) {
    server.tool("get_work_order_report", "Generates a report on work orders. IMPORTANT: All ID parameters (unit_ids, property_id, etc.) must be numeric strings (e.g. '123'), NOT names. Use respective directory reports first to lookup IDs by name if needed.", workOrderArgsBaseSchema.shape, async (args, _extra) => {
        try {
            // Validate arguments against schema
            const parseResult = workOrderArgsSchema.safeParse(args);
            if (!parseResult.success) {
                const errorMessages = parseResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('; ');
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
        }
        catch (error) {
            // Enhanced error reporting for debugging
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`Work Order Report Error:`, errorMessage);
            throw error;
        }
    });
}

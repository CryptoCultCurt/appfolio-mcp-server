"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWorkOrderReport = getWorkOrderReport;
exports.registerWorkOrderReportTool = registerWorkOrderReportTool;
const zod_1 = require("zod");
const appfolio_1 = require("../appfolio");
// Zod schema for Work Order Report arguments
const workOrderArgsSchema = zod_1.z.object({
    property_visibility: zod_1.z.enum(["active", "hidden", "all"]).optional().default("active").describe('Filter properties by status. Defaults to "active".'),
    unit_ids: zod_1.z.array(zod_1.z.string()).optional().describe('Optional. Filter by specific unit IDs.'),
    property: zod_1.z.object({ property_id: zod_1.z.string() }).optional().describe('Optional. Filter by a single property ID.'),
    parties_ids: zod_1.z.object({ occupancies_ids: zod_1.z.array(zod_1.z.string()).optional() }).optional().describe('Optional. Filter by specific occupancy IDs.'),
    party_contact_info: zod_1.z.object({ company_id: zod_1.z.string() }).optional().describe('Optional. Filter by a specific vendor ID (company).'),
    assigned_user: zod_1.z.string().optional().default("All").describe('Filter by assigned user ID or "All". Defaults to "All".'),
    created_by: zod_1.z.string().optional().default("All").describe('Filter by creator user ID or "All". Defaults to "All".'),
    priority: zod_1.z.enum(["All", "Low", "Medium", "High", "Urgent"]).optional().default("All").describe('Filter by priority. Defaults to "All".'),
    from_inspection: zod_1.z.boolean().nullable().optional().describe('Optional. Filter by whether the work order originated from an inspection. Set to null to omit filter.'),
    current_estimate_approval_status: zod_1.z.enum(["All", "Pending", "Approved", "Declined"]).optional().default("All").describe('Filter by estimate approval status. Defaults to "All".'),
    work_order_statuses: zod_1.z.array(zod_1.z.string()).optional().describe('Optional. Filter by specific work order status IDs.'),
    work_order_types: zod_1.z.array(zod_1.z.enum(["unit_turn", "tenant_requested", "other"])).optional().describe('Optional. Filter by specific work order types.'),
    unit_turn_category: zod_1.z.array(zod_1.z.string()).optional().default(["all"]).describe('Filter by unit turn category. Defaults to [\"all\"].'),
    status_date_range_from: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional().describe('Optional. Start date for status date range filter (YYYY-MM-DD).'),
    status_date_range_to: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional().describe('Optional. End date for status date range filter (YYYY-MM-DD).'),
    status_date: zod_1.z.enum(["all", "created_at", "completed_on"]).optional().default("all").describe('Field to use for status date range filtering. Defaults to "all".'),
    columns: zod_1.z.array(zod_1.z.string()).optional().describe('Array of specific columns to include in the report')
});
async function getWorkOrderReport(args) {
    const { property_visibility = "active", assigned_user = "All", created_by = "All", priority = "All", current_estimate_approval_status = "All", status_date = "all", unit_turn_category = ["all"], // Default based on API description
    from_inspection = null, // Explicitly set default
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
    // Only include from_inspection if it's not null
    if (from_inspection !== null) {
        payload.from_inspection = from_inspection;
    }
    return (0, appfolio_1.makeAppfolioApiCall)('work_order.json', payload);
}
function registerWorkOrderReportTool(server) {
    server.tool("get_work_order_report", "Generates a report on work orders.", workOrderArgsSchema.shape, async (args, _extra) => {
        const data = await getWorkOrderReport(args);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(data),
                    mimeType: "application/json"
                }
            ]
        };
    });
}

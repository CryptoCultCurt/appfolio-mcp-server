"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCompletedWorkflowsReport = getCompletedWorkflowsReport;
exports.registerCompletedWorkflowsReportTool = registerCompletedWorkflowsReportTool;
const zod_1 = require("zod");
const appfolio_1 = require("../appfolio");
const validation_1 = require("../validation");
// Originally from src/index.ts (line 74), with defaults added
const completedWorkflowsArgsSchema = zod_1.z.object({
    attachables: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional().describe((0, validation_1.getIdFieldDescription)('properties_ids', 'Property', 'Property Directory Report')),
        units_ids: zod_1.z.array(zod_1.z.string()).optional().describe((0, validation_1.getIdFieldDescription)('units_ids', 'Unit', 'Unit Directory Report')),
        tenants_ids: zod_1.z.array(zod_1.z.string()).optional().describe((0, validation_1.getIdFieldDescription)('tenants_ids', 'Tenant', 'Tenant Directory Report')),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional().describe((0, validation_1.getIdFieldDescription)('owners_ids', 'Owner', 'Owner Directory Report')),
        rental_applications_ids: zod_1.z.array(zod_1.z.string()).optional().describe((0, validation_1.getIdFieldDescription)('rental_applications_ids', 'Rental Application')),
        guest_cards_ids: zod_1.z.array(zod_1.z.string()).optional().describe((0, validation_1.getIdFieldDescription)('guest_cards_ids', 'Guest Card')),
        guest_card_interests_ids: zod_1.z.array(zod_1.z.string()).optional().describe((0, validation_1.getIdFieldDescription)('guest_card_interests_ids', 'Guest Card Interest')),
        service_requests_ids: zod_1.z.array(zod_1.z.string()).optional().describe((0, validation_1.getIdFieldDescription)('service_requests_ids', 'Service Request')),
        vendors_ids: zod_1.z.array(zod_1.z.string()).optional().describe((0, validation_1.getIdFieldDescription)('vendors_ids', 'Vendor', 'Vendor Directory Report')),
    }).optional().describe('Filter results based on specific attached entities. All ID fields must be numeric strings, not names.'),
    property_visibility: zod_1.z.enum(["active", "hidden", "all"]).default("active").describe('Filter by property visibility. Defaults to "active"'),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional().describe((0, validation_1.getIdFieldDescription)('properties_ids', 'Property', 'Property Directory Report')),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional().describe((0, validation_1.getIdFieldDescription)('property_groups_ids', 'Property Group')),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional().describe((0, validation_1.getIdFieldDescription)('portfolios_ids', 'Portfolio')),
    }).optional().describe('Filter results based on properties, groups, or portfolios. All ID fields must be numeric strings, not names.'),
    process_template: zod_1.z.string().default("All").optional().describe('Filter by specific process template name. Defaults to "All"'),
    workflow_step: zod_1.z.string().default("All").optional().describe('Filter by specific workflow step name. Defaults to "All"'),
    assigned_user: zod_1.z.string().default("All").optional().describe('Filter by assigned user ID or "All". Defaults to "All". NOTE: Expects numeric user IDs (e.g. "4"), not user names. There is no user directory report available to lookup IDs by name.'),
    date_range_from: zod_1.z.string().optional().describe('Start date for the completion date range (YYYY-MM-DD)'),
    date_range_to: zod_1.z.string().optional().describe('End date for the completion date range (YYYY-MM-DD)'),
    columns: zod_1.z.array(zod_1.z.string()).optional().describe('Array of specific columns to include in the report')
});
// Originally from src/appfolio.ts (function starting line 1582)
async function getCompletedWorkflowsReport(args) {
    // Validate ID fields
    const validationErrors = [];
    if (args.attachables) {
        validationErrors.push(...(0, validation_1.validateWorkflowIds)(args.attachables));
    }
    if (args.properties) {
        validationErrors.push(...(0, validation_1.validatePropertiesIds)(args.properties));
    }
    (0, validation_1.throwOnValidationErrors)(validationErrors);
    const { property_visibility = "active", ...rest } = args;
    const payload = { property_visibility, ...rest };
    return (0, appfolio_1.makeAppfolioApiCall)('completed_processes.json', payload);
}
// New registration function for MCP
function registerCompletedWorkflowsReportTool(server) {
    server.tool("get_completed_workflows_report", "Returns a report of completed workflows (processes) based on the provided filters. IMPORTANT: All ID parameters (owners_ids, properties_ids, units_ids, etc.) must be numeric strings (e.g. '123'), NOT names. Use directory reports first to lookup IDs by name if needed.", completedWorkflowsArgsSchema.shape, async (toolArgs) => {
        const data = await getCompletedWorkflowsReport(toolArgs);
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

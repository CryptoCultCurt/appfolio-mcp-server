"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInProgressWorkflowsReport = getInProgressWorkflowsReport;
exports.registerInProgressWorkflowsReportTool = registerInProgressWorkflowsReportTool;
const zod_1 = require("zod");
const appfolio_1 = require("../appfolio");
// Originally from src/index.ts (line 76), with defaults added
const inProgressWorkflowsArgsSchema = zod_1.z.object({
    attachables: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        units_ids: zod_1.z.array(zod_1.z.string()).optional(),
        tenants_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional(),
        rental_applications_ids: zod_1.z.array(zod_1.z.string()).optional(),
        guest_cards_ids: zod_1.z.array(zod_1.z.string()).optional(),
        guest_card_interests_ids: zod_1.z.array(zod_1.z.string()).optional(),
        service_requests_ids: zod_1.z.array(zod_1.z.string()).optional(),
        vendors_ids: zod_1.z.array(zod_1.z.string()).optional(),
    }).optional().describe('Filter results based on specific attached entities'),
    property_visibility: zod_1.z.enum(["active", "hidden", "all"]).default("active").optional().describe('Filter properties by status. Defaults to "active"'),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
    }).optional().describe('Filter results based on properties, groups, or portfolios'),
    process_template: zod_1.z.string().default("All").optional().describe('Filter by specific process template name. Defaults to "All"'),
    workflow_step: zod_1.z.string().default("All").optional().describe('Filter by specific workflow step name. Defaults to "All"'),
    assigned_user: zod_1.z.string().default("All").optional().describe('Filter by assigned user name. Defaults to "All"'),
    date_range_from: zod_1.z.string().optional().describe('Start date for the due date range (YYYY-MM-DD)'),
    date_range_to: zod_1.z.string().optional().describe('End date for the due date range (YYYY-MM-DD)'),
    columns: zod_1.z.array(zod_1.z.string()).optional().describe('Array of specific columns to include in the report')
});
// Originally from src/appfolio.ts (function starting line 1517)
async function getInProgressWorkflowsReport(args) {
    const { property_visibility = "active", ...rest } = args;
    const payload = { property_visibility, ...rest };
    return (0, appfolio_1.makeAppfolioApiCall)('in_progress_processes.json', payload);
}
// New registration function for MCP
function registerInProgressWorkflowsReportTool(server) {
    server.tool("get_in_progress_workflows_report", "Returns a report of in-progress workflows based on the provided filters.", // Description from original registration
    inProgressWorkflowsArgsSchema.shape, async (toolArgs) => {
        const data = await getInProgressWorkflowsReport(toolArgs);
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

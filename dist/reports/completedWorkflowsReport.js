"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCompletedWorkflowsReport = getCompletedWorkflowsReport;
exports.registerCompletedWorkflowsReportTool = registerCompletedWorkflowsReportTool;
const axios_1 = __importDefault(require("axios"));
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
const appfolio_1 = require("../appfolio");
dotenv_1.default.config();
const { VHOST, USERNAME, PASSWORD } = process.env;
// Originally from src/index.ts (line 74), with defaults added
const completedWorkflowsArgsSchema = zod_1.z.object({
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
    }).optional(),
    property_visibility: zod_1.z.enum(["active", "hidden", "all"]).default("active").describe('Filter by property visibility. Defaults to "active"'),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
    }).optional(),
    process_template: zod_1.z.string().default("All").optional().describe('Filter by specific process template name. Defaults to "All"'),
    workflow_step: zod_1.z.string().default("All").optional().describe('Filter by specific workflow step name. Defaults to "All"'),
    assigned_user: zod_1.z.string().default("All").optional().describe('Filter by assigned user name. Defaults to "All"'),
    date_range_from: zod_1.z.string().optional().describe('Start date for the completion date range (YYYY-MM-DD)'),
    date_range_to: zod_1.z.string().optional().describe('End date for the completion date range (YYYY-MM-DD)'),
    columns: zod_1.z.array(zod_1.z.string()).optional().describe('Array of specific columns to include in the report')
});
// Originally from src/appfolio.ts (function starting line 1582)
async function getCompletedWorkflowsReport(args) {
    if (!VHOST || !USERNAME || !PASSWORD) {
        throw new Error('Missing AppFolio API credentials');
    }
    // Defaults are now handled by Zod schema, so we can simplify payload creation
    const payload = args;
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/completed_processes.json`;
    const response = await appfolio_1.appfolioLimiter.schedule(() => axios_1.default.post(url, payload, {
        auth: { username: USERNAME, password: PASSWORD },
        headers: { 'Content-Type': 'application/json' },
    }));
    return response.data;
}
// New registration function for MCP
function registerCompletedWorkflowsReportTool(server) {
    server.tool("get_completed_workflows_report", "Returns a report of completed workflows (processes) based on the provided filters.", // Description from original registration
    completedWorkflowsArgsSchema.shape, async (toolArgs) => {
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

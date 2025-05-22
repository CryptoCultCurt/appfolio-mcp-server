"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelledWorkflowsArgsSchema = void 0;
exports.getCancelledWorkflowsReport = getCancelledWorkflowsReport;
exports.registerCancelledWorkflowsReportTool = registerCancelledWorkflowsReportTool;
const zod_1 = require("zod");
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const appfolio_1 = require("../appfolio"); // Assuming appfolioLimiter is exported from appfolio.ts
dotenv_1.default.config();
const { VHOST, USERNAME, PASSWORD } = process.env;
// Zod schema for Cancelled Workflows Report arguments
exports.cancelledWorkflowsArgsSchema = zod_1.z.object({
    attachables: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        units_ids: zod_1.z.array(zod_1.z.string()).optional(),
        tenants_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional(),
        rental_applications_ids: zod_1.z.array(zod_1.z.string()).optional(),
        guest_cards_ids: zod_1.z.array(zod_1.z.string()).optional(),
        guest_card_interests_ids: zod_1.z.array(zod_1.z.string()).optional(),
        service_requests_ids: zod_1.z.array(zod_1.z.string()).optional(),
        vendors_ids: zod_1.z.array(zod_1.z.string()).optional()
    }).optional().describe('Filter results based on specific attached entities'),
    property_visibility: zod_1.z.enum(["active", "hidden", "all"]).default("active").describe('Filter properties by status. Defaults to "active"'),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional()
    }).optional().describe('Filter results based on properties, groups, or portfolios'),
    process_template: zod_1.z.string().default("All").describe('Filter by specific process template name. Defaults to "All"'),
    workflow_step: zod_1.z.string().default("All").describe('Filter by specific workflow step name. Defaults to "All"'),
    assigned_user: zod_1.z.string().default("All").describe('Filter by assigned user name. Defaults to "All"'),
    date_range_from: zod_1.z.string().optional().describe('Start date for the cancellation date range (YYYY-MM-DD)'),
    date_range_to: zod_1.z.string().optional().describe('End date for the cancellation date range (YYYY-MM-DD)'),
    cancelled_by: zod_1.z.string().default("All").describe('Filter by the user who cancelled the workflow. Defaults to "All"'),
    columns: zod_1.z.array(zod_1.z.string()).optional().describe('Array of specific columns to include in the report')
});
// --- Cancelled Workflows Report Function ---
async function getCancelledWorkflowsReport(args) {
    if (!VHOST || !USERNAME || !PASSWORD)
        throw new Error('Missing AppFolio API credentials');
    // Defaults are handled by Zod schema now
    const payload = { ...args };
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/cancelled_processes.json`;
    const response = await appfolio_1.appfolioLimiter.schedule(() => axios_1.default.post(url, payload, {
        auth: { username: USERNAME, password: PASSWORD },
        headers: { 'Content-Type': 'application/json' },
    }));
    return response.data;
}
// Registration function for the tool
function registerCancelledWorkflowsReportTool(server) {
    server.tool("get_cancelled_workflows_report", "Retrieves a report of cancelled workflows, allowing filtering by various criteria such as properties, process templates, and date ranges.", exports.cancelledWorkflowsArgsSchema.shape, async (args) => {
        const result = await getCancelledWorkflowsReport(args);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(result, null, 2),
                    mimeType: "application/json"
                }
            ]
        };
    });
}

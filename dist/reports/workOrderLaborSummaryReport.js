"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.workOrderLaborSummaryInputSchema = void 0;
exports.getWorkOrderLaborSummaryReport = getWorkOrderLaborSummaryReport;
exports.registerWorkOrderLaborSummaryReportTool = registerWorkOrderLaborSummaryReportTool;
const zod_1 = require("zod");
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const appfolio_1 = require("../appfolio"); // Assuming appfolioLimiter is exported from appfolio.ts or a central place
dotenv_1.default.config();
const { VHOST, USERNAME, PASSWORD } = process.env;
// --- Zod Schema for Work Order Labor Summary Report arguments ---
exports.workOrderLaborSummaryInputSchema = zod_1.z.object({
    property_visibility: zod_1.z.enum(["active", "hidden", "all"]).optional().default("active").describe('Filter properties by status. Defaults to "active"'),
    maintenance_tech: zod_1.z.string().optional().default("All").describe('Filter by maintenance technician. Defaults to "All"'),
    labor_performed_from: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "labor_performed_from must be in YYYY-MM-DD format" }).describe('Start date for labor performed (YYYY-MM-DD)'),
    labor_performed_to: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "labor_performed_to must be in YYYY-MM-DD format" }).describe('End date for labor performed (YYYY-MM-DD)'),
    unit_turn: zod_1.z.enum(["0", "1"]).optional().default("0").describe('Filter by unit turn. Defaults to "0" (false)'),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional()
    }).optional().describe('Filter by specific properties, groups, portfolios, or owners'),
    columns: zod_1.z.array(zod_1.z.string()).optional().describe('Array of specific columns to include in the report'),
    // work_order_statuses is in WorkOrderLaborSummaryArgs but not in the original Zod schema from index.ts. Adding it as optional.
    work_order_statuses: zod_1.z.array(zod_1.z.string()).optional().describe('Filter by work order status IDs'),
});
// --- Work Order Labor Summary Report Function ---
async function getWorkOrderLaborSummaryReport(args) {
    if (!VHOST || !USERNAME || !PASSWORD)
        throw new Error('Missing AppFolio API credentials');
    // Validation for labor_performed_from and labor_performed_to is handled by Zod schema
    // Defaults are handled by Zod schema
    const payload = { ...args };
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/work_order_labor_summary.json`;
    const response = await appfolio_1.appfolioLimiter.schedule(() => axios_1.default.post(url, payload, {
        auth: { username: USERNAME, password: PASSWORD },
        headers: { 'Content-Type': 'application/json' },
    }));
    return response.data;
}
// --- MCP Tool Registration Function ---
function registerWorkOrderLaborSummaryReportTool(server) {
    server.tool("get_work_order_labor_summary_report", "Returns a report detailing work order labor based on specified filters.", exports.workOrderLaborSummaryInputSchema.shape, async (args, _extra) => {
        const data = await getWorkOrderLaborSummaryReport(args);
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

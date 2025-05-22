"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.propertyPerformanceArgsSchema = void 0;
exports.getPropertyPerformanceReport = getPropertyPerformanceReport;
exports.registerPropertyPerformanceReportTool = registerPropertyPerformanceReportTool;
const zod_1 = require("zod");
const axios_1 = __importDefault(require("axios"));
const appfolio_1 = require("../appfolio");
const { VHOST, USERNAME, PASSWORD } = process.env;
// Zod schema for Property Performance Report arguments
exports.propertyPerformanceArgsSchema = zod_1.z.object({
    property_visibility: zod_1.z.enum(["active", "hidden", "all"]).default("active").describe('Filter properties by status. Defaults to "active"'),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional()
    }).optional().describe('Filter results based on properties, groups, portfolios, or owners'),
    gl_account_ids: zod_1.z.array(zod_1.z.string()).optional().describe('Filter results by specific GL Account IDs'),
    posted_on_from: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The start date for the reporting period (YYYY-MM-DD). Required.'),
    posted_on_to: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The end date for the reporting period (YYYY-MM-DD). Required.'),
    columns: zod_1.z.array(zod_1.z.string()).optional().describe('Array of specific columns to include in the report')
});
// --- Property Performance Report Function ---
async function getPropertyPerformanceReport(args) {
    if (!VHOST || !USERNAME || !PASSWORD)
        throw new Error('Missing AppFolio API credentials');
    // Validation for posted_on_from and posted_on_to is now handled by Zod schema
    const payload = { ...args };
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/property_performance.json`;
    const response = await appfolio_1.appfolioLimiter.schedule(() => axios_1.default.post(url, payload, {
        auth: { username: USERNAME, password: PASSWORD },
        headers: { 'Content-Type': 'application/json' },
    }));
    return response.data;
}
function registerPropertyPerformanceReportTool(server) {
    server.tool('get_property_performance_report', 'Retrieves the Property Performance report, showing financial performance metrics for properties within a specified date range.', exports.propertyPerformanceArgsSchema.shape, async (args) => {
        const reportData = await getPropertyPerformanceReport(args);
        return {
            content: [{ type: 'text', text: JSON.stringify(reportData, null, 2) }],
        };
    });
}

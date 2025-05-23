"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.propertyPerformanceArgsSchema = void 0;
exports.getPropertyPerformanceReport = getPropertyPerformanceReport;
exports.registerPropertyPerformanceReportTool = registerPropertyPerformanceReportTool;
const zod_1 = require("zod");
const appfolio_1 = require("../appfolio");
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
    period_from: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The start date for the reporting period (YYYY-MM-DD). Required.'),
    period_to: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The end date for the reporting period (YYYY-MM-DD). Required.'),
    columns: zod_1.z.array(zod_1.z.string()).optional().describe('Array of specific columns to include in the report')
});
// --- Property Performance Report Function ---
async function getPropertyPerformanceReport(args) {
    if (!args.period_from || !args.period_to) {
        throw new Error('Missing required arguments: period_from and period_to (format YYYY-MM-DD)');
    }
    const { property_visibility = "active", ...rest } = args;
    const payload = { property_visibility, ...rest };
    return (0, appfolio_1.makeAppfolioApiCall)('property_performance.json', payload);
}
function registerPropertyPerformanceReportTool(server) {
    server.tool('get_property_performance_report', 'Retrieves the Property Performance report, showing financial performance metrics for properties within a specified date range.', exports.propertyPerformanceArgsSchema.shape, async (args) => {
        const reportData = await getPropertyPerformanceReport(args);
        return {
            content: [{ type: 'text', text: JSON.stringify(reportData, null, 2) }],
        };
    });
}

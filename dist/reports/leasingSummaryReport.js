"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leasingSummaryArgsSchema = void 0;
exports.getLeasingSummaryReport = getLeasingSummaryReport;
exports.registerLeasingSummaryReportTool = registerLeasingSummaryReportTool;
const zod_1 = require("zod");
const appfolio_1 = require("../appfolio");
// Zod schema for Leasing Summary Report arguments
exports.leasingSummaryArgsSchema = zod_1.z.object({
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional()
    }).optional().describe('Filter results based on properties, groups, portfolios, or owners'),
    unit_visibility: zod_1.z.enum(["active", "hidden", "all"]).default("active").describe('Filter units by status. Defaults to "active"'),
    posted_on_from: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The start date for the reporting period (YYYY-MM-DD). Required.'),
    posted_on_to: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The end date for the reporting period (YYYY-MM-DD). Required.'),
    columns: zod_1.z.array(zod_1.z.string()).optional().describe('Array of specific columns to include in the report')
});
// --- Leasing Summary Report Function ---
async function getLeasingSummaryReport(args) {
    if (!args.posted_on_from || !args.posted_on_to) {
        throw new Error('Missing required arguments: posted_on_from and posted_on_to (format YYYY-MM-DD)');
    }
    const { unit_visibility = "active", ...rest } = args;
    const payload = { unit_visibility, ...rest };
    return (0, appfolio_1.makeAppfolioApiCall)('leasing_summary.json', payload);
}
// --- Register Leasing Summary Report Tool ---
function registerLeasingSummaryReportTool(server) {
    server.tool("get_leasing_summary_report", "Provides a summary of leasing activities, including inquiries, showings, applications, and move-ins/outs.", exports.leasingSummaryArgsSchema.shape, async (args, _extra) => {
        const data = await getLeasingSummaryReport(args);
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

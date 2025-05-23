"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getResidentFinancialActivityReport = getResidentFinancialActivityReport;
exports.registerResidentFinancialActivityReportTool = registerResidentFinancialActivityReportTool;
const zod_1 = require("zod");
const appfolio_1 = require("../appfolio");
const residentFinancialActivityInputSchema = zod_1.z.object({
    property_visibility: zod_1.z.enum(["active", "hidden", "all"]).optional().default("active"),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional()
    }).optional(),
    occurred_on_from: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
    occurred_on_to: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
    include_voided: zod_1.z.boolean().optional().default(false),
    columns: zod_1.z.array(zod_1.z.string()).optional()
});
async function getResidentFinancialActivityReport(args) {
    if (!args.occurred_on_from || !args.occurred_on_to) {
        throw new Error('Missing required arguments: occurred_on_from and occurred_on_to (format YYYY-MM-DD)');
    }
    const { property_visibility = "active", ...rest } = args;
    const payload = { property_visibility, ...rest };
    return (0, appfolio_1.makeAppfolioApiCall)('resident_financial_activity.json', payload);
}
function registerResidentFinancialActivityReportTool(server) {
    server.tool("get_resident_financial_activity_report", "Returns resident financial activity report for the given filters.", residentFinancialActivityInputSchema.shape, async (args, _extra) => {
        const data = await getResidentFinancialActivityReport(args);
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

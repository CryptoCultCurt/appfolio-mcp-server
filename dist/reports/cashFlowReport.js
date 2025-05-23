"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCashflowReport = getCashflowReport;
exports.registerCashflowReportTool = registerCashflowReportTool;
const zod_1 = require("zod");
const appfolio_1 = require("../appfolio");
async function getCashflowReport(args) {
    return (0, appfolio_1.makeAppfolioApiCall)('cash_flow_detail.json', args);
}
// Zod schema for Cash Flow Report arguments
const cashflowInputSchema = zod_1.z.object({
    property_visibility: zod_1.z.string(),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional(),
    }).optional(),
    posted_on_from: zod_1.z.string(),
    posted_on_to: zod_1.z.string(),
    gl_account_map_id: zod_1.z.string().optional(),
    exclude_suppressed_fees: zod_1.z.string().optional(),
    columns: zod_1.z.array(zod_1.z.string()).optional(),
});
function registerCashflowReportTool(server) {
    server.tool("get_cashflow_report", "Returns Cash Flow Details including income and expenses for given time period.", cashflowInputSchema.shape, async (args, _extra) => {
        const data = await getCashflowReport(args);
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

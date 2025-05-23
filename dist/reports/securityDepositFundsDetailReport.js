"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSecurityDepositFundsDetailReport = getSecurityDepositFundsDetailReport;
exports.registerSecurityDepositFundsDetailReportTool = registerSecurityDepositFundsDetailReportTool;
const zod_1 = require("zod");
const appfolio_1 = require("../appfolio");
const securityDepositFundsDetailInputSchema = zod_1.z.object({
    property_visibility: zod_1.z.enum(["active", "hidden", "all"]).optional().default("active"),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional()
    }).optional(),
    as_of_date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
    include_voided: zod_1.z.boolean().optional().default(false),
    columns: zod_1.z.array(zod_1.z.string()).optional()
});
async function getSecurityDepositFundsDetailReport(args) {
    return (0, appfolio_1.makeAppfolioApiCall)('security_deposit_funds_detail.json', args);
}
function registerSecurityDepositFundsDetailReportTool(server) {
    server.tool("get_security_deposit_funds_detail_report", "Returns security deposit funds detail report for the given filters.", securityDepositFundsDetailInputSchema.shape, async (args, _extra) => {
        const data = await getSecurityDepositFundsDetailReport(args);
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

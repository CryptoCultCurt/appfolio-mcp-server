"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSecurityDepositFundsDetailReport = getSecurityDepositFundsDetailReport;
exports.registerSecurityDepositFundsDetailReportTool = registerSecurityDepositFundsDetailReportTool;
const zod_1 = require("zod");
const appfolio_1 = require("../appfolio");
const axios_1 = __importDefault(require("axios"));
const { VHOST, USERNAME, PASSWORD } = process.env;
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
    if (!VHOST || !USERNAME || !PASSWORD)
        throw new Error('Missing AppFolio API credentials');
    const payload = { ...args };
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/security_deposit_funds_detail.json`;
    const response = await appfolio_1.appfolioLimiter.schedule(() => axios_1.default.post(url, payload, {
        auth: { username: USERNAME, password: PASSWORD },
        headers: { 'Content-Type': 'application/json' },
    }));
    return response.data;
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

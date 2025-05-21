"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCashflowReport = getCashflowReport;
exports.registerCashflowReportTool = registerCashflowReportTool;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const appfolio_1 = require("../appfolio");
const zod_1 = require("zod");
dotenv_1.default.config();
const { VHOST, USERNAME, PASSWORD } = process.env;
async function getCashflowReport(args) {
    if (!VHOST || !USERNAME || !PASSWORD)
        throw new Error('Missing AppFolio API credentials');
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/cash_flow_detail.json`;
    const response = await appfolio_1.appfolioLimiter.schedule(() => axios_1.default.post(url, args, {
        auth: { username: USERNAME, password: PASSWORD },
        headers: { 'Content-Type': 'application/json' },
    }));
    return response.data;
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

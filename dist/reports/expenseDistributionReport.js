"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.expenseDistributionInputSchema = void 0;
exports.getExpenseDistributionReport = getExpenseDistributionReport;
exports.registerExpenseDistributionReportTool = registerExpenseDistributionReportTool;
const zod_1 = require("zod");
const axios_1 = __importDefault(require("axios"));
const bottleneck_1 = __importDefault(require("bottleneck"));
const { VHOST, USERNAME, PASSWORD } = process.env;
// Limiter, assuming it's used by this report function or similar ones
const appfolioLimiter = new bottleneck_1.default({
    reservoir: 7,
    reservoirRefreshAmount: 7,
    reservoirRefreshInterval: 15 * 1000,
    maxConcurrent: 1
});
async function getExpenseDistributionReport(args) {
    if (!VHOST || !USERNAME || !PASSWORD)
        throw new Error('Missing AppFolio API credentials');
    const payload = { ...args, property_visibility: args.property_visibility ?? "active" };
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/expense_distribution.json`;
    const response = await appfolioLimiter.schedule(() => axios_1.default.post(url, payload, {
        auth: { username: USERNAME, password: PASSWORD },
        headers: { 'Content-Type': 'application/json' },
    }));
    return response.data;
}
exports.expenseDistributionInputSchema = zod_1.z.object({
    property_visibility: zod_1.z.string().default("active").optional(),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional(),
    }).optional(),
    party_contact_info: zod_1.z.object({
        company_id: zod_1.z.string().optional(),
    }).optional(),
    posted_on_from: zod_1.z.string().describe("Required. Start date for posted_on range in YYYY-MM-DD format."),
    posted_on_to: zod_1.z.string().describe("Required. End date for posted_on range in YYYY-MM-DD format."),
    gl_account_map_id: zod_1.z.string().optional(),
    columns: zod_1.z.array(zod_1.z.string()).optional(),
});
function registerExpenseDistributionReportTool(server) {
    server.tool("get_expense_distribution_report", "Returns expense distribution report for the given filters.", exports.expenseDistributionInputSchema.shape, async (args, _extra) => {
        const data = await getExpenseDistributionReport(args);
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

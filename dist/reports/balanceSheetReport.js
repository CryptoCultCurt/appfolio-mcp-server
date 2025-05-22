"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.balanceSheetInputSchema = void 0;
exports.getBalanceSheetReport = getBalanceSheetReport;
exports.registerBalanceSheetReportTool = registerBalanceSheetReportTool;
const zod_1 = require("zod");
const axios_1 = __importDefault(require("axios"));
const bottleneck_1 = __importDefault(require("bottleneck"));
const { VHOST, USERNAME, PASSWORD } = process.env;
const appfolioLimiter = new bottleneck_1.default({
    reservoir: 7,
    reservoirRefreshAmount: 7,
    reservoirRefreshInterval: 15 * 1000,
    maxConcurrent: 1
});
async function getBalanceSheetReport(args) {
    if (!VHOST || !USERNAME || !PASSWORD)
        throw new Error('Missing AppFolio API credentials');
    if (!args.posted_on_to) {
        throw new Error('posted_on_to is required');
    }
    const { property_visibility = "active", level_of_detail = "detail_view", include_zero_balance_gl_accounts = "0", ...rest } = args;
    const payload = {
        property_visibility,
        level_of_detail,
        include_zero_balance_gl_accounts,
        ...rest
    };
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/balance_sheet.json`;
    const response = await appfolioLimiter.schedule(() => axios_1.default.post(url, payload, {
        auth: { username: USERNAME, password: PASSWORD },
        headers: { 'Content-Type': 'application/json' },
    }));
    return response.data;
}
exports.balanceSheetInputSchema = zod_1.z.object({
    property_visibility: zod_1.z.enum(["active", "hidden", "all"]).default("active").optional(),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional(),
    }).optional(),
    posted_on_to: zod_1.z.string().describe("Required. Date to run the report as of in YYYY-MM-DD format."),
    gl_account_map_id: zod_1.z.string().optional(),
    level_of_detail: zod_1.z.enum(["detail_view", "summary_view"]).default("detail_view").optional(),
    include_zero_balance_gl_accounts: zod_1.z.enum(["0", "1"]).default("0").optional(),
    columns: zod_1.z.array(zod_1.z.string()).optional(),
});
function registerBalanceSheetReportTool(server) {
    server.tool("get_balance_sheet_report", "Returns the balance sheet report for the given filters.", exports.balanceSheetInputSchema.shape, async (args, _extra) => {
        const data = await getBalanceSheetReport(args);
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

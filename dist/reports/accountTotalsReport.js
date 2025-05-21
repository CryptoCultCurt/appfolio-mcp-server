"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAccountTotalsReport = getAccountTotalsReport;
exports.registerAccountTotalsReportTool = registerAccountTotalsReportTool;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
const appfolio_1 = require("../appfolio"); // Assuming this will be correctly exported
dotenv_1.default.config();
const { VHOST, USERNAME, PASSWORD } = process.env;
async function getAccountTotalsReport(args) {
    if (!VHOST || !USERNAME || !PASSWORD)
        throw new Error('Missing AppFolio API credentials');
    // Default for gl_account_ids is handled in the server.tool registration or here if preferred.
    // The original server.tool had: { ...args, gl_account_ids: args.gl_account_ids ?? "1" }
    // We'll keep the core function clean and let the registration logic handle defaults if possible,
    // or apply it here if it's intrinsic to the function's direct use.
    // For now, assuming args comes with gl_account_ids potentially undefined, and API handles it or schema default works.
    const payload = { ...args };
    if (args.gl_account_ids === undefined) {
        payload.gl_account_ids = "1"; // Explicitly set default if not provided, matching original server.tool logic
    }
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/account_totals.json`;
    const response = await appfolio_1.appfolioLimiter.schedule(() => axios_1.default.post(url, payload, {
        auth: { username: USERNAME, password: PASSWORD },
        headers: { 'Content-Type': 'application/json' },
    }));
    return response.data;
}
const accountTotalsInputSchema = zod_1.z.object({
    property_visibility: zod_1.z.string(),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional(),
    }).optional(),
    gl_account_ids: zod_1.z.string().default("1"), // Defaulting to "1" as per original logic, can also be '[1,2]' if that was intended
    posted_on_from: zod_1.z.string(),
    posted_on_to: zod_1.z.string(),
    columns: zod_1.z.array(zod_1.z.string()).optional(),
});
function registerAccountTotalsReportTool(server) {
    server.tool("get_account_totals_report", "Returns account totals for given filters and date range.", accountTotalsInputSchema.shape, async (args, _extra) => {
        // The Zod schema now handles the default for gl_account_ids
        const data = await getAccountTotalsReport(args);
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

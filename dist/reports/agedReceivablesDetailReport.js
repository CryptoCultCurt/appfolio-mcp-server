"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAgedReceivablesDetailReport = getAgedReceivablesDetailReport;
exports.registerAgedReceivablesDetailReportTool = registerAgedReceivablesDetailReportTool;
const axios_1 = __importDefault(require("axios"));
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
const appfolio_1 = require("../appfolio");
dotenv_1.default.config(); // Ensure environment variables are loaded
const { VHOST, USERNAME, PASSWORD } = process.env;
// Originally from src/index.ts (lines 42-78)
const agedReceivablesDetailInputSchema = zod_1.z.object({
    property_visibility: zod_1.z.string().default("active"),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional(),
    }).optional(),
    tags: zod_1.z.string().optional(),
    balance_operator: zod_1.z.object({
        amount: zod_1.z.string().optional(),
        comparator: zod_1.z.string().optional()
    }).optional(),
    tenant_statuses: zod_1.z.array(zod_1.z.string()).optional(),
    occurred_on_to: zod_1.z.string(),
    gl_account_map_id: zod_1.z.string().optional(),
    columns: zod_1.z.array(zod_1.z.string()).optional(),
});
// Originally from src/appfolio.ts (function starting line 1664)
async function getAgedReceivablesDetailReport(args) {
    if (!VHOST || !USERNAME || !PASSWORD) {
        throw new Error('Missing AppFolio API credentials');
    }
    // Zod schema handles the default for property_visibility, so args can be used directly.
    const payload = args;
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/aged_receivables_detail.json`;
    const response = await appfolio_1.appfolioLimiter.schedule(() => axios_1.default.post(url, payload, {
        auth: { username: USERNAME, password: PASSWORD },
        headers: { 'Content-Type': 'application/json' },
    }));
    return response.data;
}
// New registration function for MCP
function registerAgedReceivablesDetailReportTool(server) {
    server.tool("get_aged_receivables_detail_report", "Returns aged receivables detail for the given filters.", // Description from original registration
    agedReceivablesDetailInputSchema.shape, async (toolArgs) => {
        const data = await getAgedReceivablesDetailReport(toolArgs);
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

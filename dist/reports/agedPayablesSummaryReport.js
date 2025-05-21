"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAgedPayablesSummaryReport = getAgedPayablesSummaryReport;
exports.registerAgedPayablesSummaryReportTool = registerAgedPayablesSummaryReportTool;
const zod_1 = require("zod");
const appfolio_1 = require("../appfolio"); // Assuming appfolioLimiter is exported from appfolio.ts
const axios_1 = __importDefault(require("axios")); // Add axios import
const { VHOST, USERNAME, PASSWORD } = process.env;
// Zod schema copied from src/index.ts
const agedPayablesSummaryInputSchema = zod_1.z.object({
    property_visibility: zod_1.z.string().default("active"),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional(),
    }).optional(),
    occurred_on_to: zod_1.z.string(),
    party_contact_info: zod_1.z.object({
        company_id: zod_1.z.string().optional()
    }).optional(),
    balance_operator: zod_1.z.object({
        amount: zod_1.z.string().optional(),
        comparator: zod_1.z.string().optional()
    }).optional(),
    columns: zod_1.z.array(zod_1.z.string()).optional(),
});
// Function definition copied from src/appfolio.ts
async function getAgedPayablesSummaryReport(args) {
    if (!VHOST || !USERNAME || !PASSWORD)
        throw new Error('Missing AppFolio API credentials');
    // The Zod schema now handles the default for property_visibility
    const payload = { ...args }; // property_visibility default is handled by Zod parsing
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/aged_payables_summary.json`;
    const response = await appfolio_1.appfolioLimiter.schedule(() => axios_1.default.post(url, payload, {
        auth: { username: USERNAME, password: PASSWORD },
        headers: { 'Content-Type': 'application/json' },
    }));
    return response.data;
}
// MCP Tool Registration Function
function registerAgedPayablesSummaryReportTool(server) {
    server.tool("get_aged_payables_summary_report", "Returns aged payables summary for the given filters.", agedPayablesSummaryInputSchema.shape, async (args, _extra) => {
        // Zod schema handles defaults
        const data = await getAgedPayablesSummaryReport(args);
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

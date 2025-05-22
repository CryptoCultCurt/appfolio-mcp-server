"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBudgetComparativeReport = getBudgetComparativeReport;
exports.registerBudgetComparativeReportTool = registerBudgetComparativeReportTool;
const axios_1 = __importDefault(require("axios"));
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
const appfolio_1 = require("../appfolio"); // Assuming appfolioLimiter is exported from the main appfolio.ts
dotenv_1.default.config();
const { VHOST, USERNAME, PASSWORD } = process.env;
// Reconstructed from previous src/index.ts diff
const budgetComparativeInputSchema = zod_1.z.object({
    property_visibility: zod_1.z.string().default("active"),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional(),
    }).optional(),
    period_from: zod_1.z.string(),
    period_to: zod_1.z.string(),
    comparison_period_from: zod_1.z.string(),
    comparison_period_to: zod_1.z.string(),
    additional_account_types: zod_1.z.array(zod_1.z.string()).optional(),
    gl_account_map_id: zod_1.z.string().optional(),
    level_of_detail: zod_1.z.string().optional(),
    columns: zod_1.z.array(zod_1.z.string()).optional(),
});
// Originally from src/appfolio.ts (function starting line 1602)
async function getBudgetComparativeReport(args) {
    if (!VHOST || !USERNAME || !PASSWORD) {
        throw new Error('Missing AppFolio API credentials');
    }
    // Zod schema handles the default for property_visibility, so args can be used directly.
    const payload = args;
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/budget_comparative.json`;
    const response = await appfolio_1.appfolioLimiter.schedule(() => axios_1.default.post(url, payload, {
        auth: { username: USERNAME, password: PASSWORD },
        headers: { 'Content-Type': 'application/json' },
    }));
    return response.data;
}
// New registration function for MCP
function registerBudgetComparativeReportTool(server) {
    server.tool("get_budget_comparative_report", "Returns budget comparative report for the given filters.", // Description from original registration
    budgetComparativeInputSchema.shape, async (toolArgs) => {
        // Cast toolArgs to BudgetComparativeArgs. Ensure properties match or handle discrepancies.
        const data = await getBudgetComparativeReport(toolArgs);
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

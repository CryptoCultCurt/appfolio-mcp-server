"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.annualBudgetComparativeInputSchema = void 0;
exports.getAnnualBudgetComparativeReport = getAnnualBudgetComparativeReport;
exports.registerAnnualBudgetComparativeReportTool = registerAnnualBudgetComparativeReportTool;
const axios_1 = __importDefault(require("axios"));
const zod_1 = require("zod");
const appfolio_1 = require("../appfolio"); // Assuming appfolioLimiter is exported from appfolio.ts
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const { VHOST, USERNAME, PASSWORD } = process.env;
exports.annualBudgetComparativeInputSchema = zod_1.z.object({
    property_visibility: zod_1.z.string().optional().default("active").describe('Filter properties by status. Defaults to "active"'),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional(),
    }).optional(),
    occurred_on_to: zod_1.z.string().describe('The end date for the report period (YYYY-MM-DD)'),
    additional_account_types: zod_1.z.array(zod_1.z.string()).optional().default([]).describe('Array of additional account types to include'),
    gl_account_map_id: zod_1.z.string().optional().describe('Filter by GL account map ID'),
    level_of_detail: zod_1.z.enum(["detail_view", "summary_view"]).optional().default("detail_view").describe('Specify the level of detail. Defaults to "detail_view"'),
    columns: zod_1.z.array(zod_1.z.string()).optional().describe('Array of specific columns to include in the report')
});
async function getAnnualBudgetComparativeReport(args) {
    if (!VHOST || !USERNAME || !PASSWORD)
        throw new Error('Missing AppFolio API credentials');
    // occurred_on_to is marked as required in the Zod schema, so no need to check here
    // Defaults are handled by Zod schema
    const payload = args;
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/annual_budget_comparative.json`;
    const response = await appfolio_1.appfolioLimiter.schedule(() => axios_1.default.post(url, payload, {
        auth: { username: USERNAME, password: PASSWORD },
        headers: { 'Content-Type': 'application/json' },
    }));
    return response.data;
}
function registerAnnualBudgetComparativeReportTool(server) {
    server.tool("get_annual_budget_comparative_report", "Returns annual budget comparative report for the given filters.", exports.annualBudgetComparativeInputSchema.shape, async (args, _extra) => {
        const data = await getAnnualBudgetComparativeReport(args); // Cast because Zod default might add properties not in original type
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

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIncomeStatementDateRangeReport = getIncomeStatementDateRangeReport;
exports.registerIncomeStatementDateRangeReportTool = registerIncomeStatementDateRangeReportTool;
const axios_1 = __importDefault(require("axios"));
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
const appfolio_1 = require("../appfolio");
dotenv_1.default.config();
const { VHOST, USERNAME, PASSWORD } = process.env;
// Originally from src/index.ts (line 77), with defaults added
const incomeStatementDateRangeArgsSchema = zod_1.z.object({
    property_visibility: zod_1.z.enum(["active", "hidden", "all"]).default("active").optional().describe('Filter properties by status. Defaults to "active"'),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional()
    }).optional().describe('Filter results based on properties, groups, or portfolios'),
    posted_on_from: zod_1.z.string().describe('Start date for the posting period (YYYY-MM-DD) - Required'),
    posted_on_to: zod_1.z.string().describe('End date for the posting period (YYYY-MM-DD) - Required'),
    gl_account_map_id: zod_1.z.string().optional().describe('Filter by a specific GL account map ID'),
    level_of_detail: zod_1.z.enum(["detail_view", "summary_view"]).default("detail_view").optional().describe('Specify the level of detail. Defaults to "detail_view"'),
    include_zero_balance_gl_accounts: zod_1.z.enum(["0", "1"]).default("0").optional().describe('Include GL accounts with zero balance. Defaults to "0" (false)'),
    columns: zod_1.z.array(zod_1.z.string()).optional().describe('Array of specific columns to include in the report')
});
// Originally from src/appfolio.ts (function starting line 1479)
async function getIncomeStatementDateRangeReport(args) {
    if (!VHOST || !USERNAME || !PASSWORD) {
        throw new Error('Missing AppFolio API credentials');
    }
    // Required fields posted_on_from and posted_on_to are enforced by Zod schema
    // Defaults are now handled by Zod schema
    const payload = args;
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/income_statement_date_range.json`;
    const response = await appfolio_1.appfolioLimiter.schedule(() => axios_1.default.post(url, payload, {
        auth: { username: USERNAME, password: PASSWORD },
        headers: { 'Content-Type': 'application/json' },
    }));
    return response.data;
}
// New registration function for MCP
function registerIncomeStatementDateRangeReportTool(server) {
    server.tool("get_income_statement_date_range_report", "Returns the income statement report for a specified date range.", // Description from original registration
    incomeStatementDateRangeArgsSchema.shape, async (toolArgs) => {
        const data = await getIncomeStatementDateRangeReport(toolArgs);
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

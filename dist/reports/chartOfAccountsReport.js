"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChartOfAccountsReport = getChartOfAccountsReport;
exports.registerChartOfAccountsReportTool = registerChartOfAccountsReportTool;
const axios_1 = __importDefault(require("axios"));
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
const appfolio_1 = require("../appfolio");
dotenv_1.default.config();
const { VHOST, USERNAME, PASSWORD } = process.env;
// Originally from src/index.ts (line 73)
const chartOfAccountsArgsSchema = zod_1.z.object({
    columns: zod_1.z.array(zod_1.z.string()).optional().describe('Array of specific columns to include in the report')
});
// Originally from src/appfolio.ts (function starting line 1603)
async function getChartOfAccountsReport(args) {
    if (!VHOST || !USERNAME || !PASSWORD) {
        throw new Error('Missing AppFolio API credentials');
    }
    const payload = { ...args }; // Simple payload, just pass args
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/chart_of_accounts.json`;
    const response = await appfolio_1.appfolioLimiter.schedule(() => axios_1.default.post(url, payload, {
        auth: { username: USERNAME, password: PASSWORD },
        headers: { 'Content-Type': 'application/json' },
    }));
    return response.data;
}
// New registration function for MCP
function registerChartOfAccountsReportTool(server) {
    server.tool("get_chart_of_accounts_report", "Returns the chart of accounts.", // Description from original registration
    chartOfAccountsArgsSchema.shape, async (toolArgs) => {
        const data = await getChartOfAccountsReport(toolArgs);
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

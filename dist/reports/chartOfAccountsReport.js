"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChartOfAccountsReport = getChartOfAccountsReport;
exports.registerChartOfAccountsReportTool = registerChartOfAccountsReportTool;
const zod_1 = require("zod");
const appfolio_1 = require("../appfolio");
// Originally from src/index.ts (line 73)
const chartOfAccountsArgsSchema = zod_1.z.object({
    columns: zod_1.z.array(zod_1.z.string()).optional().describe('Array of specific columns to include in the report')
});
// Originally from src/appfolio.ts (function starting line 1603)
async function getChartOfAccountsReport(args) {
    return (0, appfolio_1.makeAppfolioApiCall)('chart_of_accounts.json', args);
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

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CHART_OF_ACCOUNTS_COLUMNS = void 0;
exports.getChartOfAccountsReport = getChartOfAccountsReport;
exports.registerChartOfAccountsReportTool = registerChartOfAccountsReportTool;
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
const appfolio_1 = require("../appfolio");
dotenv_1.default.config();
// Available columns extracted from the ChartOfAccountsResult type
exports.CHART_OF_ACCOUNTS_COLUMNS = [
    'number',
    'account_name',
    'account_type',
    'sub_accountof',
    'offset_account',
    'subject_to_tax_authority',
    'options',
    'fund_account',
    'hidden',
    'gl_account_id',
    'sub_account_of_id',
    'offset_account_id'
];
// Originally from src/index.ts (line 73)
const chartOfAccountsArgsSchema = zod_1.z.object({
    columns: zod_1.z.array(zod_1.z.enum(exports.CHART_OF_ACCOUNTS_COLUMNS)).optional()
        .describe(`Array of specific columns to include in the report. Valid columns: ${exports.CHART_OF_ACCOUNTS_COLUMNS.join(', ')}. If not specified, all columns are returned. NOTE: Use 'number' for GL account number, 'account_name' for account name, and 'gl_account_id' for the internal ID.`)
});
// Originally from src/appfolio.ts (function starting line 1603)
async function getChartOfAccountsReport(args) {
    return (0, appfolio_1.makeAppfolioApiCall)('chart_of_accounts.json', args);
}
// New registration function for MCP
function registerChartOfAccountsReportTool(server) {
    server.tool("get_chart_of_accounts_report", "Returns the chart of accounts with GL account information. Use this to lookup gl_account_ids by GL account number ('number' field) or name ('account_name' field). IMPORTANT: Column names are specific - use 'number' for GL account number, 'account_name' for account name, 'gl_account_id' for internal database ID.", chartOfAccountsArgsSchema.shape, async (args, _extra) => {
        try {
            // Validate arguments against schema
            const parseResult = chartOfAccountsArgsSchema.safeParse(args);
            if (!parseResult.success) {
                const errorMessages = parseResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('; ');
                throw new Error(`Invalid arguments: ${errorMessages}`);
            }
            const result = await getChartOfAccountsReport(parseResult.data);
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(result, null, 2),
                        mimeType: "application/json"
                    }
                ]
            };
        }
        catch (error) {
            // Enhanced error reporting for debugging
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`Chart of Accounts Report Error:`, errorMessage);
            throw error;
        }
    });
}

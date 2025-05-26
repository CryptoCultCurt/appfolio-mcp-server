"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIncomeStatementDateRangeReport = getIncomeStatementDateRangeReport;
exports.registerIncomeStatementDateRangeReportTool = registerIncomeStatementDateRangeReportTool;
const zod_1 = require("zod");
const appfolio_1 = require("../appfolio");
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
    fund_type: zod_1.z.enum(["all", "operating", "capital"]).default("all").optional().describe('Filter by fund type. Defaults to "all"'),
    columns: zod_1.z.array(zod_1.z.string()).optional().describe('Array of specific columns to include in the report')
});
// Originally from src/appfolio.ts (function starting line 1479)
async function getIncomeStatementDateRangeReport(args) {
    if (!args.posted_on_from || !args.posted_on_to) {
        throw new Error('Missing required arguments: posted_on_from and posted_on_to (format YYYY-MM-DD)');
    }
    const { property_visibility = "active", fund_type = "all", level_of_detail = "detail_view", include_zero_balance_gl_accounts = "0", ...rest } = args;
    const payload = {
        property_visibility,
        fund_type,
        level_of_detail,
        include_zero_balance_gl_accounts,
        ...rest
    };
    return (0, appfolio_1.makeAppfolioApiCall)('income_statement_date_range.json', payload);
}
// New registration function for MCP
function registerIncomeStatementDateRangeReportTool(server) {
    server.tool("get_income_statement_date_range_report", "Returns the income statement report for a specified date range.", // Description from original registration
    incomeStatementDateRangeArgsSchema.shape, async (args, _extra) => {
        try {
            // Validate arguments against schema
            const parseResult = incomeStatementDateRangeArgsSchema.safeParse(args);
            if (!parseResult.success) {
                const errorMessages = parseResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('; ');
                throw new Error(`Invalid arguments: ${errorMessages}`);
            }
            const result = await getIncomeStatementDateRangeReport(parseResult.data);
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
            console.error(`Income Statement Date Range Report Error:`, errorMessage);
            throw error;
        }
    });
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIncomeStatement12MonthReport = getIncomeStatement12MonthReport;
exports.registerIncomeStatement12MonthReportTool = registerIncomeStatement12MonthReportTool;
const zod_1 = require("zod");
const appfolio_1 = require("../appfolio");
// Zod schema for 12 Month Income Statement Report arguments
const incomeStatement12MonthArgsSchema = zod_1.z.object({
    property_visibility: zod_1.z.enum(["active", "hidden", "all"]).optional().default("active").describe('Filter properties by status. Defaults to "active"'),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional()
    }).optional().describe('Filter results based on properties, groups, portfolios, or owners'),
    fund_type: zod_1.z.enum(["all", "operating", "escrow"]).optional().default("all").describe('Filter by fund type. Defaults to "all"'),
    posted_on_from: zod_1.z.string().regex(/^\d{4}-\d{2}$/, "Date must be in YYYY-MM format").describe('Required. The start month for the reporting period (YYYY-MM).'),
    posted_on_to: zod_1.z.string().regex(/^\d{4}-\d{2}$/, "Date must be in YYYY-MM format").describe('Required. The end month for the reporting period (YYYY-MM).'),
    gl_account_map_id: zod_1.z.string().optional().describe('Optional. Filter by a specific GL Account Map ID.'),
    level_of_detail: zod_1.z.enum(["detail_view", "summary_view"]).optional().default("detail_view").describe('Level of detail. Defaults to "detail_view"'),
    include_zero_balance_gl_accounts: zod_1.z.union([zod_1.z.boolean(), zod_1.z.string()]).optional().default(false).transform(val => {
        if (typeof val === 'string')
            return val === 'true' || val === '1' ? "1" : "0";
        return val ? "1" : "0";
    }).describe('Include GL accounts with zero balance. Defaults to false.'),
    columns: zod_1.z.array(zod_1.z.string()).optional().describe('Array of specific columns to include in the report')
});
// --- 12 Month Income Statement Report Function ---
async function getIncomeStatement12MonthReport(args) {
    if (!args.posted_on_from || !args.posted_on_to) {
        throw new Error('Missing required arguments: posted_on_from and posted_on_to (format YYYY-MM)');
    }
    const { property_visibility = "active", fund_type = "all", level_of_detail = "detail_view", include_zero_balance_gl_accounts = "0", ...rest } = args;
    const payload = {
        property_visibility,
        fund_type,
        level_of_detail,
        include_zero_balance_gl_accounts,
        ...rest
    };
    return (0, appfolio_1.makeAppfolioApiCall)('twelve_month_income_statement.json', payload);
}
// --- 12 Month Income Statement Report Tool ---
function registerIncomeStatement12MonthReportTool(server) {
    server.tool("get_income_statement_12_month_report", "Generates a 12-month income statement report.", incomeStatement12MonthArgsSchema.shape, async (args, _extra) => {
        try {
            // Validate arguments against schema
            const parseResult = incomeStatement12MonthArgsSchema.safeParse(args);
            if (!parseResult.success) {
                const errorMessages = parseResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('; ');
                throw new Error(`Invalid arguments: ${errorMessages}`);
            }
            const result = await getIncomeStatement12MonthReport(parseResult.data);
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
            console.error(`Income Statement 12 Month Report Error:`, errorMessage);
            throw error;
        }
    });
}

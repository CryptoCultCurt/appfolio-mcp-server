"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCashflow12MonthReport = getCashflow12MonthReport;
exports.registerCashflow12MonthReportTool = registerCashflow12MonthReportTool;
const zod_1 = require("zod");
const appfolio_1 = require("../appfolio");
// Zod schema for 12 Month Cash Flow Report arguments
const cashflow12MonthArgsSchema = zod_1.z.object({
    property_visibility: zod_1.z.enum(["active", "hidden", "all"]).optional().default("active").describe('Filter properties by status. Defaults to "active"'),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional()
    }).optional().describe('Filter results based on properties, groups, portfolios, or owners'),
    posted_on_from: zod_1.z.string().regex(/^\d{4}-\d{2}$/, "Date must be in YYYY-MM format").describe('Required. The start month for the reporting period (YYYY-MM).'),
    posted_on_to: zod_1.z.string().regex(/^\d{4}-\d{2}$/, "Date must be in YYYY-MM format").describe('Required. The end month for the reporting period (YYYY-MM).'),
    gl_account_map_id: zod_1.z.string().optional().transform(val => val === "" ? undefined : val).describe('Optional. Filter by a specific GL Account Map ID.'),
    level_of_detail: zod_1.z.enum(["detail_view", "summary_view"]).optional().default("detail_view").describe('Level of detail. Defaults to "detail_view"'),
    include_zero_balance_gl_accounts: zod_1.z.union([zod_1.z.boolean(), zod_1.z.string()]).optional().default(false).transform(val => {
        if (typeof val === 'string')
            return val === 'true' || val === '1' ? "1" : "0";
        return val ? "1" : "0";
    }).describe('Include GL accounts with zero balance. Defaults to false.'),
    exclude_suppressed_fees: zod_1.z.union([zod_1.z.boolean(), zod_1.z.string()]).optional().default(false).transform(val => {
        if (typeof val === 'string')
            return val === 'true' || val === '1' ? "1" : "0";
        return val ? "1" : "0";
    }).describe('Exclude suppressed fees. Defaults to false.'),
    columns: zod_1.z.array(zod_1.z.string()).optional().describe('Array of specific columns to include in the report')
});
// --- 12 Month Cash Flow Report Function ---
async function getCashflow12MonthReport(args) {
    if (!args.posted_on_from || !args.posted_on_to) {
        throw new Error('Missing required arguments: posted_on_from and posted_on_to (format YYYY-MM)');
    }
    const { property_visibility = "active", level_of_detail = "detail_view", include_zero_balance_gl_accounts = "0", exclude_suppressed_fees = "0", ...rest } = args;
    const payload = {
        property_visibility,
        level_of_detail,
        include_zero_balance_gl_accounts,
        exclude_suppressed_fees,
        ...rest
    };
    return (0, appfolio_1.makeAppfolioApiCall)('twelve_month_cash_flow.json', payload);
}
function registerCashflow12MonthReportTool(server) {
    server.tool("get_cashflow_12_month_report", "Generates a 12-month cash flow report.", cashflow12MonthArgsSchema.shape, async (args, _extra) => {
        try {
            // Validate arguments against schema
            const parseResult = cashflow12MonthArgsSchema.safeParse(args);
            if (!parseResult.success) {
                const errorMessages = parseResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('; ');
                throw new Error(`Invalid arguments: ${errorMessages}`);
            }
            const result = await getCashflow12MonthReport(parseResult.data);
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
            console.error(`Cashflow 12 Month Report Error:`, errorMessage);
            throw error;
        }
    });
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.balanceSheetInputSchema = void 0;
exports.getBalanceSheetReport = getBalanceSheetReport;
exports.registerBalanceSheetReportTool = registerBalanceSheetReportTool;
const zod_1 = require("zod");
const appfolio_1 = require("../appfolio");
async function getBalanceSheetReport(args) {
    if (!args.posted_on_to) {
        throw new Error('posted_on_to is required');
    }
    const { property_visibility = "active", level_of_detail = "detail_view", include_zero_balance_gl_accounts = "0", ...rest } = args;
    const payload = {
        property_visibility,
        level_of_detail,
        include_zero_balance_gl_accounts,
        ...rest
    };
    return (0, appfolio_1.makeAppfolioApiCall)('balance_sheet.json', payload);
}
exports.balanceSheetInputSchema = zod_1.z.object({
    property_visibility: zod_1.z.enum(["active", "hidden", "all"]).default("active").optional(),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional(),
    }).optional(),
    posted_on_to: zod_1.z.string().describe("Required. Date to run the report as of in YYYY-MM-DD format."),
    gl_account_map_id: zod_1.z.string().optional(),
    level_of_detail: zod_1.z.enum(["detail_view", "summary_view"]).default("detail_view").optional(),
    include_zero_balance_gl_accounts: zod_1.z.enum(["0", "1"]).default("0").optional(),
    columns: zod_1.z.array(zod_1.z.string()).optional(),
});
function registerBalanceSheetReportTool(server) {
    server.tool("get_balance_sheet_report", "Returns the balance sheet report for the given filters.", exports.balanceSheetInputSchema.shape, async (args, _extra) => {
        try {
            // Validate arguments against schema
            const parseResult = exports.balanceSheetInputSchema.safeParse(args);
            if (!parseResult.success) {
                const errorMessages = parseResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('; ');
                throw new Error(`Invalid arguments: ${errorMessages}`);
            }
            const result = await getBalanceSheetReport(parseResult.data);
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
            console.error(`Balance Sheet Report Error:`, errorMessage);
            throw error;
        }
    });
}

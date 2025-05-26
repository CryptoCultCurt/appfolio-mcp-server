"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expenseDistributionInputSchema = void 0;
exports.getExpenseDistributionReport = getExpenseDistributionReport;
exports.registerExpenseDistributionReportTool = registerExpenseDistributionReportTool;
const zod_1 = require("zod");
const appfolio_1 = require("../appfolio");
async function getExpenseDistributionReport(args) {
    if (!args.posted_on_from || !args.posted_on_to) {
        throw new Error('Missing required arguments: posted_on_from and posted_on_to (format YYYY-MM-DD)');
    }
    const { property_visibility = "active", ...rest } = args;
    const payload = { property_visibility, ...rest };
    return (0, appfolio_1.makeAppfolioApiCall)('expense_distribution.json', payload);
}
exports.expenseDistributionInputSchema = zod_1.z.object({
    property_visibility: zod_1.z.string().default("active").optional(),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional(),
    }).optional(),
    party_contact_info: zod_1.z.object({
        company_id: zod_1.z.string().optional(),
    }).optional(),
    posted_on_from: zod_1.z.string().describe("Required. Start date for posted_on range in YYYY-MM-DD format."),
    posted_on_to: zod_1.z.string().describe("Required. End date for posted_on range in YYYY-MM-DD format."),
    gl_account_map_id: zod_1.z.string().optional(),
    columns: zod_1.z.array(zod_1.z.string()).optional(),
});
function registerExpenseDistributionReportTool(server) {
    server.tool("get_expense_distribution_report", "Returns expense distribution report for the given filters.", exports.expenseDistributionInputSchema.shape, async (args, _extra) => {
        try {
            // Validate arguments against schema
            const parseResult = exports.expenseDistributionInputSchema.safeParse(args);
            if (!parseResult.success) {
                const errorMessages = parseResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('; ');
                throw new Error(`Invalid arguments: ${errorMessages}`);
            }
            const result = await getExpenseDistributionReport(parseResult.data);
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
            console.error(`Expense Distribution Report Error:`, errorMessage);
            throw error;
        }
    });
}

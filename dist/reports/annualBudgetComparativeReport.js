"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.annualBudgetComparativeInputSchema = void 0;
exports.getAnnualBudgetComparativeReport = getAnnualBudgetComparativeReport;
exports.registerAnnualBudgetComparativeReportTool = registerAnnualBudgetComparativeReportTool;
const zod_1 = require("zod");
const appfolio_1 = require("../appfolio");
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
    columns: zod_1.z.array(zod_1.z.string()).optional().describe('Array of specific columns to include in the report'),
    periods: zod_1.z.any().describe('Periods')
});
async function getAnnualBudgetComparativeReport(args) {
    if (!args.periods) {
        throw new Error('Missing required argument: periods');
    }
    const { property_visibility = "active", ...rest } = args;
    const payload = { property_visibility, ...rest };
    return (0, appfolio_1.makeAppfolioApiCall)('annual_budget_comparative.json', payload);
}
function registerAnnualBudgetComparativeReportTool(server) {
    server.tool("get_annual_budget_comparative_report", "Returns annual budget comparative report for the given filters.", exports.annualBudgetComparativeInputSchema.shape, async (args, _extra) => {
        try {
            // Validate arguments against schema
            const parseResult = exports.annualBudgetComparativeInputSchema.safeParse(args);
            if (!parseResult.success) {
                const errorMessages = parseResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('; ');
                throw new Error(`Invalid arguments: ${errorMessages}`);
            }
            const result = await getAnnualBudgetComparativeReport(parseResult.data);
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
            console.error(`Annual Budget Comparative Report Error:`, errorMessage);
            throw error;
        }
    });
}

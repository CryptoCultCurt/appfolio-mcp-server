"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBudgetComparativeReport = getBudgetComparativeReport;
exports.registerBudgetComparativeReportTool = registerBudgetComparativeReportTool;
const zod_1 = require("zod");
const appfolio_1 = require("../appfolio");
// Reconstructed from previous src/index.ts diff
const budgetComparativeInputSchema = zod_1.z.object({
    property_visibility: zod_1.z.string().default("active"),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional(),
    }).optional(),
    period_from: zod_1.z.string(),
    period_to: zod_1.z.string(),
    comparison_period_from: zod_1.z.string(),
    comparison_period_to: zod_1.z.string(),
    additional_account_types: zod_1.z.array(zod_1.z.string()).optional(),
    gl_account_map_id: zod_1.z.string().optional(),
    level_of_detail: zod_1.z.string().optional(),
    columns: zod_1.z.array(zod_1.z.string()).optional(),
});
// Originally from src/appfolio.ts (function starting line 1602)
async function getBudgetComparativeReport(args) {
    if (!args.period_from || !args.period_to || !args.comparison_period_from || !args.comparison_period_to) {
        throw new Error('Missing required arguments: period_from, period_to, comparison_period_from, and comparison_period_to (format YYYY-MM-DD)');
    }
    const { property_visibility = "active", ...rest } = args;
    const payload = { property_visibility, ...rest };
    return (0, appfolio_1.makeAppfolioApiCall)('budget_comparative.json', payload);
}
// New registration function for MCP
function registerBudgetComparativeReportTool(server) {
    server.tool("get_budget_comparative_report", "Returns budget comparative report for the given filters.", budgetComparativeInputSchema.shape, async (args, _extra) => {
        try {
            // Validate arguments against schema
            const parseResult = budgetComparativeInputSchema.safeParse(args);
            if (!parseResult.success) {
                const errorMessages = parseResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('; ');
                throw new Error(`Invalid arguments: ${errorMessages}`);
            }
            const result = await getBudgetComparativeReport(parseResult.data);
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
            console.error(`Budget Comparative Report Error:`, errorMessage);
            throw error;
        }
    });
}

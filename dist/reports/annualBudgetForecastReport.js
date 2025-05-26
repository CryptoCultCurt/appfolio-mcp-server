"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.annualBudgetForecastInputSchema = void 0;
exports.getAnnualBudgetForecastReport = getAnnualBudgetForecastReport;
exports.registerAnnualBudgetForecastReportTool = registerAnnualBudgetForecastReportTool;
const zod_1 = require("zod");
const appfolio_1 = require("../appfolio");
exports.annualBudgetForecastInputSchema = zod_1.z.object({
    property_visibility: zod_1.z.enum(["active", "hidden", "all"]).optional().default("active"),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional(),
    }).optional(),
    period_from: zod_1.z.string().describe('Start period for the forecast (YYYY-MM). Required.'),
    period_to: zod_1.z.string().describe('End period for the forecast (YYYY-MM). Required.'),
    consolidate: zod_1.z.enum(["0", "1"]).optional().default("0"),
    gl_account_map_id: zod_1.z.string().optional(),
    columns: zod_1.z.array(zod_1.z.string()).optional(),
});
async function getAnnualBudgetForecastReport(args) {
    if (!args.period_from || !args.period_to) {
        throw new Error('Missing required arguments: period_from and period_to (format YYYY-MM-DD)');
    }
    const { property_visibility = "active", ...rest } = args;
    const payload = { property_visibility, ...rest };
    return (0, appfolio_1.makeAppfolioApiCall)('annual_budget_forecast.json', payload);
}
function registerAnnualBudgetForecastReportTool(server) {
    server.tool("get_annual_budget_forecast_report", "Returns annual budget forecast report for the given filters.", exports.annualBudgetForecastInputSchema.shape, async (args, _extra) => {
        try {
            // Validate arguments against schema
            const parseResult = exports.annualBudgetForecastInputSchema.safeParse(args);
            if (!parseResult.success) {
                const errorMessages = parseResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('; ');
                throw new Error(`Invalid arguments: ${errorMessages}`);
            }
            const result = await getAnnualBudgetForecastReport(parseResult.data);
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
            console.error(`Annual Budget Forecast Report Error:`, errorMessage);
            throw error;
        }
    });
}

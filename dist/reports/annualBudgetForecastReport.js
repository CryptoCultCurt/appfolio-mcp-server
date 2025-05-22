"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.annualBudgetForecastInputSchema = void 0;
exports.getAnnualBudgetForecastReport = getAnnualBudgetForecastReport;
exports.registerAnnualBudgetForecastReportTool = registerAnnualBudgetForecastReportTool;
const axios_1 = __importDefault(require("axios"));
const zod_1 = require("zod");
const appfolio_1 = require("../appfolio");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const { VHOST, USERNAME, PASSWORD } = process.env;
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
    if (!VHOST || !USERNAME || !PASSWORD)
        throw new Error('Missing AppFolio API credentials');
    // period_from and period_to are marked as required in Zod schema
    // Defaults are handled by Zod schema
    const payload = args;
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/annual_budget_forecast.json`;
    const response = await appfolio_1.appfolioLimiter.schedule(() => axios_1.default.post(url, payload, {
        auth: { username: USERNAME, password: PASSWORD },
        headers: { 'Content-Type': 'application/json' },
    }));
    return response.data;
}
function registerAnnualBudgetForecastReportTool(server) {
    server.tool("get_annual_budget_forecast_report", "Returns annual budget forecast report for the given filters.", exports.annualBudgetForecastInputSchema.shape, async (args, _extra) => {
        const data = await getAnnualBudgetForecastReport(args);
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

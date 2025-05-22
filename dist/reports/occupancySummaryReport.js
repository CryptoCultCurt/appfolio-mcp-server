"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.occupancySummaryArgsSchema = void 0;
exports.getOccupancySummaryReport = getOccupancySummaryReport;
exports.registerOccupancySummaryReportTool = registerOccupancySummaryReportTool;
const axios_1 = __importDefault(require("axios"));
const zod_1 = require("zod");
const appfolio_1 = require("../appfolio");
const { VHOST, USERNAME, PASSWORD } = process.env;
// Zod schema for Occupancy Summary Report arguments
exports.occupancySummaryArgsSchema = zod_1.z.object({
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional()
    }).optional().describe('Filter results based on properties, groups, portfolios, or owners'),
    unit_visibility: zod_1.z.enum(["active", "hidden", "all"]).optional().default("active").describe('Filter units by status. Defaults to "active"'),
    as_of_to: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The "as of" date for the report (YYYY-MM-DD). Required.'),
    columns: zod_1.z.array(zod_1.z.string()).optional().describe('Array of specific columns to include in the report')
});
// --- Occupancy Summary Report Function ---
async function getOccupancySummaryReport(args) {
    if (!VHOST || !USERNAME || !PASSWORD)
        throw new Error('Missing AppFolio API credentials');
    if (!args.as_of_to) {
        throw new Error('Missing required argument: as_of_to (format YYYY-MM-DD)');
    }
    // Defaults are handled by Zod now
    const payload = { ...args };
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/occupancy_summary.json`;
    const response = await appfolio_1.appfolioLimiter.schedule(() => axios_1.default.post(url, payload, {
        auth: { username: USERNAME, password: PASSWORD },
        headers: { 'Content-Type': 'application/json' },
    }));
    return response.data;
}
// --- Register Occupancy Summary Report Tool ---
function registerOccupancySummaryReportTool(server) {
    server.tool("get_occupancy_summary_report", "Generates a summary of property occupancy, including number of units, occupied units, and vacancy rates.", exports.occupancySummaryArgsSchema.shape, async (args) => {
        const data = await getOccupancySummaryReport(args);
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

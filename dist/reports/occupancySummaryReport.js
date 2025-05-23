"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.occupancySummaryArgsSchema = void 0;
exports.getOccupancySummaryReport = getOccupancySummaryReport;
exports.registerOccupancySummaryReportTool = registerOccupancySummaryReportTool;
const zod_1 = require("zod");
const appfolio_1 = require("../appfolio");
// Zod schema for Occupancy Summary Report arguments
exports.occupancySummaryArgsSchema = zod_1.z.object({
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional()
    }).optional().describe('Filter results based on properties, groups, portfolios, or owners'),
    unit_visibility: zod_1.z.enum(["active", "hidden", "all"]).optional().default("active").describe('Filter units by status. Defaults to "active"'),
    as_of_date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The "as of" date for the report (YYYY-MM-DD). Required.'),
    columns: zod_1.z.array(zod_1.z.string()).optional().describe('Array of specific columns to include in the report')
});
// --- Occupancy Summary Report Function ---
async function getOccupancySummaryReport(args) {
    if (!args.as_of_date) {
        throw new Error('Missing required argument: as_of_date (format YYYY-MM-DD)');
    }
    const { unit_visibility = "active", ...rest } = args;
    const payload = { unit_visibility, ...rest };
    return (0, appfolio_1.makeAppfolioApiCall)('occupancy_summary.json', payload);
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

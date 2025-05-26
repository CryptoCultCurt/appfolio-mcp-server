"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRentRollItemizedReport = getRentRollItemizedReport;
exports.registerRentRollItemizedReportTool = registerRentRollItemizedReportTool;
const zod_1 = require("zod");
const appfolio_1 = require("../appfolio");
// Zod schema copied from src/index.ts
const rentRollItemizedInputSchema = zod_1.z.object({
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional(),
    }).optional(),
    unit_visibility: zod_1.z.string().default("active"), // Defaulting to active
    tags: zod_1.z.string().optional(),
    gl_account_ids: zod_1.z.array(zod_1.z.string()).optional(),
    as_of_date: zod_1.z.string(),
    columns: zod_1.z.array(zod_1.z.string()).optional(),
});
// Function definition copied from src/appfolio.ts
async function getRentRollItemizedReport(args) {
    if (!args.as_of_date) {
        throw new Error('Missing required argument: as_of_date (format YYYY-MM-DD)');
    }
    const { unit_visibility = "active", ...rest } = args;
    const payload = { unit_visibility, ...rest };
    return (0, appfolio_1.makeAppfolioApiCall)('rent_roll_itemized.json', payload);
}
// MCP Tool Registration Function
function registerRentRollItemizedReportTool(server) {
    server.tool("get_rent_roll_itemized_report", "Returns rent roll itemized report for the given filters.", rentRollItemizedInputSchema.shape, async (args, _extra) => {
        try {
            // Validate arguments against schema
            const parseResult = rentRollItemizedInputSchema.safeParse(args);
            if (!parseResult.success) {
                const errorMessages = parseResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('; ');
                throw new Error(`Invalid arguments: ${errorMessages}`);
            }
            const result = await getRentRollItemizedReport(parseResult.data);
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
            console.error(`Rent Roll Itemized Report Error:`, errorMessage);
            throw error;
        }
    });
}

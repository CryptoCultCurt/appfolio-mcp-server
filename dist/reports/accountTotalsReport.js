"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAccountTotalsReport = getAccountTotalsReport;
exports.registerAccountTotalsReportTool = registerAccountTotalsReportTool;
const zod_1 = require("zod");
const appfolio_1 = require("../appfolio");
async function getAccountTotalsReport(args) {
    // Handle default for gl_account_ids
    const payload = { ...args };
    if (args.gl_account_ids === undefined) {
        payload.gl_account_ids = "1"; // Explicitly set default if not provided, matching original server.tool logic
    }
    return (0, appfolio_1.makeAppfolioApiCall)('account_totals.json', payload);
}
const accountTotalsInputSchema = zod_1.z.object({
    property_visibility: zod_1.z.string(),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional(),
    }).optional(),
    gl_account_ids: zod_1.z.string().default("1"), // Defaulting to "1" as per original logic, can also be '[1,2]' if that was intended
    posted_on_from: zod_1.z.string(),
    posted_on_to: zod_1.z.string(),
    columns: zod_1.z.array(zod_1.z.string()).optional(),
});
function registerAccountTotalsReportTool(server) {
    server.tool("get_account_totals_report", "Returns account totals for given filters and date range.", accountTotalsInputSchema.shape, async (args, _extra) => {
        try {
            // Validate arguments against schema
            const parseResult = accountTotalsInputSchema.safeParse(args);
            if (!parseResult.success) {
                const errorMessages = parseResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('; ');
                throw new Error(`Invalid arguments: ${errorMessages}`);
            }
            const result = await getAccountTotalsReport(parseResult.data);
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
            console.error(`Account Totals Report Error:`, errorMessage);
            throw error;
        }
    });
}

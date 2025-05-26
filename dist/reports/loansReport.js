"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loansArgsSchema = void 0;
exports.getLoansReport = getLoansReport;
exports.registerLoansReportTool = registerLoansReportTool;
const zod_1 = require("zod");
const appfolio_1 = require("../appfolio");
// Zod schema for Loans Report arguments
exports.loansArgsSchema = zod_1.z.object({
    property_visibility: zod_1.z.enum(["active", "hidden", "all"]).optional().default("active").describe('Filter properties by status. Defaults to "active"'),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional()
    }).optional().describe('Filter results based on properties, groups, portfolios, or owners'),
    reference_to: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The reference date for the report (YYYY-MM-DD). Required.'),
    show_hidden_loans: zod_1.z.enum(["0", "1"]).optional().default("0").describe('Include loans marked as hidden. Defaults to "0" (false)'),
    columns: zod_1.z.array(zod_1.z.string()).optional().describe('Array of specific columns to include in the report')
});
// --- Loans Report Function ---
async function getLoansReport(args) {
    if (!args.reference_to) {
        throw new Error('Missing required argument: reference_to (format YYYY-MM-DD)');
    }
    const { property_visibility = "active", ...rest } = args;
    const payload = { property_visibility, ...rest };
    return (0, appfolio_1.makeAppfolioApiCall)('loans.json', payload);
}
// --- Register Loans Report Tool ---
function registerLoansReportTool(server) {
    server.tool("get_loans_report", "Retrieves a report on loans associated with properties.", exports.loansArgsSchema.shape, async (args, _extra) => {
        try {
            // Validate arguments against schema
            const parseResult = exports.loansArgsSchema.safeParse(args);
            if (!parseResult.success) {
                const errorMessages = parseResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('; ');
                throw new Error(`Invalid arguments: ${errorMessages}`);
            }
            const result = await getLoansReport(parseResult.data);
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
            console.error(`Loans Report Error:`, errorMessage);
            throw error;
        }
    });
}

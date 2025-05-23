"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ownerLeasingArgsSchema = void 0;
exports.getOwnerLeasingReport = getOwnerLeasingReport;
exports.registerOwnerLeasingReportTool = registerOwnerLeasingReportTool;
const zod_1 = require("zod");
const appfolio_1 = require("../appfolio");
// Zod schema for Owner Leasing Report arguments
exports.ownerLeasingArgsSchema = zod_1.z.object({
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional()
    }).optional().describe('Filter results based on properties, groups, portfolios, or owners'),
    received_on_from: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The start date for the reporting period based on received date (YYYY-MM-DD). Required.'),
    received_on_to: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The end date for the reporting period based on received date (YYYY-MM-DD). Required.'),
    include_units_which_are_not_rent_ready: zod_1.z.enum(["0", "1"]).optional().default("0").describe('Include units that are not marked as rent ready. Defaults to "0" (false)'),
    include_units_which_are_hidden_from_the_vacancies_dashboard: zod_1.z.enum(["0", "1"]).optional().default("0").describe('Include units hidden from the vacancies dashboard. Defaults to "0" (false)'),
    columns: zod_1.z.array(zod_1.z.string()).optional().describe('Array of specific columns to include in the report')
});
// --- Owner Leasing Report Function ---
async function getOwnerLeasingReport(args) {
    if (!args.received_on_from || !args.received_on_to) {
        throw new Error('Missing required arguments: received_on_from and received_on_to (format YYYY-MM-DD)');
    }
    const payload = args;
    return (0, appfolio_1.makeAppfolioApiCall)('owner_leasing.json', payload);
}
// --- Register Owner Leasing Report Tool ---
function registerOwnerLeasingReportTool(server) {
    server.tool("get_owner_leasing_report", "Provides a leasing report tailored for property owners, showing leasing activity within a specified date range.", exports.ownerLeasingArgsSchema.shape, async (args) => {
        const data = await getOwnerLeasingReport(args);
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

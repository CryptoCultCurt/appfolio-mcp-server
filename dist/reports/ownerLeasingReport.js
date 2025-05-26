"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ownerLeasingArgsSchema = void 0;
exports.getOwnerLeasingReport = getOwnerLeasingReport;
exports.registerOwnerLeasingReportTool = registerOwnerLeasingReportTool;
const zod_1 = require("zod");
const appfolio_1 = require("../appfolio");
const validation_1 = require("../validation");
// Zod schema for Owner Leasing Report arguments
exports.ownerLeasingArgsSchema = zod_1.z.object({
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional().describe((0, validation_1.getIdFieldDescription)('properties_ids', 'Property', 'Property Directory Report')),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional().describe((0, validation_1.getIdFieldDescription)('property_groups_ids', 'Property Group')),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional().describe((0, validation_1.getIdFieldDescription)('portfolios_ids', 'Portfolio')),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional().describe((0, validation_1.getIdFieldDescription)('owners_ids', 'Owner', 'Owner Directory Report'))
    }).optional().describe('Filter results based on properties, groups, portfolios, or owners. All ID fields must be numeric strings, not names.'),
    received_on_from: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The start date for the reporting period based on received date (YYYY-MM-DD). Required.'),
    received_on_to: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The end date for the reporting period based on received date (YYYY-MM-DD). Required.'),
    unit_visibility: zod_1.z.enum(["active", "hidden", "all"]).optional().default("active").describe('Filter units by status. Defaults to "active"'),
    include_units_which_are_not_rent_ready: zod_1.z.enum(["0", "1"]).optional().default("0").describe('Include units that are not marked as rent ready. Defaults to "0" (false)'),
    include_units_which_are_hidden_from_the_vacancies_dashboard: zod_1.z.enum(["0", "1"]).optional().default("0").describe('Include units hidden from the vacancies dashboard. Defaults to "0" (false)'),
    columns: zod_1.z.array(zod_1.z.string()).optional().describe('Array of specific columns to include in the report')
});
// --- Owner Leasing Report Function ---
async function getOwnerLeasingReport(args) {
    if (!args.received_on_from || !args.received_on_to) {
        throw new Error('Missing required arguments: received_on_from and received_on_to (format YYYY-MM-DD)');
    }
    // Validate ID fields
    if (args.properties) {
        const validationErrors = (0, validation_1.validatePropertiesIds)(args.properties);
        (0, validation_1.throwOnValidationErrors)(validationErrors);
    }
    const payload = args;
    return (0, appfolio_1.makeAppfolioApiCall)('owner_leasing.json', payload);
}
// --- Register Owner Leasing Report Tool ---
function registerOwnerLeasingReportTool(server) {
    server.tool("get_owner_leasing_report", "Provides a leasing report tailored for property owners, showing leasing activity within a specified date range. IMPORTANT: All ID parameters (owners_ids, properties_ids, etc.) must be numeric strings (e.g. '123'), NOT names. Use respective directory reports first to lookup IDs by name if needed.", exports.ownerLeasingArgsSchema.shape, async (args) => {
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

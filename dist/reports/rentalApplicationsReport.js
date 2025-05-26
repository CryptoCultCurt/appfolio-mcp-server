"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRentalApplicationsReport = getRentalApplicationsReport;
exports.registerRentalApplicationsReportTool = registerRentalApplicationsReportTool;
const zod_1 = require("zod");
const appfolio_1 = require("../appfolio");
const validation_1 = require("../validation");
const rentalApplicationsInputSchema = zod_1.z.object({
    property_visibility: zod_1.z.enum(["active", "hidden", "all"]).optional().default("active"),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional().describe((0, validation_1.getIdFieldDescription)('properties_ids', 'Property', 'Property Directory Report')),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional().describe((0, validation_1.getIdFieldDescription)('property_groups_ids', 'Property Group')),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional().describe((0, validation_1.getIdFieldDescription)('portfolios_ids', 'Portfolio')),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional().describe((0, validation_1.getIdFieldDescription)('owners_ids', 'Owner', 'Owner Directory Report'))
    }).optional().describe('Filter results based on properties, groups, portfolios, or owners. All ID fields must be numeric strings, not names.'),
    received_on_from: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional(),
    received_on_to: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional(),
    statuses: zod_1.z.array(zod_1.z.string()).optional(),
    sources: zod_1.z.array(zod_1.z.string()).optional(),
    columns: zod_1.z.array(zod_1.z.string()).optional()
});
async function getRentalApplicationsReport(args) {
    if (!args.received_on_from || !args.received_on_to) {
        throw new Error('Missing required arguments: received_on_from and received_on_to (format YYYY-MM-DD)');
    }
    // Validate ID fields
    if (args.properties) {
        const validationErrors = (0, validation_1.validatePropertiesIds)(args.properties);
        (0, validation_1.throwOnValidationErrors)(validationErrors);
    }
    const { property_visibility = "active", ...rest } = args;
    const payload = { property_visibility, ...rest };
    return (0, appfolio_1.makeAppfolioApiCall)('rental_applications.json', payload);
}
function registerRentalApplicationsReportTool(server) {
    server.tool("get_rental_applications_report", "Returns rental applications report for the given filters. IMPORTANT: All ID parameters (owners_ids, properties_ids, etc.) must be numeric strings (e.g. '123'), NOT names. Use respective directory reports first to lookup IDs by name if needed.", rentalApplicationsInputSchema.shape, async (args, _extra) => {
        const data = await getRentalApplicationsReport(args);
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

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUnitInspectionReport = getUnitInspectionReport;
exports.registerUnitInspectionReportTool = registerUnitInspectionReportTool;
const zod_1 = require("zod");
const appfolio_1 = require("../appfolio");
const validation_1 = require("../validation");
// Zod schema for Unit Inspection Report arguments
const unitInspectionArgsSchema = zod_1.z.object({
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional().describe((0, validation_1.getIdFieldDescription)('properties_ids', 'Property', 'Property Directory Report')),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional().describe((0, validation_1.getIdFieldDescription)('property_groups_ids', 'Property Group')),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional().describe((0, validation_1.getIdFieldDescription)('portfolios_ids', 'Portfolio')),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional().describe((0, validation_1.getIdFieldDescription)('owners_ids', 'Owner', 'Owner Directory Report'))
    }).optional().describe('Filter results based on properties, groups, portfolios, or owners. All ID fields must be numeric strings, not names.'),
    unit_visibility: zod_1.z.enum(["active", "hidden", "all"]).optional().default("active").describe('Filter units by status. Defaults to "active"'),
    last_inspection_on_from: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional().describe('Optional. Filter units last inspected on or after this date (YYYY-MM-DD).'),
    include_blank_inspection_date: zod_1.z.union([zod_1.z.boolean(), zod_1.z.string()]).optional().default(false).transform(val => {
        if (typeof val === 'string')
            return val === 'true' || val === '1' ? "1" : "0";
        return val ? "1" : "0";
    }).describe('Include units with no inspection date. Defaults to false.'),
    columns: zod_1.z.array(zod_1.z.string()).optional().describe('Array of specific columns to include in the report')
});
// --- Unit Inspection Report Function ---
async function getUnitInspectionReport(args) {
    // Validate ID fields
    if (args.properties) {
        const validationErrors = (0, validation_1.validatePropertiesIds)(args.properties);
        (0, validation_1.throwOnValidationErrors)(validationErrors);
    }
    const { unit_visibility = "active", include_blank_inspection_date = "0", ...rest } = args;
    const payload = {
        unit_visibility,
        include_blank_inspection_date,
        ...rest
    };
    return (0, appfolio_1.makeAppfolioApiCall)('unit_inspection.json', payload);
}
// MCP Tool Registration Function
function registerUnitInspectionReportTool(server) {
    server.tool("get_unit_inspection_report", "Generates a report on unit inspections. IMPORTANT: All ID parameters (owners_ids, properties_ids, etc.) must be numeric strings (e.g. '123'), NOT names. Use respective directory reports first to lookup IDs by name if needed.", unitInspectionArgsSchema.shape, async (args, _extra) => {
        const data = await getUnitInspectionReport(args);
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

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUnitDirectoryReport = getUnitDirectoryReport;
exports.registerUnitDirectoryReportTool = registerUnitDirectoryReportTool;
const zod_1 = require("zod");
const appfolio_1 = require("../appfolio");
const validation_1 = require("../validation");
// Zod schema for Unit Directory Report arguments
const unitDirectoryArgsSchema = zod_1.z.object({
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional().describe((0, validation_1.getIdFieldDescription)('properties_ids', 'Property', 'Property Directory Report')),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional().describe((0, validation_1.getIdFieldDescription)('property_groups_ids', 'Property Group')),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional().describe((0, validation_1.getIdFieldDescription)('portfolios_ids', 'Portfolio')),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional().describe((0, validation_1.getIdFieldDescription)('owners_ids', 'Owner', 'Owner Directory Report'))
    }).optional().describe('Filter results based on properties, groups, portfolios, or owners. All ID fields must be numeric strings, not names.'),
    unit_visibility: zod_1.z.enum(["active", "hidden", "all"]).optional().default("active").describe('Filter units by status. Defaults to "active"'),
    tags: zod_1.z.string().optional().describe('Optional. Filter by a comma-separated list of tags (e.g., "bbq,deck").'),
    columns: zod_1.z.array(zod_1.z.string()).optional().describe('Array of specific columns to include in the report')
});
// --- Unit Directory Report Function ---
async function getUnitDirectoryReport(args) {
    // Validate ID fields
    if (args.properties) {
        const validationErrors = (0, validation_1.validatePropertiesIds)(args.properties);
        (0, validation_1.throwOnValidationErrors)(validationErrors);
    }
    const { unit_visibility = "active", ...rest } = args;
    const payload = { unit_visibility, ...rest };
    return (0, appfolio_1.makeAppfolioApiCall)('unit_directory.json', payload);
}
// MCP Tool Registration Function
function registerUnitDirectoryReportTool(server) {
    server.tool("get_unit_directory_report", "Retrieves a unit directory report with details about units in properties. IMPORTANT: All ID parameters (owners_ids, properties_ids, etc.) must be numeric strings (e.g. '123'), NOT names. Use respective directory reports first to lookup IDs by name if needed.", unitDirectoryArgsSchema.shape, async (args, _extra) => {
        try {
            // Validate arguments against schema
            const parseResult = unitDirectoryArgsSchema.safeParse(args);
            if (!parseResult.success) {
                const errorMessages = parseResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('; ');
                throw new Error(`Invalid arguments: ${errorMessages}`);
            }
            const result = await getUnitDirectoryReport(parseResult.data);
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
            console.error(`Unit Directory Report Error:`, errorMessage);
            throw error;
        }
    });
}

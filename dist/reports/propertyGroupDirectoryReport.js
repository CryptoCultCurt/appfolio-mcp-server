"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.propertyGroupDirectoryArgsSchema = exports.PROPERTY_GROUP_DIRECTORY_COLUMNS = void 0;
exports.getPropertyGroupDirectoryReport = getPropertyGroupDirectoryReport;
exports.registerPropertyGroupDirectoryReportTool = registerPropertyGroupDirectoryReportTool;
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
const appfolio_1 = require("../appfolio");
const validation_1 = require("../validation");
dotenv_1.default.config();
// Available columns extracted from the sample response
exports.PROPERTY_GROUP_DIRECTORY_COLUMNS = [
    'property',
    'property_name',
    'property_id',
    'property_address',
    'property_street',
    'property_street2',
    'property_city',
    'property_state',
    'property_zip',
    'property_county',
    'property_legacy_street1',
    'property_group_name',
    'portfolio',
    'property_group_id',
    'portfolio_id'
];
// Zod schema for input validation
exports.propertyGroupDirectoryArgsSchema = zod_1.z.object({
    property_visibility: zod_1.z.enum(['active', 'inactive', 'all']).default('active')
        .describe('Property visibility filter'),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional()
            .describe((0, validation_1.getIdFieldDescription)('property', 'Property Directory Report')),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional()
            .describe((0, validation_1.getIdFieldDescription)('property group', 'Property Group Directory Report')),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional()
            .describe((0, validation_1.getIdFieldDescription)('portfolio', 'Portfolio Directory Report')),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional()
            .describe((0, validation_1.getIdFieldDescription)('owner', 'Owner Directory Report'))
    }).optional().describe('Property filtering options'),
    orphans_only: zod_1.z.enum(['0', '1']).default('0')
        .describe('Filter to show only orphaned properties (1) or all properties (0)'),
    columns: zod_1.z.array(zod_1.z.enum(exports.PROPERTY_GROUP_DIRECTORY_COLUMNS)).optional()
        .describe(`Array of specific columns to include in the report. Valid columns: ${exports.PROPERTY_GROUP_DIRECTORY_COLUMNS.join(', ')}. If not specified, all columns are returned.`)
});
// Main report function
async function getPropertyGroupDirectoryReport(args) {
    // Validate properties IDs if provided
    if (args.properties) {
        const validationErrors = (0, validation_1.validatePropertiesIds)(args.properties);
        (0, validation_1.throwOnValidationErrors)(validationErrors);
    }
    const payload = {
        property_visibility: args.property_visibility,
        properties: args.properties || {},
        orphans_only: args.orphans_only,
        ...(args.columns && { columns: args.columns })
    };
    return (0, appfolio_1.makeAppfolioApiCall)('property_group_directory.json', payload);
}
// MCP tool registration
function registerPropertyGroupDirectoryReportTool(server) {
    server.tool('get_property_group_directory_report', 'Get property group directory report from AppFolio. Shows properties organized by property groups and portfolios. IMPORTANT: All ID parameters (properties_ids, property_groups_ids, portfolios_ids, owners_ids) must be numeric strings (e.g. "123"), NOT names. Use respective directory reports first to lookup IDs by name if needed.', exports.propertyGroupDirectoryArgsSchema.shape, async (args, _extra) => {
        try {
            // Validate arguments against schema
            const parseResult = exports.propertyGroupDirectoryArgsSchema.safeParse(args);
            if (!parseResult.success) {
                const errorMessages = parseResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('; ');
                throw new Error(`Invalid arguments: ${errorMessages}`);
            }
            const result = await getPropertyGroupDirectoryReport(parseResult.data);
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify(result, null, 2),
                        mimeType: "application/json"
                    }]
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`Property Group Directory Report Error:`, errorMessage);
            throw error;
        }
    });
}

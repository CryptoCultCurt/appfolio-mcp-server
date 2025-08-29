"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.occupancySummaryArgsSchema = exports.OCCUPANCY_SUMMARY_COLUMNS = void 0;
exports.getOccupancySummaryReport = getOccupancySummaryReport;
exports.registerOccupancySummaryReportTool = registerOccupancySummaryReportTool;
const zod_1 = require("zod");
const appfolio_1 = require("../appfolio");
const validation_1 = require("../validation");
// Available columns extracted from the OccupancySummaryResultItem type
exports.OCCUPANCY_SUMMARY_COLUMNS = [
    'unit_type',
    'number_of_units',
    'occupied',
    'percent_occupied',
    'average_square_feet',
    'average_market_rent',
    'vacant_rented',
    'vacant_unrented',
    'notice_rented',
    'notice_unrented',
    'average_rent',
    'property',
    'property_id'
];
// Zod schema for Occupancy Summary Report arguments
exports.occupancySummaryArgsSchema = zod_1.z.object({
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional()
            .describe((0, validation_1.getIdFieldDescription)('property', 'Property Directory Report')),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional()
            .describe((0, validation_1.getIdFieldDescription)('property group', 'Property Group Directory Report')),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional()
            .describe((0, validation_1.getIdFieldDescription)('portfolio', 'Portfolio Directory Report')),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional()
            .describe((0, validation_1.getIdFieldDescription)('owner', 'Owner Directory Report'))
    }).optional().describe('Filter results based on properties, groups, portfolios, or owners'),
    unit_visibility: zod_1.z.enum(["active", "hidden", "all"]).optional().default("active").describe('Filter units by status. Defaults to "active"'),
    as_of_date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The "as of" date for the report (YYYY-MM-DD). Required.'),
    columns: zod_1.z.array(zod_1.z.enum(exports.OCCUPANCY_SUMMARY_COLUMNS)).optional()
        .describe(`Array of specific columns to include in the report. Valid columns: ${exports.OCCUPANCY_SUMMARY_COLUMNS.join(', ')}. If not specified, all columns are returned. NOTE: Use 'occupied' for occupied units count, 'vacant_rented' and 'vacant_unrented' for vacancy details.`)
});
// --- Occupancy Summary Report Function ---
async function getOccupancySummaryReport(args) {
    // Validate properties IDs if provided
    if (args.properties) {
        const validationErrors = (0, validation_1.validatePropertiesIds)(args.properties);
        (0, validation_1.throwOnValidationErrors)(validationErrors);
    }
    if (!args.as_of_date) {
        throw new Error('Missing required argument: as_of_date (format YYYY-MM-DD)');
    }
    const { unit_visibility = "active", ...rest } = args;
    const payload = { unit_visibility, ...rest };
    return (0, appfolio_1.makeAppfolioApiCall)('occupancy_summary.json', payload);
}
// --- Register Occupancy Summary Report Tool ---
function registerOccupancySummaryReportTool(server) {
    server.tool("get_occupancy_summary_report", "Generates a summary of property occupancy, including number of units, occupied units, and vacancy rates. IMPORTANT: All ID parameters must be numeric strings (e.g. '123'), NOT names. Use directory reports to lookup IDs by name if needed. Common columns: 'number_of_units', 'occupied', 'vacant_rented', 'vacant_unrented', 'percent_occupied'.", exports.occupancySummaryArgsSchema.shape, async (args, _extra) => {
        try {
            console.log('Occupancy Summary Report - received arguments:', JSON.stringify(args, null, 2));
            // Validate arguments against schema
            const parseResult = exports.occupancySummaryArgsSchema.safeParse(args);
            if (!parseResult.success) {
                const errorMessages = parseResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('; ');
                console.error('Occupancy Summary Report - validation errors:', errorMessages);
                throw new Error(`Invalid arguments: ${errorMessages}`);
            }
            const result = await getOccupancySummaryReport(parseResult.data);
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
            console.error(`Occupancy Summary Report Error:`, errorMessage);
            throw error;
        }
    });
}

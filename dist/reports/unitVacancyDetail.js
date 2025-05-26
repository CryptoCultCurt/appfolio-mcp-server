"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUnitVacancyDetailReport = getUnitVacancyDetailReport;
exports.registerUnitVacancyDetailReportTool = registerUnitVacancyDetailReportTool;
const zod_1 = require("zod");
const appfolio_1 = require("../appfolio");
const validation_1 = require("../validation");
// Valid column names for Unit Vacancy Detail Report
const UNIT_VACANCY_DETAIL_COLUMNS = [
    'advertised_rent',
    'posted_to_website',
    'posted_to_internet',
    'property',
    'property_name',
    'amenities',
    'lockbox_enabled',
    'affordable_program',
    'address',
    'street',
    'street2',
    'city',
    'state',
    'zip',
    'unit',
    'unit_tags',
    'unit_type',
    'bed_and_bath',
    'sqft',
    'unit_status',
    'rent_ready',
    'days_vacant',
    'last_rent',
    'schd_rent',
    'new_rent',
    'last_move_in',
    'last_move_out',
    'available_on',
    'next_move_in',
    'description',
    'amenities_price',
    'computed_market_rent',
    'ready_for_showing_on',
    'unit_turn_target_date',
    'advertised_rent_months',
    'property_id',
    'unit_id'
];
// Zod schema for Unit Vacancy Detail Report arguments
const unitVacancyDetailArgsSchema = zod_1.z.object({
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional().describe((0, validation_1.getIdFieldDescription)('properties_ids', 'Property', 'Property Directory Report')),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional().describe((0, validation_1.getIdFieldDescription)('property_groups_ids', 'Property Group')),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional().describe((0, validation_1.getIdFieldDescription)('portfolios_ids', 'Portfolio')),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional().describe((0, validation_1.getIdFieldDescription)('owners_ids', 'Owner', 'Owner Directory Report'))
    }).optional().describe('Filter results based on properties, groups, portfolios, or owners. All ID fields must be numeric strings, not names.'),
    property_visibility: zod_1.z.enum(["active", "hidden", "all"]).optional().default("active").describe('Filter units by status. Defaults to "active"'),
    tags: zod_1.z.string().optional().describe('Optional. Filter by a comma-separated list of tags (e.g., "bbq,deck").'),
    columns: zod_1.z.array(zod_1.z.enum(UNIT_VACANCY_DETAIL_COLUMNS)).optional().describe(`Array of specific columns to include in the report. Valid columns: ${UNIT_VACANCY_DETAIL_COLUMNS.join(', ')}. If not specified, all columns are returned.`)
});
// --- Unit Vacancy Detail Report Function ---
async function getUnitVacancyDetailReport(args) {
    // Validate ID fields
    if (args.properties) {
        const validationErrors = (0, validation_1.validatePropertiesIds)(args.properties);
        (0, validation_1.throwOnValidationErrors)(validationErrors);
    }
    const { property_visibility = "active", ...rest } = args;
    const payload = { property_visibility, ...rest };
    return (0, appfolio_1.makeAppfolioApiCall)('unit_vacancy.json', payload);
}
// MCP Tool Registration Function
function registerUnitVacancyDetailReportTool(server) {
    server.tool("get_unit_vacancy_detail_report", "Generates a report on unit vacancies. IMPORTANT: All ID parameters (owners_ids, properties_ids, etc.) must be numeric strings (e.g. '123'), NOT names. Use respective directory reports first to lookup IDs by name if needed.", unitVacancyDetailArgsSchema.shape, async (args, _extra) => {
        try {
            // Validate arguments against schema
            const parseResult = unitVacancyDetailArgsSchema.safeParse(args);
            if (!parseResult.success) {
                const errorMessages = parseResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('; ');
                throw new Error(`Invalid arguments: ${errorMessages}`);
            }
            const data = await getUnitVacancyDetailReport(parseResult.data);
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(data),
                        mimeType: "application/json"
                    }
                ]
            };
        }
        catch (error) {
            // Enhanced error reporting for debugging
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`Unit Vacancy Detail Report Error:`, errorMessage);
            throw error;
        }
    });
}

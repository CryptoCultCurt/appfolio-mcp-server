"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.delinquencyAsOfInputSchema = exports.delinquencyAsOfBaseSchema = exports.TENANT_STATUS_MAP = exports.delinquencyColumnsList = void 0;
exports.getDelinquencyAsOfReport = getDelinquencyAsOfReport;
exports.registerDelinquencyAsOfReportTool = registerDelinquencyAsOfReportTool;
const zod_1 = require("zod");
const appfolio_1 = require("../appfolio");
const validation_1 = require("../validation");
exports.delinquencyColumnsList = [
    'unit', 'name', 'tenant_status', 'tags', 'phone_numbers', 'move_in', 'move_out',
    'primary_tenant_email', 'unit_type', 'property', 'property_name', 'property_id',
    'property_address', 'property_street', 'property_street2', 'property_city',
    'property_state', 'property_zip', 'amount_receivable', 'delinquent_subsidy_amount',
    '00_to30', '30_plus', '30_to60', '60_plus', '60_to90', '90_plus', 'this_month',
    'last_month', 'month_before_last', 'delinquent_rent', 'delinquency_notes',
    'certified_funds_only', 'in_collections', 'collections_agency', 'unit_id',
    'occupancy_id', 'property_group_id'
];
exports.TENANT_STATUS_MAP = {
    "0": "Current",
    "1": "Past",
    "2": "Future",
    "3": "Evict",
    "4": "Notice"
};
// Base schema for shape compatibility
exports.delinquencyAsOfBaseSchema = zod_1.z.object({
    property_visibility: zod_1.z.enum(["active", "hidden", "all"]).default("active").describe('Filter properties by status. Defaults to "active".'),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional().describe((0, validation_1.getIdFieldDescription)('properties_ids', 'Property', 'property directory report')),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional().describe((0, validation_1.getIdFieldDescription)('property_groups_ids', 'Property Group', 'property group directory report')),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional().describe((0, validation_1.getIdFieldDescription)('portfolios_ids', 'Portfolio', 'portfolio directory report')),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional().describe((0, validation_1.getIdFieldDescription)('owners_ids', 'Owner', 'owner directory report')),
    }).optional().describe('Optional. Filter by specific property-related IDs.'),
    occurred_on_to: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe("Required. Date to run the report as of in YYYY-MM-DD format."),
    delinquency_note_range: zod_1.z.string().optional().describe('Optional. Filter by delinquency note range.'),
    tenant_statuses: zod_1.z.array(zod_1.z.enum(["0", "1", "2", "3", "4"])).default(["0", "4"]).optional().describe('Filter by tenant status. Valid values: "0"=Current, "1"=Past, "2"=Future, "3"=Evict, "4"=Notice. Defaults to ["0", "4"] (Current and Notice tenants).'),
    tags: zod_1.z.string().optional().describe('Optional. Filter by property tags.'),
    amount_owed_in_account: zod_1.z.string().default("all").optional().describe('Filter by amount owed in account. Defaults to "all".'),
    balance_operator: zod_1.z.object({
        amount: zod_1.z.string().optional().describe('Optional. Balance amount to compare against.'),
        comparator: zod_1.z.string().optional().describe('Optional. Comparison operator for balance amount.')
    }).optional().describe('Optional. Filter by balance amount with comparison operator.'),
    columns: zod_1.z.array(zod_1.z.enum(exports.delinquencyColumnsList)).optional().describe(`Array of specific columns to include in the report. Valid columns: ${exports.delinquencyColumnsList.join(', ')}`)
});
// Schema with validation
exports.delinquencyAsOfInputSchema = exports.delinquencyAsOfBaseSchema.superRefine((data, ctx) => {
    // Validate property-related IDs if provided
    if (data.properties) {
        const validationErrors = (0, validation_1.validatePropertiesIds)(data.properties);
        (0, validation_1.throwOnValidationErrors)(validationErrors);
    }
});
async function getDelinquencyAsOfReport(args) {
    if (!args.occurred_on_to) {
        throw new Error('Missing required argument: occurred_on_to (format YYYY-MM-DD)');
    }
    const { property_visibility = "active", tenant_statuses = ["0", "4"], amount_owed_in_account = "all", ...rest } = args;
    // Build payload, filtering out empty strings and empty objects
    const payload = {
        property_visibility,
        tenant_statuses,
        amount_owed_in_account,
    };
    // Add non-empty fields from rest
    Object.entries(rest).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            // Skip empty objects (like balance_operator with empty amount/comparator)
            if (typeof value === 'object' && !Array.isArray(value)) {
                const filteredObj = Object.fromEntries(Object.entries(value).filter(([_, v]) => v !== undefined && v !== null && v !== ""));
                if (Object.keys(filteredObj).length > 0) {
                    payload[key] = filteredObj;
                }
            }
            else {
                payload[key] = value;
            }
        }
    });
    return (0, appfolio_1.makeAppfolioApiCall)('delinquency_as_of.json', payload);
}
function registerDelinquencyAsOfReportTool(server) {
    server.tool("get_delinquency_as_of_report", "Returns delinquency as of report for the given filters. IMPORTANT: All ID parameters (properties_ids, etc.) must be numeric strings (e.g. '123'), NOT names. Use respective directory reports first to lookup IDs by name if needed. NOTE: tenant_statuses uses numeric codes: 0=Current, 1=Past, 2=Future, 3=Evict, 4=Notice.", exports.delinquencyAsOfBaseSchema.shape, async (args, _extra) => {
        try {
            // Validate arguments against schema
            const parseResult = exports.delinquencyAsOfInputSchema.safeParse(args);
            if (!parseResult.success) {
                const errorMessages = parseResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('; ');
                throw new Error(`Invalid arguments: ${errorMessages}`);
            }
            const result = await getDelinquencyAsOfReport(parseResult.data);
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
            console.error(`Delinquency As Of Report Error:`, errorMessage);
            throw error;
        }
    });
}

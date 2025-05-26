"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.propertyDirectoryArgsSchema = void 0;
exports.getPropertyDirectoryReport = getPropertyDirectoryReport;
exports.registerPropertyDirectoryReportTool = registerPropertyDirectoryReportTool;
const zod_1 = require("zod");
const appfolio_1 = require("../appfolio");
const validation_1 = require("../validation");
// Valid column names for Property Directory Report
const PROPERTY_DIRECTORY_COLUMNS = [
    'property',
    'property_name',
    'property_id',
    'property_integration_id',
    'property_address',
    'property_street',
    'property_street2',
    'property_city',
    'property_state',
    'property_zip',
    'property_county',
    'market_rent',
    'units',
    'sqft',
    'management_flat_fee',
    'management_fee_percent',
    'minimum_fee',
    'maximum_fee',
    'waive_fees_when_vacant',
    'reserve',
    'home_warranty_expiration',
    'insurance_expiration',
    'tax_year_end',
    'tax_authority',
    'owners_phone_number',
    'payer_name',
    'description',
    'portfolio',
    'premium_leads_status',
    'premium_leads_monthly_cap',
    'premium_leads_activation_date',
    'owner_i_ds',
    'property_group_id',
    'portfolio_id',
    'portfolio_uuid',
    'visibility',
    'maintenance_limit',
    'maintenance_notes',
    'site_manager_name',
    'site_manager_phone_number',
    'management_fee_type',
    'lease_fee_type',
    'lease_flat_fee',
    'lease_fee_percent',
    'renewal_fee_type',
    'renewal_flat_fee',
    'renewal_fee_percent',
    'future_management_fee_start_date',
    'future_management_fee_percent',
    'future_management_flat_fee',
    'future_minimum_fee',
    'future_maximum_fee',
    'future_management_fee_type',
    'future_waive_fees_when_vacant',
    'owner_payment_type',
    'property_type',
    'property_created_on',
    'property_created_by',
    'owners',
    'prepayment_type',
    'late_fee_type',
    'late_fee_base_amount',
    'late_fee_daily_amount',
    'late_fee_grace_period',
    'late_fee_grace_period_fixed_day',
    'late_fee_grace_balance',
    'max_daily_late_fees_amount',
    'ignore_partial_payments',
    'admin_fee_amount',
    'year_built',
    'contract_expirations',
    'management_start_date',
    'management_end_date',
    'management_end_reason',
    'agent_of_record',
    'tax_region_code',
    'property_class',
    'online_maintenance_request_instructions',
    'amenities',
    'listing_type'
];
// Zod schema for Property Directory Report arguments
exports.propertyDirectoryArgsSchema = zod_1.z.object({
    property_visibility: zod_1.z.enum(["active", "hidden", "all"]).default("active").describe('Filter properties by status. Defaults to "active"'),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional().describe('Array of property IDs (numeric strings, NOT property names)'),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional().describe('Array of property group IDs (numeric strings, NOT group names)'),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional().describe('Array of portfolio IDs (numeric strings, NOT portfolio names)'),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional().describe('Array of owner IDs (numeric strings, NOT owner names). Use Owner Directory Report to lookup owner IDs by name first if needed.'),
    }).optional().describe('Filter results based on property, group, portfolio, or owner IDs. All values must be numeric ID strings, not names.'),
    columns: zod_1.z.array(zod_1.z.enum(PROPERTY_DIRECTORY_COLUMNS)).optional().describe(`Array of specific columns to include in the report. Valid columns: ${PROPERTY_DIRECTORY_COLUMNS.join(', ')}. If not specified, all columns are returned.`)
});
// --- Property Directory Report Function ---
async function getPropertyDirectoryReport(args) {
    // Validate that IDs are numeric strings, not names
    const validationErrors = (0, validation_1.validatePropertiesIds)(args.properties);
    (0, validation_1.throwOnValidationErrors)(validationErrors);
    const { property_visibility = "active", ...rest } = args;
    const payload = { property_visibility, ...rest };
    return (0, appfolio_1.makeAppfolioApiCall)('property_directory.json', payload);
}
// Registration function for the tool
function registerPropertyDirectoryReportTool(server) {
    server.tool("get_property_directory_report", "Retrieves a property directory report with details about properties, including status, address, units count, and owner information. IMPORTANT: All ID parameters (owners_ids, properties_ids, etc.) must be numeric strings (e.g. '123'), NOT names. Use Owner Directory Report first to lookup owner IDs by name if needed.", exports.propertyDirectoryArgsSchema.shape, async (args, _extra) => {
        try {
            // Validate arguments against schema
            const parseResult = exports.propertyDirectoryArgsSchema.safeParse(args);
            if (!parseResult.success) {
                const errorMessages = parseResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('; ');
                throw new Error(`Invalid arguments: ${errorMessages}`);
            }
            const result = await getPropertyDirectoryReport(parseResult.data);
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
            console.error(`Property Directory Report Error:`, errorMessage);
            throw error;
        }
    });
}

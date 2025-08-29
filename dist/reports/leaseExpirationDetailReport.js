"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.leaseExpirationDetailArgsSchema = exports.LEASE_EXPIRATION_DETAIL_COLUMNS = void 0;
exports.getLeaseExpirationDetailReport = getLeaseExpirationDetailReport;
exports.registerLeaseExpirationDetailReportTool = registerLeaseExpirationDetailReportTool;
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
const appfolio_1 = require("../appfolio");
const validation_1 = require("../validation");
dotenv_1.default.config();
// Available columns extracted from the LeaseExpirationDetailResult type
exports.LEASE_EXPIRATION_DETAIL_COLUMNS = [
    'property',
    'property_name',
    'property_id',
    'property_address',
    'property_street',
    'property_street2',
    'property_city',
    'property_state',
    'property_zip',
    'unit',
    'unit_tags',
    'unit_type',
    'move_in',
    'lease_expires',
    'lease_expires_month',
    'market_rent',
    'sqft',
    'tenant_name',
    'deposit',
    'rent',
    'phone_numbers',
    'unit_id',
    'occupancy_id',
    'tenant_id',
    'owner_agent',
    'tenant_agent',
    'rent_status',
    'legal_rent',
    'owners_phone_number',
    'owners',
    'last_rent_increase',
    'next_rent_adjustment',
    'next_rent_increase',
    'lease_sign_date',
    'last_lease_renewal',
    'notice_given_date',
    'move_out',
    'tenant_tags',
    'affordable_program',
    'computed_market_rent'
];
// Zod schema for Lease Expiration Detail By Month Report arguments
exports.leaseExpirationDetailArgsSchema = zod_1.z.object({
    from_date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The start date for the reporting period (YYYY-MM-DD). Required.'),
    to_date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The end date for the reporting period (YYYY-MM-DD). Required.'),
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
    unit_visibility: zod_1.z.enum(["active", "hidden", "all"]).default("active").describe('Filter units by status. Defaults to "active"'),
    tags: zod_1.z.string().optional().describe('Filter by unit tags (comma-separated string)'),
    filter_lease_date_range_by: zod_1.z.enum(["Lease Expiration Date", "Lease Start Date", "Move-in Date"]).default("Lease Expiration Date").describe('Which date field to use for the date range filter. Defaults to "Lease Expiration Date"'),
    exclude_occupancies_with_move_out: zod_1.z.enum(["0", "1"]).default("0").describe('Exclude occupancies that have a move-out date. Defaults to "0" (false)'),
    exclude_month_to_month: zod_1.z.enum(["0", "1"]).default("0").describe('Exclude occupancies that are month-to-month. Defaults to "0" (false)'),
    columns: zod_1.z.array(zod_1.z.enum(exports.LEASE_EXPIRATION_DETAIL_COLUMNS)).optional()
        .describe(`Array of specific columns to include in the report. Valid columns: ${exports.LEASE_EXPIRATION_DETAIL_COLUMNS.join(', ')}. If not specified, all columns are returned.`)
});
// --- Lease Expiration Detail By Month Report Function ---
async function getLeaseExpirationDetailReport(args) {
    // Validate properties IDs if provided
    if (args.properties) {
        const validationErrors = (0, validation_1.validatePropertiesIds)(args.properties);
        (0, validation_1.throwOnValidationErrors)(validationErrors);
    }
    if (!args.from_date || !args.to_date) {
        throw new Error('Missing required arguments: from_date and to_date (format YYYY-MM-DD)');
    }
    const { unit_visibility = "active", ...rest } = args;
    const payload = { unit_visibility, ...rest };
    return (0, appfolio_1.makeAppfolioApiCall)('lease_expiration_detail.json', payload);
}
// Registration function for the tool
function registerLeaseExpirationDetailReportTool(server) {
    server.tool("get_lease_expiration_detail_by_month_report", "Retrieves a report detailing lease expirations by month, filterable by properties, date range, and other criteria. IMPORTANT: All ID parameters (properties_ids, property_groups_ids, portfolios_ids, owners_ids) must be numeric strings (e.g. '123'), NOT names. Use respective directory reports first to lookup IDs by name if needed.", exports.leaseExpirationDetailArgsSchema.shape, async (args, _extra) => {
        try {
            // Validate arguments against schema
            const parseResult = exports.leaseExpirationDetailArgsSchema.safeParse(args);
            if (!parseResult.success) {
                const errorMessages = parseResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('; ');
                throw new Error(`Invalid arguments: ${errorMessages}`);
            }
            const result = await getLeaseExpirationDetailReport(parseResult.data);
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
            console.error(`Lease Expiration Detail Report Error:`, errorMessage);
            throw error;
        }
    });
}

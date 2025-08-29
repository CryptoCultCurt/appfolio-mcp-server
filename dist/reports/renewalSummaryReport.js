"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RENEWAL_SUMMARY_COLUMNS = void 0;
exports.getRenewalSummaryReport = getRenewalSummaryReport;
exports.registerRenewalSummaryReportTool = registerRenewalSummaryReportTool;
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
const appfolio_1 = require("../appfolio");
const validation_1 = require("../validation");
dotenv_1.default.config();
// Available columns extracted from the RenewalSummaryResult type
exports.RENEWAL_SUMMARY_COLUMNS = [
    'unit_name',
    'property',
    'property_name',
    'property_id',
    'property_address',
    'property_street',
    'property_street2',
    'property_city',
    'property_state',
    'property_zip',
    'unit_type',
    'unit_id',
    'occupancy_id',
    'tenant_name',
    'lease_start',
    'lease_end',
    'previous_lease_start',
    'previous_lease_end',
    'previous_rent',
    'rent',
    'respond_by_date',
    'renewal_sent_date',
    'countersigned_date',
    'automatic_renewal_date',
    'percent_difference',
    'dollar_difference',
    'status',
    'term',
    'lease_start_month',
    'tenant_id',
    'tenant_tags',
    'tenant_agent',
    'lease_uuid',
    'lease_document_uuid',
    'notice_given_date',
    'move_out'
];
// Zod schema for Renewal Summary Report arguments
const renewalStatusSchema = zod_1.z.enum(["all", "Renewed", "Did Not Renew", "Month To Month", "Pending", "Cancelled by User"]);
const renewalSummaryArgsSchema = zod_1.z.object({
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
    start_on_from: zod_1.z.string().regex(/^\d{4}-\d{2}$/, "Date must be in YYYY-MM format").describe('The start month for the reporting period based on lease start date (YYYY-MM). Required.'),
    start_on_to: zod_1.z.string().regex(/^\d{4}-\d{2}$/, "Date must be in YYYY-MM format").describe('The end month for the reporting period based on lease start date (YYYY-MM). Required.'),
    statuses: zod_1.z.array(renewalStatusSchema).optional().default(["all"]).describe('Filter by renewal status. Defaults to ["all"]'),
    include_tenant_transfers: zod_1.z.enum(["0", "1"]).optional().describe('Include tenant transfers in the report. Defaults to "0" (false)'),
    columns: zod_1.z.array(zod_1.z.enum(exports.RENEWAL_SUMMARY_COLUMNS)).optional()
        .describe(`Array of specific columns to include in the report. Valid columns: ${exports.RENEWAL_SUMMARY_COLUMNS.join(', ')}. If not specified, all columns are returned.`)
});
// --- Renewal Summary Report Function ---
async function getRenewalSummaryReport(args) {
    // Validate properties IDs if provided
    if (args.properties) {
        const validationErrors = (0, validation_1.validatePropertiesIds)(args.properties);
        (0, validation_1.throwOnValidationErrors)(validationErrors);
    }
    if (!args.start_on_from || !args.start_on_to) {
        throw new Error('Missing required arguments: start_on_from and start_on_to (format YYYY-MM)');
    }
    const { unit_visibility = "active", statuses = ["all"], include_tenant_transfers = "0", ...rest } = args;
    const payload = {
        unit_visibility,
        statuses,
        include_tenant_transfers,
        ...rest
    };
    return (0, appfolio_1.makeAppfolioApiCall)('renewal_summary.json', payload);
}
// --- Renewal Summary Report Tool ---
function registerRenewalSummaryReportTool(server) {
    server.tool("get_renewal_summary_report", "Provides a summary of lease renewals. IMPORTANT: All ID parameters (properties_ids, property_groups_ids, portfolios_ids, owners_ids) must be numeric strings (e.g. '123'), NOT names. Use respective directory reports first to lookup IDs by name if needed. NOTE: All string parameters should be properly quoted JSON strings (e.g. \"active\", not active).", renewalSummaryArgsSchema.shape, async (args, _extra) => {
        try {
            // Log the raw arguments to help debug parsing issues
            console.log('Renewal Summary Report - Raw args received:', JSON.stringify(args, null, 2));
            // Validate arguments against schema
            const parseResult = renewalSummaryArgsSchema.safeParse(args);
            if (!parseResult.success) {
                const errorMessages = parseResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('; ');
                console.error('Renewal Summary Report - Schema validation failed:', errorMessages);
                throw new Error(`Invalid arguments: ${errorMessages}. Note: All string values should be properly quoted in JSON format (e.g. "active", not active).`);
            }
            const result = await getRenewalSummaryReport(parseResult.data);
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
            console.error(`Renewal Summary Report Error:`, errorMessage);
            throw error;
        }
    });
}

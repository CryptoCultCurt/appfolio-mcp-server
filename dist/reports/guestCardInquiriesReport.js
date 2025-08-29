"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GUEST_CARD_INQUIRIES_COLUMNS = void 0;
exports.getGuestCardInquiriesReport = getGuestCardInquiriesReport;
exports.registerGuestCardInquiriesReportTool = registerGuestCardInquiriesReportTool;
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
const appfolio_1 = require("../appfolio");
const validation_1 = require("../validation");
dotenv_1.default.config();
// Available columns extracted from the GuestCardInquiriesResult type
exports.GUEST_CARD_INQUIRIES_COLUMNS = [
    'name',
    'email_address',
    'phone_number',
    'received',
    'last_activity_date',
    'last_activity_type',
    'latest_interest_date',
    'latest_interest_source',
    'status',
    'move_in_preference',
    'max_rent',
    'bed_bath_preference',
    'pet_preference',
    'monthly_income',
    'credit_score',
    'lead_type',
    'source',
    'property',
    'unit',
    'assigned_user',
    'assigned_user_id',
    'guest_card_id',
    'guest_card_uuid',
    'inquiry_id',
    'occupancy_id',
    'property_id',
    'unit_id',
    'notes',
    'tenant_id',
    'rental_application_id',
    'rental_application_group_id',
    'applicants',
    'inquiry_type',
    'total_interests_received',
    'interests_received_in_range',
    'showings',
    'interest_to_showing_scheduled',
    'showing_to_application_received',
    'application_received_to_decision',
    'application_submission_to_lease_signed',
    'inquiry_to_lease_signed',
    'inactive_reason',
    'crm'
];
// Zod schema based on src/index.ts (Step 163) and function defaults (Step 153)
const guestCardInquiriesInputSchema = zod_1.z.object({
    property_visibility: zod_1.z.enum(["active", "inactive", "all"]).default("active").describe('Filter properties by visibility status. Defaults to "active"'),
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
    guest_card_sources: zod_1.z.array(zod_1.z.string()).default(["all"]).describe('Filter by guest card sources. Defaults to ["all"]'),
    guest_card_statuses: zod_1.z.array(zod_1.z.string()).default(["all"]).describe('Filter by guest card statuses. Defaults to ["all"]'),
    guest_card_lead_types: zod_1.z.array(zod_1.z.string()).default(["all"]).describe('Filter by guest card lead types. Defaults to ["all"]'),
    assigned_user: zod_1.z.string().default("All").describe('Filter by assigned user. Defaults to "All"'),
    assigned_user_visibility: zod_1.z.enum(["active", "inactive", "all"]).default("active").describe('Filter assigned users by visibility. Defaults to "active"'),
    guest_card_status: zod_1.z.string().default("open").describe('Filter by guest card status. Defaults to "open"'),
    filter_date_range_by: zod_1.z.enum(["received_on", "inquiry"]).default("inquiry").describe('Which date field to use for filtering. Defaults to "inquiry"'),
    received_on_from: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('Start date for the reporting period (YYYY-MM-DD). Required.'),
    received_on_to: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('End date for the reporting period (YYYY-MM-DD). Required.'),
    columns: zod_1.z.array(zod_1.z.enum(exports.GUEST_CARD_INQUIRIES_COLUMNS)).optional()
        .describe(`Array of specific columns to include in the report. Valid columns: ${exports.GUEST_CARD_INQUIRIES_COLUMNS.join(', ')}. If not specified, all columns are returned.`)
});
// Function definition from src/appfolio.ts (Step 153)
async function getGuestCardInquiriesReport(args) {
    // Validate properties IDs if provided
    if (args.properties) {
        const validationErrors = (0, validation_1.validatePropertiesIds)(args.properties);
        (0, validation_1.throwOnValidationErrors)(validationErrors);
    }
    if (!args.received_on_from || !args.received_on_to) {
        throw new Error('Missing required arguments: received_on_from and received_on_to (format YYYY-MM-DD)');
    }
    const { guest_card_status = "open", property_visibility = "active", filter_date_range_by = "inquiry", ...rest } = args;
    const payload = { guest_card_status, property_visibility, filter_date_range_by, ...rest };
    return (0, appfolio_1.makeAppfolioApiCall)('guest_card_inquiries.json', payload);
}
// MCP Tool Registration Function
function registerGuestCardInquiriesReportTool(server) {
    server.tool("get_guest_card_inquiries_report", "Returns guest card inquiries report for the given filters. IMPORTANT: All ID parameters (properties_ids, property_groups_ids, portfolios_ids, owners_ids) must be numeric strings (e.g. '123'), NOT names. Use respective directory reports first to lookup IDs by name if needed.", guestCardInquiriesInputSchema.shape, async (args, _extra) => {
        try {
            // Validate arguments against schema
            const parseResult = guestCardInquiriesInputSchema.safeParse(args);
            if (!parseResult.success) {
                const errorMessages = parseResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('; ');
                throw new Error(`Invalid arguments: ${errorMessages}`);
            }
            const result = await getGuestCardInquiriesReport(parseResult.data);
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
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`Guest Card Inquiries Report Error:`, errorMessage);
            throw error;
        }
    });
}

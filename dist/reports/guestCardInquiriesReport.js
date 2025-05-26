"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGuestCardInquiriesReport = getGuestCardInquiriesReport;
exports.registerGuestCardInquiriesReportTool = registerGuestCardInquiriesReportTool;
const zod_1 = require("zod");
const appfolio_1 = require("../appfolio");
const validation_1 = require("../validation");
// Zod schema based on src/index.ts (Step 163) and function defaults (Step 153)
const guestCardInquiriesInputSchema = zod_1.z.object({
    property_visibility: zod_1.z.string().default("active"),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional().describe((0, validation_1.getIdFieldDescription)('properties_ids', 'Property', 'Property Directory Report')),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional().describe((0, validation_1.getIdFieldDescription)('property_groups_ids', 'Property Group')),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional().describe((0, validation_1.getIdFieldDescription)('portfolios_ids', 'Portfolio')),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional().describe((0, validation_1.getIdFieldDescription)('owners_ids', 'Owner', 'Owner Directory Report')),
    }).optional().describe('Filter results based on properties, groups, portfolios, or owners. All ID fields must be numeric strings, not names.'),
    guest_card_sources: zod_1.z.array(zod_1.z.string()).default(["All"]),
    guest_card_statuses: zod_1.z.array(zod_1.z.string()).default(["All"]),
    guest_card_lead_types: zod_1.z.array(zod_1.z.string()).default(["All"]),
    assigned_user: zod_1.z.string().default("All"),
    assigned_user_visibility: zod_1.z.string().default("active"),
    guest_card_status: zod_1.z.string().default("open"),
    filter_date_range_by: zod_1.z.string().default("received_on"),
    received_on_from: zod_1.z.string(),
    received_on_to: zod_1.z.string(),
    columns: zod_1.z.array(zod_1.z.string()).optional(),
});
// Function definition from src/appfolio.ts (Step 153)
async function getGuestCardInquiriesReport(args) {
    if (!args.received_on_from || !args.received_on_to) {
        throw new Error('Missing required arguments: received_on_from and received_on_to (format YYYY-MM-DD)');
    }
    // Validate ID fields
    if (args.properties) {
        const validationErrors = (0, validation_1.validatePropertiesIds)(args.properties);
        (0, validation_1.throwOnValidationErrors)(validationErrors);
    }
    const { guest_card_status = "open", ...rest } = args;
    const payload = { guest_card_status, ...rest };
    return (0, appfolio_1.makeAppfolioApiCall)('guest_card_inquiries.json', payload);
}
// MCP Tool Registration Function
function registerGuestCardInquiriesReportTool(server) {
    server.tool("get_guest_card_inquiries_report", "Returns guest card inquiries report for the given filters.", guestCardInquiriesInputSchema.shape, async (args, _extra) => {
        const data = await getGuestCardInquiriesReport(args);
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

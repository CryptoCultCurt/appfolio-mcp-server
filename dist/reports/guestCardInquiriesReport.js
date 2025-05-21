"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGuestCardInquiriesReport = getGuestCardInquiriesReport;
exports.registerGuestCardInquiriesReportTool = registerGuestCardInquiriesReportTool;
const zod_1 = require("zod");
const appfolio_1 = require("../appfolio");
const axios_1 = __importDefault(require("axios"));
const { VHOST, USERNAME, PASSWORD } = process.env;
// Zod schema based on src/index.ts (Step 163) and function defaults (Step 153)
const guestCardInquiriesInputSchema = zod_1.z.object({
    property_visibility: zod_1.z.string().default("active"),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional(),
    }).optional(),
    guest_card_sources: zod_1.z.array(zod_1.z.string()).optional().default([]),
    guest_card_statuses: zod_1.z.array(zod_1.z.string()).optional().default([]), // General statuses array
    guest_card_lead_types: zod_1.z.array(zod_1.z.string()).optional().default([]),
    assigned_user: zod_1.z.string().optional(),
    assigned_user_visibility: zod_1.z.string().default("active"), // Added from function default
    guest_card_status: zod_1.z.string().default("open"), // Specific status field with default from function
    filter_date_range_by: zod_1.z.string().optional(),
    received_on_from: zod_1.z.string(),
    received_on_to: zod_1.z.string(),
    columns: zod_1.z.array(zod_1.z.string()).optional(),
});
// Function definition from src/appfolio.ts (Step 153)
async function getGuestCardInquiriesReport(args) {
    if (!VHOST || !USERNAME || !PASSWORD)
        throw new Error('Missing AppFolio API credentials');
    // Defaults are now handled by the Zod schema
    const payload = { ...args };
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/guest_card_inquiries.json`;
    const response = await appfolio_1.appfolioLimiter.schedule(() => axios_1.default.post(url, payload, {
        auth: { username: USERNAME, password: PASSWORD },
        headers: { 'Content-Type': 'application/json' },
    }));
    return response.data;
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

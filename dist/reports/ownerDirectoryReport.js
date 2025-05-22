"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ownerDirectoryArgsSchema = exports.ownerDirectoryColumnEnum = void 0;
exports.getOwnerDirectoryReport = getOwnerDirectoryReport;
exports.registerOwnerDirectoryReportTool = registerOwnerDirectoryReportTool;
const axios_1 = __importDefault(require("axios"));
const zod_1 = require("zod");
const appfolio_1 = require("../appfolio");
const { VHOST, USERNAME, PASSWORD } = process.env;
// Zod schema for Owner Directory Report arguments
exports.ownerDirectoryColumnEnum = zod_1.z.enum([
    "name", "phone_numbers", "email", "alternative_payee", "payment_type",
    "last_payment_date", "hold_payments", "owner_packet_reports",
    "send_owner_packets_by_email", "properties_owned", "tags", "last_packet_sent",
    "address", "street", "street2", "city", "state", "zip", "country",
    "owner_id", "properties_owned_i_ds", "notes_for_the_owner", "first_name",
    "last_name", "owner_integration_id", "created_by"
]);
exports.ownerDirectoryArgsSchema = zod_1.z.object({
    property_visibility: zod_1.z.string().optional().default("active").describe("Filter properties by visibility. Defaults to 'active'."),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional(),
    }).optional().describe("Filter results based on properties, groups, portfolios, or owners."),
    tags: zod_1.z.string().optional().describe("Comma-separated list of tags, e.g., 'bbq,deck'"),
    owner_visibility: zod_1.z.string().optional().default("active").describe("Filter owners by visibility. Defaults to 'active'."),
    created_by: zod_1.z.string().optional().default("All").describe("Filter by who created the owner. Defaults to 'All'."),
    columns: zod_1.z.array(exports.ownerDirectoryColumnEnum).optional().describe("List of columns to include in the report. If omitted, default columns are used."),
});
// --- Owner Directory Report Function ---
async function getOwnerDirectoryReport(args) {
    if (!VHOST || !USERNAME || !PASSWORD)
        throw new Error('Missing AppFolio API credentials');
    const payload = {
        ...args
    };
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/owner_directory.json`;
    const response = await appfolio_1.appfolioLimiter.schedule(() => axios_1.default.post(url, payload, {
        auth: { username: USERNAME, password: PASSWORD },
        headers: { 'Content-Type': 'application/json' },
    }));
    return response.data;
}
// --- Register Owner Directory Report Tool ---
function registerOwnerDirectoryReportTool(server) {
    server.tool("get_owner_directory_report", "Returns an owner directory report based on specified filters.", exports.ownerDirectoryArgsSchema.shape, async (args) => {
        const data = await getOwnerDirectoryReport(args);
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

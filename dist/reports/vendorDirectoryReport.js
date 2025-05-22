"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVendorDirectoryReport = getVendorDirectoryReport;
exports.registerVendorDirectoryReportTool = registerVendorDirectoryReportTool;
const zod_1 = require("zod");
const appfolio_1 = require("../appfolio");
const axios_1 = __importDefault(require("axios"));
const { VHOST, USERNAME, PASSWORD } = process.env;
// Zod schema for Vendor Directory Report arguments
const vendorDirectoryArgsSchema = zod_1.z.object({
    workers_comp_expiration_to: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional().describe('Optional. Filter vendors whose Workers Comp expires on or before this date (YYYY-MM-DD).'),
    liability_expiration_to: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional().describe('Optional. Filter vendors whose Liability Insurance expires on or before this date (YYYY-MM-DD).'),
    epa_expiration_to: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional().describe('Optional. Filter vendors whose EPA Certification expires on or before this date (YYYY-MM-DD).'),
    auto_insurance_expiration_to: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional().describe('Optional. Filter vendors whose Auto Insurance expires on or before this date (YYYY-MM-DD).'),
    state_license_expiration_to: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional().describe('Optional. Filter vendors whose State License expires on or before this date (YYYY-MM-DD).'),
    contract_expiration_to: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional().describe('Optional. Filter vendors whose Contract expires on or before this date (YYYY-MM-DD).'),
    tags: zod_1.z.string().optional().describe('Optional. Filter by a comma-separated list of tags (e.g., "plumbing,hvac").'),
    vendor_visibility: zod_1.z.enum(["active", "inactive", "all"]).optional().default("active").describe('Filter vendors by status. Defaults to "active"'),
    payment_type: zod_1.z.enum(["eCheck", "Check", "all"]).optional().describe('Optional. Filter by payment type (eCheck, Check, or all). Defaults to all if not specified.'),
    created_by: zod_1.z.string().optional().default("All").describe('Filter by who created the vendor. Defaults to "All".'), // User ID or 'All'
    vendor_type: zod_1.z.string().optional().default("All").describe('Filter by vendor type. Defaults to "All".'), // Vendor Type name or 'All'
    columns: zod_1.z.array(zod_1.z.string()).optional().describe('Array of specific columns to include in the report')
});
// --- Vendor Directory Report Function ---
async function getVendorDirectoryReport(args) {
    if (!VHOST || !USERNAME || !PASSWORD)
        throw new Error('Missing AppFolio API credentials');
    const { vendor_visibility = "active", payment_type, // Note: API might default to 'all' if not sent, needs verification
    created_by = "All", vendor_type = "All", ...rest } = args;
    const payload = {
        vendor_visibility,
        created_by,
        vendor_type,
        ...rest
    };
    // Only include payment_type if it's explicitly provided
    if (payment_type) {
        payload.payment_type = payment_type;
    }
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/vendor_directory.json`;
    const response = await appfolio_1.appfolioLimiter.schedule(() => axios_1.default.post(url, payload, {
        auth: { username: USERNAME, password: PASSWORD },
        headers: { 'Content-Type': 'application/json' },
    }));
    return response.data;
}
// MCP Tool Registration Function
function registerVendorDirectoryReportTool(server) {
    server.tool("get_vendor_directory_report", "Retrieves a directory of vendors.", vendorDirectoryArgsSchema.shape, async (args, _extra) => {
        const data = await getVendorDirectoryReport(args);
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

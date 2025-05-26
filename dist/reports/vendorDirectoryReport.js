"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVendorDirectoryReport = getVendorDirectoryReport;
exports.registerVendorDirectoryReportTool = registerVendorDirectoryReportTool;
const zod_1 = require("zod");
const appfolio_1 = require("../appfolio");
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
    return (0, appfolio_1.makeAppfolioApiCall)('vendor_directory.json', args);
}
// MCP Tool Registration Function
function registerVendorDirectoryReportTool(server) {
    server.tool("get_vendor_directory_report", "Retrieves a directory of vendors. IMPORTANT: All ID parameters must be numeric strings (e.g. '123'), NOT names.", vendorDirectoryArgsSchema.shape, async (args, _extra) => {
        try {
            // Validate arguments against schema
            const parseResult = vendorDirectoryArgsSchema.safeParse(args);
            if (!parseResult.success) {
                const errorMessages = parseResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('; ');
                throw new Error(`Invalid arguments: ${errorMessages}`);
            }
            const result = await getVendorDirectoryReport(parseResult.data);
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
            console.error(`Vendor Directory Report Error:`, errorMessage);
            throw error;
        }
    });
}

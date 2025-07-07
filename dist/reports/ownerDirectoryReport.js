"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ownerDirectoryArgsSchema = exports.ownerDirectoryColumnEnum = void 0;
exports.getOwnerDirectoryReport = getOwnerDirectoryReport;
exports.registerOwnerDirectoryReportTool = registerOwnerDirectoryReportTool;
const zod_1 = require("zod");
const appfolio_1 = require("../appfolio");
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
    property_visibility: zod_1.z.string().optional().transform(val => val === "" ? undefined : val).default("active").describe("Filter properties by visibility. Defaults to 'active'."),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional(),
    }).optional().describe("Filter results based on properties, groups, portfolios, or owners."),
    tags: zod_1.z.string().optional().transform(val => val === "" ? undefined : val).describe("FILTER BY SYSTEM TAGS ONLY: Comma-separated list of actual tags assigned to owners in the system (e.g., 'vip,corporate'). NOT for searching by owner names - use the full report results for name searching."),
    owner_visibility: zod_1.z.string().optional().transform(val => val === "" ? undefined : val).default("active").describe("Filter owners by visibility. Defaults to 'active'."),
    created_by: zod_1.z.string().optional().transform(val => val === "" ? undefined : val).default("All").describe("Filter by who created the owner. Defaults to 'All'."),
    columns: zod_1.z.array(exports.ownerDirectoryColumnEnum).optional().describe("List of columns to include in the report. If omitted, default columns are used."),
});
// --- Owner Directory Report Function ---
async function getOwnerDirectoryReport(args) {
    return (0, appfolio_1.makeAppfolioApiCall)('owner_directory.json', args);
}
// --- Register Owner Directory Report Tool ---
function registerOwnerDirectoryReportTool(server) {
    server.tool("get_owner_directory_report", "Retrieves a DIRECTORY report with details about property owners. This returns ALL owners (with optional filters) - to find specific owners by name, call this report and search the results client-side. IMPORTANT: All ID parameters must be numeric strings, NOT names. The 'tags' parameter is for filtering by actual system tags, NOT for text search.", exports.ownerDirectoryArgsSchema.shape, async (args, _extra) => {
        try {
            // Validate arguments against schema
            const parseResult = exports.ownerDirectoryArgsSchema.safeParse(args);
            if (!parseResult.success) {
                const errorMessages = parseResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('; ');
                throw new Error(`Invalid arguments: ${errorMessages}`);
            }
            const result = await getOwnerDirectoryReport(parseResult.data);
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
            console.error(`Owner Directory Report Error:`, errorMessage);
            throw error;
        }
    });
}

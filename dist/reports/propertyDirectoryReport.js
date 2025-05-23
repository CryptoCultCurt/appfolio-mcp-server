"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.propertyDirectoryArgsSchema = void 0;
exports.getPropertyDirectoryReport = getPropertyDirectoryReport;
exports.registerPropertyDirectoryReportTool = registerPropertyDirectoryReportTool;
const zod_1 = require("zod");
const appfolio_1 = require("../appfolio");
// Zod schema for Property Directory Report arguments
exports.propertyDirectoryArgsSchema = zod_1.z.object({
    property_visibility: zod_1.z.enum(["active", "hidden", "all"]).default("active").describe('Filter properties by status. Defaults to "active"'),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional(),
    }).optional().describe('Filter results based on properties, groups, portfolios, or owners'),
    columns: zod_1.z.array(zod_1.z.string()).optional().describe('Array of specific columns to include in the report')
});
// --- Property Directory Report Function ---
async function getPropertyDirectoryReport(args) {
    const { property_visibility = "active", ...rest } = args;
    const payload = { property_visibility, ...rest };
    return (0, appfolio_1.makeAppfolioApiCall)('property_directory.json', payload);
}
// Registration function for the tool
function registerPropertyDirectoryReportTool(server) {
    server.tool("get_property_directory_report", "Retrieves a property directory report with details about properties, including status, address, units count, and owner information.", exports.propertyDirectoryArgsSchema.shape, async (args) => {
        const result = await getPropertyDirectoryReport(args);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(result, null, 2),
                    mimeType: "application/json"
                }
            ]
        };
    });
}

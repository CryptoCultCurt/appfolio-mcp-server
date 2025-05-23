"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUnitDirectoryReport = getUnitDirectoryReport;
exports.registerUnitDirectoryReportTool = registerUnitDirectoryReportTool;
const zod_1 = require("zod");
const appfolio_1 = require("../appfolio");
// Zod schema for Unit Directory Report arguments
const unitDirectoryArgsSchema = zod_1.z.object({
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional()
    }).optional().describe('Filter results based on properties, groups, portfolios, or owners'),
    unit_visibility: zod_1.z.enum(["active", "hidden", "all"]).optional().default("active").describe('Filter units by status. Defaults to "active"'),
    tags: zod_1.z.string().optional().describe('Optional. Filter by a comma-separated list of tags (e.g., "bbq,deck").'),
    columns: zod_1.z.array(zod_1.z.string()).optional().describe('Array of specific columns to include in the report')
});
// --- Unit Directory Report Function ---
async function getUnitDirectoryReport(args) {
    const { unit_visibility = "active", ...rest } = args;
    const payload = { unit_visibility, ...rest };
    return (0, appfolio_1.makeAppfolioApiCall)('unit_directory.json', payload);
}
// MCP Tool Registration Function
function registerUnitDirectoryReportTool(server) {
    server.tool("get_unit_directory_report", "Retrieves a directory of units.", unitDirectoryArgsSchema.shape, async (args, _extra) => {
        const data = await getUnitDirectoryReport(args);
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

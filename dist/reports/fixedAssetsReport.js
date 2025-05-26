"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFixedAssetsReport = getFixedAssetsReport;
exports.registerFixedAssetsReportTool = registerFixedAssetsReportTool;
const zod_1 = require("zod");
const appfolio_1 = require("../appfolio");
// --- Fixed Assets Report Args Schema ---
const fixedAssetsArgsSchema = zod_1.z.object({
    property_visibility: zod_1.z.enum(["active", "hidden", "all"]).default("active").optional().describe('Filter properties by status. Defaults to "active"'),
    unit_ids: zod_1.z.array(zod_1.z.string()).optional().describe('Array of unit IDs to filter by'),
    property: zod_1.z.object({
        property_id: zod_1.z.string().optional()
    }).optional().describe('Filter by a specific property ID'),
    include_property_level_fixed_assets: zod_1.z.enum(["0", "1"]).default("1").optional().describe('Include assets linked directly to the property. Defaults to "1" (true)'),
    asset_types: zod_1.z.string().default("All").optional().describe('Filter by specific asset type name. Defaults to "All"'),
    status: zod_1.z.string().default("all").optional().describe('Filter by asset status. Defaults to "all"'),
    columns: zod_1.z.array(zod_1.z.string()).optional().describe('Array of specific columns to include in the report')
});
// --- Fixed Assets Report Function ---
async function getFixedAssetsReport(args) {
    const { property_visibility = "active", ...rest } = args;
    const payload = { property_visibility, ...rest };
    return (0, appfolio_1.makeAppfolioApiCall)('fixed_assets.json', payload);
}
// --- Fixed Assets Report Tool Registration ---
function registerFixedAssetsReportTool(server) {
    server.tool("get_fixed_assets_report", "Returns a report of fixed assets based on the provided filters.", fixedAssetsArgsSchema.shape, async (args, _extra) => {
        try {
            // Validate arguments against schema
            const parseResult = fixedAssetsArgsSchema.safeParse(args);
            if (!parseResult.success) {
                const errorMessages = parseResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('; ');
                throw new Error(`Invalid arguments: ${errorMessages}`);
            }
            const result = await getFixedAssetsReport(parseResult.data);
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
            console.error(`Fixed Assets Report Error:`, errorMessage);
            throw error;
        }
    });
}

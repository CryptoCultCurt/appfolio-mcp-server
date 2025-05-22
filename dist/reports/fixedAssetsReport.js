"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFixedAssetsReport = getFixedAssetsReport;
exports.registerFixedAssetsReportTool = registerFixedAssetsReportTool;
const axios_1 = __importDefault(require("axios"));
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
const appfolio_1 = require("../appfolio");
dotenv_1.default.config();
const { VHOST, USERNAME, PASSWORD } = process.env;
// Originally from src/index.ts (line 75), with defaults added
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
// Originally from src/appfolio.ts (function starting line 1546)
async function getFixedAssetsReport(args) {
    if (!VHOST || !USERNAME || !PASSWORD) {
        throw new Error('Missing AppFolio API credentials');
    }
    // Defaults are now handled by Zod schema
    const payload = args;
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/fixed_assets.json`;
    const response = await appfolio_1.appfolioLimiter.schedule(() => axios_1.default.post(url, payload, {
        auth: { username: USERNAME, password: PASSWORD },
        headers: { 'Content-Type': 'application/json' },
    }));
    return response.data;
}
// New registration function for MCP
function registerFixedAssetsReportTool(server) {
    server.tool("get_fixed_assets_report", "Returns a report of fixed assets based on the provided filters.", // Description from original registration
    fixedAssetsArgsSchema.shape, async (toolArgs) => {
        const data = await getFixedAssetsReport(toolArgs);
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

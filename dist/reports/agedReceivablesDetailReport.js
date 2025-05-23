"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAgedReceivablesDetailReport = getAgedReceivablesDetailReport;
exports.registerAgedReceivablesDetailReportTool = registerAgedReceivablesDetailReportTool;
const zod_1 = require("zod");
const appfolio_1 = require("../appfolio");
// Originally from src/index.ts (lines 42-78)
const agedReceivablesDetailInputSchema = zod_1.z.object({
    property_visibility: zod_1.z.string().default("active"),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional(),
    }).optional(),
    tags: zod_1.z.string().optional(),
    balance_operator: zod_1.z.object({
        amount: zod_1.z.string().optional(),
        comparator: zod_1.z.string().optional()
    }).optional(),
    tenant_statuses: zod_1.z.array(zod_1.z.string()).optional(),
    occurred_on_to: zod_1.z.string(),
    gl_account_map_id: zod_1.z.string().optional(),
    columns: zod_1.z.array(zod_1.z.string()).optional(),
    as_of: zod_1.z.string(),
});
// Originally from src/appfolio.ts (function starting line 1664)
async function getAgedReceivablesDetailReport(args) {
    if (!args.as_of) {
        throw new Error('Missing required argument: as_of (format YYYY-MM-DD)');
    }
    const { property_visibility = "active", ...rest } = args;
    const payload = { property_visibility, ...rest };
    return (0, appfolio_1.makeAppfolioApiCall)('aged_receivables_detail.json', payload);
}
// New registration function for MCP
function registerAgedReceivablesDetailReportTool(server) {
    server.tool("get_aged_receivables_detail_report", "Returns aged receivables detail for the given filters.", // Description from original registration
    agedReceivablesDetailInputSchema.shape, async (toolArgs) => {
        const data = await getAgedReceivablesDetailReport(toolArgs);
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

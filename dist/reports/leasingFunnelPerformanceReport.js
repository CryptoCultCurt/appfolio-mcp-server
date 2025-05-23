"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLeasingFunnelPerformanceReport = getLeasingFunnelPerformanceReport;
exports.registerLeasingFunnelPerformanceReportTool = registerLeasingFunnelPerformanceReportTool;
const zod_1 = require("zod");
const appfolio_1 = require("../appfolio");
// Zod schema based on src/index.ts (Step 184) and function defaults (Step 177)
const leasingFunnelPerformanceInputSchema = zod_1.z.object({
    property_visibility: zod_1.z.string().default("all"),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional(),
    }).optional(),
    date_from: zod_1.z.string(),
    date_to: zod_1.z.string(),
    assigned_user_visibility: zod_1.z.string().default("active"),
    assigned_user: zod_1.z.string().default("All"),
    columns: zod_1.z.array(zod_1.z.string()).optional(),
});
// Function definition from src/appfolio.ts (Step 177)
async function getLeasingFunnelPerformanceReport(args) {
    if (!args.date_from || !args.date_to) {
        throw new Error('Missing required arguments: date_from and date_to (format YYYY-MM-DD)');
    }
    const { property_visibility = "active", ...rest } = args;
    const payload = { property_visibility, ...rest };
    return (0, appfolio_1.makeAppfolioApiCall)('leasing_funnel_performance.json', payload);
}
// MCP Tool Registration Function
function registerLeasingFunnelPerformanceReportTool(server) {
    server.tool("get_leasing_funnel_performance_report", "Returns leasing funnel performance report for the given filters.", leasingFunnelPerformanceInputSchema.shape, async (args, _extra) => {
        const data = await getLeasingFunnelPerformanceReport(args);
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

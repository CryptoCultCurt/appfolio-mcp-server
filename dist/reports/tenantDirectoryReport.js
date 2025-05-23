"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTenantDirectoryReport = getTenantDirectoryReport;
exports.registerTenantDirectoryReportTool = registerTenantDirectoryReportTool;
const zod_1 = require("zod");
const appfolio_1 = require("../appfolio");
const tenantDirectoryInputSchema = zod_1.z.object({
    tenant_visibility: zod_1.z.enum(["active", "inactive", "all"]).optional().default("active"),
    tenant_types: zod_1.z.array(zod_1.z.string()).optional().default(["all"]),
    property_visibility: zod_1.z.enum(["active", "hidden", "all"]).optional().default("active"),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional()
    }).optional(),
    columns: zod_1.z.array(zod_1.z.string()).optional()
});
async function getTenantDirectoryReport(args) {
    const { tenant_visibility = "active", ...rest } = args;
    const payload = { tenant_visibility, ...rest };
    return (0, appfolio_1.makeAppfolioApiCall)('tenant_directory.json', payload);
}
function registerTenantDirectoryReportTool(server) {
    server.tool("get_tenant_directory_report", "Returns tenant directory report for the given filters.", tenantDirectoryInputSchema.shape, async (args, _extra) => {
        const data = await getTenantDirectoryReport(args);
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

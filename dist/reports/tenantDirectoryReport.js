"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTenantDirectoryReport = getTenantDirectoryReport;
exports.registerTenantDirectoryReportTool = registerTenantDirectoryReportTool;
const zod_1 = require("zod");
const appfolio_1 = require("../appfolio");
const axios_1 = __importDefault(require("axios"));
const { VHOST, USERNAME, PASSWORD } = process.env;
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
    if (!VHOST || !USERNAME || !PASSWORD)
        throw new Error('Missing AppFolio API credentials');
    const payload = { ...args };
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/tenant_directory.json`;
    const response = await appfolio_1.appfolioLimiter.schedule(() => axios_1.default.post(url, payload, {
        auth: { username: USERNAME, password: PASSWORD },
        headers: { 'Content-Type': 'application/json' },
    }));
    return response.data;
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

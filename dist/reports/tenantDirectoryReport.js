"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTenantDirectoryReport = getTenantDirectoryReport;
exports.registerTenantDirectoryReportTool = registerTenantDirectoryReportTool;
const zod_1 = require("zod");
const appfolio_1 = require("../appfolio");
const validation_1 = require("../validation");
const tenantDirectoryInputSchema = zod_1.z.object({
    tenant_visibility: zod_1.z.enum(["active", "inactive", "all"]).optional().default("active"),
    tenant_types: zod_1.z.array(zod_1.z.string()).optional().default(["all"]),
    property_visibility: zod_1.z.enum(["active", "hidden", "all"]).optional().default("active"),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional().describe((0, validation_1.getIdFieldDescription)('property', 'Property Directory Report')),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional().describe((0, validation_1.getIdFieldDescription)('property group', 'Property Directory Report')),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional().describe((0, validation_1.getIdFieldDescription)('portfolio', 'Property Directory Report')),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional().describe((0, validation_1.getIdFieldDescription)('owner', 'Owner Directory Report'))
    }).optional(),
    columns: zod_1.z.array(zod_1.z.string()).optional()
});
async function getTenantDirectoryReport(args) {
    // Validate ID parameters
    if (args.properties) {
        const validationErrors = (0, validation_1.validatePropertiesIds)(args.properties);
        (0, validation_1.throwOnValidationErrors)(validationErrors);
    }
    const { tenant_visibility = "active", ...rest } = args;
    const payload = { tenant_visibility, ...rest };
    return (0, appfolio_1.makeAppfolioApiCall)('tenant_directory.json', payload);
}
function registerTenantDirectoryReportTool(server) {
    server.tool("get_tenant_directory_report", "Returns tenant directory report for the given filters. IMPORTANT: All ID parameters (properties_ids, owners_ids, etc.) must be numeric strings (e.g. '123'), NOT names. Use respective directory reports first to lookup IDs by name if needed.", tenantDirectoryInputSchema.shape, async (args, _extra) => {
        try {
            // Validate arguments against schema
            const parseResult = tenantDirectoryInputSchema.safeParse(args);
            if (!parseResult.success) {
                const errorMessages = parseResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('; ');
                throw new Error(`Invalid arguments: ${errorMessages}`);
            }
            const result = await getTenantDirectoryReport(parseResult.data);
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
            console.error(`Tenant Directory Report Error:`, errorMessage);
            throw error;
        }
    });
}

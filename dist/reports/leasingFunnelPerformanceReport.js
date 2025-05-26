"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLeasingFunnelPerformanceReport = getLeasingFunnelPerformanceReport;
exports.registerLeasingFunnelPerformanceReportTool = registerLeasingFunnelPerformanceReportTool;
const zod_1 = require("zod");
const appfolio_1 = require("../appfolio");
const validation_1 = require("../validation");
// Zod schema based on src/index.ts (Step 184) and function defaults (Step 177)
const leasingFunnelPerformanceInputSchema = zod_1.z.object({
    property_visibility: zod_1.z.string().default("all"),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional().describe((0, validation_1.getIdFieldDescription)('properties_ids', 'Property', 'Property Directory Report')),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional().describe((0, validation_1.getIdFieldDescription)('property_groups_ids', 'Property Group')),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional().describe((0, validation_1.getIdFieldDescription)('portfolios_ids', 'Portfolio')),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional().describe((0, validation_1.getIdFieldDescription)('owners_ids', 'Owner', 'Owner Directory Report')),
    }).optional().describe('Filter results based on properties, groups, portfolios, or owners. All ID fields must be numeric strings, not names.'),
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
    // Validate ID fields
    if (args.properties) {
        const validationErrors = (0, validation_1.validatePropertiesIds)(args.properties);
        (0, validation_1.throwOnValidationErrors)(validationErrors);
    }
    const { property_visibility = "active", ...rest } = args;
    const payload = { property_visibility, ...rest };
    return (0, appfolio_1.makeAppfolioApiCall)('leasing_funnel_performance.json', payload);
}
// MCP Tool Registration Function
function registerLeasingFunnelPerformanceReportTool(server) {
    server.tool("get_leasing_funnel_performance_report", "Returns leasing funnel performance report for the given filters. IMPORTANT: All ID parameters (owners_ids, properties_ids, etc.) must be numeric strings (e.g. '123'), NOT names. Use respective directory reports first to lookup IDs by name if needed.", leasingFunnelPerformanceInputSchema.shape, async (args, _extra) => {
        try {
            // Validate arguments against schema
            const parseResult = leasingFunnelPerformanceInputSchema.safeParse(args);
            if (!parseResult.success) {
                const errorMessages = parseResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('; ');
                throw new Error(`Invalid arguments: ${errorMessages}`);
            }
            const result = await getLeasingFunnelPerformanceReport(parseResult.data);
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
            console.error(`Leasing Funnel Performance Report Error:`, errorMessage);
            throw error;
        }
    });
}

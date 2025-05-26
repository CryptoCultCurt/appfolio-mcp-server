"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAgedPayablesSummaryReport = getAgedPayablesSummaryReport;
exports.registerAgedPayablesSummaryReportTool = registerAgedPayablesSummaryReportTool;
const zod_1 = require("zod");
const appfolio_1 = require("../appfolio");
const validation_1 = require("../validation");
// Zod schema copied from src/index.ts
const agedPayablesSummaryInputSchema = zod_1.z.object({
    property_visibility: zod_1.z.string().default("active"),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional().describe((0, validation_1.getIdFieldDescription)('properties_ids', 'Property', 'Property Directory Report')),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional().describe((0, validation_1.getIdFieldDescription)('property_groups_ids', 'Property Group')),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional().describe((0, validation_1.getIdFieldDescription)('portfolios_ids', 'Portfolio')),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional().describe((0, validation_1.getIdFieldDescription)('owners_ids', 'Owner', 'Owner Directory Report')),
    }).optional().describe('Filter results based on properties, groups, portfolios, or owners. All ID fields must be numeric strings, not names.'),
    occurred_on: zod_1.z.string(),
    party_contact_info: zod_1.z.object({
        company_id: zod_1.z.string().optional()
    }).optional(),
    balance_operator: zod_1.z.object({
        amount: zod_1.z.string().optional(),
        comparator: zod_1.z.string().optional()
    }).optional(),
    columns: zod_1.z.array(zod_1.z.string()).optional(),
});
// Function definition copied from src/appfolio.ts
async function getAgedPayablesSummaryReport(args) {
    if (!args.occurred_on) {
        throw new Error('Missing required argument: occurred_on (format YYYY-MM-DD)');
    }
    // Validate ID fields
    if (args.properties) {
        const validationErrors = (0, validation_1.validatePropertiesIds)(args.properties);
        (0, validation_1.throwOnValidationErrors)(validationErrors);
    }
    const { property_visibility = "active", ...rest } = args;
    const payload = { property_visibility, ...rest };
    return (0, appfolio_1.makeAppfolioApiCall)('aged_payables_summary.json', payload);
}
// MCP Tool Registration Function
function registerAgedPayablesSummaryReportTool(server) {
    server.tool("get_aged_payables_summary_report", "Returns aged payables summary for the given filters. IMPORTANT: All ID parameters (owners_ids, properties_ids, etc.) must be numeric strings (e.g. '123'), NOT names. Use respective directory reports first to lookup IDs by name if needed.", agedPayablesSummaryInputSchema.shape, async (args, _extra) => {
        // Zod schema handles defaults
        const data = await getAgedPayablesSummaryReport(args);
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

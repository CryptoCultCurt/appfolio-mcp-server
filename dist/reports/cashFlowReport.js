"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCashflowReport = getCashflowReport;
exports.registerCashflowReportTool = registerCashflowReportTool;
const zod_1 = require("zod");
const appfolio_1 = require("../appfolio");
async function getCashflowReport(args) {
    return (0, appfolio_1.makeAppfolioApiCall)('cash_flow_detail.json', args);
}
// Flattened Zod schema for Cash Flow Report arguments
// (Nested objects cause TypeScript type depth issues with MCP SDK)
const cashflowInputSchema = {
    property_visibility: zod_1.z.string().describe('Property visibility filter'),
    properties_ids: zod_1.z.array(zod_1.z.string()).optional().describe('Filter by specific property IDs'),
    property_groups_ids: zod_1.z.array(zod_1.z.string()).optional().describe('Filter by property group IDs'),
    portfolios_ids: zod_1.z.array(zod_1.z.string()).optional().describe('Filter by portfolio IDs'),
    owners_ids: zod_1.z.array(zod_1.z.string()).optional().describe('Filter by owner IDs'),
    posted_on_from: zod_1.z.string().describe('Start date for the posting period (YYYY-MM-DD) - Required'),
    posted_on_to: zod_1.z.string().describe('End date for the posting period (YYYY-MM-DD) - Required'),
    gl_account_map_id: zod_1.z.string().optional().describe('Filter by GL account map ID'),
    exclude_suppressed_fees: zod_1.z.string().optional().describe('Exclude suppressed fees ("0" or "1")'),
    columns: zod_1.z.array(zod_1.z.string()).optional().describe('Specific columns to include'),
};
// Schema for internal validation (with nested properties structure)
const cashflowValidationSchema = zod_1.z.object({
    property_visibility: zod_1.z.string(),
    properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
    property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
    portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
    owners_ids: zod_1.z.array(zod_1.z.string()).optional(),
    posted_on_from: zod_1.z.string(),
    posted_on_to: zod_1.z.string(),
    gl_account_map_id: zod_1.z.string().optional(),
    exclude_suppressed_fees: zod_1.z.string().optional(),
    columns: zod_1.z.array(zod_1.z.string()).optional(),
});
// Transform flat input to nested API format
function transformToApiArgs(input) {
    const { properties_ids, property_groups_ids, portfolios_ids, owners_ids, ...rest } = input;
    const hasProperties = properties_ids || property_groups_ids || portfolios_ids || owners_ids;
    return {
        ...rest,
        ...(hasProperties && {
            properties: {
                ...(properties_ids && { properties_ids }),
                ...(property_groups_ids && { property_groups_ids }),
                ...(portfolios_ids && { portfolios_ids }),
                ...(owners_ids && { owners_ids }),
            }
        })
    };
}
function registerCashflowReportTool(server) {
    server.tool("get_cashflow_report", "Returns Cash Flow Details including income and expenses for given time period.", cashflowInputSchema, async (args, _extra) => {
        try {
            // Validate arguments against schema
            const parseResult = cashflowValidationSchema.safeParse(args);
            if (!parseResult.success) {
                const errorMessages = parseResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('; ');
                throw new Error(`Invalid arguments: ${errorMessages}`);
            }
            const apiArgs = transformToApiArgs(parseResult.data);
            const result = await getCashflowReport(apiArgs);
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
            console.error(`Cashflow Report Error:`, errorMessage);
            throw error;
        }
    });
}

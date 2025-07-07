"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVendorLedgerReport = getVendorLedgerReport;
exports.registerVendorLedgerReportTool = registerVendorLedgerReportTool;
const zod_1 = require("zod");
const appfolio_1 = require("../appfolio");
// Zod schema moved from src/index.ts
const vendorLedgerInputSchema = zod_1.z.object({
    vendor_id: zod_1.z.string().describe('Required. The ID of the vendor (company).'),
    property_visibility: zod_1.z.enum(["active", "hidden", "all"]).optional().default("active").describe('Filter properties by status. Defaults to "active"'),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional().describe('Filter by specific property IDs'),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional().describe('Filter by property group IDs'),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional().describe('Filter by portfolio IDs'),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional().describe('Filter by owner IDs')
    }).optional(),
    occurred_on_from: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('Required. The start date for the reporting period (YYYY-MM-DD).'),
    occurred_on_to: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('Required. The end date for the reporting period (YYYY-MM-DD).'),
    reverse_transaction: zod_1.z.union([zod_1.z.boolean(), zod_1.z.string()]).optional().default(false).transform(val => {
        if (typeof val === 'string')
            return val === 'true' || val === '1' ? "1" : "0";
        return val ? "1" : "0";
    }).describe('Include reversed transactions. Defaults to false.'),
    columns: zod_1.z.array(zod_1.z.string()).optional().describe('Array of specific columns to include in the report')
});
// Function moved from src/appfolio.ts
async function getVendorLedgerReport(args) {
    if (!args.vendor_id) {
        throw new Error('Missing required argument: vendor_id');
    }
    const { occurred_on_from, occurred_on_to, ...rest } = args;
    const payload = { occurred_on_from, occurred_on_to, ...rest };
    return (0, appfolio_1.makeAppfolioApiCall)('vendor_ledger.json', payload);
}
// MCP Tool Registration Function
function registerVendorLedgerReportTool(server) {
    server.tool("get_vendor_ledger_report", "Generates a report on vendor ledgers.", vendorLedgerInputSchema.shape, async (args, _extra) => {
        try {
            // Validate arguments against schema
            const parseResult = vendorLedgerInputSchema.safeParse(args);
            if (!parseResult.success) {
                const errorMessages = parseResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('; ');
                throw new Error(`Invalid arguments: ${errorMessages}`);
            }
            const result = await getVendorLedgerReport(parseResult.data);
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
            console.error(`Vendor Ledger Report Error:`, errorMessage);
            throw error;
        }
    });
}

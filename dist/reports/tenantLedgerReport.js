"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTenantLedgerReport = getTenantLedgerReport;
exports.registerTenantLedgerReportTool = registerTenantLedgerReportTool;
const zod_1 = require("zod");
const appfolio_1 = require("../appfolio");
// Zod schema for Tenant Ledger Report arguments
const tenantLedgerArgsSchema = zod_1.z.object({
    parties_ids: zod_1.z.object({
        occupancies_ids: zod_1.z.array(zod_1.z.string()).nonempty("At least one occupancy ID is required").describe('Required. Array of occupancy IDs to filter by.')
    }).describe('Required. Specify the occupancies to include.'),
    occurred_on_from: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('Required. The start date for the reporting period (YYYY-MM-DD).'),
    occurred_on_to: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('Required. The end date for the reporting period (YYYY-MM-DD).'),
    transactions_shown: zod_1.z.enum(["tenant", "owner", "all"]).optional().default("tenant").describe('Filter transactions shown. Defaults to "tenant"'),
    columns: zod_1.z.array(zod_1.z.string()).optional().describe('Array of specific columns to include in the report')
});
// --- Tenant Ledger Report Function ---
async function getTenantLedgerReport(args) {
    // Validation logic still needed before API call
    if (!args.parties_ids?.occupancies_ids || args.parties_ids.occupancies_ids.length === 0) {
        throw new Error('Missing required argument: parties_ids.occupancies_ids must contain at least one ID');
    }
    if (!args.occurred_on_from || !args.occurred_on_to) {
        throw new Error('Missing required arguments: occurred_on_from and occurred_on_to (format YYYY-MM-DD)');
    }
    const { transactions_shown = "tenant", ...rest } = args;
    const payload = { transactions_shown, ...rest };
    return (0, appfolio_1.makeAppfolioApiCall)('tenant_ledger.json', payload);
}
// --- Tenant Ledger Report Tool ---
function registerTenantLedgerReportTool(server) {
    server.tool("get_tenant_ledger_report", "Generates a report on tenant ledgers.", tenantLedgerArgsSchema.shape, async (args, _extra) => {
        try {
            // Validate arguments against schema
            const parseResult = tenantLedgerArgsSchema.safeParse(args);
            if (!parseResult.success) {
                const errorMessages = parseResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('; ');
                throw new Error(`Invalid arguments: ${errorMessages}`);
            }
            const result = await getTenantLedgerReport(parseResult.data);
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
            console.error(`Tenant Ledger Report Error:`, errorMessage);
            throw error;
        }
    });
}

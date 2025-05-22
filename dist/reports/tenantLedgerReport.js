"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTenantLedgerReport = getTenantLedgerReport;
exports.registerTenantLedgerReportTool = registerTenantLedgerReportTool;
const zod_1 = require("zod");
const appfolio_1 = require("../appfolio");
const axios_1 = __importDefault(require("axios"));
const { VHOST, USERNAME, PASSWORD } = process.env;
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
    if (!VHOST || !USERNAME || !PASSWORD)
        throw new Error('Missing AppFolio API credentials');
    if (!args.parties_ids?.occupancies_ids || args.parties_ids.occupancies_ids.length === 0) {
        throw new Error('Missing required argument: parties_ids.occupancies_ids must contain at least one ID');
    }
    if (!args.occurred_on_from || !args.occurred_on_to) {
        throw new Error('Missing required arguments: occurred_on_from and occurred_on_to (format YYYY-MM-DD)');
    }
    const { transactions_shown = "tenant", ...rest } = args;
    const payload = { transactions_shown, ...rest };
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/tenant_ledger.json`;
    const response = await appfolio_1.appfolioLimiter.schedule(() => axios_1.default.post(url, payload, {
        auth: { username: USERNAME, password: PASSWORD },
        headers: { 'Content-Type': 'application/json' },
    }));
    return response.data;
}
// --- Tenant Ledger Report Tool ---
function registerTenantLedgerReportTool(server) {
    server.tool("get_tenant_ledger_report", "Generates a report on tenant ledgers.", tenantLedgerArgsSchema.shape, async (args, _extra) => {
        const data = await getTenantLedgerReport(args);
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

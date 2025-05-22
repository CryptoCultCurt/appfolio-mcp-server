"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVendorLedgerReport = getVendorLedgerReport;
exports.registerVendorLedgerReportTool = registerVendorLedgerReportTool;
const zod_1 = require("zod");
const appfolio_1 = require("../appfolio");
const axios_1 = __importDefault(require("axios"));
const { VHOST, USERNAME, PASSWORD } = process.env;
// Zod schema moved from src/index.ts
const vendorLedgerInputSchema = zod_1.z.object({
    party_contact_info: zod_1.z.object({
        company_id: zod_1.z.string().describe('Required. The ID of the vendor (company).')
    }).describe('Required. Specifies the vendor for the ledger report.'),
    property_visibility: zod_1.z.enum(["active", "hidden", "all"]).optional().default("active").describe('Filter properties by status. Defaults to "active"'),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional().describe('Filter by specific property IDs'),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional().describe('Filter by property group IDs'),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional().describe('Filter by portfolio IDs'),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional().describe('Filter by owner IDs')
    }).optional(),
    occurred_on_from: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('Required. The start date for the reporting period (YYYY-MM-DD).'),
    occurred_on_to: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('Required. The end date for the reporting period (YYYY-MM-DD).'),
    reverse_transaction: zod_1.z.boolean().optional().default(false).transform(val => val ? "1" : "0").describe('Include reversed transactions. Defaults to false.'),
    columns: zod_1.z.array(zod_1.z.string()).optional().describe('Array of specific columns to include in the report')
});
// Function moved from src/appfolio.ts
async function getVendorLedgerReport(args) {
    if (!VHOST || !USERNAME || !PASSWORD)
        throw new Error('Missing AppFolio API credentials');
    if (!args.party_contact_info?.company_id) {
        throw new Error('Missing required argument: party_contact_info.company_id');
    }
    if (!args.occurred_on_from || !args.occurred_on_to) {
        throw new Error('Missing required arguments: occurred_on_from and occurred_on_to (format YYYY-MM-DD)');
    }
    const { property_visibility = "active", reverse_transaction = "0", ...rest } = args;
    const payload = {
        property_visibility,
        reverse_transaction,
        ...rest
    };
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/vendor_ledger.json`;
    const response = await appfolio_1.appfolioLimiter.schedule(() => axios_1.default.post(url, payload, {
        auth: { username: USERNAME, password: PASSWORD },
        headers: { 'Content-Type': 'application/json' },
    }));
    return response.data;
}
// MCP Tool Registration Function
function registerVendorLedgerReportTool(server) {
    server.tool("get_vendor_ledger_report", "Generates a report on vendor ledgers.", vendorLedgerInputSchema.shape, async (args, _extra) => {
        const data = await getVendorLedgerReport(args);
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

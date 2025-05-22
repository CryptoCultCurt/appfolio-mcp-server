"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReceivablesActivityReport = getReceivablesActivityReport;
exports.registerReceivablesActivityReportTool = registerReceivablesActivityReportTool;
const zod_1 = require("zod");
const axios_1 = __importDefault(require("axios"));
const appfolio_1 = require("../appfolio");
const { VHOST, USERNAME, PASSWORD } = process.env;
// Zod schema for Receivables Activity Report arguments
const receivablesActivityArgsSchema = zod_1.z.object({
    tenant_visibility: zod_1.z.enum(["active", "inactive", "all"]).optional().describe('Filter tenants by status. Defaults to "active"'),
    tenant_statuses: zod_1.z.array(zod_1.z.string()).optional().describe('Filter by specific tenant statuses (e.g., [\"0\", \"4\"] for Current and Notice)'),
    property_visibility: zod_1.z.enum(["active", "hidden", "all"]).optional().describe('Filter properties by status. Defaults to "active"'),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional()
    }).optional().describe('Filter results based on properties, groups, portfolios, or owners'),
    receipt_date_from: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The start date for the reporting period based on receipt date (YYYY-MM-DD). Required.'),
    receipt_date_to: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The end date for the reporting period based on receipt date (YYYY-MM-DD). Required.'),
    manually_entered_only: zod_1.z.enum(["0", "1"]).optional().describe('Include only manually entered receipts. Defaults to "0" (false)'),
    columns: zod_1.z.array(zod_1.z.string()).optional().describe('Array of specific columns to include in the report')
});
// --- Receivables Activity Report Function ---
async function getReceivablesActivityReport(args) {
    if (!VHOST || !USERNAME || !PASSWORD)
        throw new Error('Missing AppFolio API credentials');
    if (!args.receipt_date_from || !args.receipt_date_to) {
        throw new Error('Missing required arguments: receipt_date_from and receipt_date_to (format YYYY-MM-DD)');
    }
    const { tenant_visibility = "active", property_visibility = "active", manually_entered_only = "0", ...rest } = args;
    const payload = {
        tenant_visibility,
        property_visibility,
        manually_entered_only,
        ...rest
    };
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/receivables_activity.json`;
    const response = await appfolio_1.appfolioLimiter.schedule(() => axios_1.default.post(url, payload, {
        auth: { username: USERNAME, password: PASSWORD },
        headers: { 'Content-Type': 'application/json' },
    }));
    return response.data;
}
// MCP Tool Registration Function
function registerReceivablesActivityReportTool(server) {
    server.tool("get_receivables_activity_report", "Returns receivables activity report for the given filters.", receivablesActivityArgsSchema.shape, async (args, _extra) => {
        const data = await getReceivablesActivityReport(args);
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

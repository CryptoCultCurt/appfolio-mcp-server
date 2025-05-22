"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRenewalSummaryReport = getRenewalSummaryReport;
exports.registerRenewalSummaryReportTool = registerRenewalSummaryReportTool;
const axios_1 = __importDefault(require("axios"));
const zod_1 = require("zod");
const appfolio_1 = require("../appfolio");
const { VHOST, USERNAME, PASSWORD } = process.env;
// Zod schema for Renewal Summary Report arguments
const renewalStatusSchema = zod_1.z.enum(["all", "awaiting_response", "countersigned", "pending", "skipped", "notice_to_vacate"]);
const renewalSummaryArgsSchema = zod_1.z.object({
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional()
    }).optional().describe('Filter results based on properties, groups, portfolios, or owners'),
    unit_visibility: zod_1.z.enum(["active", "hidden", "all"]).optional().describe('Filter units by status. Defaults to "active"'),
    start_on_from: zod_1.z.string().regex(/^\d{4}-\d{2}$/, "Date must be in YYYY-MM format").describe('The start month for the reporting period based on lease start date (YYYY-MM). Required.'),
    start_on_to: zod_1.z.string().regex(/^\d{4}-\d{2}$/, "Date must be in YYYY-MM format").describe('The end month for the reporting period based on lease start date (YYYY-MM). Required.'),
    statuses: zod_1.z.array(renewalStatusSchema).optional().default(["all"]).describe('Filter by renewal status. Defaults to [\"all\"]'),
    include_tenant_transfers: zod_1.z.enum(["0", "1"]).optional().describe('Include tenant transfers in the report. Defaults to "0" (false)'),
    columns: zod_1.z.array(zod_1.z.string()).optional().describe('Array of specific columns to include in the report')
});
// --- Renewal Summary Report Function ---
async function getRenewalSummaryReport(args) {
    if (!VHOST || !USERNAME || !PASSWORD)
        throw new Error('Missing AppFolio API credentials');
    if (!args.start_on_from || !args.start_on_to) {
        throw new Error('Missing required arguments: start_on_from and start_on_to (format YYYY-MM)');
    }
    const { unit_visibility = "active", statuses = ["all"], include_tenant_transfers = "0", ...rest } = args;
    const payload = {
        unit_visibility,
        statuses,
        include_tenant_transfers,
        ...rest
    };
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/renewal_summary.json`;
    const response = await appfolio_1.appfolioLimiter.schedule(() => axios_1.default.post(url, payload, {
        auth: { username: USERNAME, password: PASSWORD },
        headers: { 'Content-Type': 'application/json' },
    }));
    return response.data;
}
// --- Renewal Summary Report Tool ---
function registerRenewalSummaryReportTool(server) {
    server.tool("get_renewal_summary_report", "Provides a summary of lease renewals.", renewalSummaryArgsSchema.shape, async (args, _extra) => {
        const data = await getRenewalSummaryReport(args);
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

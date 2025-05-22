"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.leaseExpirationDetailArgsSchema = void 0;
exports.getLeaseExpirationDetailByMonthReport = getLeaseExpirationDetailByMonthReport;
exports.registerLeaseExpirationDetailReportTool = registerLeaseExpirationDetailReportTool;
const zod_1 = require("zod");
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const appfolio_1 = require("../appfolio"); // Assuming appfolioLimiter is exported from appfolio.ts
dotenv_1.default.config();
const { VHOST, USERNAME, PASSWORD } = process.env;
// Zod schema for Lease Expiration Detail By Month Report arguments
exports.leaseExpirationDetailArgsSchema = zod_1.z.object({
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional()
    }).optional().describe('Filter results based on properties, groups, portfolios, or owners'),
    unit_visibility: zod_1.z.enum(["active", "hidden", "all"]).default("active").describe('Filter units by status. Defaults to "active"'),
    tags: zod_1.z.string().optional().describe('Filter by unit tags (comma-separated string)'),
    filter_lease_date_range_by: zod_1.z.enum(["Lease Expiration Date", "Lease Start Date", "Move-in Date"]).default("Lease Expiration Date").describe('Which date field to use for the date range filter. Defaults to "Lease Expiration Date"'),
    ends_on_from: zod_1.z.string().regex(/^\d{4}-\d{2}$/, "Date must be in YYYY-MM format").describe('The start month for the reporting period (YYYY-MM). Required.'),
    ends_on_to: zod_1.z.string().regex(/^\d{4}-\d{2}$/, "Date must be in YYYY-MM format").describe('The end month for the reporting period (YYYY-MM). Required.'),
    exclude_occupancies_with_move_out: zod_1.z.enum(["0", "1"]).default("0").describe('Exclude occupancies that have a move-out date. Defaults to "0" (false)'),
    exclude_month_to_month: zod_1.z.enum(["0", "1"]).default("0").describe('Exclude occupancies that are month-to-month. Defaults to "0" (false)'),
    columns: zod_1.z.array(zod_1.z.string()).optional().describe('Array of specific columns to include in the report')
});
// --- Lease Expiration Detail By Month Report Function ---
async function getLeaseExpirationDetailByMonthReport(args) {
    if (!VHOST || !USERNAME || !PASSWORD)
        throw new Error('Missing AppFolio API credentials');
    // ends_on_from and ends_on_to are required by schema, no need to check here
    // Defaults are handled by Zod schema now
    const payload = { ...args };
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/lease_expiration_detail.json`;
    const response = await appfolio_1.appfolioLimiter.schedule(() => axios_1.default.post(url, payload, {
        auth: { username: USERNAME, password: PASSWORD },
        headers: { 'Content-Type': 'application/json' },
    }));
    return response.data;
}
// Registration function for the tool
function registerLeaseExpirationDetailReportTool(server) {
    server.tool("get_lease_expiration_detail_by_month_report", "Retrieves a report detailing lease expirations by month, filterable by properties, date range, and other criteria.", exports.leaseExpirationDetailArgsSchema.shape, async (args) => {
        const result = await getLeaseExpirationDetailByMonthReport(args);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(result, null, 2),
                    mimeType: "application/json"
                }
            ]
        };
    });
}

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loansArgsSchema = void 0;
exports.getLoansReport = getLoansReport;
exports.registerLoansReportTool = registerLoansReportTool;
const axios_1 = __importDefault(require("axios"));
const zod_1 = require("zod");
const appfolio_1 = require("../appfolio");
const { VHOST, USERNAME, PASSWORD } = process.env;
// Zod schema for Loans Report arguments
exports.loansArgsSchema = zod_1.z.object({
    property_visibility: zod_1.z.enum(["active", "hidden", "all"]).optional().default("active").describe('Filter properties by status. Defaults to "active"'),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional()
    }).optional().describe('Filter results based on properties, groups, portfolios, or owners'),
    reference_to: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The reference date for the report (YYYY-MM-DD). Required.'),
    show_hidden_loans: zod_1.z.enum(["0", "1"]).optional().default("0").describe('Include loans marked as hidden. Defaults to "0" (false)'),
    columns: zod_1.z.array(zod_1.z.string()).optional().describe('Array of specific columns to include in the report')
});
// --- Loans Report Function ---
async function getLoansReport(args) {
    if (!VHOST || !USERNAME || !PASSWORD)
        throw new Error('Missing AppFolio API credentials');
    if (!args.reference_to) {
        throw new Error('Missing required argument: reference_to (format YYYY-MM-DD)');
    }
    // Defaults are handled by Zod now, so direct destructuring is fine.
    const payload = { ...args };
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/loans.json`;
    const response = await appfolio_1.appfolioLimiter.schedule(() => axios_1.default.post(url, payload, {
        auth: { username: USERNAME, password: PASSWORD },
        headers: { 'Content-Type': 'application/json' },
    }));
    return response.data;
}
// --- Register Loans Report Tool ---
function registerLoansReportTool(server) {
    server.tool("get_loans_report", "Retrieves a report on loans associated with properties.", exports.loansArgsSchema.shape, async (args) => {
        const data = await getLoansReport(args);
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

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPropertySourceTrackingReport = getPropertySourceTrackingReport;
exports.registerPropertySourceTrackingReportTool = registerPropertySourceTrackingReportTool;
const zod_1 = require("zod");
const axios_1 = __importDefault(require("axios"));
const appfolio_1 = require("../appfolio");
const { VHOST, USERNAME, PASSWORD } = process.env;
// --- Property Source Tracking Report Function ---
async function getPropertySourceTrackingReport(args) {
    if (!VHOST || !USERNAME || !PASSWORD)
        throw new Error('Missing AppFolio API credentials');
    if (!args.received_on_from || !args.received_on_to) {
        throw new Error('Missing required arguments: received_on_from and received_on_to (format YYYY-MM-DD)');
    }
    const { unit_visibility = "active", ...rest } = args;
    const payload = {
        unit_visibility,
        ...rest
    };
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/prospect_source_tracking.json`;
    const response = await appfolio_1.appfolioLimiter.schedule(() => axios_1.default.post(url, payload, {
        auth: { username: USERNAME, password: PASSWORD },
        headers: { 'Content-Type': 'application/json' },
    }));
    return response.data;
}
// Zod schema for Property Source Tracking Report arguments
const propertySourceTrackingInputSchema = zod_1.z.object({
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional()
    }).optional().describe('Filter results based on properties, groups, portfolios, or owners'),
    unit_visibility: zod_1.z.enum(["active", "hidden", "all"]).optional().describe('Filter units by status. Defaults to "active"'),
    received_on_from: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The start date for the reporting period based on received date (YYYY-MM-DD). Required.'),
    received_on_to: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The end date for the reporting period based on received date (YYYY-MM-DD). Required.'),
    columns: zod_1.z.array(zod_1.z.string()).optional().describe('Array of specific columns to include in the report')
});
// MCP Tool Registration Function
function registerPropertySourceTrackingReportTool(server) {
    server.tool("get_property_source_tracking_report", "Returns property source tracking report for the given filters.", propertySourceTrackingInputSchema.shape, async (args, _extra) => {
        const data = await getPropertySourceTrackingReport(args);
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

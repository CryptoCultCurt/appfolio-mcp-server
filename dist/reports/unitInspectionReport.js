"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUnitInspectionReport = getUnitInspectionReport;
exports.registerUnitInspectionReportTool = registerUnitInspectionReportTool;
const zod_1 = require("zod");
const appfolio_1 = require("../appfolio");
const axios_1 = __importDefault(require("axios"));
const { VHOST, USERNAME, PASSWORD } = process.env;
// Zod schema for Unit Inspection Report arguments
const unitInspectionArgsSchema = zod_1.z.object({
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional()
    }).optional().describe('Filter results based on properties, groups, portfolios, or owners'),
    unit_visibility: zod_1.z.enum(["active", "hidden", "all"]).optional().default("active").describe('Filter units by status. Defaults to "active"'),
    last_inspection_on_from: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional().describe('Optional. Filter units last inspected on or after this date (YYYY-MM-DD).'),
    include_blank_inspection_date: zod_1.z.boolean().optional().default(false).transform(val => val ? "1" : "0").describe('Include units with no inspection date. Defaults to false.'),
    columns: zod_1.z.array(zod_1.z.string()).optional().describe('Array of specific columns to include in the report')
});
// --- Unit Inspection Report Function ---
async function getUnitInspectionReport(args) {
    if (!VHOST || !USERNAME || !PASSWORD)
        throw new Error('Missing AppFolio API credentials');
    const { unit_visibility = "active", include_blank_inspection_date = "0", ...rest } = args;
    const payload = {
        unit_visibility,
        include_blank_inspection_date,
        ...rest
    };
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/unit_inspection.json`;
    const response = await appfolio_1.appfolioLimiter.schedule(() => axios_1.default.post(url, payload, {
        auth: { username: USERNAME, password: PASSWORD },
        headers: { 'Content-Type': 'application/json' },
    }));
    return response.data;
}
// MCP Tool Registration Function
function registerUnitInspectionReportTool(server) {
    server.tool("get_unit_inspection_report", "Generates a report on unit inspections.", unitInspectionArgsSchema.shape, async (args, _extra) => {
        const data = await getUnitInspectionReport(args);
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

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getScreeningAssessmentReport = getScreeningAssessmentReport;
exports.registerScreeningAssessmentReportTool = registerScreeningAssessmentReportTool;
const zod_1 = require("zod");
const appfolio_1 = require("../appfolio");
const axios_1 = __importDefault(require("axios"));
const { VHOST, USERNAME, PASSWORD } = process.env;
const screeningAssessmentInputSchema = zod_1.z.object({
    property_visibility: zod_1.z.enum(["active", "hidden", "all"]).optional().default("active"),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional()
    }).optional(),
    screening_date_from: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional(),
    screening_date_to: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional(),
    statuses: zod_1.z.array(zod_1.z.string()).optional(),
    decision_statuses: zod_1.z.array(zod_1.z.string()).optional(),
    columns: zod_1.z.array(zod_1.z.string()).optional()
});
async function getScreeningAssessmentReport(args) {
    if (!VHOST || !USERNAME || !PASSWORD)
        throw new Error('Missing AppFolio API credentials');
    const payload = { ...args };
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/screening_assessment.json`;
    const response = await appfolio_1.appfolioLimiter.schedule(() => axios_1.default.post(url, payload, {
        auth: { username: USERNAME, password: PASSWORD },
        headers: { 'Content-Type': 'application/json' },
    }));
    return response.data;
}
function registerScreeningAssessmentReportTool(server) {
    server.tool("get_screening_assessment_report", "Returns screening assessment report for the given filters.", screeningAssessmentInputSchema.shape, async (args, _extra) => {
        const data = await getScreeningAssessmentReport(args);
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

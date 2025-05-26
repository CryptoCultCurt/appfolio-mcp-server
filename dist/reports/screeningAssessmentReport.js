"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getScreeningAssessmentReport = getScreeningAssessmentReport;
exports.registerScreeningAssessmentReportTool = registerScreeningAssessmentReportTool;
const zod_1 = require("zod");
const appfolio_1 = require("../appfolio");
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
    const { property_visibility = "active", ...rest } = args;
    const payload = { property_visibility, ...rest };
    return (0, appfolio_1.makeAppfolioApiCall)('screening_assessment.json', payload);
}
function registerScreeningAssessmentReportTool(server) {
    server.tool("get_screening_assessment_report", "Returns screening assessment report for the given filters.", screeningAssessmentInputSchema.shape, async (args, _extra) => {
        try {
            // Validate arguments against schema
            const parseResult = screeningAssessmentInputSchema.safeParse(args);
            if (!parseResult.success) {
                const errorMessages = parseResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('; ');
                throw new Error(`Invalid arguments: ${errorMessages}`);
            }
            const result = await getScreeningAssessmentReport(parseResult.data);
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
            console.error(`Screening Assessment Report Error:`, errorMessage);
            throw error;
        }
    });
}

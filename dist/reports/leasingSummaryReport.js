"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.leasingSummaryArgsSchema = exports.LEASING_SUMMARY_COLUMNS = void 0;
exports.getLeasingSummaryReport = getLeasingSummaryReport;
exports.registerLeasingSummaryReportTool = registerLeasingSummaryReportTool;
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
const appfolio_1 = require("../appfolio");
const validation_1 = require("../validation");
dotenv_1.default.config();
// Available columns extracted from the LeasingSummaryResult type
exports.LEASING_SUMMARY_COLUMNS = [
    'unit_type',
    'number_of_units',
    'number_of_model_units',
    'inquiries_received',
    'showings_completed',
    'applications_received',
    'move_ins',
    'move_outs',
    'leased',
    'vacancy_postings',
    'number_of_active_campaigns',
    'number_of_ended_campaigns'
];
// Zod schema for Leasing Summary Report arguments
exports.leasingSummaryArgsSchema = zod_1.z.object({
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional()
            .describe((0, validation_1.getIdFieldDescription)('property', 'Property Directory Report')),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional()
            .describe((0, validation_1.getIdFieldDescription)('property group', 'Property Group Directory Report')),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional()
            .describe((0, validation_1.getIdFieldDescription)('portfolio', 'Portfolio Directory Report')),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional()
            .describe((0, validation_1.getIdFieldDescription)('owner', 'Owner Directory Report')),
    }).optional().describe('Filter results based on properties, groups, portfolios, or owners'),
    unit_visibility: zod_1.z.enum(["active", "hidden", "all"]).default("active").describe('Filter units by status. Defaults to "active"'),
    posted_on_from: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The start date for the reporting period (YYYY-MM-DD). Required.'),
    posted_on_to: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The end date for the reporting period (YYYY-MM-DD). Required.'),
    columns: zod_1.z.array(zod_1.z.enum(exports.LEASING_SUMMARY_COLUMNS)).optional()
        .describe(`Array of specific columns to include in the report. Valid columns: ${exports.LEASING_SUMMARY_COLUMNS.join(', ')}. If not specified, all columns are returned.`)
});
// --- Leasing Summary Report Function ---
async function getLeasingSummaryReport(args) {
    // Validate properties IDs if provided
    if (args.properties) {
        const validationErrors = (0, validation_1.validatePropertiesIds)(args.properties);
        (0, validation_1.throwOnValidationErrors)(validationErrors);
    }
    if (!args.posted_on_from || !args.posted_on_to) {
        throw new Error('Missing required arguments: posted_on_from and posted_on_to (format YYYY-MM-DD)');
    }
    const { unit_visibility = "active", ...rest } = args;
    const payload = { unit_visibility, ...rest };
    return (0, appfolio_1.makeAppfolioApiCall)('leasing_summary.json', payload);
}
// --- Register Leasing Summary Report Tool ---
function registerLeasingSummaryReportTool(server) {
    server.tool("get_leasing_summary_report", "Provides a summary of leasing activities, including inquiries, showings, applications, and move-ins/outs. IMPORTANT: All ID parameters (properties_ids, property_groups_ids, portfolios_ids, owners_ids) must be numeric strings (e.g. '123'), NOT names. Use respective directory reports first to lookup IDs by name if needed.", exports.leasingSummaryArgsSchema.shape, async (args, _extra) => {
        try {
            // Validate arguments against schema
            const parseResult = exports.leasingSummaryArgsSchema.safeParse(args);
            if (!parseResult.success) {
                const errorMessages = parseResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('; ');
                throw new Error(`Invalid arguments: ${errorMessages}`);
            }
            const result = await getLeasingSummaryReport(parseResult.data);
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
            console.error(`Leasing Summary Report Error:`, errorMessage);
            throw error;
        }
    });
}

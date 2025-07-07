"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.propertyPerformanceArgsSchema = void 0;
exports.getPropertyPerformanceReport = getPropertyPerformanceReport;
exports.registerPropertyPerformanceReportTool = registerPropertyPerformanceReportTool;
const zod_1 = require("zod");
const appfolio_1 = require("../appfolio");
const validation_1 = require("../validation");
// Zod schema for Property Performance Report arguments
exports.propertyPerformanceArgsSchema = zod_1.z.object({
    property_visibility: zod_1.z.enum(["active", "hidden", "all"]).default("active").describe('Filter properties by status. Defaults to "active"'),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional().describe((0, validation_1.getIdFieldDescription)('properties_ids', 'Property', 'Property Directory Report')),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional().describe((0, validation_1.getIdFieldDescription)('property_groups_ids', 'Property Group')),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional().describe((0, validation_1.getIdFieldDescription)('portfolios_ids', 'Portfolio')),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional().describe((0, validation_1.getIdFieldDescription)('owners_ids', 'Owner', 'Owner Directory Report'))
    }).optional().describe('Filter results based on properties, groups, portfolios, or owners. All ID fields must be numeric strings, not names.'),
    report_format: zod_1.z.enum(["Current Year Actual", "Last Year Actual", "Prior Year Actual", "Budget Comparison"]).describe('Format for the property performance report. Required.'),
    period_from: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The start date for the reporting period (YYYY-MM-DD). Required.'),
    period_to: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The end date for the reporting period (YYYY-MM-DD). Required.'),
    columns: zod_1.z.array(zod_1.z.string()).optional().describe('Array of specific columns to include in the report. Note: Available columns depend on the report_format selected. Avoid generic names like "total_income" - check the API documentation for valid column names for this report.')
});
// --- Property Performance Report Function ---
async function getPropertyPerformanceReport(args) {
    if (!args.period_from || !args.period_to) {
        throw new Error('Missing required arguments: period_from and period_to (format YYYY-MM-DD)');
    }
    // Validate ID fields
    if (args.properties) {
        const validationErrors = (0, validation_1.validatePropertiesIds)(args.properties);
        (0, validation_1.throwOnValidationErrors)(validationErrors);
    }
    const { property_visibility = "active", ...rest } = args;
    // Filter out empty arrays and undefined/null values to clean up the payload
    const cleanPayload = {
        property_visibility,
        ...Object.fromEntries(Object.entries(rest).filter(([key, value]) => {
            if (value === null || value === undefined)
                return false;
            if (Array.isArray(value) && value.length === 0)
                return false;
            if (typeof value === 'object' && value !== null) {
                const filteredObj = Object.fromEntries(Object.entries(value).filter(([, val]) => {
                    if (Array.isArray(val) && val.length === 0)
                        return false;
                    return val !== null && val !== undefined;
                }));
                return Object.keys(filteredObj).length > 0;
            }
            return true;
        }))
    };
    return (0, appfolio_1.makeAppfolioApiCall)('property_performance.json', cleanPayload);
}
function registerPropertyPerformanceReportTool(server) {
    server.tool('get_property_performance_report', 'Retrieves the Property Performance report, showing financial performance metrics for properties within a specified date range. IMPORTANT: All ID parameters (owners_ids, properties_ids, etc.) must be numeric strings (e.g. \'123\'), NOT names. Use respective directory reports first to lookup IDs by name if needed.', exports.propertyPerformanceArgsSchema.shape, async (args) => {
        const reportData = await getPropertyPerformanceReport(args);
        return {
            content: [{ type: 'text', text: JSON.stringify(reportData, null, 2) }],
        };
    });
}

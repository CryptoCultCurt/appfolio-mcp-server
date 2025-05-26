"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workOrderLaborSummaryInputSchema = void 0;
exports.getWorkOrderLaborSummaryReport = getWorkOrderLaborSummaryReport;
exports.registerWorkOrderLaborSummaryReportTool = registerWorkOrderLaborSummaryReportTool;
const zod_1 = require("zod");
const appfolio_1 = require("../appfolio");
// --- Zod Schema for Work Order Labor Summary Report arguments ---
exports.workOrderLaborSummaryInputSchema = zod_1.z.object({
    property_visibility: zod_1.z.enum(["active", "hidden", "all"]).optional().default("active").describe('Filter properties by status. Defaults to "active"'),
    maintenance_tech: zod_1.z.string().optional().default("All").describe('Filter by maintenance technician. Defaults to "All"'),
    labor_performed_from: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "labor_performed_from must be in YYYY-MM-DD format" }).describe('Start date for labor performed (YYYY-MM-DD)'),
    labor_performed_to: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "labor_performed_to must be in YYYY-MM-DD format" }).describe('End date for labor performed (YYYY-MM-DD)'),
    unit_turn: zod_1.z.enum(["0", "1"]).optional().default("0").describe('Filter by unit turn. Defaults to "0" (false)'),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional()
    }).optional().describe('Filter by specific properties, groups, portfolios, or owners'),
    columns: zod_1.z.array(zod_1.z.string()).optional().describe('Array of specific columns to include in the report'),
    // work_order_statuses is in WorkOrderLaborSummaryArgs but not in the original Zod schema from index.ts. Adding it as optional.
    work_order_statuses: zod_1.z.array(zod_1.z.string()).optional().describe('Filter by work order status IDs'),
});
// --- Work Order Labor Summary Report Function ---
async function getWorkOrderLaborSummaryReport(args) {
    if (!args.labor_performed_from || !args.labor_performed_to) {
        throw new Error('Missing required arguments: labor_performed_from and labor_performed_to (format YYYY-MM-DD)');
    }
    const { property_visibility = "active", ...rest } = args;
    const payload = { property_visibility, ...rest };
    return (0, appfolio_1.makeAppfolioApiCall)('work_order_labor_summary.json', payload);
}
// --- MCP Tool Registration Function ---
function registerWorkOrderLaborSummaryReportTool(server) {
    server.tool("get_work_order_labor_summary_report", "Returns a report detailing work order labor based on specified filters.", exports.workOrderLaborSummaryInputSchema.shape, async (args, _extra) => {
        try {
            // Validate arguments against schema
            const parseResult = exports.workOrderLaborSummaryInputSchema.safeParse(args);
            if (!parseResult.success) {
                const errorMessages = parseResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('; ');
                throw new Error(`Invalid arguments: ${errorMessages}`);
            }
            const result = await getWorkOrderLaborSummaryReport(parseResult.data);
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
            console.error(`Work Order Labor Summary Report Error:`, errorMessage);
            throw error;
        }
    });
}

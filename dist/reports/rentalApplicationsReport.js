"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRentalApplicationsReport = getRentalApplicationsReport;
exports.registerRentalApplicationsReportTool = registerRentalApplicationsReportTool;
const zod_1 = require("zod");
const appfolio_1 = require("../appfolio");
const rentalApplicationsInputSchema = zod_1.z.object({
    property_visibility: zod_1.z.enum(["active", "hidden", "all"]).optional().default("active"),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional()
    }).optional(),
    received_on_from: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional(),
    received_on_to: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional(),
    statuses: zod_1.z.array(zod_1.z.string()).optional(),
    sources: zod_1.z.array(zod_1.z.string()).optional(),
    columns: zod_1.z.array(zod_1.z.string()).optional()
});
async function getRentalApplicationsReport(args) {
    if (!args.received_on_from || !args.received_on_to) {
        throw new Error('Missing required arguments: received_on_from and received_on_to (format YYYY-MM-DD)');
    }
    const { property_visibility = "active", ...rest } = args;
    const payload = { property_visibility, ...rest };
    return (0, appfolio_1.makeAppfolioApiCall)('rental_applications.json', payload);
}
function registerRentalApplicationsReportTool(server) {
    server.tool("get_rental_applications_report", "Returns rental applications report for the given filters.", rentalApplicationsInputSchema.shape, async (args, _extra) => {
        const data = await getRentalApplicationsReport(args);
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

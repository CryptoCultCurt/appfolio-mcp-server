"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPropertyDirectoryReport = getPropertyDirectoryReport;
exports.registerPropertyDirectoryReportTool = registerPropertyDirectoryReportTool;
const appfolio_1 = require("../appfolio");
const axios_1 = __importDefault(require("axios"));
const zod_1 = require("zod");
const { VHOST, USERNAME, PASSWORD } = process.env;
// Zod schema for Property Directory Report arguments
const propertyDirectoryInputSchema = zod_1.z.object({
    property_visibility: zod_1.z.string(),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional(),
    }).optional(),
    columns: zod_1.z.array(zod_1.z.string()).optional()
});
async function getPropertyDirectoryReport(args) {
    if (!VHOST || !USERNAME || !PASSWORD)
        throw new Error('Missing AppFolio API credentials');
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/property_directory.json`;
    const response = await appfolio_1.appfolioLimiter.schedule(() => axios_1.default.post(url, args, {
        auth: { username: USERNAME, password: PASSWORD },
        headers: { 'Content-Type': 'application/json' },
    }));
    return response.data;
}
function registerPropertyDirectoryReportTool(server) {
    server.tool("get_property_directory_report", "Returns property directory details for the given filters.", propertyDirectoryInputSchema.shape, async (args) => {
        const data = await getPropertyDirectoryReport(args);
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

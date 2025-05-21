"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRentRollItemizedReport = getRentRollItemizedReport;
exports.registerRentRollItemizedReportTool = registerRentRollItemizedReportTool;
const zod_1 = require("zod");
const appfolio_1 = require("../appfolio");
const axios_1 = __importDefault(require("axios"));
const { VHOST, USERNAME, PASSWORD } = process.env;
// Zod schema copied from src/index.ts
const rentRollItemizedInputSchema = zod_1.z.object({
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional(),
    }).optional(),
    unit_visibility: zod_1.z.string().default("active"), // Defaulting to active
    tags: zod_1.z.string().optional(),
    gl_account_ids: zod_1.z.array(zod_1.z.string()).optional(),
    as_of_to: zod_1.z.string(),
    columns: zod_1.z.array(zod_1.z.string()).optional(),
});
// Function definition copied from src/appfolio.ts
async function getRentRollItemizedReport(args) {
    if (!VHOST || !USERNAME || !PASSWORD)
        throw new Error('Missing AppFolio API credentials');
    // The Zod schema now handles the default for unit_visibility
    const payload = { ...args };
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/rent_roll_itemized.json`;
    const response = await appfolio_1.appfolioLimiter.schedule(() => axios_1.default.post(url, payload, {
        auth: { username: USERNAME, password: PASSWORD },
        headers: { 'Content-Type': 'application/json' },
    }));
    return response.data;
}
// MCP Tool Registration Function
function registerRentRollItemizedReportTool(server) {
    server.tool("get_rent_roll_itemized_report", "Returns rent roll itemized report for the given filters.", rentRollItemizedInputSchema.shape, async (args, _extra) => {
        const data = await getRentRollItemizedReport(args);
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

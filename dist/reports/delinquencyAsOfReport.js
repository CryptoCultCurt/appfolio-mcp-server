"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.delinquencyAsOfInputSchema = exports.delinquencyColumnsList = void 0;
exports.getDelinquencyAsOfReport = getDelinquencyAsOfReport;
exports.registerDelinquencyAsOfReportTool = registerDelinquencyAsOfReportTool;
const zod_1 = require("zod");
const axios_1 = __importDefault(require("axios"));
const bottleneck_1 = __importDefault(require("bottleneck"));
const { VHOST, USERNAME, PASSWORD } = process.env;
// Limiter, assuming it's used by this report function or similar ones
const appfolioLimiter = new bottleneck_1.default({
    reservoir: 7,
    reservoirRefreshAmount: 7,
    reservoirRefreshInterval: 15 * 1000,
    maxConcurrent: 1
});
exports.delinquencyColumnsList = [
    'unit', 'name', 'tenant_status', 'tags', 'phone_numbers', 'move_in', 'move_out',
    'primary_tenant_email', 'unit_type', 'property', 'property_name', 'property_id',
    'property_address', 'property_street', 'property_street2', 'property_city',
    'property_state', 'property_zip', 'amount_receivable', 'delinquent_subsidy_amount',
    '00_to30', '30_plus', '30_to60', '60_plus', '60_to90', '90_plus', 'this_month',
    'last_month', 'month_before_last', 'delinquent_rent', 'delinquency_notes',
    'certified_funds_only', 'in_collections', 'collections_agency', 'unit_id',
    'occupancy_id', 'property_group_id'
];
async function getDelinquencyAsOfReport(args) {
    if (!VHOST || !USERNAME || !PASSWORD)
        throw new Error('Missing AppFolio API credentials');
    const { property_visibility = "active", tenant_statuses = ["0", "4"], amount_owed_in_account = "all", ...rest } = args;
    const payload = {
        property_visibility,
        tenant_statuses,
        amount_owed_in_account,
        ...rest
    };
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/delinquency_as_of.json`;
    const response = await appfolioLimiter.schedule(() => axios_1.default.post(url, payload, {
        auth: { username: USERNAME, password: PASSWORD },
        headers: { 'Content-Type': 'application/json' },
    }));
    return response.data;
}
exports.delinquencyAsOfInputSchema = zod_1.z.object({
    property_visibility: zod_1.z.string().default("active").optional(),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional(),
    }).optional(),
    occurred_on_to: zod_1.z.string().describe("Required. Date to run the report as of in YYYY-MM-DD format."),
    delinquency_note_range: zod_1.z.string().optional(),
    tenant_statuses: zod_1.z.array(zod_1.z.string()).default(["0", "4"].slice()).optional(),
    tags: zod_1.z.string().optional(),
    amount_owed_in_account: zod_1.z.string().default("all").optional(),
    balance_operator: zod_1.z.object({
        amount: zod_1.z.string().optional(),
        comparator: zod_1.z.string().optional()
    }).optional(),
    columns: zod_1.z.array(zod_1.z.nativeEnum(Object.fromEntries(exports.delinquencyColumnsList.map(col => [col, col])))).optional()
});
function registerDelinquencyAsOfReportTool(server) {
    server.tool("get_delinquency_as_of_report", "Returns delinquency as of report for the given filters.", exports.delinquencyAsOfInputSchema.shape, async (args, _extra) => {
        const data = await getDelinquencyAsOfReport(args); // Cast args
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

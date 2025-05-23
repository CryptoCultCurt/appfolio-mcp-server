"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.delinquencyAsOfInputSchema = exports.delinquencyColumnsList = void 0;
exports.getDelinquencyAsOfReport = getDelinquencyAsOfReport;
exports.registerDelinquencyAsOfReportTool = registerDelinquencyAsOfReportTool;
const zod_1 = require("zod");
const appfolio_1 = require("../appfolio");
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
    if (!args.as_of) {
        throw new Error('Missing required argument: as_of (format YYYY-MM-DD)');
    }
    const { property_visibility = "active", tenant_statuses = ["0", "4"], amount_owed_in_account = "all", ...rest } = args;
    const payload = {
        property_visibility,
        tenant_statuses,
        amount_owed_in_account,
        ...rest
    };
    return (0, appfolio_1.makeAppfolioApiCall)('delinquency_as_of.json', payload);
}
exports.delinquencyAsOfInputSchema = zod_1.z.object({
    property_visibility: zod_1.z.string().default("active").optional(),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional(),
    }).optional(),
    as_of: zod_1.z.string().describe("Required. Date to run the report as of in YYYY-MM-DD format."),
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

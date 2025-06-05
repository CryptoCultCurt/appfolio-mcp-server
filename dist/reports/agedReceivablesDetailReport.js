"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAgedReceivablesDetailReport = getAgedReceivablesDetailReport;
exports.registerAgedReceivablesDetailReportTool = registerAgedReceivablesDetailReportTool;
const zod_1 = require("zod");
const appfolio_1 = require("../appfolio");
const validation_1 = require("../validation");
// Valid columns for the aged receivables detail report
const VALID_AGED_RECEIVABLES_COLUMNS = [
    "payer_name",
    "property",
    "property_name",
    "property_id",
    "property_address",
    "property_street",
    "property_street2",
    "property_city",
    "property_state",
    "property_zip",
    "invoice_occurred_on",
    "account_number",
    "account_name",
    "account_id",
    "total_amount",
    "amount_receivable",
    "future_charges",
    "0_to30",
    "30_to60",
    "60_to90",
    "90_plus",
    "30_plus",
    "60_plus",
    "occupancy_name",
    "account",
    "unit_address",
    "unit_street",
    "unit_street2",
    "unit_city",
    "unit_state",
    "unit_zip",
    "unit_name",
    "unit_type",
    "unit_tags",
    "tenant_status",
    "payment_plan",
    "txn_id",
    "occupancy_id",
    "unit_id"
];
// Base schema for shape compatibility
const agedReceivablesDetailBaseSchema = zod_1.z.object({
    property_visibility: zod_1.z.string().default("active").describe('Filter properties by status. Defaults to "active".'),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional().describe((0, validation_1.getIdFieldDescription)('properties_ids', 'Property', 'property directory report')),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional().describe((0, validation_1.getIdFieldDescription)('property_groups_ids', 'Property Group', 'property group directory report')),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional().describe((0, validation_1.getIdFieldDescription)('portfolios_ids', 'Portfolio', 'portfolio directory report')),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional().describe((0, validation_1.getIdFieldDescription)('owners_ids', 'Owner', 'owner directory report')),
    }).optional().describe('Optional. Filter by specific property-related IDs.'),
    tags: zod_1.z.string().optional().describe('Optional. Filter by property tags.'),
    balance_operator: zod_1.z.object({
        amount: zod_1.z.string().optional().describe('Optional. Balance amount to compare against.'),
        comparator: zod_1.z.string().optional().describe('Optional. Comparison operator for balance amount.')
    }).optional().describe('Optional. Filter by balance amount with comparison operator.'),
    tenant_statuses: zod_1.z.array(zod_1.z.string()).optional().describe('Optional. Filter by tenant status.'),
    occurred_on_to: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('End date for transaction occurrence filter (YYYY-MM-DD format).'),
    gl_account_map_id: zod_1.z.string().optional().describe('Optional. General ledger account map ID.'),
    columns: zod_1.z.array(zod_1.z.enum(VALID_AGED_RECEIVABLES_COLUMNS)).optional().describe(`Array of specific columns to include in the report. Valid columns: ${VALID_AGED_RECEIVABLES_COLUMNS.join(', ')}`),
    as_of: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('As-of date for the aged receivables report (YYYY-MM-DD format).'),
});
// Schema with validation
const agedReceivablesDetailInputSchema = agedReceivablesDetailBaseSchema.superRefine((data, ctx) => {
    // Validate property-related IDs if provided
    if (data.properties) {
        const validationErrors = (0, validation_1.validatePropertiesIds)(data.properties);
        (0, validation_1.throwOnValidationErrors)(validationErrors);
    }
    // Validate GL account map ID if provided
    if (data.gl_account_map_id && data.gl_account_map_id !== "" && !/^\d+$/.test(data.gl_account_map_id)) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            path: ['gl_account_map_id'],
            message: 'GL Account Map ID must be a numeric string'
        });
    }
});
// Originally from src/appfolio.ts (function starting line 1664)
async function getAgedReceivablesDetailReport(args) {
    if (!args.as_of) {
        throw new Error('Missing required argument: as_of (format YYYY-MM-DD)');
    }
    const { property_visibility = "active", ...rest } = args;
    const payload = { property_visibility, ...rest };
    return (0, appfolio_1.makeAppfolioApiCall)('aged_receivables_detail.json', payload);
}
// New registration function for MCP
function registerAgedReceivablesDetailReportTool(server) {
    server.tool("get_aged_receivables_detail_report", "Returns aged receivables detail for the given filters. IMPORTANT: All ID parameters (properties_ids, etc.) must be numeric strings (e.g. '123'), NOT names. Use respective directory reports first to lookup IDs by name if needed.", agedReceivablesDetailBaseSchema.shape, async (args, _extra) => {
        try {
            // Validate arguments against schema
            const parseResult = agedReceivablesDetailInputSchema.safeParse(args);
            if (!parseResult.success) {
                const errorMessages = parseResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('; ');
                throw new Error(`Invalid arguments: ${errorMessages}`);
            }
            const result = await getAgedReceivablesDetailReport(parseResult.data);
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
            console.error(`Aged Receivables Detail Report Error:`, errorMessage);
            throw error;
        }
    });
}

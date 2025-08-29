"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RENT_ROLL_ITEMIZED_COLUMNS = void 0;
exports.getRentRollItemizedReport = getRentRollItemizedReport;
exports.registerRentRollItemizedReportTool = registerRentRollItemizedReportTool;
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
const appfolio_1 = require("../appfolio");
const validation_1 = require("../validation");
dotenv_1.default.config();
// Available columns extracted from the RentRollItemizedResult type
exports.RENT_ROLL_ITEMIZED_COLUMNS = [
    'property',
    'property_name',
    'property_id',
    'property_address',
    'property_street',
    'property_street2',
    'property_city',
    'property_state',
    'property_zip',
    'property_type',
    'occupancy_id',
    'unit_id',
    'unit',
    'unit_tags',
    'unit_type',
    'bd_ba',
    'tenant',
    'status',
    'sqft',
    'market_rent',
    'computed_market_rent',
    'advertised_rent',
    'total',
    'other_charges',
    'monthly_rent_square_ft',
    'annual_rent_square_ft',
    'deposit',
    'lease_from',
    'lease_to',
    'last_rent_increase',
    'next_rent_adjustment',
    'next_rent_increase_amount',
    'next_rent_increase',
    'move_in',
    'move_out',
    'past_due',
    'nsf',
    'late',
    'amenities',
    'additional_tenants',
    'monthly_charges',
    'rent_ready',
    'rent_status',
    'legal_rent',
    'preferential_rent',
    'tenant_tags',
    'tenant_agent',
    'property_group_id',
    'portfolio_id'
];
// Custom validation for GL account IDs
const validateGlAccountIds = (glAccountIds) => {
    const errors = [];
    for (const id of glAccountIds) {
        // Check if it looks like a GL account number (4-digit codes like 4630, 4635)
        if (/^\d{4}$/.test(id)) {
            errors.push(`GL account ID "${id}" appears to be a GL account number, not an ID. GL account IDs are internal database IDs (e.g. "123", "456"). Use the Chart of Accounts Report to lookup the correct gl_account_id for GL account number "${id}".`);
        }
        // Check if it's not numeric
        else if (!/^\d+$/.test(id)) {
            errors.push(`GL account ID "${id}" must be a numeric string (e.g. "123"). Use the Chart of Accounts Report to lookup gl_account_ids by GL account number or name.`);
        }
    }
    return errors;
};
// Zod schema copied from src/index.ts
const rentRollItemizedInputSchema = zod_1.z.object({
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional()
            .describe((0, validation_1.getIdFieldDescription)('property', 'Property Directory Report')),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional()
            .describe((0, validation_1.getIdFieldDescription)('property group', 'Property Group Directory Report')),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional()
            .describe((0, validation_1.getIdFieldDescription)('portfolio', 'Portfolio Directory Report')),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional()
            .describe((0, validation_1.getIdFieldDescription)('owner', 'Owner Directory Report')),
    }).optional(),
    unit_visibility: zod_1.z.enum(["active", "hidden", "all"]).default("active").describe('Filter units by status. Defaults to "active".'),
    tags: zod_1.z.string().optional().describe('Tags filter'),
    gl_account_ids: zod_1.z.union([
        zod_1.z.array(zod_1.z.string()),
        zod_1.z.string().transform((str) => {
            try {
                const parsed = JSON.parse(str);
                return Array.isArray(parsed) ? parsed : [str];
            }
            catch {
                return [str];
            }
        })
    ]).optional()
        .describe('Array of GL account IDs (internal database IDs, NOT GL account numbers). These are numeric strings like "123", "456". Do NOT use GL account numbers like "4630", "4635". Use the Chart of Accounts Report to lookup gl_account_ids by GL account number or name.'),
    as_of_date: zod_1.z.string().describe('Report date in YYYY-MM-DD format'),
    columns: zod_1.z.array(zod_1.z.enum(exports.RENT_ROLL_ITEMIZED_COLUMNS)).optional()
        .describe(`Array of specific columns to include in the report. Valid columns: ${exports.RENT_ROLL_ITEMIZED_COLUMNS.join(', ')}. If not specified, all columns are returned.`),
});
// Function definition copied from src/appfolio.ts
async function getRentRollItemizedReport(args) {
    // Validate properties IDs if provided
    if (args.properties) {
        const validationErrors = (0, validation_1.validatePropertiesIds)(args.properties);
        (0, validation_1.throwOnValidationErrors)(validationErrors);
    }
    // Validate GL account IDs if provided
    if (args.gl_account_ids && args.gl_account_ids.length > 0) {
        const glAccountErrors = validateGlAccountIds(args.gl_account_ids);
        if (glAccountErrors.length > 0) {
            throw new Error(`Invalid GL account IDs: ${glAccountErrors.join(' ')}`);
        }
    }
    if (!args.as_of_date) {
        throw new Error('Missing required argument: as_of_date (format YYYY-MM-DD)');
    }
    const { unit_visibility = "active", ...rest } = args;
    const payload = { unit_visibility, ...rest };
    return (0, appfolio_1.makeAppfolioApiCall)('rent_roll_itemized.json', payload);
}
// MCP Tool Registration Function
function registerRentRollItemizedReportTool(server) {
    server.tool("get_rent_roll_itemized_report", "Returns rent roll itemized report for the given filters. IMPORTANT: All ID parameters (properties_ids, property_groups_ids, portfolios_ids, owners_ids, gl_account_ids) must be numeric strings (e.g. '123'), NOT names. CRITICAL: gl_account_ids are internal database IDs, NOT GL account numbers! Do not use GL account numbers like '4630', '4635' - use the Chart of Accounts Report first to lookup the correct gl_account_ids.", rentRollItemizedInputSchema.shape, async (args, _extra) => {
        try {
            console.log('Rent Roll Itemized Report - Received args:', JSON.stringify(args, null, 2));
            // Debug GL account IDs specifically
            if (args.gl_account_ids) {
                console.log('GL Account IDs type:', typeof args.gl_account_ids);
                console.log('GL Account IDs value:', args.gl_account_ids);
                console.log('GL Account IDs is array:', Array.isArray(args.gl_account_ids));
            }
            // Validate arguments against schema
            const parseResult = rentRollItemizedInputSchema.safeParse(args);
            if (!parseResult.success) {
                const errorMessages = parseResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('; ');
                console.error('Rent Roll Itemized Report - Schema validation failed:', errorMessages);
                throw new Error(`Invalid arguments: ${errorMessages}`);
            }
            console.log('Rent Roll Itemized Report - Schema validation passed, calling function');
            const result = await getRentRollItemizedReport(parseResult.data);
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
            console.error(`Rent Roll Itemized Report Error:`, errorMessage);
            throw error;
        }
    });
}

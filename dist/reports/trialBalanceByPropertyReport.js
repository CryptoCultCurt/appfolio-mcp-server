"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTrialBalanceByPropertyReport = getTrialBalanceByPropertyReport;
exports.registerTrialBalanceByPropertyReportTool = registerTrialBalanceByPropertyReportTool;
const zod_1 = require("zod");
const appfolio_1 = require("../appfolio");
// Zod schema for Trial Balance By Property Report arguments
const trialBalanceByPropertyArgsSchema = zod_1.z.object({
    property_visibility: zod_1.z.enum(["active", "hidden", "all"]).optional().default("active").describe('Filter properties by status. Defaults to "active"'),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional()
    }).optional().describe('Filter results based on properties, groups, portfolios, or owners'),
    posted_on_from: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('Required. The start date for the reporting period (YYYY-MM-DD).'),
    posted_on_to: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('Required. The end date for the reporting period (YYYY-MM-DD).'),
    gl_account_map_id: zod_1.z.string().optional().describe('Optional. Filter by a specific GL Account Map ID.'),
    columns: zod_1.z.array(zod_1.z.string()).optional().describe('Array of specific columns to include in the report')
});
// --- Trial Balance By Property Report Function ---
async function getTrialBalanceByPropertyReport(args) {
    if (!args.posted_on_from || !args.posted_on_to) {
        throw new Error('Missing required arguments: posted_on_from and posted_on_to (format YYYY-MM-DD)');
    }
    const { property_visibility = "active", ...rest } = args;
    const payload = { property_visibility, ...rest };
    return (0, appfolio_1.makeAppfolioApiCall)('trial_balance_by_property.json', payload);
}
// --- Trial Balance By Property Report Tool ---
function registerTrialBalanceByPropertyReportTool(server) {
    server.tool("get_trial_balance_by_property_report", "Generates a trial balance report by property.", trialBalanceByPropertyArgsSchema.shape, async (args, _extra) => {
        try {
            // Validate arguments against schema
            const parseResult = trialBalanceByPropertyArgsSchema.safeParse(args);
            if (!parseResult.success) {
                const errorMessages = parseResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('; ');
                throw new Error(`Invalid arguments: ${errorMessages}`);
            }
            const result = await getTrialBalanceByPropertyReport(parseResult.data);
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
            console.error(`Trial Balance By Property Report Error:`, errorMessage);
            throw error;
        }
    });
}

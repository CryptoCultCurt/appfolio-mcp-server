"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const zod_1 = require("zod");
const appfolio_1 = require("./appfolio");
const cashflowInputSchema = zod_1.z.object({
    property_visibility: zod_1.z.string(),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional(),
    }).optional(),
    posted_on_from: zod_1.z.string(),
    posted_on_to: zod_1.z.string(),
    gl_account_map_id: zod_1.z.string().optional(),
    exclude_suppressed_fees: zod_1.z.string().optional(),
    columns: zod_1.z.array(zod_1.z.string()).optional(),
});
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
const accountTotalsInputSchema = zod_1.z.object({
    property_visibility: zod_1.z.string(),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional(),
    }).optional(),
    gl_account_ids: zod_1.z.string().default("[1,2]"),
    posted_on_from: zod_1.z.string(),
    posted_on_to: zod_1.z.string(),
    columns: zod_1.z.array(zod_1.z.string()).optional(),
});
const agedPayablesSummaryInputSchema = zod_1.z.object({
    property_visibility: zod_1.z.string().default("active"),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional(),
    }).optional(),
    occurred_on_to: zod_1.z.string(),
    party_contact_info: zod_1.z.object({
        company_id: zod_1.z.string().optional()
    }).optional(),
    balance_operator: zod_1.z.object({
        amount: zod_1.z.string().optional(),
        comparator: zod_1.z.string().optional()
    }).optional(),
    columns: zod_1.z.array(zod_1.z.string()).optional(),
});
const agedReceivablesDetailInputSchema = zod_1.z.object({
    property_visibility: zod_1.z.string().default("active"),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional(),
    }).optional(),
    tags: zod_1.z.string().optional(),
    balance_operator: zod_1.z.object({
        amount: zod_1.z.string().optional(),
        comparator: zod_1.z.string().optional()
    }).optional(),
    tenant_statuses: zod_1.z.array(zod_1.z.string()).optional(),
    occurred_on_to: zod_1.z.string(),
    gl_account_map_id: zod_1.z.string().optional(),
    columns: zod_1.z.array(zod_1.z.string()).optional(),
});
const budgetComparativeInputSchema = zod_1.z.object({
    property_visibility: zod_1.z.string().default("active"),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional(),
    }).optional(),
    period_from: zod_1.z.string(),
    period_to: zod_1.z.string(),
    comparison_period_from: zod_1.z.string(),
    comparison_period_to: zod_1.z.string(),
    additional_account_types: zod_1.z.array(zod_1.z.string()).optional(),
    gl_account_map_id: zod_1.z.string().optional(),
    level_of_detail: zod_1.z.string().optional(),
    columns: zod_1.z.array(zod_1.z.string()).optional(),
});
const expenseDistributionInputSchema = zod_1.z.object({
    property_visibility: zod_1.z.string().default("active"),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional(),
    }).optional(),
    party_contact_info: zod_1.z.object({
        company_id: zod_1.z.string().optional(),
    }).optional(),
    posted_on_from: zod_1.z.string(),
    posted_on_to: zod_1.z.string(),
    gl_account_map_id: zod_1.z.string().optional(),
    columns: zod_1.z.array(zod_1.z.string()).optional(),
});
const rentRollItemizedInputSchema = zod_1.z.object({
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional(),
    }).optional(),
    unit_visibility: zod_1.z.string().optional(),
    tags: zod_1.z.string().optional(),
    gl_account_ids: zod_1.z.array(zod_1.z.string()).optional(),
    as_of_to: zod_1.z.string(),
    columns: zod_1.z.array(zod_1.z.string()).optional(),
});
const delinquencyAsOfInputSchema = zod_1.z.object({
    property_visibility: zod_1.z.string(),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional(),
    }).optional(),
    occurred_on_to: zod_1.z.string(),
    delinquency_note_range: zod_1.z.string().optional(),
    tenant_statuses: zod_1.z.array(zod_1.z.string()).optional(),
    tags: zod_1.z.string().optional(),
    amount_owed_in_account: zod_1.z.string().optional(),
    balance_operator: zod_1.z.object({
        amount: zod_1.z.string().optional(),
        comparator: zod_1.z.string().optional()
    }).optional(),
    columns: zod_1.z.array(zod_1.z.string()).optional()
});
const guestCardInquiriesInputSchema = zod_1.z.object({
    property_visibility: zod_1.z.string().optional(),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional(),
    }).optional(),
    guest_card_sources: zod_1.z.array(zod_1.z.string()).optional(),
    guest_card_statuses: zod_1.z.array(zod_1.z.string()).optional(),
    guest_card_lead_types: zod_1.z.array(zod_1.z.string()).optional(),
    assigned_user: zod_1.z.string().optional(),
    filter_date_range_by: zod_1.z.string().optional(),
    received_on_from: zod_1.z.string(),
    received_on_to: zod_1.z.string(),
    columns: zod_1.z.array(zod_1.z.string()).optional(),
});
const leasingFunnelPerformanceInputSchema = zod_1.z.object({
    property_visibility: zod_1.z.string().optional(),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional(),
    }).optional(),
    received_on_from: zod_1.z.string(),
    received_on_to: zod_1.z.string(),
    assigned_user_visibility: zod_1.z.string().optional(),
    assigned_user: zod_1.z.string().optional(),
    columns: zod_1.z.array(zod_1.z.string()).optional(),
});
// Create the MCP server
const server = new mcp_js_1.McpServer({
    name: "appfolio-mcp",
    version: "1.0.0",
});
// Register the cashflow report as a tool (with correct argument shape)
server.tool("get_cashflow_report", "Returns Cash Flow Details including income and expenses for given time period.", cashflowInputSchema.shape, async (args, _extra) => {
    const data = await (0, appfolio_1.getCashflowReport)(args);
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
server.tool("get_property_directory_report", "Returns property directory details for the given filters.", propertyDirectoryInputSchema.shape, async (args, _extra) => {
    const data = await (0, appfolio_1.getPropertyDirectoryReport)(args);
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
server.tool("get_account_totals_report", "Returns account totals for given filters and date range.", accountTotalsInputSchema.shape, async (args, _extra) => {
    // Ensure default for gl_account_ids
    const data = await (0, appfolio_1.getAccountTotalsReport)({ ...args, gl_account_ids: args.gl_account_ids ?? "1" });
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
server.tool("get_aged_payables_summary_report", "Returns aged payables summary for the given filters.", agedPayablesSummaryInputSchema.shape, async (args, _extra) => {
    // Ensure default for property_visibility
    const data = await (0, appfolio_1.getAgedPayablesSummaryReport)({ ...args, property_visibility: args.property_visibility ?? "active" });
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
server.tool("get_aged_receivables_detail_report", "Returns aged receivables detail for the given filters.", agedReceivablesDetailInputSchema.shape, async (args, _extra) => {
    const data = await (0, appfolio_1.getAgedReceivablesDetailReport)({ ...args, property_visibility: args.property_visibility ?? "active" });
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
server.tool("get_budget_comparative_report", "Returns budget comparative report for the given filters.", budgetComparativeInputSchema.shape, async (args, _extra) => {
    const data = await (0, appfolio_1.getBudgetComparativeReport)({ ...args, property_visibility: args.property_visibility ?? "active" });
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
server.tool("get_expense_distribution_report", "Returns expense distribution report for the given filters.", expenseDistributionInputSchema.shape, async (args, _extra) => {
    const data = await (0, appfolio_1.getExpenseDistributionReport)({ ...args, property_visibility: args.property_visibility ?? "active" });
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
const transport = new stdio_js_1.StdioServerTransport();
server.tool("get_rent_roll_itemized_report", "Returns rent roll itemized report for the given filters.", rentRollItemizedInputSchema.shape, async (args, _extra) => {
    const data = await (0, appfolio_1.getRentRollItemizedReport)({ ...args, unit_visibility: args.unit_visibility ?? "active" });
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
server.tool("get_delinquency_as_of_report", "Returns delinquency as of report for the given filters.", delinquencyAsOfInputSchema.shape, async (args, _extra) => {
    const data = await (0, appfolio_1.getDelinquencyAsOfReport)(args);
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
server.tool("get_guest_card_inquiries_report", "Returns guest card inquiries report for the given filters.", guestCardInquiriesInputSchema.shape, async (args, _extra) => {
    const data = await (0, appfolio_1.getGuestCardInquiriesReport)(args);
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
server.tool("get_leasing_funnel_performance_report", "Returns leasing funnel performance report for the given filters.", leasingFunnelPerformanceInputSchema.shape, async (args, _extra) => {
    const data = await (0, appfolio_1.getLeasingFunnelPerformanceReport)(args);
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
server.connect(transport);

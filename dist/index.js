#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const zod_1 = require("zod");
const appfolio_1 = require("./appfolio");
const cashflowReport_1 = require("./reports/cashflowReport");
const accountTotalsReport_1 = require("./reports/accountTotalsReport");
const agedPayablesSummaryReport_1 = require("./reports/agedPayablesSummaryReport");
const rentRollItemizedReport_1 = require("./reports/rentRollItemizedReport");
const guestCardInquiriesReport_1 = require("./reports/guestCardInquiriesReport");
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
const delinquencyAsOfInputSchema = zod_1.z.object({
    property_visibility: zod_1.z.string().optional(),
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
    columns: zod_1.z.array(zod_1.z.enum([
        'unit', 'name', 'tenant_status', 'tags', 'phone_numbers', 'move_in', 'move_out',
        'primary_tenant_email', 'unit_type', 'property', 'property_name', 'property_id',
        'property_address', 'property_street', 'property_street2', 'property_city',
        'property_state', 'property_zip', 'amount_receivable', 'delinquent_subsidy_amount',
        '00_to30', '30_plus', '30_to60', '60_plus', '60_to90', '90_plus', 'this_month',
        'last_month', 'month_before_last', 'delinquent_rent', 'delinquency_notes',
        'certified_funds_only', 'in_collections', 'collections_agency', 'unit_id',
        'occupancy_id', 'property_group_id'
    ])).optional()
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
const annualBudgetComparativeInputSchema = zod_1.z.object({
    property_visibility: zod_1.z.string().optional().describe('Filter properties by status. Defaults to \"active\"'),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional().describe('Array of property IDs'),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional().describe('Array of property group IDs'),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional().describe('Array of portfolio IDs'),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional().describe('Array of owner IDs')
    }).optional().describe('Object containing filters based on properties, groups, portfolios, or owners'),
    occurred_on_to: zod_1.z.string().describe('The end date for the reporting period (YYYY-MM-DD). Required.'),
    additional_account_types: zod_1.z.array(zod_1.z.enum(["Asset", "Cash", "Liability", "Capital"])).optional().describe('Include additional account types beyond Income and Expense'),
    gl_account_map_id: zod_1.z.string().optional().describe('ID of the GL Account Map to use'),
    level_of_detail: zod_1.z.enum(["detail_view", "summary_view"]).optional().describe('Specify the level of detail. Defaults to \"detail_view\"'),
    columns: zod_1.z.array(zod_1.z.string()).optional().describe('Array of specific columns to include in the report')
});
const annualBudgetForecastInputSchema = zod_1.z.object({
    property_visibility: zod_1.z.enum(["active", "hidden", "all"]).optional(),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional(),
    }).optional(),
    period_from: zod_1.z.string().regex(/^\d{4}-\d{2}$/, "Period must be in YYYY-MM format"), // Required
    period_to: zod_1.z.string().regex(/^\d{4}-\d{2}$/, "Period must be in YYYY-MM format"), // Required
    consolidate: zod_1.z.enum(["0", "1"]).optional(),
    gl_account_map_id: zod_1.z.string().optional(),
    columns: zod_1.z.array(zod_1.z.string()).optional(),
});
// Zod schema for Balance Sheet Report arguments
const balanceSheetArgsSchema = zod_1.z.object({
    property_visibility: zod_1.z.enum(["active", "hidden", "all"]).optional().describe('Filter properties by status. Defaults to \"active\"'),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional().describe('Array of property IDs'),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional().describe('Array of property group IDs'),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional().describe('Array of portfolio IDs'),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional().describe('Array of owner IDs')
    }).optional().describe('Object containing filters based on properties, groups, portfolios, or owners'),
    posted_on_to: zod_1.z.string().describe('The end date for the reporting period (YYYY-MM-DD). Required.'),
    gl_account_map_id: zod_1.z.string().optional().describe('ID of the GL Account Map to use'),
    level_of_detail: zod_1.z.enum(["detail_view", "summary_view"]).optional().describe('Specify the level of detail. Defaults to \"detail_view\"'),
    include_zero_balance_gl_accounts: zod_1.z.enum(["0", "1"]).optional().describe('Include GL accounts with zero balance. Defaults to \"0\" (false)'),
    columns: zod_1.z.array(zod_1.z.string()).optional().describe('Array of specific columns to include in the report')
});
// Zod schema for Cancelled Workflows Report arguments
const cancelledWorkflowsArgsSchema = zod_1.z.object({
    attachables: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        units_ids: zod_1.z.array(zod_1.z.string()).optional(),
        tenants_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional(),
        rental_applications_ids: zod_1.z.array(zod_1.z.string()).optional(),
        guest_cards_ids: zod_1.z.array(zod_1.z.string()).optional(),
        guest_card_interests_ids: zod_1.z.array(zod_1.z.string()).optional(),
        service_requests_ids: zod_1.z.array(zod_1.z.string()).optional(),
        vendors_ids: zod_1.z.array(zod_1.z.string()).optional()
    }).optional().describe('Filter results based on specific attached entities'),
    property_visibility: zod_1.z.enum(["active", "hidden", "all"]).optional().describe('Filter properties by status. Defaults to \"active\"'),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional()
    }).optional().describe('Filter results based on properties, groups, or portfolios'),
    process_template: zod_1.z.string().optional().describe('Filter by specific process template name. Defaults to \"All\"'),
    workflow_step: zod_1.z.string().optional().describe('Filter by specific workflow step name. Defaults to \"All\"'),
    assigned_user: zod_1.z.string().optional().describe('Filter by assigned user name. Defaults to \"All\"'),
    date_range_from: zod_1.z.string().optional().describe('Start date for the cancellation date range (YYYY-MM-DD)'),
    date_range_to: zod_1.z.string().optional().describe('End date for the cancellation date range (YYYY-MM-DD)'),
    cancelled_by: zod_1.z.string().optional().describe('Filter by the user who cancelled the workflow. Defaults to \"All\"'),
    columns: zod_1.z.array(zod_1.z.string()).optional().describe('Array of specific columns to include in the report')
});
// Zod schema for Chart of Accounts Report arguments
const chartOfAccountsArgsSchema = zod_1.z.object({
    columns: zod_1.z.array(zod_1.z.string()).optional().describe('Array of specific columns to include in the report')
});
// Zod schema for Completed Workflows Report arguments
const completedWorkflowsArgsSchema = zod_1.z.object({
    attachables: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        units_ids: zod_1.z.array(zod_1.z.string()).optional(),
        tenants_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional(),
        rental_applications_ids: zod_1.z.array(zod_1.z.string()).optional(),
        guest_cards_ids: zod_1.z.array(zod_1.z.string()).optional(),
        guest_card_interests_ids: zod_1.z.array(zod_1.z.string()).optional(),
        service_requests_ids: zod_1.z.array(zod_1.z.string()).optional(),
        vendors_ids: zod_1.z.array(zod_1.z.string()).optional()
    }).optional().describe('Filter results based on specific attached entities'),
    property_visibility: zod_1.z.enum(["active", "hidden", "all"]).optional().describe('Filter properties by status. Defaults to \"active\"'),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional()
    }).optional().describe('Filter results based on properties, groups, or portfolios'),
    process_template: zod_1.z.string().optional().describe('Filter by specific process template name. Defaults to \"All\"'),
    workflow_step: zod_1.z.string().optional().describe('Filter by specific workflow step name. Defaults to \"All\"'),
    assigned_user: zod_1.z.string().optional().describe('Filter by assigned user name. Defaults to \"All\"'),
    date_range_from: zod_1.z.string().optional().describe('Start date for the completion date range (YYYY-MM-DD)'),
    date_range_to: zod_1.z.string().optional().describe('End date for the completion date range (YYYY-MM-DD)'),
    columns: zod_1.z.array(zod_1.z.string()).optional().describe('Array of specific columns to include in the report')
});
// Zod schema for Fixed Assets Report arguments
const fixedAssetsArgsSchema = zod_1.z.object({
    property_visibility: zod_1.z.enum(["active", "hidden", "all"]).optional().describe('Filter properties by status. Defaults to \"active\"'),
    unit_ids: zod_1.z.array(zod_1.z.string()).optional().describe('Array of unit IDs to filter by'),
    property: zod_1.z.object({
        property_id: zod_1.z.string().optional()
    }).optional().describe('Filter by a specific property ID'),
    include_property_level_fixed_assets: zod_1.z.enum(["0", "1"]).optional().describe('Include assets linked directly to the property. Defaults to \"1\" (true)'),
    asset_types: zod_1.z.string().optional().describe('Filter by specific asset type name. Defaults to \"All\"'),
    status: zod_1.z.string().optional().describe('Filter by asset status. Defaults to \"all\"'),
    columns: zod_1.z.array(zod_1.z.string()).optional().describe('Array of specific columns to include in the report')
});
// Zod schema for In Progress Workflows Report arguments
const inProgressWorkflowsArgsSchema = zod_1.z.object({
    attachables: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        units_ids: zod_1.z.array(zod_1.z.string()).optional(),
        tenants_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional(),
        rental_applications_ids: zod_1.z.array(zod_1.z.string()).optional(),
        guest_cards_ids: zod_1.z.array(zod_1.z.string()).optional(),
        guest_card_interests_ids: zod_1.z.array(zod_1.z.string()).optional(),
        service_requests_ids: zod_1.z.array(zod_1.z.string()).optional(),
        vendors_ids: zod_1.z.array(zod_1.z.string()).optional()
    }).optional().describe('Filter results based on specific attached entities'),
    property_visibility: zod_1.z.enum(["active", "hidden", "all"]).optional().describe('Filter properties by status. Defaults to \"active\"'),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional()
    }).optional().describe('Filter results based on properties, groups, or portfolios'),
    process_template: zod_1.z.string().optional().describe('Filter by specific process template name. Defaults to \"All\"'),
    workflow_step: zod_1.z.string().optional().describe('Filter by specific workflow step name. Defaults to \"All\"'),
    assigned_user: zod_1.z.string().optional().describe('Filter by assigned user name. Defaults to \"All\"'),
    date_range_from: zod_1.z.string().optional().describe('Start date for the due date range (YYYY-MM-DD)'),
    date_range_to: zod_1.z.string().optional().describe('End date for the due date range (YYYY-MM-DD)'),
    columns: zod_1.z.array(zod_1.z.string()).optional().describe('Array of specific columns to include in the report')
});
// Zod schema for Income Statement Date Range Report arguments
const incomeStatementDateRangeArgsSchema = zod_1.z.object({
    property_visibility: zod_1.z.enum(["active", "hidden", "all"]).optional().describe('Filter properties by status. Defaults to \"active\"'),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional()
    }).optional().describe('Filter results based on properties, groups, portfolios, or owners'),
    posted_on_from: zod_1.z.string().describe('The start date for the reporting period (YYYY-MM-DD). Required.'),
    posted_on_to: zod_1.z.string().describe('The end date for the reporting period (YYYY-MM-DD). Required.'),
    gl_account_map_id: zod_1.z.string().optional().describe('ID of the GL Account Map to use'),
    level_of_detail: zod_1.z.enum(["detail_view", "summary_view"]).optional().describe('Specify the level of detail. Defaults to \"detail_view\"'),
    include_zero_balance_gl_accounts: zod_1.z.enum(["0", "1"]).optional().describe('Include GL accounts with zero balance. Defaults to \"0\" (false)'),
    columns: zod_1.z.array(zod_1.z.string()).optional().describe('Array of specific columns to include in the report')
});
// Zod schema for Lease Expiration Detail By Month Report arguments
const leaseExpirationDetailArgsSchema = zod_1.z.object({
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional()
    }).optional().describe('Filter results based on properties, groups, portfolios, or owners'),
    unit_visibility: zod_1.z.enum(["active", "hidden", "all"]).optional().describe('Filter units by status. Defaults to \"active\"'),
    tags: zod_1.z.string().optional().describe('Filter by unit tags (comma-separated string)'),
    filter_lease_date_range_by: zod_1.z.enum(["Lease Expiration Date", "Lease Start Date", "Move-in Date"]).optional().describe('Which date field to use for the date range filter. Defaults to \"Lease Expiration Date\"'),
    ends_on_from: zod_1.z.string().regex(/^\d{4}-\d{2}$/, "Date must be in YYYY-MM format").describe('The start month for the reporting period (YYYY-MM). Required.'),
    ends_on_to: zod_1.z.string().regex(/^\d{4}-\d{2}$/, "Date must be in YYYY-MM format").describe('The end month for the reporting period (YYYY-MM). Required.'),
    exclude_occupancies_with_move_out: zod_1.z.enum(["0", "1"]).optional().describe('Exclude occupancies that have a move-out date. Defaults to \"0\" (false)'),
    exclude_month_to_month: zod_1.z.enum(["0", "1"]).optional().describe('Exclude occupancies that are month-to-month. Defaults to \"0\" (false)'),
    columns: zod_1.z.array(zod_1.z.string()).optional().describe('Array of specific columns to include in the report')
});
// Zod schema for Leasing Summary Report arguments
const leasingSummaryArgsSchema = zod_1.z.object({
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional()
    }).optional().describe('Filter results based on properties, groups, portfolios, or owners'),
    unit_visibility: zod_1.z.enum(["active", "hidden", "all"]).optional().describe('Filter units by status. Defaults to \"active\"'),
    posted_on_from: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The start date for the reporting period (YYYY-MM-DD). Required.'),
    posted_on_to: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The end date for the reporting period (YYYY-MM-DD). Required.'),
    columns: zod_1.z.array(zod_1.z.string()).optional().describe('Array of specific columns to include in the report')
});
// Zod schema for Loans Report arguments
const loansArgsSchema = zod_1.z.object({
    property_visibility: zod_1.z.enum(["active", "hidden", "all"]).optional().describe('Filter properties by status. Defaults to \"active\"'),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional()
    }).optional().describe('Filter results based on properties, groups, portfolios, or owners'),
    reference_to: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The reference date for the report (YYYY-MM-DD). Required.'),
    show_hidden_loans: zod_1.z.enum(["0", "1"]).optional().describe('Include loans marked as hidden. Defaults to \"0\" (false)'),
    columns: zod_1.z.array(zod_1.z.string()).optional().describe('Array of specific columns to include in the report')
});
// Zod schema for Occupancy Summary Report arguments
const occupancySummaryArgsSchema = zod_1.z.object({
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional()
    }).optional().describe('Filter results based on properties, groups, portfolios, or owners'),
    unit_visibility: zod_1.z.enum(["active", "hidden", "all"]).optional().describe('Filter units by status. Defaults to \"active\"'),
    as_of_to: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The \"as of\" date for the report (YYYY-MM-DD). Required.'),
    columns: zod_1.z.array(zod_1.z.string()).optional().describe('Array of specific columns to include in the report')
});
// Zod schema for Owner Leasing Report arguments
const ownerLeasingArgsSchema = zod_1.z.object({
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional()
    }).optional().describe('Filter results based on properties, groups, portfolios, or owners'),
    received_on_from: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The start date for the reporting period based on received date (YYYY-MM-DD). Required.'),
    received_on_to: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The end date for the reporting period based on received date (YYYY-MM-DD). Required.'),
    include_units_which_are_not_rent_ready: zod_1.z.enum(["0", "1"]).optional().describe('Include units that are not marked as rent ready. Defaults to \"0\" (false)'),
    include_units_which_are_hidden_from_the_vacancies_dashboard: zod_1.z.enum(["0", "1"]).optional().describe('Include units hidden from the vacancies dashboard. Defaults to \"0\" (false)'),
    columns: zod_1.z.array(zod_1.z.string()).optional().describe('Array of specific columns to include in the report')
});
// Zod schema for Property Performance Report arguments
const propertyPerformanceArgsSchema = zod_1.z.object({
    property_visibility: zod_1.z.enum(["active", "hidden", "all"]).optional().describe('Filter properties by status. Defaults to \"active\"'),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional()
    }).optional().describe('Filter results based on properties, groups, portfolios, or owners'),
    gl_account_ids: zod_1.z.array(zod_1.z.string()).optional().describe('Filter results by specific GL Account IDs'),
    posted_on_from: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The start date for the reporting period (YYYY-MM-DD). Required.'),
    posted_on_to: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The end date for the reporting period (YYYY-MM-DD). Required.'),
    columns: zod_1.z.array(zod_1.z.string()).optional().describe('Array of specific columns to include in the report')
});
// Zod schema for Property Source Tracking Report arguments
const propertySourceTrackingArgsSchema = zod_1.z.object({
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional()
    }).optional().describe('Filter results based on properties, groups, portfolios, or owners'),
    unit_visibility: zod_1.z.enum(["active", "hidden", "all"]).optional().describe('Filter units by status. Defaults to \"active\"'),
    received_on_from: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The start date for the reporting period based on received date (YYYY-MM-DD). Required.'),
    received_on_to: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The end date for the reporting period based on received date (YYYY-MM-DD). Required.'),
    columns: zod_1.z.array(zod_1.z.string()).optional().describe('Array of specific columns to include in the report')
});
// Zod schema for Receivables Activity Report arguments
const receivablesActivityArgsSchema = zod_1.z.object({
    tenant_visibility: zod_1.z.enum(["active", "inactive", "all"]).optional().describe('Filter tenants by status. Defaults to \"active\"'),
    tenant_statuses: zod_1.z.array(zod_1.z.string()).optional().describe('Filter by specific tenant statuses (e.g., [\"0\", \"4\"] for Current and Notice)'),
    property_visibility: zod_1.z.enum(["active", "hidden", "all"]).optional().describe('Filter properties by status. Defaults to \"active\"'),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional()
    }).optional().describe('Filter results based on properties, groups, portfolios, or owners'),
    receipt_date_from: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The start date for the reporting period based on receipt date (YYYY-MM-DD). Required.'),
    receipt_date_to: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The end date for the reporting period based on receipt date (YYYY-MM-DD). Required.'),
    manually_entered_only: zod_1.z.enum(["0", "1"]).optional().describe('Include only manually entered receipts. Defaults to \"0\" (false)'),
    columns: zod_1.z.array(zod_1.z.string()).optional().describe('Array of specific columns to include in the report')
});
// Zod schema for Renewal Summary Report arguments
const renewalStatusSchema = zod_1.z.enum(["all", "awaiting_response", "countersigned", "pending", "skipped", "notice_to_vacate"]);
const renewalSummaryArgsSchema = zod_1.z.object({
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional()
    }).optional().describe('Filter results based on properties, groups, portfolios, or owners'),
    unit_visibility: zod_1.z.enum(["active", "hidden", "all"]).optional().describe('Filter units by status. Defaults to \"active\"'),
    start_on_from: zod_1.z.string().regex(/^\d{4}-\d{2}$/, "Date must be in YYYY-MM format").describe('The start month for the reporting period based on lease start date (YYYY-MM). Required.'),
    start_on_to: zod_1.z.string().regex(/^\d{4}-\d{2}$/, "Date must be in YYYY-MM format").describe('The end month for the reporting period based on lease start date (YYYY-MM). Required.'),
    statuses: zod_1.z.array(renewalStatusSchema).optional().default(["all"]).describe('Filter by renewal status. Defaults to [\"all\"]'),
    include_tenant_transfers: zod_1.z.enum(["0", "1"]).optional().describe('Include tenant transfers in the report. Defaults to \"0\" (false)'),
    columns: zod_1.z.array(zod_1.z.string()).optional().describe('Array of specific columns to include in the report')
});
// Zod schema for Rental Applications Report arguments
const rentalApplicationsFilterDateRangeBySchema = zod_1.z.enum([
    "Rental Application Received Date",
    "Rental Application Decision Date"
]);
const rentalApplicationsArgsSchema = zod_1.z.object({
    property_visibility: zod_1.z.enum(["active", "hidden", "all"]).optional().describe('Filter properties by status. Defaults to \"active\"'),
    unit_ids: zod_1.z.array(zod_1.z.string()).optional().describe('Filter by specific Unit IDs'),
    property: zod_1.z.object({ property_id: zod_1.z.string() }).optional().describe('Filter by a single Property ID'),
    rental_application_statuses: zod_1.z.array(zod_1.z.string()).optional().describe('Filter by specific rental application statuses (e.g., [\"New\", \"Decision Pending\"])'),
    rental_applications_filter_date_range_by: rentalApplicationsFilterDateRangeBySchema.optional().default("Rental Application Received Date").describe('Field to use for date range filtering. Defaults to \"Rental Application Received Date\"'),
    received_on_from: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The start date for the reporting period (YYYY-MM-DD). Required.'),
    received_on_to: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The end date for the reporting period (YYYY-MM-DD). Required.'),
    columns: zod_1.z.array(zod_1.z.string()).optional().describe('Array of specific columns to include in the report')
});
// Zod schema for Resident Financial Activity Report arguments
const residentFinancialActivityArgsSchema = zod_1.z.object({
    property_visibility: zod_1.z.enum(["active", "hidden", "all"]).optional().describe('Filter properties by status. Defaults to \"active\"'),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional()
    }).optional().describe('Filter results based on properties, groups, portfolios, or owners'),
    tenant_statuses: zod_1.z.array(zod_1.z.string()).optional().describe('Filter by tenant statuses (e.g., [\"0\", \"4\"])'),
    occurred_on_from: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The start date for the reporting period (YYYY-MM-DD). Required.'),
    occurred_on_to: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The end date for the reporting period (YYYY-MM-DD). Required.'),
    gl_account_map_id: zod_1.z.string().optional().describe('Filter by a specific GL Account Map ID'),
    columns: zod_1.z.array(zod_1.z.string()).optional().describe('Array of specific columns to include in the report')
});
// Zod schema for Screening Assessment Report arguments
const screeningAssessmentArgsSchema = zod_1.z.object({
    property_visibility: zod_1.z.enum(["active", "hidden", "all"]).optional().describe('Filter properties by status. Defaults to \"active\"'),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional()
    }).optional().describe('Filter results based on properties, groups, portfolios, or owners'),
    screen_ran_at_from: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The start date for the screening ran period (YYYY-MM-DD). Required.'),
    screen_ran_at_to: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The end date for the screening ran period (YYYY-MM-DD). Required.'),
    only_show_overridden_assessments: zod_1.z.enum(["0", "1"]).optional().describe('Set to \"1\" to only show assessments that were overridden.'),
    columns: zod_1.z.array(zod_1.z.string()).optional().describe('Array of specific columns to include in the report')
});
// Zod schema for Security Deposit Funds Detail Report arguments
const securityDepositFundsDetailArgsSchema = zod_1.z.object({
    property_visibility: zod_1.z.enum(["active", "hidden", "all"]).optional().describe('Filter properties by status. Defaults to \"active\"'),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional()
    }).optional().describe('Filter results based on properties, groups, portfolios, or owners'),
    parties_ids: zod_1.z.object({
        occupancies_ids: zod_1.z.array(zod_1.z.string()).optional()
    }).optional().describe('Filter by specific occupancy IDs'),
    tenant_statuses: zod_1.z.array(zod_1.z.string()).optional().describe('Filter by tenant statuses (e.g., [\"0\", \"4\"])'),
    gl_account_ids: zod_1.z.array(zod_1.z.string()).optional().describe('Filter by specific GL Account IDs'),
    occurred_on_to: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The end date for the reporting period (YYYY-MM-DD). Required.'),
    columns: zod_1.z.array(zod_1.z.string()).optional().describe('Array of specific columns to include in the report')
});
// Zod schema for Tenant Directory Report arguments
const tenantTypeSchema = zod_1.z.enum(["all", "tenant", "cosigner", "former_tenant"]);
const tenantDirectoryArgsSchema = zod_1.z.object({
    tenant_visibility: zod_1.z.enum(["active", "hidden", "all"]).optional().default("active").describe('Filter tenants by status. Defaults to \"active\"'),
    tenant_statuses: zod_1.z.array(zod_1.z.string()).optional().describe('Filter by specific tenant statuses (e.g., [\"0\", \"4\"])'),
    tenant_types: zod_1.z.array(tenantTypeSchema).optional().default(["all"]).describe('Filter by tenant type. Defaults to [\"all\"]'),
    property_visibility: zod_1.z.enum(["active", "hidden", "all"]).optional().default("active").describe('Filter properties by status. Defaults to \"active\"'),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional()
    }).optional().describe('Filter results based on properties, groups, portfolios, or owners'),
    columns: zod_1.z.array(zod_1.z.string()).optional().describe('Array of specific columns to include in the report')
});
// Zod schema for Tenant Ledger Report arguments
const tenantLedgerArgsSchema = zod_1.z.object({
    parties_ids: zod_1.z.object({
        occupancies_ids: zod_1.z.array(zod_1.z.string()).nonempty("At least one occupancy ID is required").describe('Required. Array of occupancy IDs to filter by.')
    }).describe('Required. Specify the occupancies to include.'),
    occurred_on_from: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('Required. The start date for the reporting period (YYYY-MM-DD).'),
    occurred_on_to: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('Required. The end date for the reporting period (YYYY-MM-DD).'),
    transactions_shown: zod_1.z.enum(["tenant", "owner", "all"]).optional().default("tenant").describe('Filter transactions shown. Defaults to \"tenant\"'),
    columns: zod_1.z.array(zod_1.z.string()).optional().describe('Array of specific columns to include in the report')
});
// Zod schema for Trial Balance By Property Report arguments
const trialBalanceByPropertyArgsSchema = zod_1.z.object({
    property_visibility: zod_1.z.enum(["active", "hidden", "all"]).optional().default("active").describe('Filter properties by status. Defaults to \"active\"'),
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
// Zod schema for 12 Month Cash Flow Report arguments
const cashflow12MonthArgsSchema = zod_1.z.object({
    property_visibility: zod_1.z.enum(["active", "hidden", "all"]).optional().default("active").describe('Filter properties by status. Defaults to \"active\"'),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional()
    }).optional().describe('Filter results based on properties, groups, portfolios, or owners'),
    posted_on_from: zod_1.z.string().regex(/^\d{4}-\d{2}$/, "Date must be in YYYY-MM format").describe('Required. The start month for the reporting period (YYYY-MM).'),
    posted_on_to: zod_1.z.string().regex(/^\d{4}-\d{2}$/, "Date must be in YYYY-MM format").describe('Required. The end month for the reporting period (YYYY-MM).'),
    gl_account_map_id: zod_1.z.string().optional().describe('Optional. Filter by a specific GL Account Map ID.'),
    level_of_detail: zod_1.z.enum(["detail_view", "summary_view"]).optional().default("detail_view").describe('Level of detail. Defaults to \"detail_view\"'),
    include_zero_balance_gl_accounts: zod_1.z.boolean().optional().default(false).transform(val => val ? "1" : "0").describe('Include GL accounts with zero balance. Defaults to false.'),
    exclude_suppressed_fees: zod_1.z.boolean().optional().default(false).transform(val => val ? "1" : "0").describe('Exclude suppressed fees. Defaults to false.'),
    columns: zod_1.z.array(zod_1.z.string()).optional().describe('Array of specific columns to include in the report')
});
// Zod schema for 12 Month Income Statement Report arguments
const incomeStatement12MonthArgsSchema = zod_1.z.object({
    property_visibility: zod_1.z.enum(["active", "hidden", "all"]).optional().default("active").describe('Filter properties by status. Defaults to \"active\"'),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional()
    }).optional().describe('Filter results based on properties, groups, portfolios, or owners'),
    fund_type: zod_1.z.enum(["all", "operating", "escrow"]).optional().default("all").describe('Filter by fund type. Defaults to \"all\"'),
    posted_on_from: zod_1.z.string().regex(/^\d{4}-\d{2}$/, "Date must be in YYYY-MM format").describe('Required. The start month for the reporting period (YYYY-MM).'),
    posted_on_to: zod_1.z.string().regex(/^\d{4}-\d{2}$/, "Date must be in YYYY-MM format").describe('Required. The end month for the reporting period (YYYY-MM).'),
    gl_account_map_id: zod_1.z.string().optional().describe('Optional. Filter by a specific GL Account Map ID.'),
    level_of_detail: zod_1.z.enum(["detail_view", "summary_view"]).optional().default("detail_view").describe('Level of detail. Defaults to \"detail_view\"'),
    include_zero_balance_gl_accounts: zod_1.z.boolean().optional().default(false).transform(val => val ? "1" : "0").describe('Include GL accounts with zero balance. Defaults to false.'),
    columns: zod_1.z.array(zod_1.z.string()).optional().describe('Array of specific columns to include in the report')
});
// Zod schema for Unit Directory Report arguments
const unitDirectoryArgsSchema = zod_1.z.object({
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional()
    }).optional().describe('Filter results based on properties, groups, portfolios, or owners'),
    unit_visibility: zod_1.z.enum(["active", "hidden", "all"]).optional().default("active").describe('Filter units by status. Defaults to \"active\"'),
    tags: zod_1.z.string().optional().describe('Optional. Filter by a comma-separated list of tags (e.g., \"bbq,deck\").'),
    columns: zod_1.z.array(zod_1.z.string()).optional().describe('Array of specific columns to include in the report')
});
// Zod schema for Unit Inspection Report arguments
const unitInspectionArgsSchema = zod_1.z.object({
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional()
    }).optional().describe('Filter results based on properties, groups, portfolios, or owners'),
    unit_visibility: zod_1.z.enum(["active", "hidden", "all"]).optional().default("active").describe('Filter units by status. Defaults to \"active\"'),
    last_inspection_on_from: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional().describe('Optional. Filter units last inspected on or after this date (YYYY-MM-DD).'),
    include_blank_inspection_date: zod_1.z.boolean().optional().default(false).transform(val => val ? "1" : "0").describe('Include units with no inspection date. Defaults to false.'),
    columns: zod_1.z.array(zod_1.z.string()).optional().describe('Array of specific columns to include in the report')
});
// Zod schema for Unit Vacancy Detail Report arguments
const unitVacancyDetailArgsSchema = zod_1.z.object({
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional()
    }).optional().describe('Filter results based on properties, groups, portfolios, or owners'),
    unit_visibility: zod_1.z.enum(["active", "hidden", "all"]).optional().default("active").describe('Filter units by status. Defaults to \"active\"'),
    tags: zod_1.z.string().optional().describe('Optional. Filter by a comma-separated list of tags (e.g., \"bbq,deck\").'),
    columns: zod_1.z.array(zod_1.z.string()).optional().describe('Array of specific columns to include in the report')
});
// Zod schema for Vendor Directory Report arguments
const vendorDirectoryArgsSchema = zod_1.z.object({
    workers_comp_expiration_to: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional().describe('Optional. Filter vendors whose Workers Comp expires on or before this date (YYYY-MM-DD).'),
    liability_expiration_to: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional().describe('Optional. Filter vendors whose Liability Insurance expires on or before this date (YYYY-MM-DD).'),
    epa_expiration_to: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional().describe('Optional. Filter vendors whose EPA Certification expires on or before this date (YYYY-MM-DD).'),
    auto_insurance_expiration_to: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional().describe('Optional. Filter vendors whose Auto Insurance expires on or before this date (YYYY-MM-DD).'),
    state_license_expiration_to: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional().describe('Optional. Filter vendors whose State License expires on or before this date (YYYY-MM-DD).'),
    contract_expiration_to: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional().describe('Optional. Filter vendors whose Contract expires on or before this date (YYYY-MM-DD).'),
    tags: zod_1.z.string().optional().describe('Optional. Filter by a comma-separated list of tags (e.g., \"plumbing,hvac\").'),
    vendor_visibility: zod_1.z.enum(["active", "inactive", "all"]).optional().default("active").describe('Filter vendors by status. Defaults to \"active\"'),
    payment_type: zod_1.z.enum(["eCheck", "Check", "all"]).optional().describe('Optional. Filter by payment type (eCheck, Check, or all). Defaults to all if not specified.'),
    created_by: zod_1.z.string().optional().default("All").describe('Filter by who created the vendor. Defaults to \"All\".'), // User ID or 'All'
    vendor_type: zod_1.z.string().optional().default("All").describe('Filter by vendor type. Defaults to \"All\".'), // Vendor Type name or 'All'
    columns: zod_1.z.array(zod_1.z.string()).optional().describe('Array of specific columns to include in the report')
});
// Zod schema for Vendor Ledger Report arguments
const vendorLedgerArgsSchema = zod_1.z.object({
    party_contact_info: zod_1.z.object({
        company_id: zod_1.z.string().describe('Required. The ID of the vendor (company).')
    }).describe('Required. Specifies the vendor for the ledger report.'),
    property_visibility: zod_1.z.enum(["active", "hidden", "all"]).optional().default("active").describe('Filter properties by status. Defaults to \"active\"'),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional()
    }).optional().describe('Filter results based on properties, groups, portfolios, or owners'),
    occurred_on_from: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('Required. The start date for the reporting period (YYYY-MM-DD).'),
    occurred_on_to: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('Required. The end date for the reporting period (YYYY-MM-DD).'),
    reverse_transaction: zod_1.z.boolean().optional().default(false).transform(val => val ? "1" : "0").describe('Include reversed transactions. Defaults to false.'),
    columns: zod_1.z.array(zod_1.z.string()).optional().describe('Array of specific columns to include in the report')
});
// Zod schema for Work Order Report arguments
const workOrderArgsSchema = zod_1.z.object({
    property_visibility: zod_1.z.enum(["active", "hidden", "all"]).optional().default("active").describe('Filter properties by status. Defaults to \"active\".'),
    unit_ids: zod_1.z.array(zod_1.z.string()).optional().describe('Optional. Filter by specific unit IDs.'),
    property: zod_1.z.object({ property_id: zod_1.z.string() }).optional().describe('Optional. Filter by a single property ID.'),
    parties_ids: zod_1.z.object({ occupancies_ids: zod_1.z.array(zod_1.z.string()).optional() }).optional().describe('Optional. Filter by specific occupancy IDs.'),
    party_contact_info: zod_1.z.object({ company_id: zod_1.z.string() }).optional().describe('Optional. Filter by a specific vendor ID (company).'),
    assigned_user: zod_1.z.string().optional().default("All").describe('Filter by assigned user ID or \"All\". Defaults to \"All\".'),
    created_by: zod_1.z.string().optional().default("All").describe('Filter by creator user ID or \"All\". Defaults to \"All\".'),
    priority: zod_1.z.enum(["All", "Low", "Medium", "High", "Urgent"]).optional().default("All").describe('Filter by priority. Defaults to \"All\".'),
    from_inspection: zod_1.z.boolean().nullable().optional().describe('Optional. Filter by whether the work order originated from an inspection. Set to null to omit filter.'),
    current_estimate_approval_status: zod_1.z.enum(["All", "Pending", "Approved", "Declined"]).optional().default("All").describe('Filter by estimate approval status. Defaults to \"All\".'),
    work_order_statuses: zod_1.z.array(zod_1.z.string()).optional().describe('Optional. Filter by specific work order status IDs.'),
    work_order_types: zod_1.z.array(zod_1.z.enum(["unit_turn", "tenant_requested", "other"])).optional().describe('Optional. Filter by specific work order types.'),
    unit_turn_category: zod_1.z.array(zod_1.z.string()).optional().default(["all"]).describe('Filter by unit turn category. Defaults to [\"all\"].'),
    status_date_range_from: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional().describe('Optional. Start date for status date range filter (YYYY-MM-DD).'),
    status_date_range_to: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional().describe('Optional. End date for status date range filter (YYYY-MM-DD).'),
    status_date: zod_1.z.enum(["all", "created_at", "completed_on"]).optional().default("all").describe('Field to use for status date range filtering. Defaults to \"all\".'),
    columns: zod_1.z.array(zod_1.z.string()).optional().describe('Array of specific columns to include in the report')
});
const workOrderLaborSummaryArgsSchema = zod_1.z.object({
    property_visibility: zod_1.z.enum(["active", "hidden", "all"]).optional().default("active").describe('Optional. Filter by property visibility. Defaults to "active".'),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional(),
    }).optional(),
    maintenance_tech: zod_1.z.string().optional().describe('Optional. Filter by maintenance technician ID or "All". Defaults to "All".'),
    work_order_statuses: zod_1.z.array(zod_1.z.string()).optional().describe('Optional. Filter by specific work order status IDs.'),
    unit_turn: zod_1.z.enum(["1", "0"]).optional().default("0").describe('Filter by unit turn. "1" for true, "0" for false. Defaults to "0".'),
    labor_performed_from: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('Required. The start date for the reporting period (YYYY-MM-DD).'),
    labor_performed_to: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('Required. The end date for the reporting period (YYYY-MM-DD).'),
    columns: zod_1.z.array(zod_1.z.string()).optional().describe('Array of specific columns to include in the report')
});
// --- Owner Directory Report Input Schema ---
const ownerDirectoryColumnEnum = zod_1.z.enum([
    "name", "phone_numbers", "email", "alternative_payee", "payment_type",
    "last_payment_date", "hold_payments", "owner_packet_reports",
    "send_owner_packets_by_email", "properties_owned", "tags", "last_packet_sent",
    "address", "street", "street2", "city", "state", "zip", "country",
    "owner_id", "properties_owned_i_ds", "notes_for_the_owner", "first_name",
    "last_name", "owner_integration_id", "created_by"
]);
const ownerDirectoryInputSchema = zod_1.z.object({
    property_visibility: zod_1.z.string().optional().default("active"),
    properties: zod_1.z.object({
        properties_ids: zod_1.z.array(zod_1.z.string()).optional(),
        property_groups_ids: zod_1.z.array(zod_1.z.string()).optional(),
        portfolios_ids: zod_1.z.array(zod_1.z.string()).optional(),
        owners_ids: zod_1.z.array(zod_1.z.string()).optional(),
    }).optional(),
    tags: zod_1.z.string().optional().describe("Comma-separated list of tags, e.g., 'bbq,deck'"),
    owner_visibility: zod_1.z.string().optional().default("active"),
    created_by: zod_1.z.string().optional().default("All"),
    columns: zod_1.z.array(ownerDirectoryColumnEnum).optional().describe("List of columns to include in the report"),
});
// Create the MCP server
const server = new mcp_js_1.McpServer({
    name: "appfolio-mcp",
    version: "1.0.0",
});
const transport = new stdio_js_1.StdioServerTransport();
// --- Register Owner Directory Report Tool ---
server.tool("get_owner_directory_report", "Returns an owner directory report based on specified filters.", ownerDirectoryInputSchema.shape, async (args, _extra) => {
    const data = await (0, appfolio_1.getOwnerDirectoryReport)(args); // Cast to any for now, should match OwnerDirectoryReportArgs
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
server.tool("get_annual_budget_comparative_report", "Returns annual budget comparative report for the given filters.", annualBudgetComparativeInputSchema.shape, async (args, _extra) => {
    const data = await (0, appfolio_1.getAnnualBudgetComparativeReport)(args);
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
server.tool("get_annual_budget_forecast_report", "Returns annual budget forecast report for the given filters.", annualBudgetForecastInputSchema.shape, async (args, _extra) => {
    const data = await (0, appfolio_1.getAnnualBudgetForecastReport)(args);
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
server.tool("get_balance_sheet_report", "Returns the balance sheet report for the given filters.", balanceSheetArgsSchema.shape, async (args, _extra) => {
    const data = await (0, appfolio_1.getBalanceSheetReport)(args);
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
server.tool("get_cancelled_workflows_report", "Returns a report of cancelled workflows (processes) based on the provided filters.", cancelledWorkflowsArgsSchema.shape, async (args, _extra) => {
    const data = await (0, appfolio_1.getCancelledWorkflowsReport)(args);
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
server.tool("get_chart_of_accounts_report", "Returns the chart of accounts.", chartOfAccountsArgsSchema.shape, async (args, _extra) => {
    const data = await (0, appfolio_1.getChartOfAccountsReport)(args);
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
server.tool("get_completed_workflows_report", "Returns a report of completed workflows (processes) based on the provided filters.", completedWorkflowsArgsSchema.shape, async (args, _extra) => {
    const data = await (0, appfolio_1.getCompletedWorkflowsReport)(args);
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
server.tool("get_fixed_assets_report", "Returns a report of fixed assets based on the provided filters.", fixedAssetsArgsSchema.shape, async (args, _extra) => {
    const data = await (0, appfolio_1.getFixedAssetsReport)(args);
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
server.tool("get_in_progress_workflows_report", "Returns a report of in-progress workflows based on the provided filters.", inProgressWorkflowsArgsSchema.shape, async (args, _extra) => {
    const data = await (0, appfolio_1.getInProgressWorkflowsReport)(args);
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
server.tool("get_income_statement_date_range_report", "Returns the income statement report for a specified date range.", incomeStatementDateRangeArgsSchema.shape, async (args, _extra) => {
    const data = await (0, appfolio_1.getIncomeStatementDateRangeReport)(args);
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
server.tool("get_lease_expiration_detail_by_month_report", "Returns the lease expiration detail report, filterable by month.", leaseExpirationDetailArgsSchema.shape, async (args, _extra) => {
    const data = await (0, appfolio_1.getLeaseExpirationDetailByMonthReport)(args);
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
server.tool("get_leasing_summary_report", "Returns a summary of leasing activities for a specified date range.", leasingSummaryArgsSchema.shape, async (args, _extra) => {
    const data = await (0, appfolio_1.getLeasingSummaryReport)(args);
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
server.tool("get_loans_report", "Returns a report of loans based on the provided filters and reference date.", loansArgsSchema.shape, async (args, _extra) => {
    const data = await (0, appfolio_1.getLoansReport)(args);
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
server.tool("get_occupancy_summary_report", "Returns a summary of property occupancy as of a specified date.", occupancySummaryArgsSchema.shape, async (args, _extra) => {
    const data = await (0, appfolio_1.getOccupancySummaryReport)(args);
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
server.tool("get_owner_leasing_report", "Returns a report summarizing leasing activities relevant to owners.", ownerLeasingArgsSchema.shape, async (args, _extra) => {
    const data = await (0, appfolio_1.getOwnerLeasingReport)(args);
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
server.tool("get_property_performance_report", "Returns a report detailing property performance based on selected GL accounts and date range.", propertyPerformanceArgsSchema.shape, async (args, _extra) => {
    const data = await (0, appfolio_1.getPropertyPerformanceReport)(args);
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
server.tool("get_property_source_tracking_report", "Returns a report tracking the sources of prospects and their conversion rates.", propertySourceTrackingArgsSchema.shape, async (args, _extra) => {
    const data = await (0, appfolio_1.getPropertySourceTrackingReport)(args);
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
server.tool("get_receivables_activity_report", "Returns a report detailing receivables activity within a specified date range.", receivablesActivityArgsSchema.shape, async (args, _extra) => {
    const data = await (0, appfolio_1.getReceivablesActivityReport)(args);
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
server.tool("get_renewal_summary_report", "Returns a summary of lease renewals within a specified date range.", renewalSummaryArgsSchema.shape, async (args, _extra) => {
    const data = await (0, appfolio_1.getRenewalSummaryReport)(args);
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
server.tool("get_rental_applications_report", "Returns a detailed report of rental applications based on specified filters.", rentalApplicationsArgsSchema.shape, async (args, _extra) => {
    const data = await (0, appfolio_1.getRentalApplicationsReport)(args);
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
server.tool("get_resident_financial_activity_report", "Returns a report detailing financial activity for residents.", residentFinancialActivityArgsSchema.shape, async (args, _extra) => {
    const data = await (0, appfolio_1.getResidentFinancialActivityReport)(args);
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
server.tool("get_screening_assessment_report", "Returns a report detailing screening assessments for applicants.", screeningAssessmentArgsSchema.shape, async (args, _extra) => {
    const data = await (0, appfolio_1.getScreeningAssessmentReport)(args);
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
server.tool("get_security_deposit_funds_detail_report", "Returns a detailed report on security deposit funds.", securityDepositFundsDetailArgsSchema.shape, async (args, _extra) => {
    const data = await (0, appfolio_1.getSecurityDepositFundsDetailReport)(args);
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
server.tool("get_tenant_directory_report", "Returns a directory listing of tenants based on specified filters.", tenantDirectoryArgsSchema.shape, async (args, _extra) => {
    const data = await (0, appfolio_1.getTenantDirectoryReport)(args);
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
server.tool("get_tenant_ledger_report", "Returns a ledger report for specified tenants over a date range.", tenantLedgerArgsSchema.shape, async (args, _extra) => {
    const data = await (0, appfolio_1.getTenantLedgerReport)(args);
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
server.tool("get_trial_balance_by_property_report", "Returns a trial balance report aggregated by property.", trialBalanceByPropertyArgsSchema.shape, async (args, _extra) => {
    const data = await (0, appfolio_1.getTrialBalanceByPropertyReport)(args);
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
server.tool("get_cashflow_12_month_report", "Returns a 12-month cash flow report.", cashflow12MonthArgsSchema.shape, async (args, _extra) => {
    const data = await (0, appfolio_1.getCashflow12MonthReport)(args);
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
server.tool("get_income_statement_12_month_report", "Returns a 12-month income statement report.", incomeStatement12MonthArgsSchema.shape, async (args, _extra) => {
    const data = await (0, appfolio_1.getIncomeStatement12MonthReport)(args);
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
server.tool("get_unit_directory_report", "Returns a directory listing of units based on specified filters.", unitDirectoryArgsSchema.shape, async (args, _extra) => {
    const data = await (0, appfolio_1.getUnitDirectoryReport)(args);
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
server.tool("get_unit_inspection_report", "Returns a report on unit inspections based on specified filters.", unitInspectionArgsSchema.shape, async (args, _extra) => {
    const data = await (0, appfolio_1.getUnitInspectionReport)(args);
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
server.tool("get_unit_vacancy_detail_report", "Returns a detailed report on unit vacancies based on specified filters.", unitVacancyDetailArgsSchema.shape, async (args, _extra) => {
    const data = await (0, appfolio_1.getUnitVacancyDetailReport)(args);
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
server.tool("get_vendor_directory_report", "Returns a directory listing of vendors based on specified filters.", vendorDirectoryArgsSchema.shape, async (args, _extra) => {
    const data = await (0, appfolio_1.getVendorDirectoryReport)(args);
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
server.tool("get_vendor_ledger_report", "Returns a ledger report for a specific vendor based on specified filters.", vendorLedgerArgsSchema.shape, async (args, _extra) => {
    const data = await (0, appfolio_1.getVendorLedgerReport)(args);
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
server.tool("get_work_order_report", "Returns a report detailing work orders based on specified filters.", workOrderArgsSchema.shape, async (args, _extra) => {
    const data = await (0, appfolio_1.getWorkOrderReport)(args);
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
server.tool("get_work_order_labor_summary_report", "Returns a report detailing work order labor based on specified filters.", workOrderLaborSummaryArgsSchema.shape, async (args, _extra) => {
    const data = await (0, appfolio_1.getWorkOrderLaborSummaryReport)(args);
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
(0, accountTotalsReport_1.registerAccountTotalsReportTool)(server);
(0, cashflowReport_1.registerCashflowReportTool)(server);
(0, agedPayablesSummaryReport_1.registerAgedPayablesSummaryReportTool)(server);
(0, rentRollItemizedReport_1.registerRentRollItemizedReportTool)(server);
(0, guestCardInquiriesReport_1.registerGuestCardInquiriesReportTool)(server);
server.connect(transport);

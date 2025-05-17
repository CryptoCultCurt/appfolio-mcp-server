#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  getAccountTotalsReport, getAgedPayablesSummaryReport, getAgedReceivablesDetailReport, getAnnualBudgetComparativeReport,
  getAnnualBudgetForecastReport, getBalanceSheetReport, getBudgetComparativeReport, getCancelledWorkflowsReport,
  getChartOfAccountsReport, getCompletedWorkflowsReport, getFixedAssetsReport, getInProgressWorkflowsReport,
  getIncomeStatementDateRangeReport, getLeaseExpirationDetailByMonthReport, getLeasingSummaryReport, getLoansReport, 
  getOccupancySummaryReport, getOwnerLeasingReport, getPropertyPerformanceReport, getPropertySourceTrackingReport, 
  getReceivablesActivityReport, getRenewalSummaryReport, getRentalApplicationsReport, getResidentFinancialActivityReport, 
  getScreeningAssessmentReport, getSecurityDepositFundsDetailReport, getTenantDirectoryReport, getTenantLedgerReport, 
  getTrialBalanceByPropertyReport, getCashflow12MonthReport, getIncomeStatement12MonthReport, getUnitDirectoryReport, 
  getUnitInspectionReport, getUnitVacancyDetailReport, getVendorDirectoryReport, getVendorLedgerReport, getWorkOrderReport, 
  getWorkOrderLaborSummaryReport, getCashflowReport, getDelinquencyAsOfReport, getExpenseDistributionReport, getGuestCardInquiriesReport,
  getLeasingFunnelPerformanceReport, getPropertyDirectoryReport, getRentRollItemizedReport, getOwnerDirectoryReport, DelinquencyAsOfArgs
} from "./appfolio";

// Zod schema for Cash Flow Report arguments
const cashflowInputSchema = z.object({
  property_visibility: z.string(),
  properties: z.object({
    properties_ids: z.array(z.string()).optional(),
    property_groups_ids: z.array(z.string()).optional(),
    portfolios_ids: z.array(z.string()).optional(),
    owners_ids: z.array(z.string()).optional(),
  }).optional(),
  posted_on_from: z.string(),
  posted_on_to: z.string(),
  gl_account_map_id: z.string().optional(),
  exclude_suppressed_fees: z.string().optional(),
  columns: z.array(z.string()).optional(),
});

const propertyDirectoryInputSchema = z.object({
  property_visibility: z.string(),
  properties: z.object({
    properties_ids: z.array(z.string()).optional(),
    property_groups_ids: z.array(z.string()).optional(),
    portfolios_ids: z.array(z.string()).optional(),
    owners_ids: z.array(z.string()).optional(),
  }).optional(),
  columns: z.array(z.string()).optional()
});

const accountTotalsInputSchema = z.object({
  property_visibility: z.string(),
  properties: z.object({
    properties_ids: z.array(z.string()).optional(),
    property_groups_ids: z.array(z.string()).optional(),
    portfolios_ids: z.array(z.string()).optional(),
    owners_ids: z.array(z.string()).optional(),
  }).optional(),
  gl_account_ids: z.string().default("[1,2]"),
  posted_on_from: z.string(),
  posted_on_to: z.string(),
  columns: z.array(z.string()).optional(),
});

const agedPayablesSummaryInputSchema = z.object({
  property_visibility: z.string().default("active"),
  properties: z.object({
    properties_ids: z.array(z.string()).optional(),
    property_groups_ids: z.array(z.string()).optional(),
    portfolios_ids: z.array(z.string()).optional(),
    owners_ids: z.array(z.string()).optional(),
  }).optional(),
  occurred_on_to: z.string(),
  party_contact_info: z.object({
    company_id: z.string().optional()
  }).optional(),
  balance_operator: z.object({
    amount: z.string().optional(),
    comparator: z.string().optional()
  }).optional(),
  columns: z.array(z.string()).optional(),
});

const agedReceivablesDetailInputSchema = z.object({
  property_visibility: z.string().default("active"),
  properties: z.object({
    properties_ids: z.array(z.string()).optional(),
    property_groups_ids: z.array(z.string()).optional(),
    portfolios_ids: z.array(z.string()).optional(),
    owners_ids: z.array(z.string()).optional(),
  }).optional(),
  tags: z.string().optional(),
  balance_operator: z.object({
    amount: z.string().optional(),
    comparator: z.string().optional()
  }).optional(),
  tenant_statuses: z.array(z.string()).optional(),
  occurred_on_to: z.string(),
  gl_account_map_id: z.string().optional(),
  columns: z.array(z.string()).optional(),
});

const budgetComparativeInputSchema = z.object({
  property_visibility: z.string().default("active"),
  properties: z.object({
    properties_ids: z.array(z.string()).optional(),
    property_groups_ids: z.array(z.string()).optional(),
    portfolios_ids: z.array(z.string()).optional(),
    owners_ids: z.array(z.string()).optional(),
  }).optional(),
  period_from: z.string(),
  period_to: z.string(),
  comparison_period_from: z.string(),
  comparison_period_to: z.string(),
  additional_account_types: z.array(z.string()).optional(),
  gl_account_map_id: z.string().optional(),
  level_of_detail: z.string().optional(),
  columns: z.array(z.string()).optional(),
});

const expenseDistributionInputSchema = z.object({
  property_visibility: z.string().default("active"),
  properties: z.object({
    properties_ids: z.array(z.string()).optional(),
    property_groups_ids: z.array(z.string()).optional(),
    portfolios_ids: z.array(z.string()).optional(),
    owners_ids: z.array(z.string()).optional(),
  }).optional(),
  party_contact_info: z.object({
    company_id: z.string().optional(),
  }).optional(),
  posted_on_from: z.string(),
  posted_on_to: z.string(),
  gl_account_map_id: z.string().optional(),
  columns: z.array(z.string()).optional(),
});

const rentRollItemizedInputSchema = z.object({
  properties: z.object({
    properties_ids: z.array(z.string()).optional(),
    property_groups_ids: z.array(z.string()).optional(),
    portfolios_ids: z.array(z.string()).optional(),
    owners_ids: z.array(z.string()).optional(),
  }).optional(),
  unit_visibility: z.string().optional(),
  tags: z.string().optional(),
  gl_account_ids: z.array(z.string()).optional(),
  as_of_to: z.string(),
  columns: z.array(z.string()).optional(),
});

const delinquencyAsOfInputSchema = z.object({
  property_visibility: z.string().optional(),
  properties: z.object({
    properties_ids: z.array(z.string()).optional(),
    property_groups_ids: z.array(z.string()).optional(),
    portfolios_ids: z.array(z.string()).optional(),
    owners_ids: z.array(z.string()).optional(),
  }).optional(),
  occurred_on_to: z.string(),
  delinquency_note_range: z.string().optional(),
  tenant_statuses: z.array(z.string()).optional(),
  tags: z.string().optional(),
  amount_owed_in_account: z.string().optional(),
  balance_operator: z.object({
    amount: z.string().optional(),
    comparator: z.string().optional()
  }).optional(),
  columns: z.array(z.enum([
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

const guestCardInquiriesInputSchema = z.object({
  property_visibility: z.string().optional(),
  properties: z.object({
    properties_ids: z.array(z.string()).optional(),
    property_groups_ids: z.array(z.string()).optional(),
    portfolios_ids: z.array(z.string()).optional(),
    owners_ids: z.array(z.string()).optional(),
  }).optional(),
  guest_card_sources: z.array(z.string()).optional(),
  guest_card_statuses: z.array(z.string()).optional(),
  guest_card_lead_types: z.array(z.string()).optional(),
  assigned_user: z.string().optional(),
  filter_date_range_by: z.string().optional(),
  received_on_from: z.string(),
  received_on_to: z.string(),
  columns: z.array(z.string()).optional(),
});

const leasingFunnelPerformanceInputSchema = z.object({
  property_visibility: z.string().optional(),
  properties: z.object({
    properties_ids: z.array(z.string()).optional(),
    property_groups_ids: z.array(z.string()).optional(),
    portfolios_ids: z.array(z.string()).optional(),
    owners_ids: z.array(z.string()).optional(),
  }).optional(),
  received_on_from: z.string(),
  received_on_to: z.string(),
  assigned_user_visibility: z.string().optional(),
  assigned_user: z.string().optional(),
  columns: z.array(z.string()).optional(),
});

const annualBudgetComparativeInputSchema = z.object({
  property_visibility: z.string().optional().describe('Filter properties by status. Defaults to \"active\"'),
  properties: z.object({
    properties_ids: z.array(z.string()).optional().describe('Array of property IDs'),
    property_groups_ids: z.array(z.string()).optional().describe('Array of property group IDs'),
    portfolios_ids: z.array(z.string()).optional().describe('Array of portfolio IDs'),
    owners_ids: z.array(z.string()).optional().describe('Array of owner IDs')
  }).optional().describe('Object containing filters based on properties, groups, portfolios, or owners'),
  occurred_on_to: z.string().describe('The end date for the reporting period (YYYY-MM-DD). Required.'),
  additional_account_types: z.array(z.enum(["Asset", "Cash", "Liability", "Capital"])).optional().describe('Include additional account types beyond Income and Expense'),
  gl_account_map_id: z.string().optional().describe('ID of the GL Account Map to use'),
  level_of_detail: z.enum(["detail_view", "summary_view"]).optional().describe('Specify the level of detail. Defaults to \"detail_view\"'),
  columns: z.array(z.string()).optional().describe('Array of specific columns to include in the report')
});

const annualBudgetForecastInputSchema = z.object({
  property_visibility: z.enum(["active", "hidden", "all"]).optional(),
  properties: z.object({
    properties_ids: z.array(z.string()).optional(),
    property_groups_ids: z.array(z.string()).optional(),
    portfolios_ids: z.array(z.string()).optional(),
    owners_ids: z.array(z.string()).optional(),
  }).optional(),
  period_from: z.string().regex(/^\d{4}-\d{2}$/, "Period must be in YYYY-MM format"), // Required
  period_to: z.string().regex(/^\d{4}-\d{2}$/, "Period must be in YYYY-MM format"),   // Required
  consolidate: z.enum(["0", "1"]).optional(),
  gl_account_map_id: z.string().optional(),
  columns: z.array(z.string()).optional(),
});

// Zod schema for Balance Sheet Report arguments
const balanceSheetArgsSchema = z.object({
  property_visibility: z.enum(["active", "hidden", "all"]).optional().describe('Filter properties by status. Defaults to \"active\"'),
  properties: z.object({
    properties_ids: z.array(z.string()).optional().describe('Array of property IDs'),
    property_groups_ids: z.array(z.string()).optional().describe('Array of property group IDs'),
    portfolios_ids: z.array(z.string()).optional().describe('Array of portfolio IDs'),
    owners_ids: z.array(z.string()).optional().describe('Array of owner IDs')
  }).optional().describe('Object containing filters based on properties, groups, portfolios, or owners'),
  posted_on_to: z.string().describe('The end date for the reporting period (YYYY-MM-DD). Required.'),
  gl_account_map_id: z.string().optional().describe('ID of the GL Account Map to use'),
  level_of_detail: z.enum(["detail_view", "summary_view"]).optional().describe('Specify the level of detail. Defaults to \"detail_view\"'),
  include_zero_balance_gl_accounts: z.enum(["0", "1"]).optional().describe('Include GL accounts with zero balance. Defaults to \"0\" (false)'),
  columns: z.array(z.string()).optional().describe('Array of specific columns to include in the report')
});

// Zod schema for Cancelled Workflows Report arguments
const cancelledWorkflowsArgsSchema = z.object({
  attachables: z.object({
    properties_ids: z.array(z.string()).optional(),
    units_ids: z.array(z.string()).optional(),
    tenants_ids: z.array(z.string()).optional(),
    owners_ids: z.array(z.string()).optional(),
    rental_applications_ids: z.array(z.string()).optional(),
    guest_cards_ids: z.array(z.string()).optional(),
    guest_card_interests_ids: z.array(z.string()).optional(),
    service_requests_ids: z.array(z.string()).optional(),
    vendors_ids: z.array(z.string()).optional()
  }).optional().describe('Filter results based on specific attached entities'),
  property_visibility: z.enum(["active", "hidden", "all"]).optional().describe('Filter properties by status. Defaults to \"active\"'),
  properties: z.object({
    properties_ids: z.array(z.string()).optional(),
    property_groups_ids: z.array(z.string()).optional(),
    portfolios_ids: z.array(z.string()).optional()
  }).optional().describe('Filter results based on properties, groups, or portfolios'),
  process_template: z.string().optional().describe('Filter by specific process template name. Defaults to \"All\"'),
  workflow_step: z.string().optional().describe('Filter by specific workflow step name. Defaults to \"All\"'),
  assigned_user: z.string().optional().describe('Filter by assigned user name. Defaults to \"All\"'),
  date_range_from: z.string().optional().describe('Start date for the cancellation date range (YYYY-MM-DD)'),
  date_range_to: z.string().optional().describe('End date for the cancellation date range (YYYY-MM-DD)'),
  cancelled_by: z.string().optional().describe('Filter by the user who cancelled the workflow. Defaults to \"All\"'),
  columns: z.array(z.string()).optional().describe('Array of specific columns to include in the report')
});

// Zod schema for Chart of Accounts Report arguments
const chartOfAccountsArgsSchema = z.object({
  columns: z.array(z.string()).optional().describe('Array of specific columns to include in the report')
});

// Zod schema for Completed Workflows Report arguments
const completedWorkflowsArgsSchema = z.object({
  attachables: z.object({
    properties_ids: z.array(z.string()).optional(),
    units_ids: z.array(z.string()).optional(),
    tenants_ids: z.array(z.string()).optional(),
    owners_ids: z.array(z.string()).optional(),
    rental_applications_ids: z.array(z.string()).optional(),
    guest_cards_ids: z.array(z.string()).optional(),
    guest_card_interests_ids: z.array(z.string()).optional(),
    service_requests_ids: z.array(z.string()).optional(),
    vendors_ids: z.array(z.string()).optional()
  }).optional().describe('Filter results based on specific attached entities'),
  property_visibility: z.enum(["active", "hidden", "all"]).optional().describe('Filter properties by status. Defaults to \"active\"'),
  properties: z.object({
    properties_ids: z.array(z.string()).optional(),
    property_groups_ids: z.array(z.string()).optional(),
    portfolios_ids: z.array(z.string()).optional()
  }).optional().describe('Filter results based on properties, groups, or portfolios'),
  process_template: z.string().optional().describe('Filter by specific process template name. Defaults to \"All\"'),
  workflow_step: z.string().optional().describe('Filter by specific workflow step name. Defaults to \"All\"'),
  assigned_user: z.string().optional().describe('Filter by assigned user name. Defaults to \"All\"'),
  date_range_from: z.string().optional().describe('Start date for the completion date range (YYYY-MM-DD)'),
  date_range_to: z.string().optional().describe('End date for the completion date range (YYYY-MM-DD)'),
  columns: z.array(z.string()).optional().describe('Array of specific columns to include in the report')
});

// Zod schema for Fixed Assets Report arguments
const fixedAssetsArgsSchema = z.object({
  property_visibility: z.enum(["active", "hidden", "all"]).optional().describe('Filter properties by status. Defaults to \"active\"'),
  unit_ids: z.array(z.string()).optional().describe('Array of unit IDs to filter by'),
  property: z.object({
    property_id: z.string().optional()
  }).optional().describe('Filter by a specific property ID'),
  include_property_level_fixed_assets: z.enum(["0", "1"]).optional().describe('Include assets linked directly to the property. Defaults to \"1\" (true)'),
  asset_types: z.string().optional().describe('Filter by specific asset type name. Defaults to \"All\"'),
  status: z.string().optional().describe('Filter by asset status. Defaults to \"all\"'),
  columns: z.array(z.string()).optional().describe('Array of specific columns to include in the report')
});

// Zod schema for In Progress Workflows Report arguments
const inProgressWorkflowsArgsSchema = z.object({
  attachables: z.object({
    properties_ids: z.array(z.string()).optional(),
    units_ids: z.array(z.string()).optional(),
    tenants_ids: z.array(z.string()).optional(),
    owners_ids: z.array(z.string()).optional(),
    rental_applications_ids: z.array(z.string()).optional(),
    guest_cards_ids: z.array(z.string()).optional(),
    guest_card_interests_ids: z.array(z.string()).optional(),
    service_requests_ids: z.array(z.string()).optional(),
    vendors_ids: z.array(z.string()).optional()
  }).optional().describe('Filter results based on specific attached entities'),
  property_visibility: z.enum(["active", "hidden", "all"]).optional().describe('Filter properties by status. Defaults to \"active\"'),
  properties: z.object({
    properties_ids: z.array(z.string()).optional(),
    property_groups_ids: z.array(z.string()).optional(),
    portfolios_ids: z.array(z.string()).optional()
  }).optional().describe('Filter results based on properties, groups, or portfolios'),
  process_template: z.string().optional().describe('Filter by specific process template name. Defaults to \"All\"'),
  workflow_step: z.string().optional().describe('Filter by specific workflow step name. Defaults to \"All\"'),
  assigned_user: z.string().optional().describe('Filter by assigned user name. Defaults to \"All\"'),
  date_range_from: z.string().optional().describe('Start date for the due date range (YYYY-MM-DD)'),
  date_range_to: z.string().optional().describe('End date for the due date range (YYYY-MM-DD)'),
  columns: z.array(z.string()).optional().describe('Array of specific columns to include in the report')
});

// Zod schema for Income Statement Date Range Report arguments
const incomeStatementDateRangeArgsSchema = z.object({
  property_visibility: z.enum(["active", "hidden", "all"]).optional().describe('Filter properties by status. Defaults to \"active\"'),
  properties: z.object({
    properties_ids: z.array(z.string()).optional(),
    property_groups_ids: z.array(z.string()).optional(),
    portfolios_ids: z.array(z.string()).optional(),
    owners_ids: z.array(z.string()).optional()
  }).optional().describe('Filter results based on properties, groups, portfolios, or owners'),
  posted_on_from: z.string().describe('The start date for the reporting period (YYYY-MM-DD). Required.'),
  posted_on_to: z.string().describe('The end date for the reporting period (YYYY-MM-DD). Required.'),
  gl_account_map_id: z.string().optional().describe('ID of the GL Account Map to use'),
  level_of_detail: z.enum(["detail_view", "summary_view"]).optional().describe('Specify the level of detail. Defaults to \"detail_view\"'),
  include_zero_balance_gl_accounts: z.enum(["0", "1"]).optional().describe('Include GL accounts with zero balance. Defaults to \"0\" (false)'),
  columns: z.array(z.string()).optional().describe('Array of specific columns to include in the report')
});

// Zod schema for Lease Expiration Detail By Month Report arguments
const leaseExpirationDetailArgsSchema = z.object({
  properties: z.object({
    properties_ids: z.array(z.string()).optional(),
    property_groups_ids: z.array(z.string()).optional(),
    portfolios_ids: z.array(z.string()).optional(),
    owners_ids: z.array(z.string()).optional()
  }).optional().describe('Filter results based on properties, groups, portfolios, or owners'),
  unit_visibility: z.enum(["active", "hidden", "all"]).optional().describe('Filter units by status. Defaults to \"active\"'),
  tags: z.string().optional().describe('Filter by unit tags (comma-separated string)'),
  filter_lease_date_range_by: z.enum(["Lease Expiration Date", "Lease Start Date", "Move-in Date"]).optional().describe('Which date field to use for the date range filter. Defaults to \"Lease Expiration Date\"'),
  ends_on_from: z.string().regex(/^\d{4}-\d{2}$/, "Date must be in YYYY-MM format").describe('The start month for the reporting period (YYYY-MM). Required.'),
  ends_on_to: z.string().regex(/^\d{4}-\d{2}$/, "Date must be in YYYY-MM format").describe('The end month for the reporting period (YYYY-MM). Required.'),
  exclude_occupancies_with_move_out: z.enum(["0", "1"]).optional().describe('Exclude occupancies that have a move-out date. Defaults to \"0\" (false)'),
  exclude_month_to_month: z.enum(["0", "1"]).optional().describe('Exclude occupancies that are month-to-month. Defaults to \"0\" (false)'),
  columns: z.array(z.string()).optional().describe('Array of specific columns to include in the report')
});

// Zod schema for Leasing Summary Report arguments
const leasingSummaryArgsSchema = z.object({
  properties: z.object({
    properties_ids: z.array(z.string()).optional(),
    property_groups_ids: z.array(z.string()).optional(),
    portfolios_ids: z.array(z.string()).optional(),
    owners_ids: z.array(z.string()).optional()
  }).optional().describe('Filter results based on properties, groups, portfolios, or owners'),
  unit_visibility: z.enum(["active", "hidden", "all"]).optional().describe('Filter units by status. Defaults to \"active\"'),
  posted_on_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The start date for the reporting period (YYYY-MM-DD). Required.'),
  posted_on_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The end date for the reporting period (YYYY-MM-DD). Required.'),
  columns: z.array(z.string()).optional().describe('Array of specific columns to include in the report')
});

// Zod schema for Loans Report arguments
const loansArgsSchema = z.object({
  property_visibility: z.enum(["active", "hidden", "all"]).optional().describe('Filter properties by status. Defaults to \"active\"'),
  properties: z.object({
    properties_ids: z.array(z.string()).optional(),
    property_groups_ids: z.array(z.string()).optional(),
    portfolios_ids: z.array(z.string()).optional(),
    owners_ids: z.array(z.string()).optional()
  }).optional().describe('Filter results based on properties, groups, portfolios, or owners'),
  reference_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The reference date for the report (YYYY-MM-DD). Required.'),
  show_hidden_loans: z.enum(["0", "1"]).optional().describe('Include loans marked as hidden. Defaults to \"0\" (false)'),
  columns: z.array(z.string()).optional().describe('Array of specific columns to include in the report')
});

// Zod schema for Occupancy Summary Report arguments
const occupancySummaryArgsSchema = z.object({
  properties: z.object({
    properties_ids: z.array(z.string()).optional(),
    property_groups_ids: z.array(z.string()).optional(),
    portfolios_ids: z.array(z.string()).optional(),
    owners_ids: z.array(z.string()).optional()
  }).optional().describe('Filter results based on properties, groups, portfolios, or owners'),
  unit_visibility: z.enum(["active", "hidden", "all"]).optional().describe('Filter units by status. Defaults to \"active\"'),
  as_of_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The \"as of\" date for the report (YYYY-MM-DD). Required.'),
  columns: z.array(z.string()).optional().describe('Array of specific columns to include in the report')
});

// Zod schema for Owner Leasing Report arguments
const ownerLeasingArgsSchema = z.object({
  properties: z.object({
    properties_ids: z.array(z.string()).optional(),
    property_groups_ids: z.array(z.string()).optional(),
    portfolios_ids: z.array(z.string()).optional(),
    owners_ids: z.array(z.string()).optional()
  }).optional().describe('Filter results based on properties, groups, portfolios, or owners'),
  received_on_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The start date for the reporting period based on received date (YYYY-MM-DD). Required.'),
  received_on_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The end date for the reporting period based on received date (YYYY-MM-DD). Required.'),
  include_units_which_are_not_rent_ready: z.enum(["0", "1"]).optional().describe('Include units that are not marked as rent ready. Defaults to \"0\" (false)'),
  include_units_which_are_hidden_from_the_vacancies_dashboard: z.enum(["0", "1"]).optional().describe('Include units hidden from the vacancies dashboard. Defaults to \"0\" (false)'),
  columns: z.array(z.string()).optional().describe('Array of specific columns to include in the report')
});

// Zod schema for Property Performance Report arguments
const propertyPerformanceArgsSchema = z.object({
  property_visibility: z.enum(["active", "hidden", "all"]).optional().describe('Filter properties by status. Defaults to \"active\"'),
  properties: z.object({
    properties_ids: z.array(z.string()).optional(),
    property_groups_ids: z.array(z.string()).optional(),
    portfolios_ids: z.array(z.string()).optional(),
    owners_ids: z.array(z.string()).optional()
  }).optional().describe('Filter results based on properties, groups, portfolios, or owners'),
  gl_account_ids: z.array(z.string()).optional().describe('Filter results by specific GL Account IDs'),
  posted_on_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The start date for the reporting period (YYYY-MM-DD). Required.'),
  posted_on_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The end date for the reporting period (YYYY-MM-DD). Required.'),
  columns: z.array(z.string()).optional().describe('Array of specific columns to include in the report')
});

// Zod schema for Property Source Tracking Report arguments
const propertySourceTrackingArgsSchema = z.object({
  properties: z.object({
    properties_ids: z.array(z.string()).optional(),
    property_groups_ids: z.array(z.string()).optional(),
    portfolios_ids: z.array(z.string()).optional(),
    owners_ids: z.array(z.string()).optional()
  }).optional().describe('Filter results based on properties, groups, portfolios, or owners'),
  unit_visibility: z.enum(["active", "hidden", "all"]).optional().describe('Filter units by status. Defaults to \"active\"'),
  received_on_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The start date for the reporting period based on received date (YYYY-MM-DD). Required.'),
  received_on_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The end date for the reporting period based on received date (YYYY-MM-DD). Required.'),
  columns: z.array(z.string()).optional().describe('Array of specific columns to include in the report')
});

// Zod schema for Receivables Activity Report arguments
const receivablesActivityArgsSchema = z.object({
  tenant_visibility: z.enum(["active", "inactive", "all"]).optional().describe('Filter tenants by status. Defaults to \"active\"'),
  tenant_statuses: z.array(z.string()).optional().describe('Filter by specific tenant statuses (e.g., [\"0\", \"4\"] for Current and Notice)'),
  property_visibility: z.enum(["active", "hidden", "all"]).optional().describe('Filter properties by status. Defaults to \"active\"'),
  properties: z.object({
    properties_ids: z.array(z.string()).optional(),
    property_groups_ids: z.array(z.string()).optional(),
    portfolios_ids: z.array(z.string()).optional(),
    owners_ids: z.array(z.string()).optional()
  }).optional().describe('Filter results based on properties, groups, portfolios, or owners'),
  receipt_date_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The start date for the reporting period based on receipt date (YYYY-MM-DD). Required.'),
  receipt_date_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The end date for the reporting period based on receipt date (YYYY-MM-DD). Required.'),
  manually_entered_only: z.enum(["0", "1"]).optional().describe('Include only manually entered receipts. Defaults to \"0\" (false)'),
  columns: z.array(z.string()).optional().describe('Array of specific columns to include in the report')
});

// Zod schema for Renewal Summary Report arguments
const renewalStatusSchema = z.enum(["all", "awaiting_response", "countersigned", "pending", "skipped", "notice_to_vacate"]);
const renewalSummaryArgsSchema = z.object({
  properties: z.object({
    properties_ids: z.array(z.string()).optional(),
    property_groups_ids: z.array(z.string()).optional(),
    portfolios_ids: z.array(z.string()).optional(),
    owners_ids: z.array(z.string()).optional()
  }).optional().describe('Filter results based on properties, groups, portfolios, or owners'),
  unit_visibility: z.enum(["active", "hidden", "all"]).optional().describe('Filter units by status. Defaults to \"active\"'),
  start_on_from: z.string().regex(/^\d{4}-\d{2}$/, "Date must be in YYYY-MM format").describe('The start month for the reporting period based on lease start date (YYYY-MM). Required.'),
  start_on_to: z.string().regex(/^\d{4}-\d{2}$/, "Date must be in YYYY-MM format").describe('The end month for the reporting period based on lease start date (YYYY-MM). Required.'),
  statuses: z.array(renewalStatusSchema).optional().default(["all"]).describe('Filter by renewal status. Defaults to [\"all\"]'),
  include_tenant_transfers: z.enum(["0", "1"]).optional().describe('Include tenant transfers in the report. Defaults to \"0\" (false)'),
  columns: z.array(z.string()).optional().describe('Array of specific columns to include in the report')
});

// Zod schema for Rental Applications Report arguments
const rentalApplicationsFilterDateRangeBySchema = z.enum([
  "Rental Application Received Date",
  "Rental Application Decision Date"
]);
const rentalApplicationsArgsSchema = z.object({
  property_visibility: z.enum(["active", "hidden", "all"]).optional().describe('Filter properties by status. Defaults to \"active\"'),
  unit_ids: z.array(z.string()).optional().describe('Filter by specific Unit IDs'),
  property: z.object({ property_id: z.string() }).optional().describe('Filter by a single Property ID'),
  rental_application_statuses: z.array(z.string()).optional().describe('Filter by specific rental application statuses (e.g., [\"New\", \"Decision Pending\"])'),
  rental_applications_filter_date_range_by: rentalApplicationsFilterDateRangeBySchema.optional().default("Rental Application Received Date").describe('Field to use for date range filtering. Defaults to \"Rental Application Received Date\"'),
  received_on_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The start date for the reporting period (YYYY-MM-DD). Required.'),
  received_on_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The end date for the reporting period (YYYY-MM-DD). Required.'),
  columns: z.array(z.string()).optional().describe('Array of specific columns to include in the report')
});

// Zod schema for Resident Financial Activity Report arguments
const residentFinancialActivityArgsSchema = z.object({
  property_visibility: z.enum(["active", "hidden", "all"]).optional().describe('Filter properties by status. Defaults to \"active\"'),
  properties: z.object({
    properties_ids: z.array(z.string()).optional(),
    property_groups_ids: z.array(z.string()).optional(),
    portfolios_ids: z.array(z.string()).optional(),
    owners_ids: z.array(z.string()).optional()
  }).optional().describe('Filter results based on properties, groups, portfolios, or owners'),
  tenant_statuses: z.array(z.string()).optional().describe('Filter by tenant statuses (e.g., [\"0\", \"4\"])'),
  occurred_on_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The start date for the reporting period (YYYY-MM-DD). Required.'),
  occurred_on_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The end date for the reporting period (YYYY-MM-DD). Required.'),
  gl_account_map_id: z.string().optional().describe('Filter by a specific GL Account Map ID'),
  columns: z.array(z.string()).optional().describe('Array of specific columns to include in the report')
});

// Zod schema for Screening Assessment Report arguments
const screeningAssessmentArgsSchema = z.object({
  property_visibility: z.enum(["active", "hidden", "all"]).optional().describe('Filter properties by status. Defaults to \"active\"'),
  properties: z.object({
    properties_ids: z.array(z.string()).optional(),
    property_groups_ids: z.array(z.string()).optional(),
    portfolios_ids: z.array(z.string()).optional(),
    owners_ids: z.array(z.string()).optional()
  }).optional().describe('Filter results based on properties, groups, portfolios, or owners'),
  screen_ran_at_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The start date for the screening ran period (YYYY-MM-DD). Required.'),
  screen_ran_at_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The end date for the screening ran period (YYYY-MM-DD). Required.'),
  only_show_overridden_assessments: z.enum(["0", "1"]).optional().describe('Set to \"1\" to only show assessments that were overridden.'),
  columns: z.array(z.string()).optional().describe('Array of specific columns to include in the report')
});

// Zod schema for Security Deposit Funds Detail Report arguments
const securityDepositFundsDetailArgsSchema = z.object({
  property_visibility: z.enum(["active", "hidden", "all"]).optional().describe('Filter properties by status. Defaults to \"active\"'),
  properties: z.object({
    properties_ids: z.array(z.string()).optional(),
    property_groups_ids: z.array(z.string()).optional(),
    portfolios_ids: z.array(z.string()).optional(),
    owners_ids: z.array(z.string()).optional()
  }).optional().describe('Filter results based on properties, groups, portfolios, or owners'),
  parties_ids: z.object({
    occupancies_ids: z.array(z.string()).optional()
  }).optional().describe('Filter by specific occupancy IDs'),
  tenant_statuses: z.array(z.string()).optional().describe('Filter by tenant statuses (e.g., [\"0\", \"4\"])'),
  gl_account_ids: z.array(z.string()).optional().describe('Filter by specific GL Account IDs'),
  occurred_on_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The end date for the reporting period (YYYY-MM-DD). Required.'),
  columns: z.array(z.string()).optional().describe('Array of specific columns to include in the report')
});

// Zod schema for Tenant Directory Report arguments
const tenantTypeSchema = z.enum(["all", "tenant", "cosigner", "former_tenant"]);
const tenantDirectoryArgsSchema = z.object({
  tenant_visibility: z.enum(["active", "hidden", "all"]).optional().default("active").describe('Filter tenants by status. Defaults to \"active\"'),
  tenant_statuses: z.array(z.string()).optional().describe('Filter by specific tenant statuses (e.g., [\"0\", \"4\"])'),
  tenant_types: z.array(tenantTypeSchema).optional().default(["all"]).describe('Filter by tenant type. Defaults to [\"all\"]'),
  property_visibility: z.enum(["active", "hidden", "all"]).optional().default("active").describe('Filter properties by status. Defaults to \"active\"'),
  properties: z.object({
    properties_ids: z.array(z.string()).optional(),
    property_groups_ids: z.array(z.string()).optional(),
    portfolios_ids: z.array(z.string()).optional(),
    owners_ids: z.array(z.string()).optional()
  }).optional().describe('Filter results based on properties, groups, portfolios, or owners'),
  columns: z.array(z.string()).optional().describe('Array of specific columns to include in the report')
});

// Zod schema for Tenant Ledger Report arguments
const tenantLedgerArgsSchema = z.object({
  parties_ids: z.object({
    occupancies_ids: z.array(z.string()).nonempty("At least one occupancy ID is required").describe('Required. Array of occupancy IDs to filter by.')
  }).describe('Required. Specify the occupancies to include.'),
  occurred_on_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('Required. The start date for the reporting period (YYYY-MM-DD).'),
  occurred_on_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('Required. The end date for the reporting period (YYYY-MM-DD).'),
  transactions_shown: z.enum(["tenant", "owner", "all"]).optional().default("tenant").describe('Filter transactions shown. Defaults to \"tenant\"'),
  columns: z.array(z.string()).optional().describe('Array of specific columns to include in the report')
});

// Zod schema for Trial Balance By Property Report arguments
const trialBalanceByPropertyArgsSchema = z.object({
  property_visibility: z.enum(["active", "hidden", "all"]).optional().default("active").describe('Filter properties by status. Defaults to \"active\"'),
  properties: z.object({
    properties_ids: z.array(z.string()).optional(),
    property_groups_ids: z.array(z.string()).optional(),
    portfolios_ids: z.array(z.string()).optional(),
    owners_ids: z.array(z.string()).optional()
  }).optional().describe('Filter results based on properties, groups, portfolios, or owners'),
  posted_on_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('Required. The start date for the reporting period (YYYY-MM-DD).'),
  posted_on_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('Required. The end date for the reporting period (YYYY-MM-DD).'),
  gl_account_map_id: z.string().optional().describe('Optional. Filter by a specific GL Account Map ID.'),
  columns: z.array(z.string()).optional().describe('Array of specific columns to include in the report')
});

// Zod schema for 12 Month Cash Flow Report arguments
const cashflow12MonthArgsSchema = z.object({
  property_visibility: z.enum(["active", "hidden", "all"]).optional().default("active").describe('Filter properties by status. Defaults to \"active\"'),
  properties: z.object({
    properties_ids: z.array(z.string()).optional(),
    property_groups_ids: z.array(z.string()).optional(),
    portfolios_ids: z.array(z.string()).optional(),
    owners_ids: z.array(z.string()).optional()
  }).optional().describe('Filter results based on properties, groups, portfolios, or owners'),
  posted_on_from: z.string().regex(/^\d{4}-\d{2}$/, "Date must be in YYYY-MM format").describe('Required. The start month for the reporting period (YYYY-MM).'),
  posted_on_to: z.string().regex(/^\d{4}-\d{2}$/, "Date must be in YYYY-MM format").describe('Required. The end month for the reporting period (YYYY-MM).'),
  gl_account_map_id: z.string().optional().describe('Optional. Filter by a specific GL Account Map ID.'),
  level_of_detail: z.enum(["detail_view", "summary_view"]).optional().default("detail_view").describe('Level of detail. Defaults to \"detail_view\"'),
  include_zero_balance_gl_accounts: z.boolean().optional().default(false).transform(val => val ? "1" : "0").describe('Include GL accounts with zero balance. Defaults to false.'),
  exclude_suppressed_fees: z.boolean().optional().default(false).transform(val => val ? "1" : "0").describe('Exclude suppressed fees. Defaults to false.'),
  columns: z.array(z.string()).optional().describe('Array of specific columns to include in the report')
});

// Zod schema for 12 Month Income Statement Report arguments
const incomeStatement12MonthArgsSchema = z.object({
  property_visibility: z.enum(["active", "hidden", "all"]).optional().default("active").describe('Filter properties by status. Defaults to \"active\"'),
  properties: z.object({
    properties_ids: z.array(z.string()).optional(),
    property_groups_ids: z.array(z.string()).optional(),
    portfolios_ids: z.array(z.string()).optional(),
    owners_ids: z.array(z.string()).optional()
  }).optional().describe('Filter results based on properties, groups, portfolios, or owners'),
  fund_type: z.enum(["all", "operating", "escrow"]).optional().default("all").describe('Filter by fund type. Defaults to \"all\"'),
  posted_on_from: z.string().regex(/^\d{4}-\d{2}$/, "Date must be in YYYY-MM format").describe('Required. The start month for the reporting period (YYYY-MM).'),
  posted_on_to: z.string().regex(/^\d{4}-\d{2}$/, "Date must be in YYYY-MM format").describe('Required. The end month for the reporting period (YYYY-MM).'),
  gl_account_map_id: z.string().optional().describe('Optional. Filter by a specific GL Account Map ID.'),
  level_of_detail: z.enum(["detail_view", "summary_view"]).optional().default("detail_view").describe('Level of detail. Defaults to \"detail_view\"'),
  include_zero_balance_gl_accounts: z.boolean().optional().default(false).transform(val => val ? "1" : "0").describe('Include GL accounts with zero balance. Defaults to false.'),
  columns: z.array(z.string()).optional().describe('Array of specific columns to include in the report')
});

// Zod schema for Unit Directory Report arguments
const unitDirectoryArgsSchema = z.object({
  properties: z.object({
    properties_ids: z.array(z.string()).optional(),
    property_groups_ids: z.array(z.string()).optional(),
    portfolios_ids: z.array(z.string()).optional(),
    owners_ids: z.array(z.string()).optional()
  }).optional().describe('Filter results based on properties, groups, portfolios, or owners'),
  unit_visibility: z.enum(["active", "hidden", "all"]).optional().default("active").describe('Filter units by status. Defaults to \"active\"'),
  tags: z.string().optional().describe('Optional. Filter by a comma-separated list of tags (e.g., \"bbq,deck\").'),
  columns: z.array(z.string()).optional().describe('Array of specific columns to include in the report')
});

// Zod schema for Unit Inspection Report arguments
const unitInspectionArgsSchema = z.object({
  properties: z.object({
    properties_ids: z.array(z.string()).optional(),
    property_groups_ids: z.array(z.string()).optional(),
    portfolios_ids: z.array(z.string()).optional(),
    owners_ids: z.array(z.string()).optional()
  }).optional().describe('Filter results based on properties, groups, portfolios, or owners'),
  unit_visibility: z.enum(["active", "hidden", "all"]).optional().default("active").describe('Filter units by status. Defaults to \"active\"'),
  last_inspection_on_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional().describe('Optional. Filter units last inspected on or after this date (YYYY-MM-DD).'),
  include_blank_inspection_date: z.boolean().optional().default(false).transform(val => val ? "1" : "0").describe('Include units with no inspection date. Defaults to false.'),
  columns: z.array(z.string()).optional().describe('Array of specific columns to include in the report')
});

// Zod schema for Unit Vacancy Detail Report arguments
const unitVacancyDetailArgsSchema = z.object({
  properties: z.object({
    properties_ids: z.array(z.string()).optional(),
    property_groups_ids: z.array(z.string()).optional(),
    portfolios_ids: z.array(z.string()).optional(),
    owners_ids: z.array(z.string()).optional()
  }).optional().describe('Filter results based on properties, groups, portfolios, or owners'),
  unit_visibility: z.enum(["active", "hidden", "all"]).optional().default("active").describe('Filter units by status. Defaults to \"active\"'),
  tags: z.string().optional().describe('Optional. Filter by a comma-separated list of tags (e.g., \"bbq,deck\").'),
  columns: z.array(z.string()).optional().describe('Array of specific columns to include in the report')
});

// Zod schema for Vendor Directory Report arguments
const vendorDirectoryArgsSchema = z.object({
  workers_comp_expiration_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional().describe('Optional. Filter vendors whose Workers Comp expires on or before this date (YYYY-MM-DD).'),
  liability_expiration_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional().describe('Optional. Filter vendors whose Liability Insurance expires on or before this date (YYYY-MM-DD).'),
  epa_expiration_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional().describe('Optional. Filter vendors whose EPA Certification expires on or before this date (YYYY-MM-DD).'),
  auto_insurance_expiration_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional().describe('Optional. Filter vendors whose Auto Insurance expires on or before this date (YYYY-MM-DD).'),
  state_license_expiration_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional().describe('Optional. Filter vendors whose State License expires on or before this date (YYYY-MM-DD).'),
  contract_expiration_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional().describe('Optional. Filter vendors whose Contract expires on or before this date (YYYY-MM-DD).'),
  tags: z.string().optional().describe('Optional. Filter by a comma-separated list of tags (e.g., \"plumbing,hvac\").'),
  vendor_visibility: z.enum(["active", "inactive", "all"]).optional().default("active").describe('Filter vendors by status. Defaults to \"active\"'),
  payment_type: z.enum(["eCheck", "Check", "all"]).optional().describe('Optional. Filter by payment type (eCheck, Check, or all). Defaults to all if not specified.'),
  created_by: z.string().optional().default("All").describe('Filter by who created the vendor. Defaults to \"All\".'), // User ID or 'All'
  vendor_type: z.string().optional().default("All").describe('Filter by vendor type. Defaults to \"All\".'), // Vendor Type name or 'All'
  columns: z.array(z.string()).optional().describe('Array of specific columns to include in the report')
});

// Zod schema for Vendor Ledger Report arguments
const vendorLedgerArgsSchema = z.object({
  party_contact_info: z.object({
    company_id: z.string().describe('Required. The ID of the vendor (company).')
  }).describe('Required. Specifies the vendor for the ledger report.'),
  property_visibility: z.enum(["active", "hidden", "all"]).optional().default("active").describe('Filter properties by status. Defaults to \"active\"'),
  properties: z.object({
    properties_ids: z.array(z.string()).optional(),
    property_groups_ids: z.array(z.string()).optional(),
    portfolios_ids: z.array(z.string()).optional(),
    owners_ids: z.array(z.string()).optional()
  }).optional().describe('Filter results based on properties, groups, portfolios, or owners'),
  occurred_on_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('Required. The start date for the reporting period (YYYY-MM-DD).'),
  occurred_on_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('Required. The end date for the reporting period (YYYY-MM-DD).'),
  reverse_transaction: z.boolean().optional().default(false).transform(val => val ? "1" : "0").describe('Include reversed transactions. Defaults to false.'),
  columns: z.array(z.string()).optional().describe('Array of specific columns to include in the report')
});

// Zod schema for Work Order Report arguments
const workOrderArgsSchema = z.object({
  property_visibility: z.enum(["active", "hidden", "all"]).optional().default("active").describe('Filter properties by status. Defaults to \"active\".'),
  unit_ids: z.array(z.string()).optional().describe('Optional. Filter by specific unit IDs.'),
  property: z.object({ property_id: z.string() }).optional().describe('Optional. Filter by a single property ID.'),
  parties_ids: z.object({ occupancies_ids: z.array(z.string()).optional() }).optional().describe('Optional. Filter by specific occupancy IDs.'),
  party_contact_info: z.object({ company_id: z.string() }).optional().describe('Optional. Filter by a specific vendor ID (company).'),
  assigned_user: z.string().optional().default("All").describe('Filter by assigned user ID or \"All\". Defaults to \"All\".'),
  created_by: z.string().optional().default("All").describe('Filter by creator user ID or \"All\". Defaults to \"All\".'),
  priority: z.enum(["All", "Low", "Medium", "High", "Urgent"]).optional().default("All").describe('Filter by priority. Defaults to \"All\".'),
  from_inspection: z.boolean().nullable().optional().describe('Optional. Filter by whether the work order originated from an inspection. Set to null to omit filter.'),
  current_estimate_approval_status: z.enum(["All", "Pending", "Approved", "Declined"]).optional().default("All").describe('Filter by estimate approval status. Defaults to \"All\".'),
  work_order_statuses: z.array(z.string()).optional().describe('Optional. Filter by specific work order status IDs.'),
  work_order_types: z.array(z.enum(["unit_turn", "tenant_requested", "other"])).optional().describe('Optional. Filter by specific work order types.'),
  unit_turn_category: z.array(z.string()).optional().default(["all"]).describe('Filter by unit turn category. Defaults to [\"all\"].'),
  status_date_range_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional().describe('Optional. Start date for status date range filter (YYYY-MM-DD).'),
  status_date_range_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional().describe('Optional. End date for status date range filter (YYYY-MM-DD).'),
  status_date: z.enum(["all", "created_at", "completed_on"]).optional().default("all").describe('Field to use for status date range filtering. Defaults to \"all\".'),
  columns: z.array(z.string()).optional().describe('Array of specific columns to include in the report')
});

const workOrderLaborSummaryArgsSchema = z.object({
  property_visibility: z.enum(["active", "hidden", "all"]).optional().default("active").describe('Optional. Filter by property visibility. Defaults to "active".'),
  properties: z.object({
    properties_ids: z.array(z.string()).optional(),
    property_groups_ids: z.array(z.string()).optional(),
    portfolios_ids: z.array(z.string()).optional(),
    owners_ids: z.array(z.string()).optional(),
  }).optional(),
  maintenance_tech: z.string().optional().describe('Optional. Filter by maintenance technician ID or "All". Defaults to "All".'),
  work_order_statuses: z.array(z.string()).optional().describe('Optional. Filter by specific work order status IDs.'),
  unit_turn: z.enum(["1", "0"]).optional().default("0").describe('Filter by unit turn. "1" for true, "0" for false. Defaults to "0".'),
  labor_performed_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('Required. The start date for the reporting period (YYYY-MM-DD).'),
  labor_performed_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('Required. The end date for the reporting period (YYYY-MM-DD).'),
  columns: z.array(z.string()).optional().describe('Array of specific columns to include in the report')
});

// --- Owner Directory Report Input Schema ---
const ownerDirectoryColumnEnum = z.enum([
  "name", "phone_numbers", "email", "alternative_payee", "payment_type",
  "last_payment_date", "hold_payments", "owner_packet_reports",
  "send_owner_packets_by_email", "properties_owned", "tags", "last_packet_sent",
  "address", "street", "street2", "city", "state", "zip", "country",
  "owner_id", "properties_owned_i_ds", "notes_for_the_owner", "first_name",
  "last_name", "owner_integration_id", "created_by"
]);

const ownerDirectoryInputSchema = z.object({
  property_visibility: z.string().optional().default("active"),
  properties: z.object({
    properties_ids: z.array(z.string()).optional(),
    property_groups_ids: z.array(z.string()).optional(),
    portfolios_ids: z.array(z.string()).optional(),
    owners_ids: z.array(z.string()).optional(),
  }).optional(),
  tags: z.string().optional().describe("Comma-separated list of tags, e.g., 'bbq,deck'"),
  owner_visibility: z.string().optional().default("active"),
  created_by: z.string().optional().default("All"),
  columns: z.array(ownerDirectoryColumnEnum).optional().describe("List of columns to include in the report"),
});

// Create the MCP server
const server = new McpServer({
  name: "appfolio-mcp",
  version: "1.0.0",
});

// --- Register Owner Directory Report Tool ---
server.tool(
  "get_owner_directory_report",
  "Returns an owner directory report based on specified filters.",
  ownerDirectoryInputSchema.shape,
  async (args, _extra: unknown) => {
    const data = await getOwnerDirectoryReport(args as any); // Cast to any for now, should match OwnerDirectoryReportArgs
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data),
          mimeType: "application/json"
        }
      ]
    };
  }
);

// Register the cashflow report as a tool (with correct argument shape)
server.tool(
  "get_cashflow_report",
  "Returns Cash Flow Details including income and expenses for given time period.",
  cashflowInputSchema.shape,
  async (args, _extra) => {
    const data = await getCashflowReport(args);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data),
          mimeType: "application/json"
        }
      ]
    };
  }
);

server.tool(
  "get_property_directory_report",
  "Returns property directory details for the given filters.",
  propertyDirectoryInputSchema.shape,
  async (args, _extra: unknown) => {
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
  }
);

server.tool(
  "get_account_totals_report",
  "Returns account totals for given filters and date range.",
  accountTotalsInputSchema.shape,
  async (args, _extra: unknown) => {
    // Ensure default for gl_account_ids
    const data = await getAccountTotalsReport({ ...args, gl_account_ids: args.gl_account_ids ?? "1" });
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data),
          mimeType: "application/json"
        }
      ]
    };
  }
);

server.tool(
  "get_aged_payables_summary_report",
  "Returns aged payables summary for the given filters.",
  agedPayablesSummaryInputSchema.shape,
  async (args, _extra: unknown) => {
    // Ensure default for property_visibility
    const data = await getAgedPayablesSummaryReport({ ...args, property_visibility: args.property_visibility ?? "active" });
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data),
          mimeType: "application/json"
        }
      ]
    };
  }
);

server.tool(
  "get_aged_receivables_detail_report",
  "Returns aged receivables detail for the given filters.",
  agedReceivablesDetailInputSchema.shape,
  async (args, _extra: unknown) => {
    const data = await getAgedReceivablesDetailReport({ ...args, property_visibility: args.property_visibility ?? "active" });
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data),
          mimeType: "application/json"
        }
      ]
    };
  }
);

server.tool(
  "get_budget_comparative_report",
  "Returns budget comparative report for the given filters.",
  budgetComparativeInputSchema.shape,
  async (args, _extra: unknown) => {
    const data = await getBudgetComparativeReport({ ...args, property_visibility: args.property_visibility ?? "active" });
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data),
          mimeType: "application/json"
        }
      ]
    };
  }
);

server.tool(
  "get_expense_distribution_report",
  "Returns expense distribution report for the given filters.",
  expenseDistributionInputSchema.shape,
  async (args, _extra: unknown) => {
    const data = await getExpenseDistributionReport({ ...args, property_visibility: args.property_visibility ?? "active" });
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data),
          mimeType: "application/json"
        }
      ]
    };
  }
);

const transport = new StdioServerTransport();
server.tool(
  "get_rent_roll_itemized_report",
  "Returns rent roll itemized report for the given filters.",
  rentRollItemizedInputSchema.shape,
  async (args, _extra: unknown) => {
    const data = await getRentRollItemizedReport({ ...args, unit_visibility: args.unit_visibility ?? "active" });
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data),
          mimeType: "application/json"
        }
      ]
    };
  }
);

server.tool(
  "get_delinquency_as_of_report",
  "Returns delinquency as of report for the given filters.",
  delinquencyAsOfInputSchema.shape,
  async (args, _extra: unknown) => {
    const data = await getDelinquencyAsOfReport(args);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data),
          mimeType: "application/json"
        }
      ]
    };
  }
);

server.tool(
  "get_guest_card_inquiries_report",
  "Returns guest card inquiries report for the given filters.",
  guestCardInquiriesInputSchema.shape,
  async (args, _extra: unknown) => {
    const data = await getGuestCardInquiriesReport(args);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data),
          mimeType: "application/json"
        }
      ]
    };
  }
);

server.tool(
  "get_leasing_funnel_performance_report",
  "Returns leasing funnel performance report for the given filters.",
  leasingFunnelPerformanceInputSchema.shape,
  async (args, _extra: unknown) => {
    const data = await getLeasingFunnelPerformanceReport(args);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data),
          mimeType: "application/json"
        }
      ]
    };
  }
);

// Explicitly infer type from schema
type AnnualBudgetComparativeArgsFromSchema = z.infer<typeof annualBudgetComparativeInputSchema>;

server.tool(
  "get_annual_budget_comparative_report",
  "Returns annual budget comparative report for the given filters.",
  annualBudgetComparativeInputSchema.shape,
  async (args: AnnualBudgetComparativeArgsFromSchema, _extra: unknown) => {
    const data = await getAnnualBudgetComparativeReport(args);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data),
          mimeType: "application/json"
        }
      ]
    };
  }
);

server.tool(
  "get_annual_budget_forecast_report",
  "Returns annual budget forecast report for the given filters.",
  annualBudgetForecastInputSchema.shape,
  async (args, _extra: unknown) => {
    const data = await getAnnualBudgetForecastReport(args);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data),
          mimeType: "application/json"
        }
      ]
    };
  }
);

server.tool(
  "get_balance_sheet_report",
  "Returns the balance sheet report for the given filters.",
  balanceSheetArgsSchema.shape,
  async (args, _extra: unknown) => {
    const data = await getBalanceSheetReport(args);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data),
          mimeType: "application/json"
        }
      ]
    };
  }
);

server.tool(
  "get_cancelled_workflows_report",
  "Returns a report of cancelled workflows (processes) based on the provided filters.",
  cancelledWorkflowsArgsSchema.shape,
  async (args, _extra: unknown) => {
    const data = await getCancelledWorkflowsReport(args);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data),
          mimeType: "application/json"
        }
      ]
    };
  }
);

server.tool(
  "get_chart_of_accounts_report",
  "Returns the chart of accounts.",
  chartOfAccountsArgsSchema.shape,
  async (args, _extra: unknown) => {
    const data = await getChartOfAccountsReport(args);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data),
          mimeType: "application/json"
        }
      ]
    };
  }
);

server.tool(
  "get_completed_workflows_report",
  "Returns a report of completed workflows (processes) based on the provided filters.",
  completedWorkflowsArgsSchema.shape,
  async (args, _extra: unknown) => {
    const data = await getCompletedWorkflowsReport(args);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data),
          mimeType: "application/json"
        }
      ]
    };
  }
);

server.tool(
  "get_fixed_assets_report",
  "Returns a report of fixed assets based on the provided filters.",
  fixedAssetsArgsSchema.shape,
  async (args, _extra: unknown) => {
    const data = await getFixedAssetsReport(args);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data),
          mimeType: "application/json"
        }
      ]
    };
  }
);

server.tool(
  "get_in_progress_workflows_report",
  "Returns a report of in-progress workflows based on the provided filters.",
  inProgressWorkflowsArgsSchema.shape,
  async (args, _extra: unknown) => {
    const data = await getInProgressWorkflowsReport(args);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data),
          mimeType: "application/json"
        }
      ]
    };
  }
);

server.tool(
  "get_income_statement_date_range_report",
  "Returns the income statement report for a specified date range.",
  incomeStatementDateRangeArgsSchema.shape,
  async (args, _extra: unknown) => {
    const data = await getIncomeStatementDateRangeReport(args);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data),
          mimeType: "application/json"
        }
      ]
    };
  }
);

server.tool(
  "get_lease_expiration_detail_by_month_report",
  "Returns the lease expiration detail report, filterable by month.",
  leaseExpirationDetailArgsSchema.shape,
  async (args, _extra: unknown) => {
    const data = await getLeaseExpirationDetailByMonthReport(args);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data),
          mimeType: "application/json"
        }
      ]
    };
  }
);

server.tool(
  "get_leasing_summary_report",
  "Returns a summary of leasing activities for a specified date range.",
  leasingSummaryArgsSchema.shape,
  async (args, _extra: unknown) => {
    const data = await getLeasingSummaryReport(args);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data),
          mimeType: "application/json"
        }
      ]
    };
  }
);

server.tool(
  "get_loans_report",
  "Returns a report of loans based on the provided filters and reference date.",
  loansArgsSchema.shape,
  async (args, _extra: unknown) => {
    const data = await getLoansReport(args);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data),
          mimeType: "application/json"
        }
      ]
    };
  }
);

server.tool(
  "get_occupancy_summary_report",
  "Returns a summary of property occupancy as of a specified date.",
  occupancySummaryArgsSchema.shape,
  async (args, _extra: unknown) => {
    const data = await getOccupancySummaryReport(args);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data),
          mimeType: "application/json"
        }
      ]
    };
  }
);

server.tool(
  "get_owner_leasing_report",
  "Returns a report summarizing leasing activities relevant to owners.",
  ownerLeasingArgsSchema.shape,
  async (args, _extra: unknown) => {
    const data = await getOwnerLeasingReport(args);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data),
          mimeType: "application/json"
        }
      ]
    };
  }
);

server.tool(
  "get_property_performance_report",
  "Returns a report detailing property performance based on selected GL accounts and date range.",
  propertyPerformanceArgsSchema.shape,
  async (args, _extra: unknown) => {
    const data = await getPropertyPerformanceReport(args);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data),
          mimeType: "application/json"
        }
      ]
    };
  }
);

server.tool(
  "get_property_source_tracking_report",
  "Returns a report tracking the sources of prospects and their conversion rates.",
  propertySourceTrackingArgsSchema.shape,
  async (args, _extra: unknown) => {
    const data = await getPropertySourceTrackingReport(args);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data),
          mimeType: "application/json"
        }
      ]
    };
  }
);

server.tool(
  "get_receivables_activity_report",
  "Returns a report detailing receivables activity within a specified date range.",
  receivablesActivityArgsSchema.shape,
  async (args, _extra: unknown) => {
    const data = await getReceivablesActivityReport(args);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data),
          mimeType: "application/json"
        }
      ]
    };
  }
);

server.tool(
  "get_renewal_summary_report",
  "Returns a summary of lease renewals within a specified date range.",
  renewalSummaryArgsSchema.shape,
  async (args, _extra: unknown) => {
    const data = await getRenewalSummaryReport(args);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data),
          mimeType: "application/json"
        }
      ]
    };
  }
);

server.tool(
  "get_rental_applications_report",
  "Returns a detailed report of rental applications based on specified filters.",
  rentalApplicationsArgsSchema.shape,
  async (args, _extra: unknown) => {
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
  }
);

server.tool(
  "get_resident_financial_activity_report",
  "Returns a report detailing financial activity for residents.",
  residentFinancialActivityArgsSchema.shape,
  async (args, _extra: unknown) => {
    const data = await getResidentFinancialActivityReport(args);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data),
          mimeType: "application/json"
        }
      ]
    };
  }
);

server.tool(
  "get_screening_assessment_report",
  "Returns a report detailing screening assessments for applicants.",
  screeningAssessmentArgsSchema.shape,
  async (args, _extra: unknown) => {
    const data = await getScreeningAssessmentReport(args);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data),
          mimeType: "application/json"
        }
      ]
    };
  }
);

server.tool(
  "get_security_deposit_funds_detail_report",
  "Returns a detailed report on security deposit funds.",
  securityDepositFundsDetailArgsSchema.shape,
  async (args, _extra: unknown) => {
    const data = await getSecurityDepositFundsDetailReport(args);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data),
          mimeType: "application/json"
        }
      ]
    };
  }
);

server.tool(
  "get_tenant_directory_report",
  "Returns a directory listing of tenants based on specified filters.",
  tenantDirectoryArgsSchema.shape,
  async (args, _extra: unknown) => {
    const data = await getTenantDirectoryReport(args);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data),
          mimeType: "application/json"
        }
      ]
    };
  }
);

server.tool(
  "get_tenant_ledger_report",
  "Returns a ledger report for specified tenants over a date range.",
  tenantLedgerArgsSchema.shape,
  async (args, _extra: unknown) => {
    const data = await getTenantLedgerReport(args);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data),
          mimeType: "application/json"
        }
      ]
    };
  }
);

server.tool(
  "get_trial_balance_by_property_report",
  "Returns a trial balance report aggregated by property.",
  trialBalanceByPropertyArgsSchema.shape,
  async (args, _extra: unknown) => {
    const data = await getTrialBalanceByPropertyReport(args);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data),
          mimeType: "application/json"
        }
      ]
    };
  }
);

server.tool(
  "get_cashflow_12_month_report",
  "Returns a 12-month cash flow report.",
  cashflow12MonthArgsSchema.shape,
  async (args, _extra: unknown) => {
    const data = await getCashflow12MonthReport(args);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data),
          mimeType: "application/json"
        }
      ]
    };
  }
);

server.tool(
  "get_income_statement_12_month_report",
  "Returns a 12-month income statement report.",
  incomeStatement12MonthArgsSchema.shape,
  async (args, _extra: unknown) => {
    const data = await getIncomeStatement12MonthReport(args);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data),
          mimeType: "application/json"
        }
      ]
    };
  }
);

server.tool(
  "get_unit_directory_report",
  "Returns a directory listing of units based on specified filters.",
  unitDirectoryArgsSchema.shape,
  async (args, _extra: unknown) => {
    const data = await getUnitDirectoryReport(args);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data),
          mimeType: "application/json"
        }
      ]
    };
  }
);

server.tool(
  "get_unit_inspection_report",
  "Returns a report on unit inspections based on specified filters.",
  unitInspectionArgsSchema.shape,
  async (args, _extra: unknown) => {
    const data = await getUnitInspectionReport(args);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data),
          mimeType: "application/json"
        }
      ]
    };
  }
);

server.tool(
  "get_unit_vacancy_detail_report",
  "Returns a detailed report on unit vacancies based on specified filters.",
  unitVacancyDetailArgsSchema.shape,
  async (args, _extra: unknown) => {
    const data = await getUnitVacancyDetailReport(args);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data),
          mimeType: "application/json"
        }
      ]
    };
  }
);

server.tool(
  "get_vendor_directory_report",
  "Returns a directory listing of vendors based on specified filters.",
  vendorDirectoryArgsSchema.shape,
  async (args, _extra: unknown) => {
    const data = await getVendorDirectoryReport(args);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data),
          mimeType: "application/json"
        }
      ]
    };
  }
);

server.tool(
  "get_vendor_ledger_report",
  "Returns a ledger report for a specific vendor based on specified filters.",
  vendorLedgerArgsSchema.shape,
  async (args, _extra: unknown) => {
    const data = await getVendorLedgerReport(args);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data),
          mimeType: "application/json"
        }
      ]
    };
  }
);

server.tool(
  "get_work_order_report",
  "Returns a report detailing work orders based on specified filters.",
  workOrderArgsSchema.shape,
  async (args, _extra: unknown) => {
    const data = await getWorkOrderReport(args);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data),
          mimeType: "application/json"
        }
      ]
    };
  }
);

server.tool(
  "get_work_order_labor_summary_report",
  "Returns a report detailing work order labor based on specified filters.",
  workOrderLaborSummaryArgsSchema.shape,
  async (args, _extra: unknown) => {
    const data = await getWorkOrderLaborSummaryReport(args);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data),
          mimeType: "application/json"
        }
      ]
    };
  }
);

server.connect(transport);
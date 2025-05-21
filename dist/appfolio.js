"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGuestCardInquiriesReport = exports.getAccountTotalsReport = exports.getCashflowReport = exports.getRentRollItemizedReport = exports.getAgedPayablesSummaryReport = exports.appfolioLimiter = exports.delinquencyColumnsList = void 0;
exports.getAgedReceivablesDetailReport = getAgedReceivablesDetailReport;
exports.getBudgetComparativeReport = getBudgetComparativeReport;
exports.getExpenseDistributionReport = getExpenseDistributionReport;
exports.getPropertyDirectoryReport = getPropertyDirectoryReport;
exports.getDelinquencyAsOfReport = getDelinquencyAsOfReport;
exports.getLeasingFunnelPerformanceReport = getLeasingFunnelPerformanceReport;
exports.getAnnualBudgetComparativeReport = getAnnualBudgetComparativeReport;
exports.getAnnualBudgetForecastReport = getAnnualBudgetForecastReport;
exports.getBalanceSheetReport = getBalanceSheetReport;
exports.getCancelledWorkflowsReport = getCancelledWorkflowsReport;
exports.getChartOfAccountsReport = getChartOfAccountsReport;
exports.getCompletedWorkflowsReport = getCompletedWorkflowsReport;
exports.getFixedAssetsReport = getFixedAssetsReport;
exports.getInProgressWorkflowsReport = getInProgressWorkflowsReport;
exports.getIncomeStatementDateRangeReport = getIncomeStatementDateRangeReport;
exports.getLeaseExpirationDetailByMonthReport = getLeaseExpirationDetailByMonthReport;
exports.getLeasingSummaryReport = getLeasingSummaryReport;
exports.getLoansReport = getLoansReport;
exports.getOccupancySummaryReport = getOccupancySummaryReport;
exports.getOwnerLeasingReport = getOwnerLeasingReport;
exports.getPropertyPerformanceReport = getPropertyPerformanceReport;
exports.getPropertySourceTrackingReport = getPropertySourceTrackingReport;
exports.getReceivablesActivityReport = getReceivablesActivityReport;
exports.getRenewalSummaryReport = getRenewalSummaryReport;
exports.getRentalApplicationsReport = getRentalApplicationsReport;
exports.getResidentFinancialActivityReport = getResidentFinancialActivityReport;
exports.getScreeningAssessmentReport = getScreeningAssessmentReport;
exports.getSecurityDepositFundsDetailReport = getSecurityDepositFundsDetailReport;
exports.getTenantDirectoryReport = getTenantDirectoryReport;
exports.getTenantLedgerReport = getTenantLedgerReport;
exports.getTrialBalanceByPropertyReport = getTrialBalanceByPropertyReport;
exports.getCashflow12MonthReport = getCashflow12MonthReport;
exports.getIncomeStatement12MonthReport = getIncomeStatement12MonthReport;
exports.getUnitDirectoryReport = getUnitDirectoryReport;
exports.getUnitInspectionReport = getUnitInspectionReport;
exports.getUnitVacancyDetailReport = getUnitVacancyDetailReport;
exports.getVendorDirectoryReport = getVendorDirectoryReport;
exports.getVendorLedgerReport = getVendorLedgerReport;
exports.getWorkOrderReport = getWorkOrderReport;
exports.getWorkOrderLaborSummaryReport = getWorkOrderLaborSummaryReport;
exports.getOwnerDirectoryReport = getOwnerDirectoryReport;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const bottleneck_1 = __importDefault(require("bottleneck"));
dotenv_1.default.config();
const { VHOST, USERNAME, PASSWORD } = process.env;
const cashflowReport_1 = require("./reports/cashflowReport"); // Corrected casing
Object.defineProperty(exports, "getCashflowReport", { enumerable: true, get: function () { return cashflowReport_1.getCashflowReport; } });
const accountTotalsReport_1 = require("./reports/accountTotalsReport");
Object.defineProperty(exports, "getAccountTotalsReport", { enumerable: true, get: function () { return accountTotalsReport_1.getAccountTotalsReport; } });
const agedPayablesSummaryReport_1 = require("./reports/agedPayablesSummaryReport");
Object.defineProperty(exports, "getAgedPayablesSummaryReport", { enumerable: true, get: function () { return agedPayablesSummaryReport_1.getAgedPayablesSummaryReport; } });
const rentRollItemizedReport_1 = require("./reports/rentRollItemizedReport");
Object.defineProperty(exports, "getRentRollItemizedReport", { enumerable: true, get: function () { return rentRollItemizedReport_1.getRentRollItemizedReport; } });
const guestCardInquiriesReport_1 = require("./reports/guestCardInquiriesReport");
Object.defineProperty(exports, "getGuestCardInquiriesReport", { enumerable: true, get: function () { return guestCardInquiriesReport_1.getGuestCardInquiriesReport; } });
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
// --- Work Order Labor Summary Report Function ---
async function getWorkOrderLaborSummaryReport(args) {
    if (!VHOST || !USERNAME || !PASSWORD)
        throw new Error('Missing AppFolio API credentials');
    if (!args.labor_performed_from || !args.labor_performed_to) {
        throw new Error('Missing required arguments: labor_performed_from and labor_performed_to (format YYYY-MM-DD)');
    }
    const { property_visibility = "active", maintenance_tech = "All", unit_turn = "0", // Default to not filter by unit turn unless specified
    ...rest } = args;
    const payload = {
        property_visibility,
        maintenance_tech,
        unit_turn,
        ...rest
    };
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/work_order_labor_summary.json`;
    const response = await appfolioLimiter.schedule(() => axios_1.default.post(url, payload, {
        auth: { username: USERNAME, password: PASSWORD },
        headers: { 'Content-Type': 'application/json' },
    }));
    return response.data;
}
// --- Owner Directory Report Function ---
async function getOwnerDirectoryReport(args) {
    if (!VHOST || !USERNAME || !PASSWORD)
        throw new Error('Missing AppFolio API credentials');
    const { property_visibility = "active", owner_visibility = "active", created_by = "All", ...rest } = args;
    const payload = {
        property_visibility,
        owner_visibility,
        created_by,
        ...rest
    };
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/owner_directory.json`;
    const response = await appfolioLimiter.schedule(() => axios_1.default.post(url, payload, {
        auth: { username: USERNAME, password: PASSWORD },
        headers: { 'Content-Type': 'application/json' },
    }));
    return response.data;
}
async function getAgedReceivablesDetailReport(args) {
    if (!VHOST || !USERNAME || !PASSWORD)
        throw new Error('Missing AppFolio API credentials');
    // Set default for property_visibility if not provided
    const payload = { ...args, property_visibility: args.property_visibility ?? "active" };
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/aged_receivables_detail.json`;
    const response = await appfolioLimiter.schedule(() => axios_1.default.post(url, payload, {
        auth: { username: USERNAME, password: PASSWORD },
        headers: { 'Content-Type': 'application/json' },
    }));
    return response.data;
}
async function getBudgetComparativeReport(args) {
    if (!VHOST || !USERNAME || !PASSWORD)
        throw new Error('Missing AppFolio API credentials');
    // Set default for property_visibility if not provided
    const payload = { ...args, property_visibility: args.property_visibility ?? "active" };
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/budget_comparative.json`;
    const response = await appfolioLimiter.schedule(() => axios_1.default.post(url, payload, {
        auth: { username: USERNAME, password: PASSWORD },
        headers: { 'Content-Type': 'application/json' },
    }));
    return response.data;
}
async function getExpenseDistributionReport(args) {
    if (!VHOST || !USERNAME || !PASSWORD)
        throw new Error('Missing AppFolio API credentials');
    const payload = { ...args, property_visibility: args.property_visibility ?? "active" };
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/expense_distribution.json`;
    const response = await appfolioLimiter.schedule(() => axios_1.default.post(url, payload, {
        auth: { username: USERNAME, password: PASSWORD },
        headers: { 'Content-Type': 'application/json' },
    }));
    return response.data;
}
async function getDelinquencyAsOfReport(args) {
    if (!VHOST || !USERNAME || !PASSWORD)
        throw new Error('Missing AppFolio API credentials');
    const { property_visibility = "active", tenant_statuses = ["0", "4"], // Default based on previous implementation
    amount_owed_in_account = "all", // Default based on previous implementation
    ...rest } = args;
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
async function getLeasingFunnelPerformanceReport(args) {
    if (!VHOST || !USERNAME || !PASSWORD)
        throw new Error('Missing AppFolio API credentials');
    const { property_visibility = "all", // Default based on previous implementation
    assigned_user_visibility = "active", // Default based on previous implementation
    assigned_user = "All", // Default based on previous implementation
    ...rest } = args;
    const payload = {
        property_visibility,
        assigned_user_visibility,
        assigned_user,
        ...rest,
    };
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/leasing_funnel_performance.json`;
    const response = await appfolioLimiter.schedule(() => axios_1.default.post(url, payload, {
        auth: { username: USERNAME, password: PASSWORD },
        headers: { 'Content-Type': 'application/json' },
    }));
    return response.data;
}
async function getAnnualBudgetComparativeReport(args) {
    if (!VHOST || !USERNAME || !PASSWORD)
        throw new Error('Missing AppFolio API credentials');
    if (!args.occurred_on_to)
        throw new Error('occurred_on_to is required'); // Check required field
    const { property_visibility = "active", additional_account_types = [], level_of_detail = "detail_view", ...rest } = args;
    const payload = {
        property_visibility,
        additional_account_types,
        level_of_detail,
        ...rest
    };
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/annual_budget_comparative.json`;
    const response = await appfolioLimiter.schedule(() => axios_1.default.post(url, payload, {
        auth: { username: USERNAME, password: PASSWORD },
        headers: { 'Content-Type': 'application/json' },
    }));
    return response.data;
}
async function getAnnualBudgetForecastReport(args) {
    if (!VHOST || !USERNAME || !PASSWORD)
        throw new Error('Missing AppFolio API credentials');
    if (!args.period_from || !args.period_to)
        throw new Error('period_from and period_to are required');
    const { property_visibility = "active", consolidate = "0", ...rest } = args;
    const payload = {
        property_visibility,
        consolidate,
        ...rest
    };
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/annual_budget_forecast.json`;
    const response = await appfolioLimiter.schedule(() => axios_1.default.post(url, payload, {
        auth: { username: USERNAME, password: PASSWORD },
        headers: { 'Content-Type': 'application/json' },
    }));
    // The API returns the array directly, not nested under a key like 'results'
    return response.data;
}
async function getBalanceSheetReport(args) {
    if (!VHOST || !USERNAME || !PASSWORD)
        throw new Error('Missing AppFolio API credentials');
    if (!args.posted_on_to)
        throw new Error('posted_on_to is required');
    const { property_visibility = "active", level_of_detail = "detail_view", include_zero_balance_gl_accounts = "0", ...rest } = args;
    const payload = {
        property_visibility,
        level_of_detail,
        include_zero_balance_gl_accounts,
        ...rest
    };
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/balance_sheet.json`;
    const response = await appfolioLimiter.schedule(() => axios_1.default.post(url, payload, {
        auth: { username: USERNAME, password: PASSWORD },
        headers: { 'Content-Type': 'application/json' },
    }));
    return response.data;
}
async function getCancelledWorkflowsReport(args) {
    if (!VHOST || !USERNAME || !PASSWORD)
        throw new Error('Missing AppFolio API credentials');
    const { property_visibility = "active", process_template = "All", workflow_step = "All", assigned_user = "All", cancelled_by = "All", ...rest } = args;
    const payload = {
        property_visibility,
        process_template,
        workflow_step,
        assigned_user,
        cancelled_by,
        ...rest
    };
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/cancelled_processes.json`;
    const response = await appfolioLimiter.schedule(() => axios_1.default.post(url, payload, {
        auth: { username: USERNAME, password: PASSWORD },
        headers: { 'Content-Type': 'application/json' },
    }));
    return response.data;
}
async function getChartOfAccountsReport(args) {
    if (!VHOST || !USERNAME || !PASSWORD)
        throw new Error('Missing AppFolio API credentials');
    const payload = { ...args }; // Simple payload, just pass args
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/chart_of_accounts.json`;
    const response = await appfolioLimiter.schedule(() => axios_1.default.post(url, payload, {
        auth: { username: USERNAME, password: PASSWORD },
        headers: { 'Content-Type': 'application/json' },
    }));
    return response.data;
}
async function getCompletedWorkflowsReport(args) {
    if (!VHOST || !USERNAME || !PASSWORD)
        throw new Error('Missing AppFolio API credentials');
    const { property_visibility = "active", process_template = "All", workflow_step = "All", assigned_user = "All", ...rest } = args;
    const payload = {
        property_visibility,
        process_template,
        workflow_step,
        assigned_user,
        ...rest
    };
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/completed_processes.json`;
    const response = await appfolioLimiter.schedule(() => axios_1.default.post(url, payload, {
        auth: { username: USERNAME, password: PASSWORD },
        headers: { 'Content-Type': 'application/json' },
    }));
    return response.data;
}
// --- Fixed Assets Report Function ---
async function getFixedAssetsReport(args) {
    if (!VHOST || !USERNAME || !PASSWORD)
        throw new Error('Missing AppFolio API credentials');
    const { property_visibility = "active", include_property_level_fixed_assets = "1", asset_types = "All", status = "all", ...rest } = args;
    const payload = {
        property_visibility,
        include_property_level_fixed_assets,
        asset_types,
        status,
        ...rest
    };
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/fixed_assets.json`;
    const response = await appfolioLimiter.schedule(() => axios_1.default.post(url, payload, {
        auth: { username: USERNAME, password: PASSWORD },
        headers: { 'Content-Type': 'application/json' },
    }));
    return response.data;
}
// --- In Progress Workflows Report Function ---
async function getInProgressWorkflowsReport(args) {
    if (!VHOST || !USERNAME || !PASSWORD)
        throw new Error('Missing AppFolio API credentials');
    const { property_visibility = "active", process_template = "All", workflow_step = "All", assigned_user = "All", ...rest } = args;
    const payload = {
        property_visibility,
        process_template,
        workflow_step,
        assigned_user,
        ...rest
    };
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/in_progress_workflows.json`;
    const response = await appfolioLimiter.schedule(() => axios_1.default.post(url, payload, {
        auth: { username: USERNAME, password: PASSWORD },
        headers: { 'Content-Type': 'application/json' },
    }));
    return response.data;
}
// --- Income Statement Date Range Report Function ---
async function getIncomeStatementDateRangeReport(args) {
    if (!VHOST || !USERNAME || !PASSWORD)
        throw new Error('Missing AppFolio API credentials');
    if (!args.posted_on_from || !args.posted_on_to) {
        throw new Error('Missing required arguments: posted_on_from and posted_on_to (format YYYY-MM-DD)');
    }
    const { property_visibility = "active", level_of_detail = "detail_view", include_zero_balance_gl_accounts = "0", ...rest } = args;
    const payload = {
        property_visibility,
        level_of_detail,
        include_zero_balance_gl_accounts,
        ...rest
    };
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/income_statement_date_range.json`;
    const response = await appfolioLimiter.schedule(() => axios_1.default.post(url, payload, {
        auth: { username: USERNAME, password: PASSWORD },
        headers: { 'Content-Type': 'application/json' },
    }));
    return response.data;
}
// --- Lease Expiration Detail By Month Report Function ---
async function getLeaseExpirationDetailByMonthReport(args) {
    if (!VHOST || !USERNAME || !PASSWORD)
        throw new Error('Missing AppFolio API credentials');
    if (!args.ends_on_from || !args.ends_on_to) {
        throw new Error('Missing required arguments: ends_on_from and ends_on_to (format YYYY-MM)');
    }
    const { unit_visibility = "active", filter_lease_date_range_by = "Lease Expiration Date", exclude_occupancies_with_move_out = "0", exclude_month_to_month = "0", ...rest } = args;
    const payload = {
        unit_visibility,
        filter_lease_date_range_by,
        exclude_occupancies_with_move_out,
        exclude_month_to_month,
        ...rest
    };
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/lease_expiration_detail.json`;
    const response = await appfolioLimiter.schedule(() => axios_1.default.post(url, payload, {
        auth: { username: USERNAME, password: PASSWORD },
        headers: { 'Content-Type': 'application/json' },
    }));
    return response.data;
}
// --- Leasing Summary Report Function ---
async function getLeasingSummaryReport(args) {
    if (!VHOST || !USERNAME || !PASSWORD)
        throw new Error('Missing AppFolio API credentials');
    if (!args.posted_on_from || !args.posted_on_to) {
        throw new Error('Missing required arguments: posted_on_from and posted_on_to (format YYYY-MM-DD)');
    }
    const { unit_visibility = "active", ...rest } = args;
    const payload = {
        unit_visibility,
        ...rest
    };
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/leasing_summary.json`;
    const response = await appfolioLimiter.schedule(() => axios_1.default.post(url, payload, {
        auth: { username: USERNAME, password: PASSWORD },
        headers: { 'Content-Type': 'application/json' },
    }));
    return response.data;
}
// --- Loans Report Function ---
async function getLoansReport(args) {
    if (!VHOST || !USERNAME || !PASSWORD)
        throw new Error('Missing AppFolio API credentials');
    if (!args.reference_to) {
        throw new Error('Missing required argument: reference_to (format YYYY-MM-DD)');
    }
    const { property_visibility = "active", show_hidden_loans = "0", ...rest } = args;
    const payload = {
        property_visibility,
        show_hidden_loans,
        ...rest
    };
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/loans.json`;
    const response = await appfolioLimiter.schedule(() => axios_1.default.post(url, payload, {
        auth: { username: USERNAME, password: PASSWORD },
        headers: { 'Content-Type': 'application/json' },
    }));
    return response.data;
}
// --- Occupancy Summary Report Function ---
async function getOccupancySummaryReport(args) {
    if (!VHOST || !USERNAME || !PASSWORD)
        throw new Error('Missing AppFolio API credentials');
    if (!args.as_of_to) {
        throw new Error('Missing required argument: as_of_to (format YYYY-MM-DD)');
    }
    const { unit_visibility = "active", ...rest } = args;
    const payload = {
        unit_visibility,
        ...rest
    };
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/occupancy_summary.json`;
    const response = await appfolioLimiter.schedule(() => axios_1.default.post(url, payload, {
        auth: { username: USERNAME, password: PASSWORD },
        headers: { 'Content-Type': 'application/json' },
    }));
    return response.data;
}
// --- Owner Leasing Report Function ---
async function getOwnerLeasingReport(args) {
    if (!VHOST || !USERNAME || !PASSWORD)
        throw new Error('Missing AppFolio API credentials');
    if (!args.received_on_from || !args.received_on_to) {
        throw new Error('Missing required arguments: received_on_from and received_on_to (format YYYY-MM-DD)');
    }
    const { include_units_which_are_not_rent_ready = "0", include_units_which_are_hidden_from_the_vacancies_dashboard = "0", ...rest } = args;
    const payload = {
        include_units_which_are_not_rent_ready,
        include_units_which_are_hidden_from_the_vacancies_dashboard,
        ...rest
    };
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/owner_leasing.json`;
    const response = await appfolioLimiter.schedule(() => axios_1.default.post(url, payload, {
        auth: { username: USERNAME, password: PASSWORD },
        headers: { 'Content-Type': 'application/json' },
    }));
    return response.data;
}
// --- Property Performance Report Function ---
async function getPropertyPerformanceReport(args) {
    if (!VHOST || !USERNAME || !PASSWORD)
        throw new Error('Missing AppFolio API credentials');
    if (!args.posted_on_from || !args.posted_on_to) {
        throw new Error('Missing required arguments: posted_on_from and posted_on_to (format YYYY-MM-DD)');
    }
    const { property_visibility = "active", ...rest } = args;
    const payload = {
        property_visibility,
        ...rest
    };
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/property_performance.json`;
    const response = await appfolioLimiter.schedule(() => axios_1.default.post(url, payload, {
        auth: { username: USERNAME, password: PASSWORD },
        headers: { 'Content-Type': 'application/json' },
    }));
    return response.data;
}
// --- Property Source Tracking Report Function ---
async function getPropertySourceTrackingReport(args) {
    if (!VHOST || !USERNAME || !PASSWORD)
        throw new Error('Missing AppFolio API credentials');
    if (!args.received_on_from || !args.received_on_to) {
        throw new Error('Missing required arguments: received_on_from and received_on_to (format YYYY-MM-DD)');
    }
    const { unit_visibility = "active", ...rest } = args;
    const payload = {
        unit_visibility,
        ...rest
    };
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/prospect_source_tracking.json`;
    const response = await appfolioLimiter.schedule(() => axios_1.default.post(url, payload, {
        auth: { username: USERNAME, password: PASSWORD },
        headers: { 'Content-Type': 'application/json' },
    }));
    return response.data;
}
// --- Receivables Activity Report Function ---
async function getReceivablesActivityReport(args) {
    if (!VHOST || !USERNAME || !PASSWORD)
        throw new Error('Missing AppFolio API credentials');
    if (!args.receipt_date_from || !args.receipt_date_to) {
        throw new Error('Missing required arguments: receipt_date_from and receipt_date_to (format YYYY-MM-DD)');
    }
    const { tenant_visibility = "active", property_visibility = "active", manually_entered_only = "0", ...rest } = args;
    const payload = {
        tenant_visibility,
        property_visibility,
        manually_entered_only,
        ...rest
    };
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/receivables_activity.json`;
    const response = await appfolioLimiter.schedule(() => axios_1.default.post(url, payload, {
        auth: { username: USERNAME, password: PASSWORD },
        headers: { 'Content-Type': 'application/json' },
    }));
    return response.data;
}
// --- Renewal Summary Report Function ---
async function getRenewalSummaryReport(args) {
    if (!VHOST || !USERNAME || !PASSWORD)
        throw new Error('Missing AppFolio API credentials');
    if (!args.start_on_from || !args.start_on_to) {
        throw new Error('Missing required arguments: start_on_from and start_on_to (format YYYY-MM)');
    }
    const { unit_visibility = "active", statuses = ["all"], include_tenant_transfers = "0", ...rest } = args;
    const payload = {
        unit_visibility,
        statuses,
        include_tenant_transfers,
        ...rest
    };
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/renewal_summary.json`;
    const response = await appfolioLimiter.schedule(() => axios_1.default.post(url, payload, {
        auth: { username: USERNAME, password: PASSWORD },
        headers: { 'Content-Type': 'application/json' },
    }));
    return response.data;
}
// --- Rental Applications Report Function ---
async function getRentalApplicationsReport(args) {
    if (!VHOST || !USERNAME || !PASSWORD)
        throw new Error('Missing AppFolio API credentials');
    if (!args.received_on_from || !args.received_on_to) {
        throw new Error('Missing required arguments: received_on_from and received_on_to (format YYYY-MM-DD)');
    }
    const { property_visibility = "active", rental_applications_filter_date_range_by = "Rental Application Received Date", ...rest } = args;
    const payload = {
        property_visibility,
        rental_applications_filter_date_range_by,
        ...rest
    };
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/rental_applications.json`;
    const response = await appfolioLimiter.schedule(() => axios_1.default.post(url, payload, {
        auth: { username: USERNAME, password: PASSWORD },
        headers: { 'Content-Type': 'application/json' },
    }));
    return response.data;
}
// --- Resident Financial Activity Report Function ---
async function getResidentFinancialActivityReport(args) {
    if (!VHOST || !USERNAME || !PASSWORD)
        throw new Error('Missing AppFolio API credentials');
    if (!args.occurred_on_from || !args.occurred_on_to) {
        throw new Error('Missing required arguments: occurred_on_from and occurred_on_to (format YYYY-MM-DD)');
    }
    const { property_visibility = "active", ...rest } = args;
    const payload = { property_visibility, ...rest };
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/resident_financial_activity.json`;
    const response = await appfolioLimiter.schedule(() => axios_1.default.post(url, payload, {
        auth: { username: USERNAME, password: PASSWORD },
        headers: { 'Content-Type': 'application/json' },
    }));
    return response.data;
}
// --- Screening Assessment Report Function ---
async function getScreeningAssessmentReport(args) {
    if (!VHOST || !USERNAME || !PASSWORD)
        throw new Error('Missing AppFolio API credentials');
    if (!args.screen_ran_at_from || !args.screen_ran_at_to) {
        throw new Error('Missing required arguments: screen_ran_at_from and screen_ran_at_to (format YYYY-MM-DD)');
    }
    const { property_visibility = "active", ...rest } = args;
    const payload = { property_visibility, ...rest };
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/screening_assessments.json`;
    const response = await appfolioLimiter.schedule(() => axios_1.default.post(url, payload, {
        auth: { username: USERNAME, password: PASSWORD },
        headers: { 'Content-Type': 'application/json' },
    }));
    return response.data;
}
// --- Security Deposit Funds Detail Report Function ---
async function getSecurityDepositFundsDetailReport(args) {
    if (!VHOST || !USERNAME || !PASSWORD)
        throw new Error('Missing AppFolio API credentials');
    if (!args.occurred_on_to) {
        throw new Error('Missing required argument: occurred_on_to (format YYYY-MM-DD)');
    }
    const { property_visibility = "active", ...rest } = args;
    const payload = { property_visibility, ...rest };
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/security_deposit_funds_detail.json`;
    const response = await appfolioLimiter.schedule(() => axios_1.default.post(url, payload, {
        auth: { username: USERNAME, password: PASSWORD },
        headers: { 'Content-Type': 'application/json' },
    }));
    return response.data;
}
// --- Tenant Directory Report Function ---
async function getTenantDirectoryReport(args) {
    if (!VHOST || !USERNAME || !PASSWORD)
        throw new Error('Missing AppFolio API credentials');
    const { tenant_visibility = "active", tenant_types = ["all"], property_visibility = "active", ...rest } = args;
    const payload = {
        tenant_visibility,
        tenant_types,
        property_visibility,
        ...rest
    };
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/tenant_directory.json`;
    const response = await appfolioLimiter.schedule(() => axios_1.default.post(url, payload, {
        auth: { username: USERNAME, password: PASSWORD },
        headers: { 'Content-Type': 'application/json' },
    }));
    return response.data;
}
// --- Tenant Ledger Report Function ---
async function getTenantLedgerReport(args) {
    if (!VHOST || !USERNAME || !PASSWORD)
        throw new Error('Missing AppFolio API credentials');
    if (!args.parties_ids?.occupancies_ids || args.parties_ids.occupancies_ids.length === 0) {
        throw new Error('Missing required argument: parties_ids.occupancies_ids must contain at least one ID');
    }
    if (!args.occurred_on_from || !args.occurred_on_to) {
        throw new Error('Missing required arguments: occurred_on_from and occurred_on_to (format YYYY-MM-DD)');
    }
    const { transactions_shown = "tenant", ...rest } = args;
    const payload = { transactions_shown, ...rest };
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/tenant_ledger.json`;
    const response = await appfolioLimiter.schedule(() => axios_1.default.post(url, payload, {
        auth: { username: USERNAME, password: PASSWORD },
        headers: { 'Content-Type': 'application/json' },
    }));
    return response.data;
}
// --- Trial Balance By Property Report Function ---
async function getTrialBalanceByPropertyReport(args) {
    if (!VHOST || !USERNAME || !PASSWORD)
        throw new Error('Missing AppFolio API credentials');
    if (!args.posted_on_from || !args.posted_on_to) {
        throw new Error('Missing required arguments: posted_on_from and posted_on_to (format YYYY-MM-DD)');
    }
    const { property_visibility = "active", ...rest } = args;
    const payload = { property_visibility, ...rest };
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/trial_balance_by_property.json`;
    const response = await appfolioLimiter.schedule(() => axios_1.default.post(url, payload, {
        auth: { username: USERNAME, password: PASSWORD },
        headers: { 'Content-Type': 'application/json' },
    }));
    return response.data;
}
// --- 12 Month Cash Flow Report Function ---
async function getCashflow12MonthReport(args) {
    if (!VHOST || !USERNAME || !PASSWORD)
        throw new Error('Missing AppFolio API credentials');
    if (!args.posted_on_from || !args.posted_on_to) {
        throw new Error('Missing required arguments: posted_on_from and posted_on_to (format YYYY-MM)');
    }
    const { property_visibility = "active", level_of_detail = "detail_view", include_zero_balance_gl_accounts = "0", exclude_suppressed_fees = "0", ...rest } = args;
    const payload = {
        property_visibility,
        level_of_detail,
        include_zero_balance_gl_accounts,
        exclude_suppressed_fees,
        ...rest
    };
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/twelve_month_cash_flow.json`;
    const response = await appfolioLimiter.schedule(() => axios_1.default.post(url, payload, {
        auth: { username: USERNAME, password: PASSWORD },
        headers: { 'Content-Type': 'application/json' },
    }));
    return response.data;
}
// --- 12 Month Income Statement Report Function ---
async function getIncomeStatement12MonthReport(args) {
    if (!VHOST || !USERNAME || !PASSWORD)
        throw new Error('Missing AppFolio API credentials');
    if (!args.posted_on_from || !args.posted_on_to) {
        throw new Error('Missing required arguments: posted_on_from and posted_on_to (format YYYY-MM)');
    }
    const { property_visibility = "active", fund_type = "all", level_of_detail = "detail_view", include_zero_balance_gl_accounts = "0", ...rest } = args;
    const payload = {
        property_visibility,
        fund_type,
        level_of_detail,
        include_zero_balance_gl_accounts,
        ...rest
    };
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/twelve_month_income_statement.json`;
    const response = await appfolioLimiter.schedule(() => axios_1.default.post(url, payload, {
        auth: { username: USERNAME, password: PASSWORD },
        headers: { 'Content-Type': 'application/json' },
    }));
    return response.data;
}
// --- Unit Directory Report Function ---
async function getUnitDirectoryReport(args) {
    if (!VHOST || !USERNAME || !PASSWORD)
        throw new Error('Missing AppFolio API credentials');
    const { unit_visibility = "active", ...rest } = args;
    const payload = { unit_visibility, ...rest };
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/unit_directory.json`;
    const response = await appfolioLimiter.schedule(() => axios_1.default.post(url, payload, {
        auth: { username: USERNAME, password: PASSWORD },
        headers: { 'Content-Type': 'application/json' },
    }));
    return response.data;
}
// --- Unit Inspection Report Function ---
async function getUnitInspectionReport(args) {
    if (!VHOST || !USERNAME || !PASSWORD)
        throw new Error('Missing AppFolio API credentials');
    const { unit_visibility = "active", include_blank_inspection_date = "0", ...rest } = args;
    const payload = {
        unit_visibility,
        include_blank_inspection_date,
        ...rest
    };
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/unit_inspection.json`;
    const response = await appfolioLimiter.schedule(() => axios_1.default.post(url, payload, {
        auth: { username: USERNAME, password: PASSWORD },
        headers: { 'Content-Type': 'application/json' },
    }));
    return response.data;
}
// --- Unit Vacancy Detail Report Function ---
async function getUnitVacancyDetailReport(args) {
    if (!VHOST || !USERNAME || !PASSWORD)
        throw new Error('Missing AppFolio API credentials');
    const { unit_visibility = "active", ...rest } = args;
    const payload = { unit_visibility, ...rest };
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/unit_vacancy.json`;
    const response = await appfolioLimiter.schedule(() => axios_1.default.post(url, payload, {
        auth: { username: USERNAME, password: PASSWORD },
        headers: { 'Content-Type': 'application/json' },
    }));
    return response.data;
}
// --- Vendor Directory Report Function ---
async function getVendorDirectoryReport(args) {
    if (!VHOST || !USERNAME || !PASSWORD)
        throw new Error('Missing AppFolio API credentials');
    const { vendor_visibility = "active", payment_type, // Note: API might default to 'all' if not sent, needs verification
    created_by = "All", vendor_type = "All", ...rest } = args;
    const payload = {
        vendor_visibility,
        created_by,
        vendor_type,
        ...rest
    };
    // Only include payment_type if it's explicitly provided
    if (payment_type) {
        payload.payment_type = payment_type;
    }
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/vendor_directory.json`;
    const response = await appfolioLimiter.schedule(() => axios_1.default.post(url, payload, {
        auth: { username: USERNAME, password: PASSWORD },
        headers: { 'Content-Type': 'application/json' },
    }));
    return response.data;
}
// --- Vendor Ledger Report Function ---
async function getVendorLedgerReport(args) {
    if (!VHOST || !USERNAME || !PASSWORD)
        throw new Error('Missing AppFolio API credentials');
    if (!args.party_contact_info?.company_id) {
        throw new Error('Missing required argument: party_contact_info.company_id');
    }
    if (!args.occurred_on_from || !args.occurred_on_to) {
        throw new Error('Missing required arguments: occurred_on_from and occurred_on_to (format YYYY-MM-DD)');
    }
    const { property_visibility = "active", reverse_transaction = "0", ...rest } = args;
    const payload = {
        property_visibility,
        reverse_transaction,
        ...rest
    };
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/vendor_ledger.json`;
    const response = await appfolioLimiter.schedule(() => axios_1.default.post(url, payload, {
        auth: { username: USERNAME, password: PASSWORD },
        headers: { 'Content-Type': 'application/json' },
    }));
    return response.data;
}
async function getWorkOrderReport(args) {
    if (!VHOST || !USERNAME || !PASSWORD)
        throw new Error('Missing AppFolio API credentials');
    const { property_visibility = "active", assigned_user = "All", created_by = "All", priority = "All", current_estimate_approval_status = "All", status_date = "all", unit_turn_category = ["all"], // Default based on API description
    from_inspection = null, // Explicitly set default
    ...rest } = args;
    // Construct payload, handle potential null for from_inspection
    const payload = {
        property_visibility,
        assigned_user,
        created_by,
        priority,
        current_estimate_approval_status,
        status_date,
        unit_turn_category,
        ...rest
    };
    // Only include from_inspection if it's not null
    if (from_inspection !== null) {
        payload.from_inspection = from_inspection;
    }
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/work_order.json`;
    const response = await appfolioLimiter.schedule(() => axios_1.default.post(url, payload, {
        auth: { username: USERNAME, password: PASSWORD },
        headers: { 'Content-Type': 'application/json' },
    }));
    return response.data;
}
async function getPropertyDirectoryReport(args) {
    if (!VHOST || !USERNAME || !PASSWORD)
        throw new Error('Missing AppFolio API credentials');
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/property_directory.json`;
    const response = await appfolioLimiter.schedule(() => axios_1.default.post(url, args, {
        auth: { username: USERNAME, password: PASSWORD },
        headers: { 'Content-Type': 'application/json' },
    }));
    return response.data;
}
const appfolioLimiter = new bottleneck_1.default({
    reservoir: 7, // initial number of requests
    reservoirRefreshAmount: 7,
    reservoirRefreshInterval: 15 * 1000, // 15 seconds
    maxConcurrent: 1 // ensure requests are spaced out
});
exports.appfolioLimiter = appfolioLimiter;

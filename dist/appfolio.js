"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPropertyGroupDirectoryReport = exports.getUnitInspectionReport = exports.getWorkOrderReport = exports.getVendorDirectoryReport = exports.getUnitVacancyDetailReport = exports.getUnitDirectoryReport = exports.getIncomeStatement12MonthReport = exports.getCashflow12MonthReport = exports.getPropertyDirectoryReport = exports.getTenantLedgerReport = exports.getTenantDirectoryReport = exports.getSecurityDepositFundsDetailReport = exports.getScreeningAssessmentReport = exports.getResidentFinancialActivityReport = exports.getRentalApplicationsReport = exports.getVendorLedgerReport = exports.getRenewalSummaryReport = exports.getReceivablesActivityReport = exports.getPropertySourceTrackingReport = exports.getPropertyPerformanceReport = exports.getOwnerLeasingReport = exports.getOccupancySummaryReport = exports.getLoansReport = exports.getOwnerDirectoryReport = exports.getLeasingSummaryReport = exports.getLeaseExpirationDetailReport = exports.getCancelledWorkflowsReport = exports.getWorkOrderLaborSummaryReport = exports.getIncomeStatementDateRangeReport = exports.getInProgressWorkflowsReport = exports.getFixedAssetsReport = exports.getCompletedWorkflowsReport = exports.getChartOfAccountsReport = exports.getBudgetComparativeReport = exports.getAgedReceivablesDetailReport = exports.getBalanceSheetReport = exports.getExpenseDistributionReport = exports.delinquencyColumnsList = exports.getDelinquencyAsOfReport = exports.getAnnualBudgetForecastReport = exports.getAnnualBudgetComparativeReport = exports.getLeasingFunnelPerformanceReport = exports.getGuestCardInquiriesReport = exports.getRentRollItemizedReport = exports.getAgedPayablesSummaryReport = exports.getAccountTotalsReport = exports.getCashflowReport = exports.appfolioLimiter = void 0;
exports.makeAppfolioApiCall = makeAppfolioApiCall;
const dotenv_1 = __importDefault(require("dotenv"));
const bottleneck_1 = __importDefault(require("bottleneck"));
const axios_1 = __importDefault(require("axios")); // Import axios
dotenv_1.default.config();
const cashflowReport_1 = require("./reports/cashflowReport");
Object.defineProperty(exports, "getCashflowReport", { enumerable: true, get: function () { return cashflowReport_1.getCashflowReport; } });
const accountTotalsReport_1 = require("./reports/accountTotalsReport");
Object.defineProperty(exports, "getAccountTotalsReport", { enumerable: true, get: function () { return accountTotalsReport_1.getAccountTotalsReport; } });
const agedPayablesSummaryReport_1 = require("./reports/agedPayablesSummaryReport");
Object.defineProperty(exports, "getAgedPayablesSummaryReport", { enumerable: true, get: function () { return agedPayablesSummaryReport_1.getAgedPayablesSummaryReport; } });
const rentRollItemizedReport_1 = require("./reports/rentRollItemizedReport");
Object.defineProperty(exports, "getRentRollItemizedReport", { enumerable: true, get: function () { return rentRollItemizedReport_1.getRentRollItemizedReport; } });
const guestCardInquiriesReport_1 = require("./reports/guestCardInquiriesReport");
Object.defineProperty(exports, "getGuestCardInquiriesReport", { enumerable: true, get: function () { return guestCardInquiriesReport_1.getGuestCardInquiriesReport; } });
const leasingFunnelPerformanceReport_1 = require("./reports/leasingFunnelPerformanceReport");
Object.defineProperty(exports, "getLeasingFunnelPerformanceReport", { enumerable: true, get: function () { return leasingFunnelPerformanceReport_1.getLeasingFunnelPerformanceReport; } });
const annualBudgetComparativeReport_1 = require("./reports/annualBudgetComparativeReport");
Object.defineProperty(exports, "getAnnualBudgetComparativeReport", { enumerable: true, get: function () { return annualBudgetComparativeReport_1.getAnnualBudgetComparativeReport; } });
const annualBudgetForecastReport_1 = require("./reports/annualBudgetForecastReport");
Object.defineProperty(exports, "getAnnualBudgetForecastReport", { enumerable: true, get: function () { return annualBudgetForecastReport_1.getAnnualBudgetForecastReport; } });
const delinquencyAsOfReport_1 = require("./reports/delinquencyAsOfReport");
Object.defineProperty(exports, "getDelinquencyAsOfReport", { enumerable: true, get: function () { return delinquencyAsOfReport_1.getDelinquencyAsOfReport; } });
Object.defineProperty(exports, "delinquencyColumnsList", { enumerable: true, get: function () { return delinquencyAsOfReport_1.delinquencyColumnsList; } });
const expenseDistributionReport_1 = require("./reports/expenseDistributionReport");
Object.defineProperty(exports, "getExpenseDistributionReport", { enumerable: true, get: function () { return expenseDistributionReport_1.getExpenseDistributionReport; } });
const balanceSheetReport_1 = require("./reports/balanceSheetReport");
Object.defineProperty(exports, "getBalanceSheetReport", { enumerable: true, get: function () { return balanceSheetReport_1.getBalanceSheetReport; } });
const agedReceivablesDetailReport_1 = require("./reports/agedReceivablesDetailReport");
Object.defineProperty(exports, "getAgedReceivablesDetailReport", { enumerable: true, get: function () { return agedReceivablesDetailReport_1.getAgedReceivablesDetailReport; } });
const budgetComparativeReport_1 = require("./reports/budgetComparativeReport");
Object.defineProperty(exports, "getBudgetComparativeReport", { enumerable: true, get: function () { return budgetComparativeReport_1.getBudgetComparativeReport; } });
const chartOfAccountsReport_1 = require("./reports/chartOfAccountsReport");
Object.defineProperty(exports, "getChartOfAccountsReport", { enumerable: true, get: function () { return chartOfAccountsReport_1.getChartOfAccountsReport; } });
const completedWorkflowsReport_1 = require("./reports/completedWorkflowsReport");
Object.defineProperty(exports, "getCompletedWorkflowsReport", { enumerable: true, get: function () { return completedWorkflowsReport_1.getCompletedWorkflowsReport; } });
const fixedAssetsReport_1 = require("./reports/fixedAssetsReport");
Object.defineProperty(exports, "getFixedAssetsReport", { enumerable: true, get: function () { return fixedAssetsReport_1.getFixedAssetsReport; } });
const inProgressWorkflowsReport_1 = require("./reports/inProgressWorkflowsReport");
Object.defineProperty(exports, "getInProgressWorkflowsReport", { enumerable: true, get: function () { return inProgressWorkflowsReport_1.getInProgressWorkflowsReport; } });
const incomeStatementDateRangeReport_1 = require("./reports/incomeStatementDateRangeReport");
Object.defineProperty(exports, "getIncomeStatementDateRangeReport", { enumerable: true, get: function () { return incomeStatementDateRangeReport_1.getIncomeStatementDateRangeReport; } });
const workOrderLaborSummaryReport_1 = require("./reports/workOrderLaborSummaryReport");
Object.defineProperty(exports, "getWorkOrderLaborSummaryReport", { enumerable: true, get: function () { return workOrderLaborSummaryReport_1.getWorkOrderLaborSummaryReport; } });
const cancelledWorkflowsReport_1 = require("./reports/cancelledWorkflowsReport");
Object.defineProperty(exports, "getCancelledWorkflowsReport", { enumerable: true, get: function () { return cancelledWorkflowsReport_1.getCancelledWorkflowsReport; } });
const leaseExpirationDetailReport_1 = require("./reports/leaseExpirationDetailReport");
Object.defineProperty(exports, "getLeaseExpirationDetailReport", { enumerable: true, get: function () { return leaseExpirationDetailReport_1.getLeaseExpirationDetailReport; } });
const leasingSummaryReport_1 = require("./reports/leasingSummaryReport");
Object.defineProperty(exports, "getLeasingSummaryReport", { enumerable: true, get: function () { return leasingSummaryReport_1.getLeasingSummaryReport; } });
const ownerDirectoryReport_1 = require("./reports/ownerDirectoryReport");
Object.defineProperty(exports, "getOwnerDirectoryReport", { enumerable: true, get: function () { return ownerDirectoryReport_1.getOwnerDirectoryReport; } });
const loansReport_1 = require("./reports/loansReport");
Object.defineProperty(exports, "getLoansReport", { enumerable: true, get: function () { return loansReport_1.getLoansReport; } });
const occupancySummaryReport_1 = require("./reports/occupancySummaryReport");
Object.defineProperty(exports, "getOccupancySummaryReport", { enumerable: true, get: function () { return occupancySummaryReport_1.getOccupancySummaryReport; } });
const ownerLeasingReport_1 = require("./reports/ownerLeasingReport");
Object.defineProperty(exports, "getOwnerLeasingReport", { enumerable: true, get: function () { return ownerLeasingReport_1.getOwnerLeasingReport; } });
const propertyPerformanceReport_1 = require("./reports/propertyPerformanceReport");
Object.defineProperty(exports, "getPropertyPerformanceReport", { enumerable: true, get: function () { return propertyPerformanceReport_1.getPropertyPerformanceReport; } });
const propertySourceTrackingReport_1 = require("./reports/propertySourceTrackingReport");
Object.defineProperty(exports, "getPropertySourceTrackingReport", { enumerable: true, get: function () { return propertySourceTrackingReport_1.getPropertySourceTrackingReport; } });
const receivablesActivityReport_1 = require("./reports/receivablesActivityReport");
Object.defineProperty(exports, "getReceivablesActivityReport", { enumerable: true, get: function () { return receivablesActivityReport_1.getReceivablesActivityReport; } });
const renewalSummaryReport_1 = require("./reports/renewalSummaryReport");
Object.defineProperty(exports, "getRenewalSummaryReport", { enumerable: true, get: function () { return renewalSummaryReport_1.getRenewalSummaryReport; } });
const vendorLedgerReport_1 = require("./reports/vendorLedgerReport");
Object.defineProperty(exports, "getVendorLedgerReport", { enumerable: true, get: function () { return vendorLedgerReport_1.getVendorLedgerReport; } });
const rentalApplicationsReport_1 = require("./reports/rentalApplicationsReport");
Object.defineProperty(exports, "getRentalApplicationsReport", { enumerable: true, get: function () { return rentalApplicationsReport_1.getRentalApplicationsReport; } });
const residentFinancialActivityReport_1 = require("./reports/residentFinancialActivityReport");
Object.defineProperty(exports, "getResidentFinancialActivityReport", { enumerable: true, get: function () { return residentFinancialActivityReport_1.getResidentFinancialActivityReport; } });
const screeningAssessmentReport_1 = require("./reports/screeningAssessmentReport");
Object.defineProperty(exports, "getScreeningAssessmentReport", { enumerable: true, get: function () { return screeningAssessmentReport_1.getScreeningAssessmentReport; } });
const securityDepositFundsDetailReport_1 = require("./reports/securityDepositFundsDetailReport");
Object.defineProperty(exports, "getSecurityDepositFundsDetailReport", { enumerable: true, get: function () { return securityDepositFundsDetailReport_1.getSecurityDepositFundsDetailReport; } });
const tenantDirectoryReport_1 = require("./reports/tenantDirectoryReport");
Object.defineProperty(exports, "getTenantDirectoryReport", { enumerable: true, get: function () { return tenantDirectoryReport_1.getTenantDirectoryReport; } });
const tenantLedgerReport_1 = require("./reports/tenantLedgerReport");
Object.defineProperty(exports, "getTenantLedgerReport", { enumerable: true, get: function () { return tenantLedgerReport_1.getTenantLedgerReport; } });
const propertyDirectoryReport_1 = require("./reports/propertyDirectoryReport");
Object.defineProperty(exports, "getPropertyDirectoryReport", { enumerable: true, get: function () { return propertyDirectoryReport_1.getPropertyDirectoryReport; } });
const cashflow12MonthReport_1 = require("./reports/cashflow12MonthReport");
Object.defineProperty(exports, "getCashflow12MonthReport", { enumerable: true, get: function () { return cashflow12MonthReport_1.getCashflow12MonthReport; } });
const incomeStatement12MonthReport_1 = require("./reports/incomeStatement12MonthReport");
Object.defineProperty(exports, "getIncomeStatement12MonthReport", { enumerable: true, get: function () { return incomeStatement12MonthReport_1.getIncomeStatement12MonthReport; } });
const unitDirectoryReport_1 = require("./reports/unitDirectoryReport");
Object.defineProperty(exports, "getUnitDirectoryReport", { enumerable: true, get: function () { return unitDirectoryReport_1.getUnitDirectoryReport; } });
const unitInspectionReport_1 = require("./reports/unitInspectionReport");
Object.defineProperty(exports, "getUnitInspectionReport", { enumerable: true, get: function () { return unitInspectionReport_1.getUnitInspectionReport; } });
const unitVacancyDetail_1 = require("./reports/unitVacancyDetail");
Object.defineProperty(exports, "getUnitVacancyDetailReport", { enumerable: true, get: function () { return unitVacancyDetail_1.getUnitVacancyDetailReport; } });
const vendorDirectoryReport_1 = require("./reports/vendorDirectoryReport");
Object.defineProperty(exports, "getVendorDirectoryReport", { enumerable: true, get: function () { return vendorDirectoryReport_1.getVendorDirectoryReport; } });
const workOrderReport_1 = require("./reports/workOrderReport");
Object.defineProperty(exports, "getWorkOrderReport", { enumerable: true, get: function () { return workOrderReport_1.getWorkOrderReport; } });
const propertyGroupDirectoryReport_1 = require("./reports/propertyGroupDirectoryReport");
Object.defineProperty(exports, "getPropertyGroupDirectoryReport", { enumerable: true, get: function () { return propertyGroupDirectoryReport_1.getPropertyGroupDirectoryReport; } });
exports.appfolioLimiter = new bottleneck_1.default({
    reservoir: 200, // initial value
    reservoirRefreshAmount: 200,
    reservoirRefreshInterval: 60 * 1000, // 1 minute
    maxConcurrent: 10,
    minTime: 100 // 10 requests per second, also helps with reservoir not depleting too fast
});
// Centralized AppFolio API call function with shared rate limiting and authentication
async function makeAppfolioApiCall(endpoint, payload) {
    const { VHOST, USERNAME, PASSWORD } = process.env;
    if (!VHOST || !USERNAME || !PASSWORD) {
        throw new Error('Missing AppFolio API credentials');
    }
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/${endpoint}`;
    try {
        const response = await exports.appfolioLimiter.schedule(() => axios_1.default.post(url, payload, {
            auth: { username: USERNAME, password: PASSWORD },
            headers: { 'Content-Type': 'application/json' },
        }));
        return response.data;
    }
    catch (error) {
        // Transform axios errors into more meaningful error messages
        if (axios_1.default.isAxiosError(error)) {
            const status = error.response?.status;
            const statusText = error.response?.statusText;
            const responseData = error.response?.data;
            // Try to extract meaningful error message from response
            let errorMessage = 'Unknown API error';
            if (responseData) {
                if (typeof responseData === 'string') {
                    errorMessage = responseData;
                }
                else if (responseData.error) {
                    errorMessage = responseData.error;
                }
                else if (responseData.message) {
                    errorMessage = responseData.message;
                }
                else if (responseData.errors && Array.isArray(responseData.errors)) {
                    errorMessage = responseData.errors.join(', ');
                }
            }
            if (status === 400) {
                throw new Error(`Bad Request: ${errorMessage}. Please check your parameters and try again.`);
            }
            else if (status === 401) {
                throw new Error(`Authentication failed: ${errorMessage}. Please check your AppFolio credentials.`);
            }
            else if (status === 403) {
                throw new Error(`Access denied: ${errorMessage}. You may not have permission to access this resource.`);
            }
            else if (status === 404) {
                throw new Error(`Resource not found: ${errorMessage}. The requested endpoint may not exist.`);
            }
            else if (status === 422) {
                throw new Error(`Validation error: ${errorMessage}. Please check your parameters and try again.`);
            }
            else if (status === 500) {
                throw new Error(`Internal server error: ${errorMessage}. This may be due to invalid parameters or a temporary server issue. Please verify your parameters and try again.`);
            }
            else if (status) {
                throw new Error(`HTTP ${status} ${statusText}: ${errorMessage}`);
            }
            else {
                throw new Error(`Network error: ${error.message}`);
            }
        }
        // Re-throw non-axios errors as-is
        throw error;
    }
}

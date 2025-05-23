import dotenv from 'dotenv';
import Bottleneck from "bottleneck";
import axios from 'axios'; // Import axios
dotenv.config();

import { getCashflowReport, CashflowReportArgs } from './reports/cashflowReport'; 
import { getAccountTotalsReport, AccountTotalsReportArgs, AccountTotalsReportResult } from './reports/accountTotalsReport';
import { getAgedPayablesSummaryReport, AgedPayablesSummaryArgs, AgedPayablesSummaryResult } from './reports/agedPayablesSummaryReport';
import { getRentRollItemizedReport, RentRollItemizedArgs, RentRollItemizedResult } from './reports/rentRollItemizedReport';
import { getGuestCardInquiriesReport, GuestCardInquiriesArgs, GuestCardInquiriesResult } from './reports/guestCardInquiriesReport';
import { getLeasingFunnelPerformanceReport, LeasingFunnelPerformanceArgs, LeasingFunnelPerformanceResult } from './reports/leasingFunnelPerformanceReport';
import { getAnnualBudgetComparativeReport, AnnualBudgetCompArgsV2, AnnualBudgetComparativeResult } from './reports/annualBudgetComparativeReport';
import { getAnnualBudgetForecastReport, AnnualBudgetForecastArgs, AnnualBudgetForecastResult } from './reports/annualBudgetForecastReport';
import { getDelinquencyAsOfReport, DelinquencyAsOfArgs, DelinquencyColumn, delinquencyColumnsList, DelinquencyAsOfResult } from './reports/delinquencyAsOfReport';
import { getExpenseDistributionReport, ExpenseDistributionArgs, ExpenseDistributionResult } from './reports/expenseDistributionReport';
import { getBalanceSheetReport, BalanceSheetArgs, BalanceSheetResult } from './reports/balanceSheetReport';
import { getAgedReceivablesDetailReport, AgedReceivablesDetailArgs, AgedReceivablesDetailResult } from './reports/agedReceivablesDetailReport';
import { getBudgetComparativeReport, BudgetComparativeArgs, BudgetComparativeResult } from './reports/budgetComparativeReport';
import { getChartOfAccountsReport, ChartOfAccountsArgs, ChartOfAccountsResult } from './reports/chartOfAccountsReport';
import { getCompletedWorkflowsReport, CompletedWorkflowsArgs, CompletedWorkflowsResult } from './reports/completedWorkflowsReport';
import { getFixedAssetsReport, FixedAssetsArgs, FixedAssetsResult } from './reports/fixedAssetsReport';
import { getInProgressWorkflowsReport, InProgressWorkflowsArgs, InProgressWorkflowsResult } from './reports/inProgressWorkflowsReport';
import { getIncomeStatementDateRangeReport, IncomeStatementDateRangeArgs, IncomeStatementDateRangeResult } from './reports/incomeStatementDateRangeReport';
import { getWorkOrderLaborSummaryReport, WorkOrderLaborSummaryArgs, WorkOrderLaborSummaryResult } from './reports/workOrderLaborSummaryReport';
import { getCancelledWorkflowsReport, CancelledWorkflowsArgs, CancelledWorkflowsResult } from './reports/cancelledWorkflowsReport';
import { getLeaseExpirationDetailReport, LeaseExpirationDetailArgs, LeaseExpirationDetailResult } from './reports/leaseExpirationDetailReport';
import { getLeasingSummaryReport, LeasingSummaryArgs, LeasingSummaryResult } from './reports/leasingSummaryReport';
import { getOwnerDirectoryReport, OwnerDirectoryReportArgs, OwnerDirectoryResult, OwnerDirectoryReportPropertiesArgs, OwnerDirectoryReportResultItem } from './reports/ownerDirectoryReport';
import { getLoansReport, LoansArgs, LoansResult } from './reports/loansReport';
import { getOccupancySummaryReport, OccupancySummaryArgs, OccupancySummaryResult } from './reports/occupancySummaryReport';
import { getOwnerLeasingReport, OwnerLeasingArgs, OwnerLeasingResult } from './reports/ownerLeasingReport';
import { getPropertyPerformanceReport, PropertyPerformanceArgs, PropertyPerformanceResult } from './reports/propertyPerformanceReport';
import { getPropertySourceTrackingReport, PropertySourceTrackingArgs, PropertySourceTrackingResult } from './reports/propertySourceTrackingReport';
import { getReceivablesActivityReport, ReceivablesActivityArgs, ReceivablesActivityResult } from './reports/receivablesActivityReport';
import { getRenewalSummaryReport, RenewalSummaryArgs, RenewalSummaryResult } from './reports/renewalSummaryReport';
import { getVendorLedgerReport, VendorLedgerArgs, VendorLedgerResult } from './reports/vendorLedgerReport';
import { getRentalApplicationsReport, RentalApplicationsArgs, RentalApplicationsResult } from './reports/rentalApplicationsReport';
import { getResidentFinancialActivityReport, ResidentFinancialActivityArgs, ResidentFinancialActivityResult } from './reports/residentFinancialActivityReport';
import { getScreeningAssessmentReport, ScreeningAssessmentArgs, ScreeningAssessmentResult } from './reports/screeningAssessmentReport';
import { getSecurityDepositFundsDetailReport, SecurityDepositFundsDetailArgs, SecurityDepositFundsDetailResult } from './reports/securityDepositFundsDetailReport';
import { getTenantDirectoryReport, TenantDirectoryArgs, TenantDirectoryResult } from './reports/tenantDirectoryReport';
import { getTenantLedgerReport, TenantLedgerArgs, TenantLedgerResult } from './reports/tenantLedgerReport';
import { getPropertyDirectoryReport, PropertyDirectoryArgs, PropertyDirectoryResult } from './reports/propertyDirectoryReport';
import { getCashflow12MonthReport, Cashflow12MonthArgs, Cashflow12MonthResult } from './reports/cashflow12MonthReport';
import { getIncomeStatement12MonthReport, IncomeStatement12MonthArgs, IncomeStatement12MonthResult } from './reports/incomeStatement12MonthReport';
import { getUnitDirectoryReport, UnitDirectoryArgs, UnitDirectoryResult } from './reports/unitDirectoryReport';
import { getUnitInspectionReport, UnitInspectionArgs, UnitInspectionResult } from './reports/unitInspectionReport';
import { getUnitVacancyDetailReport, UnitVacancyDetailArgs, UnitVacancyDetailResult } from './reports/unitVacancyDetail';
import { getVendorDirectoryReport, VendorDirectoryArgs, VendorDirectoryResult } from './reports/vendorDirectoryReport';
import { getWorkOrderReport, WorkOrderArgs, WorkOrderResult } from './reports/workOrderReport';

export const appfolioLimiter = new Bottleneck({
  reservoir: 200, // initial value
  reservoirRefreshAmount: 200,
  reservoirRefreshInterval: 60 * 1000, // 1 minute
  maxConcurrent: 10,
  minTime: 100 // 10 requests per second, also helps with reservoir not depleting too fast
});

// Centralized AppFolio API call function with shared rate limiting and authentication
export async function makeAppfolioApiCall<T = any>(endpoint: string, payload: any): Promise<T> {
  const { VHOST, USERNAME, PASSWORD } = process.env;
  
  if (!VHOST || !USERNAME || !PASSWORD) {
    throw new Error('Missing AppFolio API credentials');
  }

  const url = `https://${VHOST}.appfolio.com/api/v2/reports/${endpoint}`;
  const response = await appfolioLimiter.schedule(() => 
    axios.post(url, payload, {
      auth: { username: USERNAME, password: PASSWORD },
      headers: { 'Content-Type': 'application/json' },
    })
  );

  return response.data;
}

export {
  // Imported from ./reports/cashflowReport
  getCashflowReport,
  CashflowReportArgs,

  // Imported from ./reports/accountTotalsReport
  getAccountTotalsReport,
  AccountTotalsReportArgs,
  AccountTotalsReportResult,

  // Imported from ./reports/agedPayablesSummaryReport
  getAgedPayablesSummaryReport,
  AgedPayablesSummaryArgs,
  AgedPayablesSummaryResult,

  // Imported from ./reports/rentRollItemizedReport
  getRentRollItemizedReport,
  RentRollItemizedArgs,
  RentRollItemizedResult,

  // Imported from ./reports/guestCardInquiriesReport
  getGuestCardInquiriesReport,
  GuestCardInquiriesArgs,
  GuestCardInquiriesResult,

  // Imported from ./reports/leasingFunnelPerformanceReport
  getLeasingFunnelPerformanceReport,
  LeasingFunnelPerformanceArgs,
  LeasingFunnelPerformanceResult,

  // Imported from ./reports/annualBudgetComparativeReport
  getAnnualBudgetComparativeReport,
  AnnualBudgetCompArgsV2,
  AnnualBudgetComparativeResult,

  // Imported from ./reports/annualBudgetForecastReport
  getAnnualBudgetForecastReport,
  AnnualBudgetForecastArgs,
  AnnualBudgetForecastResult,

  // Imported from ./reports/delinquencyAsOfReport
  getDelinquencyAsOfReport,
  DelinquencyAsOfArgs,
  DelinquencyColumn,
  delinquencyColumnsList,
  DelinquencyAsOfResult,

  // Imported from ./reports/expenseDistributionReport
  getExpenseDistributionReport,
  ExpenseDistributionArgs,
  ExpenseDistributionResult,

  // Imported from ./reports/balanceSheetReport
  getBalanceSheetReport,
  BalanceSheetArgs,
  BalanceSheetResult,

  // Imported from ./reports/agedReceivablesDetailReport
  getAgedReceivablesDetailReport,
  AgedReceivablesDetailArgs,
  AgedReceivablesDetailResult,

  // Imported from ./reports/budgetComparativeReport
  getBudgetComparativeReport,
  BudgetComparativeArgs,
  BudgetComparativeResult,

  // Imported from ./reports/chartOfAccountsReport
  getChartOfAccountsReport,
  ChartOfAccountsArgs,
  ChartOfAccountsResult,

  // Imported from ./reports/completedWorkflowsReport
  getCompletedWorkflowsReport,
  CompletedWorkflowsArgs,
  CompletedWorkflowsResult,

  // Imported from ./reports/fixedAssetsReport
  getFixedAssetsReport,
  FixedAssetsArgs,
  FixedAssetsResult,

  // Imported from ./reports/inProgressWorkflowsReport
  getInProgressWorkflowsReport,
  InProgressWorkflowsArgs,
  InProgressWorkflowsResult,

  // Imported from ./reports/incomeStatementDateRangeReport
  getIncomeStatementDateRangeReport,
  IncomeStatementDateRangeArgs,
  IncomeStatementDateRangeResult,

  // Imported from ./reports/workOrderLaborSummaryReport
  getWorkOrderLaborSummaryReport,
  WorkOrderLaborSummaryArgs,
  WorkOrderLaborSummaryResult,

  // Imported from ./reports/cancelledWorkflowsReport
  getCancelledWorkflowsReport,
  CancelledWorkflowsArgs,
  CancelledWorkflowsResult,

  // Imported from ./reports/leaseExpirationDetailReport
  getLeaseExpirationDetailReport,
  LeaseExpirationDetailArgs,
  LeaseExpirationDetailResult,

  // Imported from ./reports/leasingSummaryReport
  getLeasingSummaryReport,
  LeasingSummaryArgs,
  LeasingSummaryResult,

  // Imported from ./reports/ownerDirectoryReport
  getOwnerDirectoryReport,
  OwnerDirectoryReportArgs,
  OwnerDirectoryResult,
  OwnerDirectoryReportPropertiesArgs,
  OwnerDirectoryReportResultItem,

  // Imported from ./reports/loansReport
  getLoansReport,
  LoansArgs,
  LoansResult,

  // Imported from ./reports/occupancySummaryReport
  getOccupancySummaryReport,
  OccupancySummaryArgs,
  OccupancySummaryResult,

  // Imported from ./reports/ownerLeasingReport
  getOwnerLeasingReport,
  OwnerLeasingArgs,
  OwnerLeasingResult,

  // Imported from ./reports/propertyPerformanceReport
  getPropertyPerformanceReport,
  PropertyPerformanceArgs,
  PropertyPerformanceResult,

  // Imported from ./reports/propertySourceTrackingReport
  getPropertySourceTrackingReport,
  PropertySourceTrackingArgs,
  PropertySourceTrackingResult,

  // Imported from ./reports/receivablesActivityReport
  getReceivablesActivityReport,
  ReceivablesActivityArgs,
  ReceivablesActivityResult,

  // Imported from ./reports/renewalSummaryReport
  getRenewalSummaryReport,
  RenewalSummaryArgs,
  RenewalSummaryResult,

  // Imported from ./reports/vendorLedgerReport
  getVendorLedgerReport,
  VendorLedgerArgs,
  VendorLedgerResult,
  
  // Imported from ./reports/rentalApplicationsReport
  getRentalApplicationsReport,
  RentalApplicationsArgs,
  RentalApplicationsResult,
  
  // Imported from ./reports/residentFinancialActivityReport
  getResidentFinancialActivityReport,
  ResidentFinancialActivityArgs,
  ResidentFinancialActivityResult,
  
  // Imported from ./reports/screeningAssessmentReport
  getScreeningAssessmentReport,
  ScreeningAssessmentArgs,
  ScreeningAssessmentResult,
  
  // Imported from ./reports/securityDepositFundsDetailReport
  getSecurityDepositFundsDetailReport,
  SecurityDepositFundsDetailArgs,
  SecurityDepositFundsDetailResult,
  
  // Imported from ./reports/tenantDirectoryReport
  getTenantDirectoryReport,
  TenantDirectoryArgs,
  TenantDirectoryResult,

  // Imported from ./reports/tenantLedgerReport
  getTenantLedgerReport,
  TenantLedgerArgs,
  TenantLedgerResult,

  // Imported from ./reports/propertyDirectoryReport
  getPropertyDirectoryReport,
  PropertyDirectoryArgs,
  PropertyDirectoryResult,

  // Imported from ./reports/cashflow12MonthReport
  getCashflow12MonthReport,
  Cashflow12MonthArgs,
  Cashflow12MonthResult,

  // Imported from ./reports/incomeStatement12MonthReport
  getIncomeStatement12MonthReport,
  IncomeStatement12MonthArgs,
  IncomeStatement12MonthResult,

  // Imported from ./reports/unitDirectoryReport
  getUnitDirectoryReport,
  UnitDirectoryArgs,
  UnitDirectoryResult,

  // Imported from ./reports/unitVacancyDetailReport
  getUnitVacancyDetailReport,
  UnitVacancyDetailArgs,
  UnitVacancyDetailResult,

  // Imported from ./reports/vendorDirectoryReport
  getVendorDirectoryReport,
  VendorDirectoryArgs,
  VendorDirectoryResult,

  // Imported from ./reports/workOrderReport
  getWorkOrderReport,
  WorkOrderArgs,
  WorkOrderResult,

  // Imported from ./reports/unitInspectionReport
  getUnitInspectionReport,
  UnitInspectionArgs,
  UnitInspectionResult,
};
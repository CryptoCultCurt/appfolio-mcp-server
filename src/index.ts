#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { registerCashflowReportTool } from "./reports/cashflowReport";
import { registerAccountTotalsReportTool } from "./reports/accountTotalsReport";
import { registerAgedPayablesSummaryReportTool } from "./reports/agedPayablesSummaryReport";
import { registerRentRollItemizedReportTool } from "./reports/rentRollItemizedReport";
import { registerGuestCardInquiriesReportTool } from "./reports/guestCardInquiriesReport";
import { registerLeasingFunnelPerformanceReportTool } from "./reports/leasingFunnelPerformanceReport";
import { registerAnnualBudgetComparativeReportTool } from "./reports/annualBudgetComparativeReport";
import { registerAnnualBudgetForecastReportTool } from "./reports/annualBudgetForecastReport";
import { registerDelinquencyAsOfReportTool } from "./reports/delinquencyAsOfReport";
import { registerExpenseDistributionReportTool } from "./reports/expenseDistributionReport";
import { registerBalanceSheetReportTool } from "./reports/balanceSheetReport";
import { registerAgedReceivablesDetailReportTool } from "./reports/agedReceivablesDetailReport";
import { registerBudgetComparativeReportTool } from "./reports/budgetComparativeReport";
import { registerChartOfAccountsReportTool } from "./reports/chartOfAccountsReport";
import { registerCompletedWorkflowsReportTool } from "./reports/completedWorkflowsReport";
import { registerFixedAssetsReportTool } from "./reports/fixedAssetsReport";
import { registerInProgressWorkflowsReportTool } from "./reports/inProgressWorkflowsReport";
import { registerIncomeStatementDateRangeReportTool } from "./reports/incomeStatementDateRangeReport";
import { registerCancelledWorkflowsReportTool } from "./reports/cancelledWorkflowsReport";
import { registerLeaseExpirationDetailReportTool } from "./reports/leaseExpirationDetailReport";
import { registerLeasingSummaryReportTool } from "./reports/leasingSummaryReport";
import { registerOwnerDirectoryReportTool } from "./reports/ownerDirectoryReport";
import { registerLoansReportTool } from "./reports/loansReport";
import { registerOccupancySummaryReportTool } from "./reports/occupancySummaryReport";
import { registerOwnerLeasingReportTool } from "./reports/ownerLeasingReport";
import { registerPropertyPerformanceReportTool } from "./reports/propertyPerformanceReport";
import { registerPropertySourceTrackingReportTool } from "./reports/propertySourceTrackingReport";
import { registerReceivablesActivityReportTool } from "./reports/receivablesActivityReport";
import { registerRenewalSummaryReportTool } from "./reports/renewalSummaryReport";
import { registerVendorLedgerReportTool } from "./reports/vendorLedgerReport";
import { registerRentalApplicationsReportTool } from "./reports/rentalApplicationsReport";
import { registerResidentFinancialActivityReportTool } from "./reports/residentFinancialActivityReport";
import { registerScreeningAssessmentReportTool } from "./reports/screeningAssessmentReport";
import { registerSecurityDepositFundsDetailReportTool } from "./reports/securityDepositFundsDetailReport";
import { registerTenantDirectoryReportTool } from "./reports/tenantDirectoryReport";
import { registerTrialBalanceByPropertyReportTool } from "./reports/trialBalanceByPropertyReport";
import { registerPropertyDirectoryReportTool } from "./reports/propertyDirectoryReport";
import { registerCashflow12MonthReportTool } from "./reports/cashflow12MonthReport";
import { registerIncomeStatement12MonthReportTool } from "./reports/incomeStatement12MonthReport";
import { registerUnitDirectoryReportTool } from "./reports/unitDirectoryReport";
import { registerUnitInspectionReportTool } from "./reports/unitInspectionReport";
import { registerUnitVacancyDetailReportTool } from "./reports/unitVacancyDetail";
import { registerVendorDirectoryReportTool } from "./reports/vendorDirectoryReport";
import { registerWorkOrderReportTool } from "./reports/workOrderReport";
import { registerWorkOrderLaborSummaryReportTool } from "./reports/workOrderLaborSummaryReport";
import { registerTenantLedgerReportTool } from "./reports/tenantLedgerReport";

// Create the MCP server
const server = new McpServer({
  name: "appfolio-mcp",
  version: "1.0.0",
});

const transport = new StdioServerTransport();

registerCashflowReportTool(server);
registerAccountTotalsReportTool(server);
registerAgedPayablesSummaryReportTool(server);
registerRentRollItemizedReportTool(server);
registerGuestCardInquiriesReportTool(server);
registerLeasingFunnelPerformanceReportTool(server);
registerAnnualBudgetComparativeReportTool(server);
registerAnnualBudgetForecastReportTool(server);
registerDelinquencyAsOfReportTool(server);
registerExpenseDistributionReportTool(server);
registerBalanceSheetReportTool(server);
registerAgedReceivablesDetailReportTool(server);
registerBudgetComparativeReportTool(server);
registerChartOfAccountsReportTool(server);
registerCompletedWorkflowsReportTool(server);
registerFixedAssetsReportTool(server);
registerInProgressWorkflowsReportTool(server);
registerIncomeStatementDateRangeReportTool(server);
registerWorkOrderLaborSummaryReportTool(server);
registerCancelledWorkflowsReportTool(server);
registerLeaseExpirationDetailReportTool(server);
registerLeasingSummaryReportTool(server);
registerOwnerDirectoryReportTool(server);
registerLoansReportTool(server);
registerOccupancySummaryReportTool(server);
registerOwnerLeasingReportTool(server);
registerPropertyPerformanceReportTool(server);
registerPropertySourceTrackingReportTool(server);
registerReceivablesActivityReportTool(server);
registerRenewalSummaryReportTool(server);
registerVendorLedgerReportTool(server);
registerRentalApplicationsReportTool(server);
registerResidentFinancialActivityReportTool(server);
registerScreeningAssessmentReportTool(server);
registerSecurityDepositFundsDetailReportTool(server);
registerTenantDirectoryReportTool(server);
registerTenantLedgerReportTool(server);
registerTrialBalanceByPropertyReportTool(server);
registerPropertyDirectoryReportTool(server);
registerCashflow12MonthReportTool(server);
registerIncomeStatement12MonthReportTool(server);
registerUnitDirectoryReportTool(server);
registerUnitInspectionReportTool(server);
registerUnitVacancyDetailReportTool(server);
registerVendorDirectoryReportTool(server);
registerWorkOrderReportTool(server);
registerWorkOrderLaborSummaryReportTool(server);

server.connect(transport);
console.log(`MCP Server listening on port ${process.env.PORT}`);
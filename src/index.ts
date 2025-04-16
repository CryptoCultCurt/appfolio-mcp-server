import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { getAccountTotalsReport, getAgedPayablesSummaryReport, getAgedReceivablesDetailReport, getBudgetComparativeReport, 
  getCashflowReport, getDelinquencyAsOfReport, getExpenseDistributionReport, getGuestCardInquiriesReport, 
  getLeasingFunnelPerformanceReport, getPropertyDirectoryReport, getRentRollItemizedReport } from "./appfolio";

// reports todo:
// getAnnualBudgetComparativeReport
// getAnnualBudgetForecastReport
// getBalanceSheetReport
// getBalanceSheetComparativeReport
// getCancelledWorkflowsReport
// getChartOfAccountsReport
// getCompletedWorkflowsReport
// getFixedAssetsReport
// getInProgressWorkflowsReport
// getIncomeStatementDateRangeReport
// getLeaseExpirationDetailByMonthReport
// getLeasingSummaryReport
// getLoansReport
// getOccupancySummaryReport
// getOwnerLeasingReport
// getPropertyPerformanceReport
// getPropertySourceTrackingReport
// getReceivablesActivityReport
// getRenewalSummaryReport
// getRentalApplicationsReport
// getResidentFinancialActivityReport
// getScreeningAssessmentReport
// getSecurityDepositFundsDetailReport
// getSurveyResponsesReport
// getDebtCollectionsStatusReport
// getTenantDirectoryReport
// getTenantLedgerReport
// getTrialBalanceByPropertyReport
// getCashflow12MonthReport
// getIncomeStatement12MonthReport
// getUnitDirectoryReport
// getUnitInspectionReport
// getUnitVacancyDetailReport
// getActivitiesSummaryReport
// getVendorDirectoryReport
// getVendorLedgerReport
// getWorkOrderReport
// getWorkOrderLaborSummaryReport







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
  property_visibility: z.string(),
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
  columns: z.array(z.string()).optional()
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

// Create the MCP server
const server = new McpServer({
  name: "appfolio-mcp",
  version: "1.0.0",
});

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
  async (args, _extra) => {
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
  async (args, _extra) => {
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
  async (args: import("./appfolio").AgedPayablesSummaryArgs, _extra: unknown) => {
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
  async (args: import("./appfolio").AgedReceivablesDetailArgs, _extra: unknown) => {
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
  async (args: import("./appfolio").BudgetComparativeArgs, _extra: unknown) => {
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
  async (args: import("./appfolio").ExpenseDistributionArgs, _extra: unknown) => {
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
  async (args: import("./appfolio").RentRollItemizedArgs, _extra: unknown) => {
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
  async (args: import("./appfolio").DelinquencyAsOfArgs, _extra: unknown) => {
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
  async (args: import("./appfolio").GuestCardInquiriesArgs, _extra: unknown) => {
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
  async (args: import("./appfolio").LeasingFunnelPerformanceArgs, _extra: unknown) => {
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

server.connect(transport);
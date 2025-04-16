import axios from 'axios';
import dotenv from 'dotenv';
import Bottleneck from "bottleneck";
dotenv.config();

const { VHOST, USERNAME, PASSWORD } = process.env;

export type CashflowReportArgs = {
  property_visibility: string;
  properties?: {
    properties_ids?: string[];
    property_groups_ids?: string[];
    portfolios_ids?: string[];
    owners_ids?: string[];
  };
  posted_on_from: string;
  posted_on_to: string;
  gl_account_map_id?: string;
  exclude_suppressed_fees?: string;
  columns?: string[];
};

export type AccountTotalsReportArgs = {
  property_visibility: string;
  properties?: {
    properties_ids?: string[];
    property_groups_ids?: string[];
    portfolios_ids?: string[];
    owners_ids?: string[];
  };
  gl_account_ids?: string; // default handled in function
  posted_on_from: string;
  posted_on_to: string;
  columns?: string[];
};

export type AccountTotalsReportResult = {
  results: Array<{
    property: string;
    property_name: string;
    property_id: number;
    property_address: string;
    property_street: string;
    property_street2: string;
    property_city: string;
    property_state: string;
    property_zip: string;
    reserve_amount: string;
    net_amount: string;
    ending_balance: string;
  }>;
  next_page_url: string;
};

export type AgedPayablesSummaryArgs = {
  property_visibility?: string; // default handled in function
  properties?: {
    properties_ids?: string[];
    property_groups_ids?: string[];
    portfolios_ids?: string[];
    owners_ids?: string[];
  };
  occurred_on_to: string;
  party_contact_info?: {
    company_id?: string;
  };
  balance_operator?: {
    amount?: string;
    comparator?: string;
  };
  columns?: string[];
};

export type AgedPayablesSummaryResult = {
  results: Array<{
    property: string;
    property_name: string;
    property_id: number;
    property_address: string;
    property_street: string;
    property_street2: string;
    property_city: string;
    property_state: string;
    property_zip: string;
    payee_name: string;
    unit_id: number;
    amount_payable: string;
    not_yet_due: string;
    "0_to30": string;
    "30_to60": string;
    "60_to90": string;
    "90_plus": string;
    "30_plus": string;
    "60_plus": string;
    party_id: string;
    party_type: string;
  }>;
  next_page_url: string;
};

export type RentRollItemizedArgs = {
  properties?: {
    properties_ids?: string[];
    property_groups_ids?: string[];
    portfolios_ids?: string[];
    owners_ids?: string[];
  };
  unit_visibility?: string; // default handled in function
  tags?: string;
  gl_account_ids?: string[];
  as_of_to: string;
  columns?: string[];
};

export type RentRollItemizedResult = {
  results: Array<{
    property: string;
    property_name: string;
    property_id: number;
    property_address: string;
    property_street: string;
    property_street2: string;
    property_city: string;
    property_state: string;
    property_zip: string;
    property_type: string;
    occupancy_id: number;
    unit_id: number;
    unit: string;
    unit_tags: string;
    unit_type: string;
    bd_ba: string;
    tenant: string;
    status: string;
    sqft: number;
    market_rent: string;
    computed_market_rent: string;
    advertised_rent: string;
    gl_accounts: Array<{ id: number; value: string }>;
    total: string;
    other_charges: string;
    monthly_rent_square_ft: string;
    annual_rent_square_ft: string;
    deposit: string;
    lease_from: string;
    lease_to: string;
    last_rent_increase: string;
    next_rent_adjustment: string;
    next_rent_increase_amount: string;
    next_rent_increase: string;
    move_in: string;
    move_out: string;
    past_due: string;
    nsf: number;
    late: number;
    amenities: string;
    additional_tenants: string;
    monthly_charges: string;
    rent_ready: string;
    rent_status: string;
    legal_rent: string;
    preferential_rent: string;
    tenant_tags: string;
    tenant_agent: string;
    property_group_id: string;
    portfolio_id: number;
  }>;
  next_page_url: string;
};

export type AgedReceivablesDetailArgs = {
  property_visibility?: string; // default handled in function
  properties?: {
    properties_ids?: string[];
    property_groups_ids?: string[];
    portfolios_ids?: string[];
    owners_ids?: string[];
  };
  tags?: string;
  balance_operator?: {
    amount?: string;
    comparator?: string;
  };
  tenant_statuses?: string[];
  occurred_on_to: string;
  gl_account_map_id?: string;
  columns?: string[];
};

export type AgedReceivablesDetailResult = {
  results: Array<{
    payer_name: string;
    property: string;
    property_name: string;
    property_id: number;
    property_address: string;
    property_street: string;
    property_street2: string;
    property_city: string;
    property_state: string;
    property_zip: string;
    invoice_occurred_on: string;
    account_number: string;
    account_name: string;
    account_id: number;
    total_amount: string;
    amount_receivable: string;
    future_charges: string;
    "0_to30": string;
    "30_to60": string;
    "60_to90": string;
    "90_plus": string;
    "30_plus": string;
    "60_plus": string;
    occupancy_name: string;
    account: string;
    unit_address: string;
    unit_street: string;
    unit_street2: string;
    unit_city: string;
    unit_state: string;
    unit_zip: string;
    unit_name: string;
    unit_type: string;
    unit_tags: string;
    tenant_status: string;
    payment_plan: string;
    txn_id: number;
    occupancy_id: number;
    unit_id: number;
  }>;
  next_page_url: string;
};

export type GuestCardInquiriesArgs = {
  property_visibility?: string; // defaults to "active"
  properties?: {
    properties_ids?: string[];
    property_groups_ids?: string[];
    portfolios_ids?: string[];
    owners_ids?: string[];
  };
  guest_card_sources?: string[]; // defaults to []
  guest_card_statuses?: string[]; // defaults to []
  guest_card_lead_types?: string[]; // defaults to []
  assigned_user?: string;
  assigned_user_visibility?: string; // Add missing property (used in function)
  guest_card_status?: string; // Add missing property (used in function)
  filter_date_range_by?: string;
  received_on_from: string; // required
  received_on_to: string;   // required
  columns?: string[];
};

export type GuestCardInquiriesResult = {
  results: Array<{
    name: string;
    email_address: string;
    phone_number: string;
    received: string;
    last_activity_date: string;
    last_activity_type: string;
    latest_interest_date: string;
    latest_interest_source: string;
    status: string;
    move_in_preference: string;
    max_rent: string;
    bed_bath_preference: string;
    pet_preference: string;
    monthly_income: string;
    credit_score: string;
    lead_type: string;
    source: string;
    property: string;
    unit: string;
    assigned_user: string;
    assigned_user_id: number;
    guest_card_id: number;
    inquiry_id: number;
    occupancy_id: number;
    property_id: string;
    unit_id: string;
    notes: string;
    tenant_id: number;
    rental_application_id: number;
    rental_application_group_id: number;
    applicants: string;
    inquiry_type: string;
    total_interests_received: number;
    interests_received_in_range: number;
    showings: number;
    interest_to_showing_scheduled: string;
    showing_to_application_received: string;
    application_received_to_decision: string;
    application_submission_to_lease_signed: string;
    inquiry_to_lease_signed: string;
    inactive_reason: string;
    crm: string;
  }>;
  next_page_url: string;
};

export type LeasingFunnelPerformanceArgs = {
  property_visibility?: string; // defaults to "all"
  properties?: {
    properties_ids?: string[];
    property_groups_ids?: string[];
    portfolios_ids?: string[];
    owners_ids?: string[];
  };
  received_on_from: string; // required
  received_on_to: string;   // required
  assigned_user_visibility?: string; // defaults to "active"
  assigned_user?: string;            // defaults to "All"
  columns?: string[];
};

export type LeasingFunnelPerformanceResult = {
  results: Array<{
    assigned_inquiry_owner: string;
    assigned_inquiry_owner_id: number;
    property_name: string;
    property_id: number;
    inquiries: number;
    completed_showings: number;
    cancelled_showings: number;
    rental_apps: number;
    decision_pending: number;
    approved: number;
    denied: number;
    cancelled: number;
    signed_leases: number;
    move_ins: number;
    inquiries_to_completed_showings: string;
    completed_showings_to_apps: string;
    approved_app_rate: string;
    apps_to_signed_leases: string;
    inquiries_to_leases: string;
  }>;
  next_page_url: string;
};

export type AnnualBudgetCompArgsV2 = {
  property_visibility?: string;
  properties?: {
    properties_ids?: string[];
    property_groups_ids?: string[];
    portfolios_ids?: string[];
    owners_ids?: string[];
  };
  occurred_on_to: string; // Add missing required field
  additional_account_types?: string[];
  gl_account_map_id?: string;
  level_of_detail?: string;
  columns?: string[];
};

export type AnnualBudgetComparativeResult = Array<{
  account_name: string;
  mtd_actual: string;
  mtd_budget: string;
  mtd_amount_variance: string;
  mtd_percent_variance: string;
  ytd_actual: string;
  ytd_budget: string;
  ytd_amount_variance: string;
  ytd_percent_variance: string;
  annual: string;
  account_number: string;
  note: string;
  variance_note: string;
}>;

export type AnnualBudgetForecastArgs = {
  property_visibility?: "active" | "hidden" | "all";
  properties?: {
    properties_ids?: string[];
    property_groups_ids?: string[];
    portfolios_ids?: string[];
    owners_ids?: string[];
  };
  period_from: string; // Required, format YYYY-MM
  period_to: string;   // Required, format YYYY-MM
  consolidate?: "0" | "1";
  gl_account_map_id?: string;
  columns?: string[];
};

export type AnnualBudgetForecastResult = Array<{
  account_name: string;
  account_code: string;
  months: Array<{
    id: string; // e.g., "2023-06"
    value: string;
  }>;
  total: string;
  property_name: string;
  property_id: number;
  account_id: number;
  note: string;
}>;

export type DelinquencyAsOfArgs = {
  property_visibility?: string; // defaults to "active"
  properties?: {
    properties_ids?: string[];
    property_groups_ids?: string[];
    portfolios_ids?: string[];
    owners_ids?: string[];
  };
  occurred_on_to: string; // required
  delinquency_note_range?: string;
  tenant_statuses?: string[]; // defaults to ["0", "4"]
  tags?: string;
  amount_owed_in_account?: string; // defaults to "all"
  balance_operator?: {
    amount?: string;
    comparator?: string;
  };
  columns?: string[];
};

export type DelinquencyAsOfResult = {
  results: Array<{
    unit: string;
    name: string;
    tenant_status: string;
    tags: string;
    phone_numbers: string;
    move_in: string;
    move_out: string;
    primary_tenant_email: string;
    unit_type: string;
    property: string;
    property_name: string;
    property_id: number;
    property_address: string;
    property_street: string;
    property_street2: string;
    property_city: string;
    property_state: string;
    property_zip: string;
    amount_receivable: string;
    delinquent_subsidy_amount: string;
    "00_to30": string;
    "30_plus": string;
    "30_to60": string;
    "60_plus": string;
    "60_to90": string;
    "90_plus": string;
    this_month: string;
    last_month: string;
    month_before_last: string;
    delinquent_rent: string;
    delinquency_notes: string;
    certified_funds_only: string;
    in_collections: string;
    collections_agency: string;
    unit_id: number;
    occupancy_id: number;
    property_group_id: string;
  }>;
  next_page_url: string;
};

export type BudgetComparativeArgs = {
  property_visibility?: string; // default handled in function
  properties?: {
    properties_ids?: string[];
    property_groups_ids?: string[];
    portfolios_ids?: string[];
    owners_ids?: string[];
  };
  period_from: string;
  period_to: string;
  comparison_period_from: string;
  comparison_period_to: string;
  gl_account_map_id?: string;
  columns?: string[];
};

export type BudgetComparativeResult = Array<{
  account_number: string;
  account_name: string;
  period_actual: string;
  comparison_actual: string;
  period_var: string;
  percent_var: string;
  period_budget: string;
  comparison_budget: string;
  budget_period_var: string;
  budget_percent_var: string;
  comparison_period_var: string;
  comparison_percent_var: string;
}>;

export type ExpenseDistributionArgs = {
  property_visibility?: string; // default handled in function
  properties?: {
    properties_ids?: string[];
    property_groups_ids?: string[];
    portfolios_ids?: string[];
    owners_ids?: string[];
  };
  party_contact_info?: {
    company_id?: string;
  };
  posted_on_from: string;
  posted_on_to: string;
  gl_account_map_id?: string;
  columns?: string[];
};

export type ExpenseDistributionResult = {
  results: Array<{
    account: string;
    account_name: string;
    account_number: string;
    invoice_num: string;
    invoice_date: string;
    property_name: string;
    unit: string;
    property_address: string;
    payee: string;
    payable_account: string;
    amount: string;
    unpaid_amount: string;
    check_num: string;
    check_date: string;
    description: string;
  }>;
  next_page_url: string;
};

export type BalanceSheetArgs = {
  property_visibility?: "active" | "hidden" | "all"; // Defaults to "active"
  properties?: {
    properties_ids?: string[];
    property_groups_ids?: string[];
    portfolios_ids?: string[];
    owners_ids?: string[];
  };
  posted_on_to: string; // Required
  gl_account_map_id?: string;
  level_of_detail?: "detail_view" | "summary_view"; // Defaults to "detail_view"
  include_zero_balance_gl_accounts?: "0" | "1"; // Defaults to "0"
  columns?: string[];
};

export type BalanceSheetResult = Array<{
  account_name: string;
  balance: string;
  account_number: string;
}>;

export type CancelledWorkflowsArgs = {
  attachables?: {
    properties_ids?: string[];
    units_ids?: string[];
    tenants_ids?: string[];
    owners_ids?: string[];
    rental_applications_ids?: string[];
    guest_cards_ids?: string[];
    guest_card_interests_ids?: string[];
    service_requests_ids?: string[];
    vendors_ids?: string[];
  };
  property_visibility?: "active" | "hidden" | "all"; // Defaults to "active"
  properties?: {
    properties_ids?: string[];
    property_groups_ids?: string[];
    portfolios_ids?: string[];
  };
  process_template?: string; // Defaults to "All"
  workflow_step?: string; // Defaults to "All"
  assigned_user?: string; // Defaults to "All"
  date_range_from?: string;
  date_range_to?: string;
  cancelled_by?: string; // Defaults to "All"
  columns?: string[];
};

export type CancelledWorkflowsResult = {
  results: Array<{
    attachable_for: string;
    property: string;
    workflow_name: string;
    cancelled_date: string;
    cancelled_by: string;
    cancellation_reason: string;
  }>;
  next_page_url: string;
};

export type ChartOfAccountsArgs = {
  columns?: string[];
};

export type ChartOfAccountsResult = {
  results: Array<{
    number: string;
    account_name: string;
    account_type: string;
    sub_accountof: string;
    offset_account: string;
    subject_to_tax_authority: string;
    options: string;
    fund_account: string;
    hidden: string;
    gl_account_id: number;
    sub_account_of_id: number | null; // ID can be null if not a sub-account
    offset_account_id: number | null; // ID can be null
  }>;
  next_page_url: string;
};

export type CompletedWorkflowsArgs = {
  attachables?: {
    properties_ids?: string[];
    units_ids?: string[];
    tenants_ids?: string[];
    owners_ids?: string[];
    rental_applications_ids?: string[];
    guest_cards_ids?: string[];
    guest_card_interests_ids?: string[];
    service_requests_ids?: string[];
    vendors_ids?: string[];
  };
  property_visibility?: "active" | "hidden" | "all"; // Defaults to "active"
  properties?: {
    properties_ids?: string[];
    property_groups_ids?: string[];
    portfolios_ids?: string[];
  };
  process_template?: string; // Defaults to "All"
  workflow_step?: string; // Defaults to "All"
  assigned_user?: string; // Defaults to "All"
  date_range_from?: string;
  date_range_to?: string;
  columns?: string[];
};

export type CompletedWorkflowsResult = {
  results: Array<{
    attachable_for: string;
    property: string;
    workflow_name: string;
    completed_date: string;
  }>;
  next_page_url: string;
};

// --- Fixed Assets Report Types ---
export type FixedAssetsArgs = {
  property_visibility?: "active" | "hidden" | "all"; // Defaults to "active"
  unit_ids?: string[];
  property?: {
    property_id?: string;
  };
  include_property_level_fixed_assets?: "0" | "1"; // Defaults to "1"
  asset_types?: string; // Defaults to "All"
  status?: string; // Defaults to "all"
  columns?: string[];
};

export type FixedAssetsResult = {
  results: Array<{
    asset_id: string;
    serial_number: string;
    asset_type: string;
    property_name: string;
    property_id: number;
    unit: string;
    unit_id: number;
    warranty_expiration: string;
    placed_in_service: string;
    status: string;
    cost: string;
  }>;
  next_page_url: string;
};

// --- In Progress Workflows Report Types ---
export type InProgressWorkflowsArgs = {
  attachables?: {
    properties_ids?: string[];
    units_ids?: string[];
    tenants_ids?: string[];
    owners_ids?: string[];
    rental_applications_ids?: string[];
    guest_cards_ids?: string[];
    guest_card_interests_ids?: string[];
    service_requests_ids?: string[];
    vendors_ids?: string[];
  };
  property_visibility?: "active" | "hidden" | "all"; // Defaults to "active"
  properties?: {
    properties_ids?: string[];
    property_groups_ids?: string[];
    portfolios_ids?: string[];
  };
  process_template?: string; // Defaults to "All"
  workflow_step?: string; // Defaults to "All"
  assigned_user?: string; // Defaults to "All"
  date_range_from?: string;
  date_range_to?: string;
  columns?: string[];
};

export type InProgressWorkflowsResult = {
  results: Array<{
    attachable_for: string;
    property: string;
    workflow_name: string;
    current_step: string;
    status: string;
    due_date: string;
    assigned_to: string;
  }>;
  next_page_url: string;
};

// --- Income Statement Date Range Report Types ---
export type IncomeStatementDateRangeArgs = {
  property_visibility?: "active" | "hidden" | "all"; // Defaults to "active"
  properties?: {
    properties_ids?: string[];
    property_groups_ids?: string[];
    portfolios_ids?: string[];
    owners_ids?: string[];
  };
  posted_on_from: string; // Required
  posted_on_to: string; // Required
  gl_account_map_id?: string;
  level_of_detail?: "detail_view" | "summary_view"; // Defaults to "detail_view"
  include_zero_balance_gl_accounts?: "0" | "1"; // Defaults to "0"
  columns?: string[];
};

export type IncomeStatementDateRangeResult = Array<{
  account_name: string;
  selected_period: string;
  account_number: string;
  gl_account_id: number;
}>;

// --- Lease Expiration Detail By Month Report Types ---
export type LeaseExpirationDetailArgs = {
  properties?: {
    properties_ids?: string[];
    property_groups_ids?: string[];
    portfolios_ids?: string[];
    owners_ids?: string[];
  };
  unit_visibility?: "active" | "hidden" | "all"; // Defaults to "active"
  tags?: string; // Comma-separated string
  filter_lease_date_range_by?: "Lease Expiration Date" | "Lease Start Date" | "Move-in Date"; // Defaults to "Lease Expiration Date"
  ends_on_from: string; // Required (YYYY-MM)
  ends_on_to: string; // Required (YYYY-MM)
  exclude_occupancies_with_move_out?: "0" | "1"; // Defaults to "0"
  exclude_month_to_month?: "0" | "1"; // Defaults to "0"
  columns?: string[];
};

export type LeaseExpirationDetailResult = {
  results: Array<{
    property: string;
    property_name: string;
    property_id: number;
    property_address: string;
    property_street: string;
    property_street2: string | null;
    property_city: string;
    property_state: string;
    property_zip: string;
    unit: string;
    unit_tags: string | null;
    unit_type: string;
    move_in: string;
    lease_expires: string;
    lease_expires_month: string;
    market_rent: string | null;
    sqft: number | null;
    tenant_name: string;
    deposit: string | null;
    rent: string | null;
    phone_numbers: string | null;
    unit_id: number;
    occupancy_id: number;
    tenant_id: number;
    owner_agent: string | null;
    tenant_agent: string | null;
    rent_status: string | null;
    legal_rent: string | null;
    owners_phone_number: string | null;
    owners: string | null;
    last_rent_increase: string | null;
    next_rent_adjustment: string | null;
    next_rent_increase: string | null;
    lease_sign_date: string | null;
    last_lease_renewal: string | null;
    notice_given_date: string | null;
    move_out: string | null;
    tenant_tags: string | null;
    affordable_program: string | null;
    computed_market_rent: string | null;
  }>;
  next_page_url: string | null;
};

async function getAgedPayablesSummaryReport(args: AgedPayablesSummaryArgs): Promise<AgedPayablesSummaryResult> { 
  if (!VHOST || !USERNAME || !PASSWORD) throw new Error('Missing AppFolio API credentials');
  // Set default for property_visibility if not provided
  const payload = { ...args, property_visibility: args.property_visibility ?? "active" };
  const url = `https://${VHOST}.appfolio.com/api/v2/reports/aged_payables_summary.json`;
  const response = await appfolioLimiter.schedule(() => axios.post(url, payload, {
    auth: { username: USERNAME, password: PASSWORD },
    headers: { 'Content-Type': 'application/json' },
  }));
  return response.data;
}

async function getAgedReceivablesDetailReport(args: AgedReceivablesDetailArgs): Promise<AgedReceivablesDetailResult> {
  if (!VHOST || !USERNAME || !PASSWORD) throw new Error('Missing AppFolio API credentials');
  // Set default for property_visibility if not provided
  const payload = { ...args, property_visibility: args.property_visibility ?? "active" };
  const url = `https://${VHOST}.appfolio.com/api/v2/reports/aged_receivables_detail.json`;
  const response = await appfolioLimiter.schedule(() => axios.post(url, payload, {
    auth: { username: USERNAME, password: PASSWORD },
    headers: { 'Content-Type': 'application/json' },
  }));
  return response.data;
}

async function getBudgetComparativeReport(args: BudgetComparativeArgs): Promise<BudgetComparativeResult> {
  if (!VHOST || !USERNAME || !PASSWORD) throw new Error('Missing AppFolio API credentials');
  // Set default for property_visibility if not provided
  const payload = { ...args, property_visibility: args.property_visibility ?? "active" };
  const url = `https://${VHOST}.appfolio.com/api/v2/reports/budget_comparative.json`;
  const response = await appfolioLimiter.schedule(() => axios.post(url, payload, {
    auth: { username: USERNAME, password: PASSWORD },
    headers: { 'Content-Type': 'application/json' },
  }));
  return response.data;
}

async function getExpenseDistributionReport(args: ExpenseDistributionArgs): Promise<ExpenseDistributionResult> {
  if (!VHOST || !USERNAME || !PASSWORD) throw new Error('Missing AppFolio API credentials');
  const payload = { ...args, property_visibility: args.property_visibility ?? "active" };
  const url = `https://${VHOST}.appfolio.com/api/v2/reports/expense_distribution.json`;
  const response = await appfolioLimiter.schedule(() => axios.post(url, payload, {
    auth: { username: USERNAME, password: PASSWORD },
    headers: { 'Content-Type': 'application/json' },
  }));
  return response.data;
}

async function getRentRollItemizedReport(args: RentRollItemizedArgs): Promise<RentRollItemizedResult> {
  if (!VHOST || !USERNAME || !PASSWORD) throw new Error('Missing AppFolio API credentials');
  const payload = { ...args, unit_visibility: args.unit_visibility ?? "active" };
  const url = `https://${VHOST}.appfolio.com/api/v2/reports/rent_roll_itemized.json`;
  const response = await appfolioLimiter.schedule(() => axios.post(url, payload, {
    auth: { username: USERNAME, password: PASSWORD },
    headers: { 'Content-Type': 'application/json' },
  }));
  return response.data;
}

async function getCashflowReport(args: CashflowReportArgs) {
  if (!VHOST || !USERNAME || !PASSWORD) throw new Error('Missing AppFolio API credentials');
  const url = `https://${VHOST}.appfolio.com/api/v2/reports/cash_flow_detail.json`;
  const response = await appfolioLimiter.schedule(() => axios.post(url, args, {
    auth: { username: USERNAME, password: PASSWORD },
    headers: { 'Content-Type': 'application/json' },
  }));
  return response.data;
}

async function getPropertyDirectoryReport(args: any) {
  if (!VHOST || !USERNAME || !PASSWORD) throw new Error('Missing AppFolio API credentials');
  const url = `https://${VHOST}.appfolio.com/api/v2/reports/property_directory.json`;
  const response = await appfolioLimiter.schedule(() => axios.post(url, args, {
    auth: { username: USERNAME, password: PASSWORD },
    headers: { 'Content-Type': 'application/json' },
  }));
  return response.data;
}

async function getAccountTotalsReport(args: AccountTotalsReportArgs): Promise<AccountTotalsReportResult> {
  if (!VHOST || !USERNAME || !PASSWORD) throw new Error('Missing AppFolio API credentials');
  const payload = { ...args, gl_account_ids: args.gl_account_ids ?? "1" }; // Assuming "1" is a sensible default for gl_account_ids
  const url = `https://${VHOST}.appfolio.com/api/v2/reports/account_totals.json`;
  const response = await appfolioLimiter.schedule(() => axios.post(url, payload, {
    auth: { username: USERNAME, password: PASSWORD },
    headers: { 'Content-Type': 'application/json' },
  }));
  return response.data;
}

async function getDelinquencyAsOfReport(args: DelinquencyAsOfArgs): Promise<DelinquencyAsOfResult> {
  if (!VHOST || !USERNAME || !PASSWORD) throw new Error('Missing AppFolio API credentials');
  const {
    property_visibility = "active",
    tenant_statuses = ["0", "4"], // Default based on previous implementation
    amount_owed_in_account = "all", // Default based on previous implementation
    ...rest
  } = args;

  const payload = {
    property_visibility,
    tenant_statuses,
    amount_owed_in_account,
    ...rest,
  };

  const url = `https://${VHOST}.appfolio.com/api/v2/reports/delinquency_as_of.json`;
  const response = await appfolioLimiter.schedule(() => axios.post(url, payload, {
    auth: { username: USERNAME, password: PASSWORD },
    headers: { 'Content-Type': 'application/json' },
  }));
  return response.data;
}

async function getGuestCardInquiriesReport(args: GuestCardInquiriesArgs): Promise<GuestCardInquiriesResult> {
  if (!VHOST || !USERNAME || !PASSWORD) throw new Error('Missing AppFolio API credentials');
  const {
    property_visibility = "active",
    assigned_user_visibility = "active",
    guest_card_status = "open", // Default based on previous implementation
    ...rest
  } = args;

  const payload = {
    property_visibility,
    assigned_user_visibility,
    guest_card_status,
    ...rest
  };
  const url = `https://${VHOST}.appfolio.com/api/v2/reports/guest_card_inquiries.json`;
  const response = await appfolioLimiter.schedule(() => axios.post(url, payload, {
    auth: { username: USERNAME, password: PASSWORD },
    headers: { 'Content-Type': 'application/json' },
  }));
  return response.data;
}

async function getLeasingFunnelPerformanceReport(
  args: LeasingFunnelPerformanceArgs
): Promise<LeasingFunnelPerformanceResult> {
  if (!VHOST || !USERNAME || !PASSWORD) throw new Error('Missing AppFolio API credentials');
  const {
    property_visibility = "all", // Default based on previous implementation
    assigned_user_visibility = "active", // Default based on previous implementation
    assigned_user = "All", // Default based on previous implementation
    ...rest
  } = args;

  const payload = {
    property_visibility,
    assigned_user_visibility,
    assigned_user,
    ...rest,
  };

  const url = `https://${VHOST}.appfolio.com/api/v2/reports/leasing_funnel_performance.json`;
  const response = await appfolioLimiter.schedule(() => axios.post(url, payload, {
    auth: { username: USERNAME, password: PASSWORD },
    headers: { 'Content-Type': 'application/json' },
  }));
  return response.data;
}

async function getAnnualBudgetComparativeReport(args: AnnualBudgetCompArgsV2): Promise<AnnualBudgetComparativeResult> {
  if (!VHOST || !USERNAME || !PASSWORD) throw new Error('Missing AppFolio API credentials');
  if (!args.occurred_on_to) throw new Error('occurred_on_to is required'); // Check required field
  const {
    property_visibility = "active",
    additional_account_types = [],
    level_of_detail = "detail_view",
    ...rest
  } = args;
  const payload = {
    property_visibility,
    additional_account_types,
    level_of_detail,
    ...rest
  };
  const url = `https://${VHOST}.appfolio.com/api/v2/reports/annual_budget_comparative.json`;
  const response = await appfolioLimiter.schedule(() => axios.post(url, payload, {
    auth: { username: USERNAME, password: PASSWORD },
    headers: { 'Content-Type': 'application/json' },
  }));
  return response.data;
}

async function getAnnualBudgetForecastReport(args: AnnualBudgetForecastArgs): Promise<AnnualBudgetForecastResult> {
  if (!VHOST || !USERNAME || !PASSWORD) throw new Error('Missing AppFolio API credentials');
  if (!args.period_from || !args.period_to) throw new Error('period_from and period_to are required');

  const {
    property_visibility = "active",
    consolidate = "0",
    ...rest
  } = args;

  const payload = {
    property_visibility,
    consolidate,
    ...rest
  };

  const url = `https://${VHOST}.appfolio.com/api/v2/reports/annual_budget_forecast.json`;
  const response = await appfolioLimiter.schedule(() => axios.post(url, payload, {
    auth: { username: USERNAME, password: PASSWORD },
    headers: { 'Content-Type': 'application/json' },
  }));

  // The API returns the array directly, not nested under a key like 'results'
  return response.data;
}

async function getBalanceSheetReport(args: BalanceSheetArgs): Promise<BalanceSheetResult> {
  if (!VHOST || !USERNAME || !PASSWORD) throw new Error('Missing AppFolio API credentials');
  if (!args.posted_on_to) throw new Error('posted_on_to is required');

  const {
    property_visibility = "active",
    level_of_detail = "detail_view",
    include_zero_balance_gl_accounts = "0",
    ...rest
  } = args;

  const payload = {
    property_visibility,
    level_of_detail,
    include_zero_balance_gl_accounts,
    ...rest
  };

  const url = `https://${VHOST}.appfolio.com/api/v2/reports/balance_sheet.json`;
  const response = await appfolioLimiter.schedule(() => axios.post(url, payload, {
    auth: { username: USERNAME, password: PASSWORD },
    headers: { 'Content-Type': 'application/json' },
  }));

  return response.data;
}

async function getCancelledWorkflowsReport(args: CancelledWorkflowsArgs): Promise<CancelledWorkflowsResult> {
  if (!VHOST || !USERNAME || !PASSWORD) throw new Error('Missing AppFolio API credentials');

  const {
    property_visibility = "active",
    process_template = "All",
    workflow_step = "All",
    assigned_user = "All",
    cancelled_by = "All",
    ...rest
  } = args;

  const payload = {
    property_visibility,
    process_template,
    workflow_step,
    assigned_user,
    cancelled_by,
    ...rest
  };

  const url = `https://${VHOST}.appfolio.com/api/v2/reports/cancelled_processes.json`;
  const response = await appfolioLimiter.schedule(() => axios.post(url, payload, {
    auth: { username: USERNAME, password: PASSWORD },
    headers: { 'Content-Type': 'application/json' },
  }));

  return response.data;
}

async function getChartOfAccountsReport(args: ChartOfAccountsArgs): Promise<ChartOfAccountsResult> {
  if (!VHOST || !USERNAME || !PASSWORD) throw new Error('Missing AppFolio API credentials');

  const payload = { ...args }; // Simple payload, just pass args

  const url = `https://${VHOST}.appfolio.com/api/v2/reports/chart_of_accounts.json`;
  const response = await appfolioLimiter.schedule(() => axios.post(url, payload, {
    auth: { username: USERNAME, password: PASSWORD },
    headers: { 'Content-Type': 'application/json' },
  }));

  return response.data;
}

async function getCompletedWorkflowsReport(args: CompletedWorkflowsArgs): Promise<CompletedWorkflowsResult> {
  if (!VHOST || !USERNAME || !PASSWORD) throw new Error('Missing AppFolio API credentials');

  const {
    property_visibility = "active",
    process_template = "All",
    workflow_step = "All",
    assigned_user = "All",
    ...rest
  } = args;

  const payload = {
    property_visibility,
    process_template,
    workflow_step,
    assigned_user,
    ...rest
  };

  const url = `https://${VHOST}.appfolio.com/api/v2/reports/completed_processes.json`;
  const response = await appfolioLimiter.schedule(() => axios.post(url, payload, {
    auth: { username: USERNAME, password: PASSWORD },
    headers: { 'Content-Type': 'application/json' },
  }));

  return response.data;
}

// --- Fixed Assets Report Function ---
async function getFixedAssetsReport(args: FixedAssetsArgs): Promise<FixedAssetsResult> {
  if (!VHOST || !USERNAME || !PASSWORD) throw new Error('Missing AppFolio API credentials');

  const {
    property_visibility = "active",
    include_property_level_fixed_assets = "1",
    asset_types = "All",
    status = "all",
    ...rest
  } = args;

  const payload = {
    property_visibility,
    include_property_level_fixed_assets,
    asset_types,
    status,
    ...rest
  };

  const url = `https://${VHOST}.appfolio.com/api/v2/reports/fixed_assets.json`;
  const response = await appfolioLimiter.schedule(() => axios.post(url, payload, {
    auth: { username: USERNAME, password: PASSWORD },
    headers: { 'Content-Type': 'application/json' },
  }));

  return response.data;
}

// --- In Progress Workflows Report Function ---
async function getInProgressWorkflowsReport(args: InProgressWorkflowsArgs): Promise<InProgressWorkflowsResult> {
  if (!VHOST || !USERNAME || !PASSWORD) throw new Error('Missing AppFolio API credentials');

  const {
    property_visibility = "active",
    process_template = "All",
    workflow_step = "All",
    assigned_user = "All",
    ...rest
  } = args;

  const payload = {
    property_visibility,
    process_template,
    workflow_step,
    assigned_user,
    ...rest
  };

  const url = `https://${VHOST}.appfolio.com/api/v2/reports/in_progress_workflows.json`;
  const response = await appfolioLimiter.schedule(() => axios.post(url, payload, {
    auth: { username: USERNAME, password: PASSWORD },
    headers: { 'Content-Type': 'application/json' },
  }));

  return response.data;
}

// --- Income Statement Date Range Report Function ---
async function getIncomeStatementDateRangeReport(args: IncomeStatementDateRangeArgs): Promise<IncomeStatementDateRangeResult> {
  if (!VHOST || !USERNAME || !PASSWORD) throw new Error('Missing AppFolio API credentials');
  if (!args.posted_on_from || !args.posted_on_to) {
    throw new Error('Missing required arguments: posted_on_from and posted_on_to (format YYYY-MM-DD)');
  }

  const {
    property_visibility = "active",
    level_of_detail = "detail_view",
    include_zero_balance_gl_accounts = "0",
    ...rest
  } = args;

  const payload = {
    property_visibility,
    level_of_detail,
    include_zero_balance_gl_accounts,
    ...rest
  };

  const url = `https://${VHOST}.appfolio.com/api/v2/reports/income_statement_date_range.json`;
  const response = await appfolioLimiter.schedule(() => axios.post(url, payload, {
    auth: { username: USERNAME, password: PASSWORD },
    headers: { 'Content-Type': 'application/json' },
  }));

  return response.data;
}

// --- Lease Expiration Detail By Month Report Function ---
async function getLeaseExpirationDetailByMonthReport(args: LeaseExpirationDetailArgs): Promise<LeaseExpirationDetailResult> {
  if (!VHOST || !USERNAME || !PASSWORD) throw new Error('Missing AppFolio API credentials');
  if (!args.ends_on_from || !args.ends_on_to) {
    throw new Error('Missing required arguments: ends_on_from and ends_on_to (format YYYY-MM)');
  }

  const {
    unit_visibility = "active",
    filter_lease_date_range_by = "Lease Expiration Date",
    exclude_occupancies_with_move_out = "0",
    exclude_month_to_month = "0",
    ...rest
  } = args;

  const payload = {
    unit_visibility,
    filter_lease_date_range_by,
    exclude_occupancies_with_move_out,
    exclude_month_to_month,
    ...rest
  };

  const url = `https://${VHOST}.appfolio.com/api/v2/reports/lease_expiration_detail.json`;
  const response = await appfolioLimiter.schedule(() => axios.post(url, payload, {
    auth: { username: USERNAME, password: PASSWORD },
    headers: { 'Content-Type': 'application/json' },
  }));

  return response.data;
}

// --- Leasing Summary Report Types ---
export type LeasingSummaryArgs = {
  properties?: {
    properties_ids?: string[];
    property_groups_ids?: string[];
    portfolios_ids?: string[];
    owners_ids?: string[];
  };
  unit_visibility?: "active" | "hidden" | "all"; // Defaults to "active"
  posted_on_from: string; // Required (YYYY-MM-DD)
  posted_on_to: string; // Required (YYYY-MM-DD)
  columns?: string[];
};

export type LeasingSummaryResult = {
  results: Array<{
    unit_type: string;
    number_of_units: number;
    number_of_model_units: number;
    inquiries_received: number;
    showings_completed: number;
    applications_received: number;
    move_ins: number;
    move_outs: number;
    leased: number;
    vacancy_postings: number;
    number_of_active_campaigns: number;
    number_of_ended_campaigns: number;
  }>;
  next_page_url: string | null;
};

// --- Leasing Summary Report Function ---
async function getLeasingSummaryReport(args: LeasingSummaryArgs): Promise<LeasingSummaryResult> {
  if (!VHOST || !USERNAME || !PASSWORD) throw new Error('Missing AppFolio API credentials');
  if (!args.posted_on_from || !args.posted_on_to) {
    throw new Error('Missing required arguments: posted_on_from and posted_on_to (format YYYY-MM-DD)');
  }

  const { unit_visibility = "active", ...rest } = args;

  const payload = {
    unit_visibility,
    ...rest
  };

  const url = `https://${VHOST}.appfolio.com/api/v2/reports/leasing_summary.json`;
  const response = await appfolioLimiter.schedule(() => axios.post(url, payload, {
    auth: { username: USERNAME, password: PASSWORD },
    headers: { 'Content-Type': 'application/json' },
  }));

  return response.data;
}

// --- Loans Report Types ---
export type LoansArgs = {
  property_visibility?: "active" | "hidden" | "all"; // Defaults to "active"
  properties?: {
    properties_ids?: string[];
    property_groups_ids?: string[];
    portfolios_ids?: string[];
    owners_ids?: string[];
  };
  reference_to: string; // Required (YYYY-MM-DD)
  show_hidden_loans?: "0" | "1"; // Defaults to "0"
  columns?: string[];
};

export type LoansResult = {
  results: Array<{
    property: string;
    property_name: string;
    property_id: number;
    property_address: string;
    property_street: string;
    property_street2: string | null;
    property_city: string;
    property_state: string;
    property_zip: string;
    loan_id: number;
    loan_number: string;
    vendor: string;
    monthly_payment: string | null;
    maturity_date: string | null;
    ending_balance: string;
    interest_rate: string | null;
    next_interest_rate: string | null;
    next_interest_rate_date: string | null;
    escrow: string | null;
    prepayment_penalty: string | null;
    balloon_amount: string | null;
  }>;
  next_page_url: string | null;
};

// --- Loans Report Function ---
async function getLoansReport(args: LoansArgs): Promise<LoansResult> {
  if (!VHOST || !USERNAME || !PASSWORD) throw new Error('Missing AppFolio API credentials');
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
  const response = await appfolioLimiter.schedule(() => axios.post(url, payload, {
    auth: { username: USERNAME, password: PASSWORD },
    headers: { 'Content-Type': 'application/json' },
  }));

  return response.data;
}

// --- Occupancy Summary Report Types ---
export type OccupancySummaryArgs = {
  properties?: {
    properties_ids?: string[];
    property_groups_ids?: string[];
    portfolios_ids?: string[];
    owners_ids?: string[];
  };
  unit_visibility?: "active" | "hidden" | "all"; // Defaults to "active"
  as_of_to: string; // Required (YYYY-MM-DD)
  columns?: string[];
};

export type OccupancySummaryResult = {
  results: Array<{
    unit_type: string;
    number_of_units: number;
    occupied: number;
    percent_occupied: string;
    average_square_feet: number;
    average_market_rent: string | null;
    vacant_rented: number;
    vacant_unrented: number;
    notice_rented: number;
    notice_unrented: number;
    average_rent: string | null;
    property: string;
    property_id: number;
  }>;
  next_page_url: string | null;
};

// --- Occupancy Summary Report Function ---
async function getOccupancySummaryReport(args: OccupancySummaryArgs): Promise<OccupancySummaryResult> {
  if (!VHOST || !USERNAME || !PASSWORD) throw new Error('Missing AppFolio API credentials');
  if (!args.as_of_to) {
    throw new Error('Missing required argument: as_of_to (format YYYY-MM-DD)');
  }

  const { unit_visibility = "active", ...rest } = args;

  const payload = {
    unit_visibility,
    ...rest
  };

  const url = `https://${VHOST}.appfolio.com/api/v2/reports/occupancy_summary.json`;
  const response = await appfolioLimiter.schedule(() => axios.post(url, payload, {
    auth: { username: USERNAME, password: PASSWORD },
    headers: { 'Content-Type': 'application/json' },
  }));

  return response.data;
}

// --- Owner Leasing Report Types ---
export type OwnerLeasingArgs = {
  properties?: {
    properties_ids?: string[];
    property_groups_ids?: string[];
    portfolios_ids?: string[];
    owners_ids?: string[];
  };
  received_on_from: string; // Required (YYYY-MM-DD)
  received_on_to: string; // Required (YYYY-MM-DD)
  include_units_which_are_not_rent_ready?: "0" | "1"; // Defaults to "0"
  include_units_which_are_hidden_from_the_vacancies_dashboard?: "0" | "1"; // Defaults to "0"
  columns?: string[];
};

export type OwnerLeasingResult = {
  results: Array<{
    property: string;
    unit: string;
    applied_to: string | null;
    unit_type: string;
    market_rent: string | null;
    inquiries: number;
    showings: number;
    applications: number;
    approved_applications: number;
    converted_tenants: number;
    property_id: string;
    unit_id: number;
    computed_market_rent: string | null;
  }>;
  next_page_url: string | null;
};

// --- Owner Leasing Report Function ---
async function getOwnerLeasingReport(args: OwnerLeasingArgs): Promise<OwnerLeasingResult> {
  if (!VHOST || !USERNAME || !PASSWORD) throw new Error('Missing AppFolio API credentials');
  if (!args.received_on_from || !args.received_on_to) {
    throw new Error('Missing required arguments: received_on_from and received_on_to (format YYYY-MM-DD)');
  }

  const {
    include_units_which_are_not_rent_ready = "0",
    include_units_which_are_hidden_from_the_vacancies_dashboard = "0",
    ...rest
  } = args;

  const payload = {
    include_units_which_are_not_rent_ready,
    include_units_which_are_hidden_from_the_vacancies_dashboard,
    ...rest
  };

  const url = `https://${VHOST}.appfolio.com/api/v2/reports/owner_leasing.json`;
  const response = await appfolioLimiter.schedule(() => axios.post(url, payload, {
    auth: { username: USERNAME, password: PASSWORD },
    headers: { 'Content-Type': 'application/json' },
  }));

  return response.data;
}

// --- Property Performance Report Types ---
export type PropertyPerformanceArgs = {
  property_visibility?: "active" | "hidden" | "all"; // Defaults to "active"
  properties?: {
    properties_ids?: string[];
    property_groups_ids?: string[];
    portfolios_ids?: string[];
    owners_ids?: string[];
  };
  gl_account_ids?: string[];
  posted_on_from: string; // Required (YYYY-MM-DD)
  posted_on_to: string; // Required (YYYY-MM-DD)
  columns?: string[];
};

export type PropertyPerformanceResult = {
  results: Array<{
    property: string;
    property_name: string;
    property_id: number;
    property_address: string;
    property_street: string;
    property_street2: string | null;
    property_city: string;
    property_state: string;
    property_zip: string;
    units: number;
    gl_accounts: Array<{
      id: number;
      value: string;
    }>;
    commission_percent: string | null;
    site_manager: string | null;
    property_group_id: string | null;
    portfolio_id: number | null;
  }>;
  next_page_url: string | null;
};

// --- Property Performance Report Function ---
async function getPropertyPerformanceReport(args: PropertyPerformanceArgs): Promise<PropertyPerformanceResult> {
  if (!VHOST || !USERNAME || !PASSWORD) throw new Error('Missing AppFolio API credentials');
  if (!args.posted_on_from || !args.posted_on_to) {
    throw new Error('Missing required arguments: posted_on_from and posted_on_to (format YYYY-MM-DD)');
  }

  const { property_visibility = "active", ...rest } = args;

  const payload = {
    property_visibility,
    ...rest
  };

  const url = `https://${VHOST}.appfolio.com/api/v2/reports/property_performance.json`;
  const response = await appfolioLimiter.schedule(() => axios.post(url, payload, {
    auth: { username: USERNAME, password: PASSWORD },
    headers: { 'Content-Type': 'application/json' },
  }));

  return response.data;
}

// --- Property Source Tracking Report Types ---
export type PropertySourceTrackingArgs = {
  properties?: {
    properties_ids?: string[];
    property_groups_ids?: string[];
    portfolios_ids?: string[];
    owners_ids?: string[];
  };
  unit_visibility?: "active" | "hidden" | "all"; // Defaults to "active"
  received_on_from: string; // Required (YYYY-MM-DD)
  received_on_to: string; // Required (YYYY-MM-DD)
  columns?: string[];
};

export type PropertySourceTrackingResult = {
  results: Array<{
    source: string;
    guest_card_inquiries: number;
    showings: number;
    applications: number;
    approved_applications: number;
    converted_tenants: number;
  }>;
  next_page_url: string | null;
};

// --- Property Source Tracking Report Function ---
async function getPropertySourceTrackingReport(args: PropertySourceTrackingArgs): Promise<PropertySourceTrackingResult> {
  if (!VHOST || !USERNAME || !PASSWORD) throw new Error('Missing AppFolio API credentials');
  if (!args.received_on_from || !args.received_on_to) {
    throw new Error('Missing required arguments: received_on_from and received_on_to (format YYYY-MM-DD)');
  }

  const { unit_visibility = "active", ...rest } = args;

  const payload = {
    unit_visibility,
    ...rest
  };

  const url = `https://${VHOST}.appfolio.com/api/v2/reports/prospect_source_tracking.json`;
  const response = await appfolioLimiter.schedule(() => axios.post(url, payload, {
    auth: { username: USERNAME, password: PASSWORD },
    headers: { 'Content-Type': 'application/json' },
  }));

  return response.data;
}

// --- Receivables Activity Report Types ---
export type ReceivablesActivityArgs = {
  tenant_visibility?: "active" | "inactive" | "all"; // Defaults to "active"
  tenant_statuses?: string[]; // e.g., ["0", "4"]
  property_visibility?: "active" | "hidden" | "all"; // Defaults to "active"
  properties?: {
    properties_ids?: string[];
    property_groups_ids?: string[];
    portfolios_ids?: string[];
    owners_ids?: string[];
  };
  receipt_date_from: string; // Required (YYYY-MM-DD)
  receipt_date_to: string; // Required (YYYY-MM-DD)
  manually_entered_only?: "0" | "1"; // Defaults to "0"
  columns?: string[];
};

export type ReceivablesActivityResult = {
  results: Array<{
    property: string;
    property_name: string;
    property_id: number;
    property_address: string;
    property_street: string;
    property_street2: string | null;
    property_city: string;
    property_state: string;
    property_zip: string;
    party: string;
    status: string;
    txn_amount: string;
    txn_remarks: string | null;
    txn_reference: string | null;
    txn_receipt_date: string;
    portal_activated: string;
    last_online_receipt_date: string | null;
    online_payments_recurring_count: number;
    online_payments_recurring_total: string;
    move_in: string;
    emails: string | null;
    phone_numbers: string | null;
    certified_funds_only: string;
    opted_out_of_portal: string;
    payment_type: string;
    must_pay_balance_in_full: string;
    property_list: string;
    txn_id: number;
    occupancy_id: number;
    selected_tenant_id: number;
    unit_id: number;
  }>;
  next_page_url: string | null;
};

// --- Receivables Activity Report Function ---
async function getReceivablesActivityReport(args: ReceivablesActivityArgs): Promise<ReceivablesActivityResult> {
  if (!VHOST || !USERNAME || !PASSWORD) throw new Error('Missing AppFolio API credentials');
  if (!args.receipt_date_from || !args.receipt_date_to) {
    throw new Error('Missing required arguments: receipt_date_from and receipt_date_to (format YYYY-MM-DD)');
  }

  const {
    tenant_visibility = "active",
    property_visibility = "active",
    manually_entered_only = "0",
    ...rest
  } = args;

  const payload = {
    tenant_visibility,
    property_visibility,
    manually_entered_only,
    ...rest
  };

  const url = `https://${VHOST}.appfolio.com/api/v2/reports/receivables_activity.json`;
  const response = await appfolioLimiter.schedule(() => axios.post(url, payload, {
    auth: { username: USERNAME, password: PASSWORD },
    headers: { 'Content-Type': 'application/json' },
  }));

  return response.data;
}

// --- Renewal Summary Report Types ---
export type RenewalStatus = "all" | "awaiting_response" | "countersigned" | "pending" | "skipped" | "notice_to_vacate";

export type RenewalSummaryArgs = {
  properties?: {
    properties_ids?: string[];
    property_groups_ids?: string[];
    portfolios_ids?: string[];
    owners_ids?: string[];
  };
  unit_visibility?: "active" | "hidden" | "all"; // Defaults to "active"
  start_on_from: string; // Required (YYYY-MM)
  start_on_to: string; // Required (YYYY-MM)
  statuses?: RenewalStatus[]; // Defaults to ["all"]
  include_tenant_transfers?: "0" | "1"; // Defaults to "0"
  columns?: string[];
};

export type RenewalSummaryResult = {
  results: Array<{
    unit_name: string;
    property: string;
    property_name: string;
    property_id: number;
    property_address: string;
    property_street: string;
    property_street2: string | null;
    property_city: string;
    property_state: string;
    property_zip: string;
    unit_type: string;
    unit_id: number;
    occupancy_id: number;
    tenant_name: string;
    lease_start: string | null;
    lease_end: string | null;
    previous_lease_start: string | null;
    previous_lease_end: string | null;
    previous_rent: string | null;
    rent: string | null;
    respond_by_date: string | null;
    renewal_sent_date: string | null;
    countersigned_date: string | null;
    automatic_renewal_date: string | null;
    percent_difference: string | null;
    dollar_difference: string | null;
    status: string;
    term: string | null;
    lease_start_month: string | null;
    tenant_id: number;
    tenant_tags: string | null;
    tenant_agent: string | null;
    lease_uuid: string | null;
    lease_document_uuid: string | null;
    notice_given_date: string | null;
    move_out: string | null;
  }>;
  next_page_url: string | null;
};

// --- Renewal Summary Report Function ---
async function getRenewalSummaryReport(args: RenewalSummaryArgs): Promise<RenewalSummaryResult> {
  if (!VHOST || !USERNAME || !PASSWORD) throw new Error('Missing AppFolio API credentials');
  if (!args.start_on_from || !args.start_on_to) {
    throw new Error('Missing required arguments: start_on_from and start_on_to (format YYYY-MM)');
  }

  const {
    unit_visibility = "active",
    statuses = ["all"],
    include_tenant_transfers = "0",
    ...rest
  } = args;

  const payload = {
    unit_visibility,
    statuses,
    include_tenant_transfers,
    ...rest
  };

  const url = `https://${VHOST}.appfolio.com/api/v2/reports/renewal_summary.json`;
  const response = await appfolioLimiter.schedule(() => axios.post(url, payload, {
    auth: { username: USERNAME, password: PASSWORD },
    headers: { 'Content-Type': 'application/json' },
  }));

  return response.data;
}

// --- Rental Applications Report Types ---
export type RentalApplicationsFilterDateRangeBy = "Rental Application Received Date" | "Rental Application Decision Date";

export type RentalApplicationsArgs = {
  property_visibility?: "active" | "hidden" | "all"; // Defaults to "active"
  unit_ids?: string[];
  property?: { property_id: string }; // Filter by a single property ID
  rental_application_statuses?: string[]; // e.g., ["New", "Decision Pending"]
  rental_applications_filter_date_range_by?: RentalApplicationsFilterDateRangeBy; // Defaults to "Rental Application Received Date"
  received_on_from: string; // Required (YYYY-MM-DD)
  received_on_to: string; // Required (YYYY-MM-DD)
  columns?: string[];
};

export type RentalApplicationsResult = {
  results: Array<{
    applicants: string | null;
    received: string | null;
    desired_move_in: string | null;
    lead_source: string | null;
    status: string | null;
    screening: string | null;
    assigned_user_id: number | null;
    created_by: string | null;
    reason_for_status: string | null;
    unit_title: string | null;
    unit_type: string | null;
    property_name: string | null;
    unit_name: string | null;
    campaign_title: string | null;
    applying_for: string | null;
    assigned_user: string | null;
    applicant_reported_source: string | null;
    screened_on: string | null;
    approved_at: string | null;
    denied_at: string | null;
    canceled_at: string | null;
    decision_made_at: string | null;
    time_to_conversion: string | null;
    application_fee_paid: string | null;
    admin_fee_paid: string | null;
    rental_application_id: number;
    rental_application_group_id: number;
    move_in_date: string | null;
    lease_start_date: string | null;
    lease_end_date: string | null;
    inquiry_id: number | null;
    application_status: string | null;
    email: string | null;
    phone_number: string | null;
    current_address1: string | null;
    current_address2: string | null;
    current_city: string | null;
    current_state: string | null;
    current_zip: string | null;
    current_monthly_rent: string | null;
    resided_from: string | null;
    resided_to: string | null;
    landlord_name: string | null;
    landlord_phone_number: string | null;
    landlord_email: string | null;
    previous1_address1: string | null;
    previous1_address2: string | null;
    previous_city1: string | null;
    previous_state1: string | null;
    previous_zip1: string | null;
    previous_monthly_rent1: string | null;
    previous_resided_from1: string | null;
    previous_resided_to1: string | null;
    previous_landlord_name1: string | null;
    previous_landlord_phone_number1: string | null;
    previous_landlord_email1: string | null;
    previous2_address1: string | null;
    previous2_address2: string | null;
    previous_city2: string | null;
    previous_state2: string | null;
    previous_zip2: string | null;
    previous_monthly_rent2: string | null;
    previous_resided_from2: string | null;
    previous_resided_to2: string | null;
    previous_landlord_name2: string | null;
    previous_landlord_phone_number2: string | null;
    previous_landlord_email2: string | null;
    employer_name: string | null;
    employer_phone_number: string | null;
    monthly_salary: string | null;
    position_held: string | null;
    years_worked: number | null;
    additional_incomes: string | null;
    pets_names: string | null;
    pets_kinds: string | null;
    pets_weights: string | null;
    unit_address: string | null;
    unit_street: string | null;
    unit_street2: string | null;
    unit_city: string | null;
    unit_state: string | null;
    unit_zip: string | null;
    unit_id: number | null;
    property_id: number | null;
    tenant_id: number | null;
    rental_application_integration_id: string | null;
  }>;
  next_page_url: string | null;
};

// --- Rental Applications Report Function ---
async function getRentalApplicationsReport(args: RentalApplicationsArgs): Promise<RentalApplicationsResult> {
  if (!VHOST || !USERNAME || !PASSWORD) throw new Error('Missing AppFolio API credentials');
  if (!args.received_on_from || !args.received_on_to) {
    throw new Error('Missing required arguments: received_on_from and received_on_to (format YYYY-MM-DD)');
  }

  const {
    property_visibility = "active",
    rental_applications_filter_date_range_by = "Rental Application Received Date",
    ...rest
  } = args;

  const payload = {
    property_visibility,
    rental_applications_filter_date_range_by,
    ...rest
  };

  const url = `https://${VHOST}.appfolio.com/api/v2/reports/rental_applications.json`;
  const response = await appfolioLimiter.schedule(() => axios.post(url, payload, {
    auth: { username: USERNAME, password: PASSWORD },
    headers: { 'Content-Type': 'application/json' },
  }));

  return response.data;
}

// --- Resident Financial Activity Report Types ---
export type ResidentFinancialActivityArgs = {
  property_visibility?: "active" | "hidden" | "all"; // Defaults to "active"
  properties?: {
    properties_ids?: string[];
    property_groups_ids?: string[];
    portfolios_ids?: string[];
    owners_ids?: string[];
  };
  tenant_statuses?: string[]; // e.g., ["0", "4"]
  occurred_on_from: string; // Required (YYYY-MM-DD)
  occurred_on_to: string; // Required (YYYY-MM-DD)
  gl_account_map_id?: string;
  columns?: string[];
};

export type ResidentFinancialActivityResult = {
  results: Array<{
    account: string | null;
    account_name: string | null;
    account_number: string | null;
    unit_address: string | null;
    unit_street: string | null;
    unit_street2: string | null;
    unit_city: string | null;
    unit_state: string | null;
    unit_zip: string | null;
    last_receipt_date: string | null;
    occupancy_name: string | null;
    unit_name: string | null;
    property_name: string | null;
    payer: string | null;
    sum_start_date: string | null;
    sum_charges: string | null;
    sum_payments: string | null;
    sum_end_date: string | null;
  }>;
  next_page_url: string | null;
};

// --- Resident Financial Activity Report Function ---
async function getResidentFinancialActivityReport(args: ResidentFinancialActivityArgs): Promise<ResidentFinancialActivityResult> {
  if (!VHOST || !USERNAME || !PASSWORD) throw new Error('Missing AppFolio API credentials');
  if (!args.occurred_on_from || !args.occurred_on_to) {
    throw new Error('Missing required arguments: occurred_on_from and occurred_on_to (format YYYY-MM-DD)');
  }

  const { property_visibility = "active", ...rest } = args;
  const payload = { property_visibility, ...rest };

  const url = `https://${VHOST}.appfolio.com/api/v2/reports/resident_financial_activity.json`;
  const response = await appfolioLimiter.schedule(() => axios.post(url, payload, {
    auth: { username: USERNAME, password: PASSWORD },
    headers: { 'Content-Type': 'application/json' },
  }));

  return response.data;
}

// --- Screening Assessment Report Types ---
export type ScreeningAssessmentArgs = {
  property_visibility?: "active" | "hidden" | "all"; // Defaults to "active"
  properties?: {
    properties_ids?: string[];
    property_groups_ids?: string[];
    portfolios_ids?: string[];
    owners_ids?: string[];
  };
  screen_ran_at_from: string; // Required (YYYY-MM-DD)
  screen_ran_at_to: string; // Required (YYYY-MM-DD)
  only_show_overridden_assessments?: "0" | "1"; // Optional, '1' to show only overridden
  columns?: string[];
};

export type ScreeningAssessmentResult = {
  results: Array<{
    applicant_name: string | null;
    calculated_assessment: string | null;
    screening_timestamp: string | null;
    final_assessment: string | null;
    override_reasons: string | null;
    override_comment: string | null;
    override_timestamp: string | null;
    override_user: string | null;
    rental_application_id: number | null;
    property: string | null;
    property_name: string | null;
    property_id: number | null;
    property_address: string | null;
    property_street: string | null;
    property_street2: string | null;
    property_city: string | null;
    property_state: string | null;
    property_zip: string | null;
  }>;
  next_page_url: string | null;
};

// --- Screening Assessment Report Function ---
async function getScreeningAssessmentReport(args: ScreeningAssessmentArgs): Promise<ScreeningAssessmentResult> {
  if (!VHOST || !USERNAME || !PASSWORD) throw new Error('Missing AppFolio API credentials');
  if (!args.screen_ran_at_from || !args.screen_ran_at_to) {
    throw new Error('Missing required arguments: screen_ran_at_from and screen_ran_at_to (format YYYY-MM-DD)');
  }

  const { property_visibility = "active", ...rest } = args;
  const payload = { property_visibility, ...rest };

  const url = `https://${VHOST}.appfolio.com/api/v2/reports/screening_assessments.json`;
  const response = await appfolioLimiter.schedule(() => axios.post(url, payload, {
    auth: { username: USERNAME, password: PASSWORD },
    headers: { 'Content-Type': 'application/json' },
  }));

  return response.data;
}

// --- Security Deposit Funds Detail Report Types ---
export type SecurityDepositFundsDetailArgs = {
  property_visibility?: "active" | "hidden" | "all"; // Defaults to "active"
  properties?: {
    properties_ids?: string[];
    property_groups_ids?: string[];
    portfolios_ids?: string[];
    owners_ids?: string[];
  };
  parties_ids?: {
    occupancies_ids?: string[];
  };
  tenant_statuses?: string[]; // e.g., ["0", "4"]
  gl_account_ids?: string[];
  occurred_on_to: string; // Required (YYYY-MM-DD)
  columns?: string[];
};

export type SecurityDepositFundsDetailResult = {
  results: Array<{
    property: string | null;
    property_name: string | null;
    property_id: number | null;
    property_address: string | null;
    property_street: string | null;
    property_street2: string | null;
    property_city: string | null;
    property_state: string | null;
    property_zip: string | null;
    unit: string | null;
    tenant_name: string | null;
    tenant_status: string | null;
    move_in: string | null;
    move_out: string | null;
    amount: string | null;
    unit_id: number | null;
    occupancy_id: number | null;
    sdr_echeck_eligibility: string | null;
  }>;
  next_page_url: string | null;
};

// --- Security Deposit Funds Detail Report Function ---
async function getSecurityDepositFundsDetailReport(args: SecurityDepositFundsDetailArgs): Promise<SecurityDepositFundsDetailResult> {
  if (!VHOST || !USERNAME || !PASSWORD) throw new Error('Missing AppFolio API credentials');
  if (!args.occurred_on_to) {
    throw new Error('Missing required argument: occurred_on_to (format YYYY-MM-DD)');
  }

  const { property_visibility = "active", ...rest } = args;
  const payload = { property_visibility, ...rest };

  const url = `https://${VHOST}.appfolio.com/api/v2/reports/security_deposit_funds_detail.json`;
  const response = await appfolioLimiter.schedule(() => axios.post(url, payload, {
    auth: { username: USERNAME, password: PASSWORD },
    headers: { 'Content-Type': 'application/json' },
  }));

  return response.data;
}

// --- Tenant Directory Report Types ---
export type TenantDirectoryArgs = {
  tenant_visibility?: "active" | "hidden" | "all"; // Defaults to "active"
  tenant_statuses?: string[]; // e.g., ["0", "4"]
  tenant_types?: ("all" | "tenant" | "cosigner" | "former_tenant")[]; // Defaults to ["all"]
  property_visibility?: "active" | "hidden" | "all"; // Defaults to "active"
  properties?: {
    properties_ids?: string[];
    property_groups_ids?: string[];
    portfolios_ids?: string[];
    owners_ids?: string[];
  };
  columns?: string[];
};

export type TenantDirectoryResult = {
  results: Array<{
    tenant_address: string | null;
    tenant_street: string | null;
    tenant_street2: string | null;
    tenant_city: string | null;
    tenant_state: string | null;
    tenant_zip: string | null;
    tenant_birthdate: string | null;
    property: string | null;
    property_name: string | null;
    property_id: number | null;
    property_address: string | null;
    property_street: string | null;
    property_street2: string | null;
    property_city: string | null;
    property_state: string | null;
    property_zip: string | null;
    unit: string | null;
    tenant: string | null;
    status: string | null;
    tenant_type: string | null;
    phone_numbers: string | null;
    emails: string | null;
    move_in: string | null;
    lease_to: string | null;
    rent: string | null;
    deposit: string | null;
    tenant_tags: string | null;
    tenant_agent: string | null;
    tenant_visibility: string | null;
    certified_funds_only: string | null;
    lease_from: string | null;
    last_lease_renewal: string | null;
    move_out: string | null;
    next_rent_increase: string | null;
    last_rent_increase: string | null;
    next_rent_adjustment: string | null;
    sdr_echeck_eligibility: string | null;
    tenant_portal_activated: string | null;
    online_payments_recurring_total: string | null;
    online_payments_recurring_count: number | null;
    tenant_portal_login: string | null;
    tenant_notes: string | null;
    send_rent_reminders: string | null;
    unit_tags: string | null;
    unit_type: string | null;
    late_fee_type: string | null;
    late_fee_base_amount: string | null;
    late_fee_daily_amount: string | null;
    rent_grace_days: number | null;
    rent_grace_day_fixed_day: number | null;
    late_fee_grace_balance: string | null;
    max_daily_late_fees_amount: string | null;
    ignore_partial_payments: string | null;
    ais_enabled: string | null;
    insurance_company_name: string | null;
    insurance_expiration: string | null;
    insurance_policy_number: string | null;
    transaction_fee: string | null;
    primary_tenant: string | null;
    first_name: string | null;
    last_name: string | null;
    company_name: string | null;
    license_plates: string | null;
    pets: string | null;
    auto_nsf_fee_amount: string | null;
    require_online_payments_in_full: string | null;
    tenant_sdr_payment: string | null;
    commercial_lease_type: string | null;
    occupancy_id: number | null;
    unit_id: number | null;
    selected_tenant_id: number | null;
    guest_card_id: number | null;
    inquiry_id: number | null;
    rental_application_id: number | null;
    portfolio_id: number | null;
    occupancy_import_uid: string | null;
    tenant_integration_id: string | null;
  }>;
  next_page_url: string | null;
};

// --- Tenant Directory Report Function ---
async function getTenantDirectoryReport(args: TenantDirectoryArgs): Promise<TenantDirectoryResult> {
  if (!VHOST || !USERNAME || !PASSWORD) throw new Error('Missing AppFolio API credentials');

  const {
    tenant_visibility = "active",
    tenant_types = ["all"],
    property_visibility = "active",
    ...rest
  } = args;

  const payload = {
    tenant_visibility,
    tenant_types,
    property_visibility,
    ...rest
  };

  const url = `https://${VHOST}.appfolio.com/api/v2/reports/tenant_directory.json`;
  const response = await appfolioLimiter.schedule(() => axios.post(url, payload, {
    auth: { username: USERNAME, password: PASSWORD },
    headers: { 'Content-Type': 'application/json' },
  }));

  return response.data;
}

// --- Tenant Ledger Report Types ---
export type TenantLedgerArgs = {
  parties_ids: {
    occupancies_ids: string[]; // Required
  };
  occurred_on_from: string; // Required (YYYY-MM-DD)
  occurred_on_to: string; // Required (YYYY-MM-DD)
  transactions_shown?: "tenant" | "owner" | "all"; // Defaults to "tenant"
  columns?: string[];
};

export type TenantLedgerResult = {
  results: Array<{
    date: string | null;
    payer: string | null;
    description: string | null;
    debit: string | null;
    credit: string | null;
    credit_debit_balance: string | null;
  }>;
  next_page_url: string | null;
};

// --- Tenant Ledger Report Function ---
async function getTenantLedgerReport(args: TenantLedgerArgs): Promise<TenantLedgerResult> {
  if (!VHOST || !USERNAME || !PASSWORD) throw new Error('Missing AppFolio API credentials');
  if (!args.parties_ids?.occupancies_ids || args.parties_ids.occupancies_ids.length === 0) {
    throw new Error('Missing required argument: parties_ids.occupancies_ids must contain at least one ID');
  }
  if (!args.occurred_on_from || !args.occurred_on_to) {
    throw new Error('Missing required arguments: occurred_on_from and occurred_on_to (format YYYY-MM-DD)');
  }

  const { transactions_shown = "tenant", ...rest } = args;
  const payload = { transactions_shown, ...rest };

  const url = `https://${VHOST}.appfolio.com/api/v2/reports/tenant_ledger.json`;
  const response = await appfolioLimiter.schedule(() => axios.post(url, payload, {
    auth: { username: USERNAME, password: PASSWORD },
    headers: { 'Content-Type': 'application/json' },
  }));

  return response.data;
}

// --- Trial Balance By Property Report Types ---
export type TrialBalanceByPropertyArgs = {
  property_visibility?: "active" | "hidden" | "all"; // Defaults to "active"
  properties?: {
    properties_ids?: string[];
    property_groups_ids?: string[];
    portfolios_ids?: string[];
    owners_ids?: string[];
  };
  posted_on_from: string; // Required (YYYY-MM-DD)
  posted_on_to: string; // Required (YYYY-MM-DD)
  gl_account_map_id?: string;
  columns?: string[];
};

export type TrialBalanceByPropertyResult = {
  results: Array<{
    property_name: string | null;
    account_name: string | null;
    balance_forward: string | null;
    debit: string | null;
    credit: string | null;
    ending_balance: string | null;
    property_id: number | null;
  }>;
  next_page_url: string | null;
};

// --- Trial Balance By Property Report Function ---
async function getTrialBalanceByPropertyReport(args: TrialBalanceByPropertyArgs): Promise<TrialBalanceByPropertyResult> {
  if (!VHOST || !USERNAME || !PASSWORD) throw new Error('Missing AppFolio API credentials');
  if (!args.posted_on_from || !args.posted_on_to) {
    throw new Error('Missing required arguments: posted_on_from and posted_on_to (format YYYY-MM-DD)');
  }

  const { property_visibility = "active", ...rest } = args;
  const payload = { property_visibility, ...rest };

  const url = `https://${VHOST}.appfolio.com/api/v2/reports/trial_balance_by_property.json`;
  const response = await appfolioLimiter.schedule(() => axios.post(url, payload, {
    auth: { username: USERNAME, password: PASSWORD },
    headers: { 'Content-Type': 'application/json' },
  }));

  return response.data;
}

// --- 12 Month Cash Flow Report Types ---
export type Cashflow12MonthArgs = {
  property_visibility?: "active" | "hidden" | "all"; // Defaults to "active"
  properties?: {
    properties_ids?: string[];
    property_groups_ids?: string[];
    portfolios_ids?: string[];
    owners_ids?: string[];
  };
  posted_on_from: string; // Required (YYYY-MM)
  posted_on_to: string; // Required (YYYY-MM)
  gl_account_map_id?: string;
  level_of_detail?: "detail_view" | "summary_view"; // Defaults to "detail_view"
  include_zero_balance_gl_accounts?: "1" | "0"; // Defaults to "0"
  exclude_suppressed_fees?: "1" | "0"; // Defaults to "0"
  columns?: string[];
};

export type Cashflow12MonthResult = Array<{
  account_name: string | null;
  account_code: string | null;
  months: Array<{
    id: string | null;
    value: string | null;
  }>;
  total: string | null;
}>;

// --- 12 Month Cash Flow Report Function ---
async function getCashflow12MonthReport(args: Cashflow12MonthArgs): Promise<Cashflow12MonthResult> {
  if (!VHOST || !USERNAME || !PASSWORD) throw new Error('Missing AppFolio API credentials');
  if (!args.posted_on_from || !args.posted_on_to) {
    throw new Error('Missing required arguments: posted_on_from and posted_on_to (format YYYY-MM)');
  }

  const {
    property_visibility = "active",
    level_of_detail = "detail_view",
    include_zero_balance_gl_accounts = "0",
    exclude_suppressed_fees = "0",
    ...rest
  } = args;

  const payload = {
    property_visibility,
    level_of_detail,
    include_zero_balance_gl_accounts,
    exclude_suppressed_fees,
    ...rest
  };

  const url = `https://${VHOST}.appfolio.com/api/v2/reports/twelve_month_cash_flow.json`;
  const response = await appfolioLimiter.schedule(() => axios.post(url, payload, {
    auth: { username: USERNAME, password: PASSWORD },
    headers: { 'Content-Type': 'application/json' },
  }));

  return response.data;
}

// --- 12 Month Income Statement Report Types ---
export type IncomeStatement12MonthArgs = {
  property_visibility?: "active" | "hidden" | "all"; // Defaults to "active"
  properties?: {
    properties_ids?: string[];
    property_groups_ids?: string[];
    portfolios_ids?: string[];
    owners_ids?: string[];
  };
  fund_type?: "all" | "operating" | "escrow"; // Defaults to "all"
  posted_on_from: string; // Required (YYYY-MM)
  posted_on_to: string; // Required (YYYY-MM)
  gl_account_map_id?: string;
  level_of_detail?: "detail_view" | "summary_view"; // Defaults to "detail_view"
  include_zero_balance_gl_accounts?: "1" | "0"; // Defaults to "0"
  columns?: string[];
};

// Result type is the same structure as 12 Month Cash Flow
export type IncomeStatement12MonthResult = Cashflow12MonthResult;

// --- 12 Month Income Statement Report Function ---
async function getIncomeStatement12MonthReport(args: IncomeStatement12MonthArgs): Promise<IncomeStatement12MonthResult> {
  if (!VHOST || !USERNAME || !PASSWORD) throw new Error('Missing AppFolio API credentials');
  if (!args.posted_on_from || !args.posted_on_to) {
    throw new Error('Missing required arguments: posted_on_from and posted_on_to (format YYYY-MM)');
  }

  const {
    property_visibility = "active",
    fund_type = "all",
    level_of_detail = "detail_view",
    include_zero_balance_gl_accounts = "0",
    ...rest
  } = args;

  const payload = {
    property_visibility,
    fund_type,
    level_of_detail,
    include_zero_balance_gl_accounts,
    ...rest
  };

  const url = `https://${VHOST}.appfolio.com/api/v2/reports/twelve_month_income_statement.json`;
  const response = await appfolioLimiter.schedule(() => axios.post(url, payload, {
    auth: { username: USERNAME, password: PASSWORD },
    headers: { 'Content-Type': 'application/json' },
  }));

  return response.data;
}

// --- Unit Directory Report Types ---
export type UnitDirectoryArgs = {
  properties?: {
    properties_ids?: string[];
    property_groups_ids?: string[];
    portfolios_ids?: string[];
    owners_ids?: string[];
  };
  unit_visibility?: "active" | "hidden" | "all"; // Defaults to "active"
  tags?: string; // Comma-separated list of tags
  columns?: string[];
};

export type UnitDirectoryResult = {
  results: Array<{
    property: string | null;
    property_name: string | null;
    property_id: number | null;
    unit_address: string | null;
    unit_street: string | null;
    unit_street2: string | null;
    unit_city: string | null;
    unit_state: string | null;
    unit_zip: string | null;
    unit_name: string | null;
    market_rent: string | null;
    marketing_title: string | null;
    marketing_description: string | null;
    advertised_rent: string | null;
    posted_to_website: string | null;
    posted_to_internet: string | null;
    you_tube_url: string | null;
    default_deposit: string | null;
    sqft: number | null;
    bedrooms: number | null;
    bathrooms: string | null;
    unit_tags: string | null;
    unit_type: string | null;
    created_on: string | null;
    rentable: string | null;
    rubs_enabled: string | null;
    rubs_enabled_on: string | null;
    description: string | null;
    rent_status: string | null;
    legal_rent: string | null;
    application_fee: string | null;
    rent_ready: string | null;
    unit_id: number | null;
    computed_market_rent: string | null;
    ready_for_showing_on: string | null;
    visibility: string | null;
    rentable_uid: string | null;
    portfolio_id: number | null;
    unit_integration_id: string | null;
    unit_amenities: string | null;
    unit_appliances: string | null;
    unit_utilities: string | null;
    billed_as: string | null;
  }>;
  next_page_url: string | null;
};

// --- Unit Directory Report Function ---
async function getUnitDirectoryReport(args: UnitDirectoryArgs): Promise<UnitDirectoryResult> {
  if (!VHOST || !USERNAME || !PASSWORD) throw new Error('Missing AppFolio API credentials');

  const { unit_visibility = "active", ...rest } = args;
  const payload = { unit_visibility, ...rest };

  const url = `https://${VHOST}.appfolio.com/api/v2/reports/unit_directory.json`;
  const response = await appfolioLimiter.schedule(() => axios.post(url, payload, {
    auth: { username: USERNAME, password: PASSWORD },
    headers: { 'Content-Type': 'application/json' },
  }));

  return response.data;
}

// --- Unit Inspection Report Types ---
export type UnitInspectionArgs = {
  properties?: {
    properties_ids?: string[];
    property_groups_ids?: string[];
    portfolios_ids?: string[];
    owners_ids?: string[];
  };
  unit_visibility?: "active" | "hidden" | "all"; // Defaults to "active"
  last_inspection_on_from?: string; // Optional (YYYY-MM-DD)
  include_blank_inspection_date?: "1" | "0"; // Defaults to "0"
  columns?: string[];
};

export type UnitInspectionResult = {
  results: Array<{
    property: string | null;
    property_name: string | null;
    property_id: number | null;
    property_address: string | null;
    property_street: string | null;
    property_street2: string | null;
    property_city: string | null;
    property_state: string | null;
    property_zip: string | null;
    unit_name: string | null;
    last_inspection_date: string | null;
    tenant_name: string | null;
    tenant_primary_phone_number: string | null;
    move_in_date: string | null;
    move_out_date: string | null;
    unit_id: number | null;
    occupancy_id: number | null;
    rentable: string | null;
    unit_tags: string | null;
  }>;
  next_page_url: string | null;
};

// --- Unit Inspection Report Function ---
async function getUnitInspectionReport(args: UnitInspectionArgs): Promise<UnitInspectionResult> {
  if (!VHOST || !USERNAME || !PASSWORD) throw new Error('Missing AppFolio API credentials');

  const {
    unit_visibility = "active",
    include_blank_inspection_date = "0",
    ...rest
  } = args;

  const payload = {
    unit_visibility,
    include_blank_inspection_date,
    ...rest
  };

  const url = `https://${VHOST}.appfolio.com/api/v2/reports/unit_inspection.json`;
  const response = await appfolioLimiter.schedule(() => axios.post(url, payload, {
    auth: { username: USERNAME, password: PASSWORD },
    headers: { 'Content-Type': 'application/json' },
  }));

  return response.data;
}

// --- Unit Vacancy Detail Report Types ---
export type UnitVacancyDetailArgs = {
  properties?: {
    properties_ids?: string[];
    property_groups_ids?: string[];
    portfolios_ids?: string[];
    owners_ids?: string[];
  };
  unit_visibility?: "active" | "hidden" | "all"; // Defaults to "active"
  tags?: string; // Comma-separated list of tags
  columns?: string[];
};

export type UnitVacancyDetailResult = {
  results: Array<{
    advertised_rent: string | null;
    posted_to_website: string | null;
    posted_to_internet: string | null;
    property: string | null;
    property_name: string | null;
    amenities: string | null;
    lockbox_enabled: string | null;
    affordable_program: string | null;
    address: string | null;
    street: string | null;
    street2: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
    unit: string | null;
    unit_tags: string | null;
    unit_type: string | null;
    bed_and_bath: string | null;
    sqft: number | null;
    unit_status: string | null;
    rent_ready: string | null;
    days_vacant: number | null;
    last_rent: string | null;
    schd_rent: string | null;
    new_rent: string | null;
    last_move_in: string | null;
    last_move_out: string | null;
    available_on: string | null;
    next_move_in: string | null;
    description: string | null;
    amenities_price: string | null;
    computed_market_rent: string | null;
    ready_for_showing_on: string | null;
    unit_turn_target_date: string | null;
    advertised_rent_months: Array<Record<string, unknown>>; // Array of objects, structure not fully defined
    property_id: number | null;
    unit_id: number | null;
  }>;
  next_page_url: string | null;
};

// --- Unit Vacancy Detail Report Function ---
async function getUnitVacancyDetailReport(args: UnitVacancyDetailArgs): Promise<UnitVacancyDetailResult> {
  if (!VHOST || !USERNAME || !PASSWORD) throw new Error('Missing AppFolio API credentials');

  const { unit_visibility = "active", ...rest } = args;
  const payload = { unit_visibility, ...rest };

  const url = `https://${VHOST}.appfolio.com/api/v2/reports/unit_vacancy.json`;
  const response = await appfolioLimiter.schedule(() => axios.post(url, payload, {
    auth: { username: USERNAME, password: PASSWORD },
    headers: { 'Content-Type': 'application/json' },
  }));

  return response.data;
}

// --- Vendor Directory Report Types ---
export type VendorDirectoryArgs = {
  workers_comp_expiration_to?: string; // Optional (YYYY-MM-DD)
  liability_expiration_to?: string; // Optional (YYYY-MM-DD)
  epa_expiration_to?: string; // Optional (YYYY-MM-DD)
  auto_insurance_expiration_to?: string; // Optional (YYYY-MM-DD)
  state_license_expiration_to?: string; // Optional (YYYY-MM-DD)
  contract_expiration_to?: string; // Optional (YYYY-MM-DD)
  tags?: string; // Comma-separated list of tags
  vendor_visibility?: "active" | "inactive" | "all"; // Defaults to "active"
  payment_type?: "eCheck" | "Check" | "all"; // Defaults to "all" if not specified, needs check
  created_by?: string; // Defaults to "All"
  vendor_type?: string; // Defaults to "All"
  columns?: string[];
};

export type VendorDirectoryResult = {
  results: Array<{
    company_name: string | null;
    name: string | null;
    address: string | null;
    street: string | null;
    street2: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
    phone_numbers: string | null;
    email: string | null;
    default_gl_account: string | null;
    payment_type: string | null;
    send1099: string | null;
    workers_comp_expires: string | null;
    liability_ins_expires: string | null;
    epa_cert_expires: string | null;
    auto_ins_expires: string | null;
    state_lic_expires: string | null;
    contract_expires: string | null;
    tags: string | null;
    vendor_id: number | null;
    vendor_trades: string | null;
    do_not_use_for_work_order: string | null;
    terms: string | null;
    first_name: string | null;
    last_name: string | null;
    vendor_integration_id: string | null;
    created_by: string | null;
    vendor_type: string | null;
    portal_activated: string | null;
  }>;
  next_page_url: string | null;
};

// --- Vendor Directory Report Function ---
async function getVendorDirectoryReport(args: VendorDirectoryArgs): Promise<VendorDirectoryResult> {
  if (!VHOST || !USERNAME || !PASSWORD) throw new Error('Missing AppFolio API credentials');

  const {
    vendor_visibility = "active",
    payment_type, // Note: API might default to 'all' if not sent, needs verification
    created_by = "All",
    vendor_type = "All",
    ...rest
  } = args;

  const payload: Record<string, any> = {
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
  const response = await appfolioLimiter.schedule(() => axios.post(url, payload, {
    auth: { username: USERNAME, password: PASSWORD },
    headers: { 'Content-Type': 'application/json' },
  }));

  return response.data;
}

// --- Vendor Ledger Report Types ---
export type VendorLedgerArgs = {
  party_contact_info: {
    company_id: string; // Required Vendor ID
  };
  property_visibility?: "active" | "hidden" | "all"; // Defaults to "active"
  properties?: {
    properties_ids?: string[];
    property_groups_ids?: string[];
    portfolios_ids?: string[];
    owners_ids?: string[];
  };
  occurred_on_from: string; // Required (YYYY-MM-DD)
  occurred_on_to: string; // Required (YYYY-MM-DD)
  reverse_transaction?: "1" | "0"; // Defaults to "0"
  columns?: string[];
};

export type VendorLedgerResult = {
  results: Array<{
    reference_number: string | null;
    bill_date: string | null;
    due_date: string | null;
    account: string | null;
    account_name: string | null;
    account_number: string | null;
    property: string | null;
    property_name: string | null;
    property_id: number | null;
    property_address: string | null;
    property_street: string | null;
    property_street2: string | null;
    property_city: string | null;
    property_state: string | null;
    property_zip: string | null;
    unit: string | null;
    payee_name: string | null;
    paid: string | null;
    unpaid: string | null;
    check_number: string | null;
    payment_date: string | null;
    description: string | null;
    work_order: string | null;
    cash_account: string | null;
    txn_id: number | null;
    payable_invoice_detail_id: number | null;
    unit_id: number | null;
    quantity: string | null;
    rate: string | null;
    work_order_assignee: string | null;
    approval_status: string | null;
    approved_by: string | null;
    last_approver: string | null;
    next_approvers: string | null;
    days_pending_approval: string | null;
    board_approval_status: string | null;
    txn_created_at: string | null;
    txn_updated_at: string | null;
    created_by: string | null;
    bank_account: string | null;
    vendor_account_number: string | null;
    service_from: string | null;
    service_to: string | null;
    other_payment_type: string | null;
    purchase_order_number: string | null;
    purchase_order_id: number | null;
    project: string | null;
    project_id: number | null;
    service_request_id: number | null;
    vendor_id: number | null;
    cost_center_name: string | null;
    cost_center_number: string | null;
    work_order_issue: string | null;
    work_order_id: number | null;
    party_id: number | null;
    party_type: string | null;
  }>;
  next_page_url: string | null;
};

// --- Vendor Ledger Report Function ---
async function getVendorLedgerReport(args: VendorLedgerArgs): Promise<VendorLedgerResult> {
  if (!VHOST || !USERNAME || !PASSWORD) throw new Error('Missing AppFolio API credentials');
  if (!args.party_contact_info?.company_id) {
    throw new Error('Missing required argument: party_contact_info.company_id');
  }
  if (!args.occurred_on_from || !args.occurred_on_to) {
    throw new Error('Missing required arguments: occurred_on_from and occurred_on_to (format YYYY-MM-DD)');
  }

  const {
    property_visibility = "active",
    reverse_transaction = "0",
    ...rest
  } = args;

  const payload = {
    property_visibility,
    reverse_transaction,
    ...rest
  };

  const url = `https://${VHOST}.appfolio.com/api/v2/reports/vendor_ledger.json`;
  const response = await appfolioLimiter.schedule(() => axios.post(url, payload, {
    auth: { username: USERNAME, password: PASSWORD },
    headers: { 'Content-Type': 'application/json' },
  }));

  return response.data;
}

// --- Work Order Report Types ---
export type WorkOrderArgs = {
  property_visibility?: "active" | "hidden" | "all"; // Defaults to "active"
  unit_ids?: string[];
  property?: { property_id: string }; // Filter by a single property ID
  parties_ids?: {
    occupancies_ids?: string[];
  };
  party_contact_info?: {
    company_id: string; // Vendor ID
  };
  assigned_user?: string; // User ID or "All", defaults to "All"
  created_by?: string; // User ID or "All", defaults to "All"
  priority?: "All" | "Low" | "Medium" | "High" | "Urgent"; // Defaults to "All"
  from_inspection?: boolean | null; // Defaults to null/omit
  current_estimate_approval_status?: "All" | "Pending" | "Approved" | "Declined"; // Defaults to "All"
  work_order_statuses?: string[]; // List of status IDs
  work_order_types?: Array<"unit_turn" | "tenant_requested" | "other">; // List of types
  unit_turn_category?: Array<"all" | string>; // List of categories, defaults to ["all"]
  status_date_range_from?: string; // YYYY-MM-DD
  status_date_range_to?: string; // YYYY-MM-DD
  status_date?: "all" | "created_at" | "completed_on"; // Defaults to "all"
  columns?: string[];
};

export type WorkOrderResult = {
  results: Array<{
    property: string | null;
    property_name: string | null;
    property_id: number | null;
    property_address: string | null;
    property_street: string | null;
    property_street2: string | null;
    property_city: string | null;
    property_state: string | null;
    property_zip: string | null;
    unit_address: string | null;
    unit_street: string | null;
    unit_street2: string | null;
    unit_city: string | null;
    unit_state: string | null;
    unit_zip: string | null;
    priority: string | null;
    work_order_type: string | null;
    service_request_number: string | null;
    service_request_description: string | null;
    home_warranty_expiration: string | null;
    work_order_number: string | null;
    job_description: string | null;
    instructions: string | null;
    status: string | null;
    vendor_id: number | null;
    vendor: string | null;
    unit_id: number | null;
    unit_name: string | null;
    occupancy_id: number | null;
    primary_tenant: string | null;
    primary_tenant_email: string | null;
    primary_tenant_phone_number: string | null;
    created_at: string | null;
    created_by: string | null;
    assigned_user: string | null;
    estimate_req_on: string | null;
    estimated_on: string | null;
    estimate_amount: string | null;
    estimate_approval_status: string | null;
    estimate_approved_on: string | null;
    estimate_approval_last_requested_on: string | null;
    scheduled_start: string | null;
    scheduled_end: string | null;
    work_completed_on: string | null;
    completed_on: string | null;
    last_billed_on: string | null;
    canceled_on: string | null;
    amount: string | null;
    invoice: string | null;
    unit_turn_id: string | null;
    corporate_charge_amount: string | null;
    corporate_charge_id: number | null;
    discount_amount: string | null;
    discount_bill_id: number | null;
    markup_amount: string | null;
    markup_bill_id: number | null;
    tenant_total_charge_amount: string | null;
    tenant_charge_ids: string | null; // Comma-separated IDs?
    vendor_bill_amount: string | null;
    vendor_bill_id: number | null;
    vendor_charge_amount: string | null;
    vendor_charge_id: number | null;
    inspection_id: number | null;
    inspection_date: string | null;
    work_order_id: number | null;
    service_request_id: number | null;
    recurring: string | null;
    submitted_by_tenant: string | null;
    requesting_tenant: string | null;
    maintenance_limit: string | null;
    status_notes: string | null;
    follow_up_on: string | null;
    vendor_trade: string | null;
    unit_turn_category: string | null;
    work_order_issue: string | null;
    survey_id: number | null;
    vendor_portal_invoices: number | null;
  }>;
  next_page_url: string | null;
};

// --- Work Order Report Function ---
async function getWorkOrderReport(args: WorkOrderArgs): Promise<WorkOrderResult> {
  if (!VHOST || !USERNAME || !PASSWORD) throw new Error('Missing AppFolio API credentials');

  const {
    property_visibility = "active",
    assigned_user = "All",
    created_by = "All",
    priority = "All",
    current_estimate_approval_status = "All",
    status_date = "all",
    unit_turn_category = ["all"], // Default based on API description
    from_inspection = null, // Explicitly set default
    ...rest
  } = args;

  // Construct payload, handle potential null for from_inspection
  const payload: any = {
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
  const response = await appfolioLimiter.schedule(() => axios.post(url, payload, {
    auth: { username: USERNAME, password: PASSWORD },
    headers: { 'Content-Type': 'application/json' },
  }));

  return response.data;
}

// --- Work Order Labor Summary Report Types ---
export type WorkOrderLaborSummaryArgs = {
  property_visibility?: "active" | "hidden" | "all"; // Defaults to "active"
  properties?: {
    properties_ids?: string[];
    property_groups_ids?: string[];
    portfolios_ids?: string[];
    owners_ids?: string[];
  };
  maintenance_tech?: string; // User ID or "All", defaults to "All"
  work_order_statuses?: string[]; // List of status IDs
  unit_turn?: "1" | "0"; // Defaults to "0" (false)
  labor_performed_from: string; // Required (YYYY-MM-DD)
  labor_performed_to: string; // Required (YYYY-MM-DD)
  columns?: string[];
};

export type WorkOrderLaborSummaryResult = {
  results: Array<{
    work_order_number: string | null;
    date: string | null;
    maintenance_tech: string | null;
    property_name: string | null;
    unit_name: string | null;
    start_time: string | null;
    end_time: string | null;
    worked_hours: string | null;
    hours: string | null;
    marked_after_hours: string | null;
    hours_difference: string | null;
    work_order_status: string | null;
    description: string | null;
    last_edited_by: string | null;
    unit_turn_id: string | null;
    timer_start: string | null;
    timer_stop: string | null;
    gl_account: string | null;
    last_bill_created_at: string | null;
    work_order_issue: string | null;
    property_id: number | null;
    unit_id: number | null;
    work_order_id: number | null;
    service_request_id: number | null;
    labor_detail_id: number | null;
  }>;
  next_page_url: string | null;
};

// --- Work Order Labor Summary Report Function ---
async function getWorkOrderLaborSummaryReport(args: WorkOrderLaborSummaryArgs): Promise<WorkOrderLaborSummaryResult> {
  if (!VHOST || !USERNAME || !PASSWORD) throw new Error('Missing AppFolio API credentials');
  if (!args.labor_performed_from || !args.labor_performed_to) {
    throw new Error('Missing required arguments: labor_performed_from and labor_performed_to (format YYYY-MM-DD)');
  }

  const {
    property_visibility = "active",
    maintenance_tech = "All",
    unit_turn = "0", // Default to not filter by unit turn unless specified
    ...rest
  } = args;

  const payload = {
    property_visibility,
    maintenance_tech,
    unit_turn,
    ...rest
  };

  const url = `https://${VHOST}.appfolio.com/api/v2/reports/work_order_labor_summary.json`;
  const response = await appfolioLimiter.schedule(() => axios.post(url, payload, {
    auth: { username: USERNAME, password: PASSWORD },
    headers: { 'Content-Type': 'application/json' },
  }));

  return response.data;
}

export {
  getAgedPayablesSummaryReport,
  getAgedReceivablesDetailReport,
  getBudgetComparativeReport,
  getExpenseDistributionReport,
  getRentRollItemizedReport,
  getCashflowReport,
  getPropertyDirectoryReport,
  getAccountTotalsReport,
  getDelinquencyAsOfReport,
  getGuestCardInquiriesReport,
  getLeasingFunnelPerformanceReport,
  getAnnualBudgetComparativeReport,
  getAnnualBudgetForecastReport,
  getBalanceSheetReport,
  getCancelledWorkflowsReport,
  getChartOfAccountsReport,
  getCompletedWorkflowsReport,
  getFixedAssetsReport,
  getInProgressWorkflowsReport,
  getIncomeStatementDateRangeReport,
  getLeaseExpirationDetailByMonthReport,
  getLeasingSummaryReport,
  getLoansReport,
  getOccupancySummaryReport,
  getOwnerLeasingReport,
  getPropertyPerformanceReport,
  getPropertySourceTrackingReport,
  getReceivablesActivityReport,
  getRenewalSummaryReport,
  getRentalApplicationsReport,
  getResidentFinancialActivityReport,
  getScreeningAssessmentReport,
  getSecurityDepositFundsDetailReport,
  getTenantDirectoryReport,
  getTenantLedgerReport,
  getTrialBalanceByPropertyReport,
  getCashflow12MonthReport,
  getIncomeStatement12MonthReport,
  getUnitDirectoryReport,
  getUnitInspectionReport,
  getUnitVacancyDetailReport,
  getVendorDirectoryReport,
  getVendorLedgerReport,
  getWorkOrderReport,
  getWorkOrderLaborSummaryReport // Add new function to exports
};


const appfolioLimiter = new Bottleneck({
  reservoir: 7, // initial number of requests
  reservoirRefreshAmount: 7,
  reservoirRefreshInterval: 15 * 1000, // 15 seconds
  maxConcurrent: 1 // ensure requests are spaced out
});

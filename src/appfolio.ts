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

export async function getAgedPayablesSummaryReport(args: AgedPayablesSummaryArgs): Promise<AgedPayablesSummaryResult> { 
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

export async function getAgedReceivablesDetailReport(args: AgedReceivablesDetailArgs): Promise<AgedReceivablesDetailResult> {
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
  additional_account_types?: string[];
  gl_account_map_id?: string;
  level_of_detail?: string;
  columns?: string[];
};

export type BudgetComparativeResult = Array<{
  account_number: string;
  account_name: string;
  period_actual: string;
  period_budget: string;
  period_amount_var: string;
  period_percent_var: string;
  comparison_actual: string;
  comparison_budget: string;
  comparison_amount_var: string;
  comparison_percent_var: string;
}>;

export async function getBudgetComparativeReport(args: BudgetComparativeArgs): Promise<BudgetComparativeResult> {
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

export async function getExpenseDistributionReport(args: ExpenseDistributionArgs): Promise<ExpenseDistributionResult> {
  if (!VHOST || !USERNAME || !PASSWORD) throw new Error('Missing AppFolio API credentials');
  const payload = { ...args, property_visibility: args.property_visibility ?? "active" };
  const url = `https://${VHOST}.appfolio.com/api/v2/reports/expense_distribution.json`;
  const response = await appfolioLimiter.schedule(() => axios.post(url, payload, {
    auth: { username: USERNAME, password: PASSWORD },
    headers: { 'Content-Type': 'application/json' },
  }));
  return response.data;
}

export async function getRentRollItemizedReport(args: RentRollItemizedArgs): Promise<RentRollItemizedResult> {
  if (!VHOST || !USERNAME || !PASSWORD) throw new Error('Missing AppFolio API credentials');
  const payload = { ...args, unit_visibility: args.unit_visibility ?? "active" };
  const url = `https://${VHOST}.appfolio.com/api/v2/reports/rent_roll_itemized.json`;
  const response = await appfolioLimiter.schedule(() => axios.post(url, payload, {
    auth: { username: USERNAME, password: PASSWORD },
    headers: { 'Content-Type': 'application/json' },
  }));
  return response.data;
}


const appfolioLimiter = new Bottleneck({
  reservoir: 7, // initial number of requests
  reservoirRefreshAmount: 7,
  reservoirRefreshInterval: 15 * 1000, // 15 seconds
  maxConcurrent: 1 // ensure requests are spaced out
});

export async function getCashflowReport(args: CashflowReportArgs) {
  if (!VHOST || !USERNAME || !PASSWORD) throw new Error('Missing AppFolio API credentials');
  const url = `https://${VHOST}.appfolio.com/api/v2/reports/cash_flow_detail.json`;
  const response = await appfolioLimiter.schedule(() => axios.post(url, args, {
    auth: { username: USERNAME, password: PASSWORD },
    headers: { 'Content-Type': 'application/json' },
  }));
  return response.data;
}

export async function getPropertyDirectoryReport(args: any) {
  if (!VHOST || !USERNAME || !PASSWORD) throw new Error('Missing AppFolio API credentials');
  const url = `https://${VHOST}.appfolio.com/api/v2/reports/property_directory.json`;
  const response = await appfolioLimiter.schedule(() => axios.post(url, args, {
    auth: { username: USERNAME, password: PASSWORD },
    headers: { 'Content-Type': 'application/json' },
  }));
  return response.data;
}

export async function getAccountTotalsReport(args: AccountTotalsReportArgs): Promise<AccountTotalsReportResult> {
  if (!VHOST || !USERNAME || !PASSWORD) throw new Error('Missing AppFolio API credentials');
  const payload = { ...args, gl_account_ids: args.gl_account_ids ?? "1" };
  const url = `https://${VHOST}.appfolio.com/api/v2/reports/account_totals.json`;
  const response = await appfolioLimiter.schedule(() => axios.post(url, payload, {
    auth: { username: USERNAME, password: PASSWORD },
    headers: { 'Content-Type': 'application/json' },
  }));
  return response.data;
}

export async function getDelinquencyAsOfReport(args: DelinquencyAsOfArgs): Promise<DelinquencyAsOfResult> {
  if (!process.env.VHOST || !process.env.USERNAME || !process.env.PASSWORD) {
    throw new Error('Missing AppFolio API credentials');
  }
  const {
    property_visibility = "active",
    tenant_statuses = ["0", "4"],
    amount_owed_in_account = "all",
    ...rest
  } = args;

  const payload = {
    property_visibility,
    tenant_statuses,
    amount_owed_in_account,
    ...rest,
  };

  const url = `https://${process.env.VHOST}.appfolio.com/api/v2/reports/delinquency_as_of.json`;
  const response = await axios.post(url, payload, {
    auth: { username: process.env.USERNAME, password: process.env.PASSWORD },
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data;
}

export async function getGuestCardInquiriesReport(
  args: GuestCardInquiriesArgs
): Promise<GuestCardInquiriesResult> {
  if (!process.env.VHOST || !process.env.USERNAME || !process.env.PASSWORD) {
    throw new Error('Missing AppFolio API credentials');
  }
  const {
    property_visibility = "active",
    guest_card_sources = [],
    guest_card_statuses = [],
    guest_card_lead_types = [],
    ...rest
  } = args;

  const payload = {
    property_visibility,
    guest_card_sources,
    guest_card_statuses,
    guest_card_lead_types,
    ...rest,
  };

  const url = `https://${process.env.VHOST}.appfolio.com/api/v2/reports/guest_card_inquiries.json`;
  const response = await axios.post(url, payload, {
    auth: { username: process.env.USERNAME, password: process.env.PASSWORD },
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data;
}

export async function getLeasingFunnelPerformanceReport(
  args: LeasingFunnelPerformanceArgs
): Promise<LeasingFunnelPerformanceResult> {
  if (!process.env.VHOST || !process.env.USERNAME || !process.env.PASSWORD) {
    throw new Error('Missing AppFolio API credentials');
  }
  const {
    property_visibility = "all",
    assigned_user_visibility = "active",
    assigned_user = "All",
    ...rest
  } = args;

  const payload = {
    property_visibility,
    assigned_user_visibility,
    assigned_user,
    ...rest,
  };

  const url = `https://${process.env.VHOST}.appfolio.com/api/v2/reports/leasing_funnel_performance.json`;
  const response = await axios.post(url, payload, {
    auth: { username: process.env.USERNAME, password: process.env.PASSWORD },
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data;
}

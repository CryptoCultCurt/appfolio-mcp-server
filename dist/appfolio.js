"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAgedPayablesSummaryReport = getAgedPayablesSummaryReport;
exports.getAgedReceivablesDetailReport = getAgedReceivablesDetailReport;
exports.getBudgetComparativeReport = getBudgetComparativeReport;
exports.getExpenseDistributionReport = getExpenseDistributionReport;
exports.getRentRollItemizedReport = getRentRollItemizedReport;
exports.getCashflowReport = getCashflowReport;
exports.getPropertyDirectoryReport = getPropertyDirectoryReport;
exports.getAccountTotalsReport = getAccountTotalsReport;
exports.getDelinquencyAsOfReport = getDelinquencyAsOfReport;
exports.getGuestCardInquiriesReport = getGuestCardInquiriesReport;
exports.getLeasingFunnelPerformanceReport = getLeasingFunnelPerformanceReport;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const bottleneck_1 = __importDefault(require("bottleneck"));
dotenv_1.default.config();
const { VHOST, USERNAME, PASSWORD } = process.env;
async function getAgedPayablesSummaryReport(args) {
    if (!VHOST || !USERNAME || !PASSWORD)
        throw new Error('Missing AppFolio API credentials');
    // Set default for property_visibility if not provided
    const payload = { ...args, property_visibility: args.property_visibility ?? "active" };
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/aged_payables_summary.json`;
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
async function getRentRollItemizedReport(args) {
    if (!VHOST || !USERNAME || !PASSWORD)
        throw new Error('Missing AppFolio API credentials');
    const payload = { ...args, unit_visibility: args.unit_visibility ?? "active" };
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/rent_roll_itemized.json`;
    const response = await appfolioLimiter.schedule(() => axios_1.default.post(url, payload, {
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
async function getCashflowReport(args) {
    if (!VHOST || !USERNAME || !PASSWORD)
        throw new Error('Missing AppFolio API credentials');
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/cash_flow_detail.json`;
    const response = await appfolioLimiter.schedule(() => axios_1.default.post(url, args, {
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
async function getAccountTotalsReport(args) {
    if (!VHOST || !USERNAME || !PASSWORD)
        throw new Error('Missing AppFolio API credentials');
    const payload = { ...args, gl_account_ids: args.gl_account_ids ?? "1" };
    const url = `https://${VHOST}.appfolio.com/api/v2/reports/account_totals.json`;
    const response = await appfolioLimiter.schedule(() => axios_1.default.post(url, payload, {
        auth: { username: USERNAME, password: PASSWORD },
        headers: { 'Content-Type': 'application/json' },
    }));
    return response.data;
}
async function getDelinquencyAsOfReport(args) {
    if (!process.env.VHOST || !process.env.USERNAME || !process.env.PASSWORD) {
        throw new Error('Missing AppFolio API credentials');
    }
    const { property_visibility = "active", tenant_statuses = ["0", "4"], amount_owed_in_account = "all", ...rest } = args;
    const payload = {
        property_visibility,
        tenant_statuses,
        amount_owed_in_account,
        ...rest,
    };
    const url = `https://${process.env.VHOST}.appfolio.com/api/v2/reports/delinquency_as_of.json`;
    const response = await axios_1.default.post(url, payload, {
        auth: { username: process.env.USERNAME, password: process.env.PASSWORD },
        headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
}
async function getGuestCardInquiriesReport(args) {
    if (!process.env.VHOST || !process.env.USERNAME || !process.env.PASSWORD) {
        throw new Error('Missing AppFolio API credentials');
    }
    const { property_visibility = "active", guest_card_sources = [], guest_card_statuses = [], guest_card_lead_types = [], ...rest } = args;
    const payload = {
        property_visibility,
        guest_card_sources,
        guest_card_statuses,
        guest_card_lead_types,
        ...rest,
    };
    const url = `https://${process.env.VHOST}.appfolio.com/api/v2/reports/guest_card_inquiries.json`;
    const response = await axios_1.default.post(url, payload, {
        auth: { username: process.env.USERNAME, password: process.env.PASSWORD },
        headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
}
async function getLeasingFunnelPerformanceReport(args) {
    if (!process.env.VHOST || !process.env.USERNAME || !process.env.PASSWORD) {
        throw new Error('Missing AppFolio API credentials');
    }
    const { property_visibility = "all", assigned_user_visibility = "active", assigned_user = "All", ...rest } = args;
    const payload = {
        property_visibility,
        assigned_user_visibility,
        assigned_user,
        ...rest,
    };
    const url = `https://${process.env.VHOST}.appfolio.com/api/v2/reports/leasing_funnel_performance.json`;
    const response = await axios_1.default.post(url, payload, {
        auth: { username: process.env.USERNAME, password: process.env.PASSWORD },
        headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
}

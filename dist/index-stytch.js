#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const node_crypto_1 = require("node:crypto");
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const streamableHttp_js_1 = require("@modelcontextprotocol/sdk/server/streamableHttp.js");
const sse_js_1 = require("@modelcontextprotocol/sdk/server/sse.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const stytch = __importStar(require("stytch"));
// Import all your report tools
const cashflowReport_1 = require("./reports/cashflowReport");
const accountTotalsReport_1 = require("./reports/accountTotalsReport");
const agedPayablesSummaryReport_1 = require("./reports/agedPayablesSummaryReport");
const rentRollItemizedReport_1 = require("./reports/rentRollItemizedReport");
const guestCardInquiriesReport_1 = require("./reports/guestCardInquiriesReport");
const leasingFunnelPerformanceReport_1 = require("./reports/leasingFunnelPerformanceReport");
const annualBudgetComparativeReport_1 = require("./reports/annualBudgetComparativeReport");
const annualBudgetForecastReport_1 = require("./reports/annualBudgetForecastReport");
const delinquencyAsOfReport_1 = require("./reports/delinquencyAsOfReport");
const expenseDistributionReport_1 = require("./reports/expenseDistributionReport");
const balanceSheetReport_1 = require("./reports/balanceSheetReport");
const agedReceivablesDetailReport_1 = require("./reports/agedReceivablesDetailReport");
const budgetComparativeReport_1 = require("./reports/budgetComparativeReport");
const chartOfAccountsReport_1 = require("./reports/chartOfAccountsReport");
const completedWorkflowsReport_1 = require("./reports/completedWorkflowsReport");
const fixedAssetsReport_1 = require("./reports/fixedAssetsReport");
const inProgressWorkflowsReport_1 = require("./reports/inProgressWorkflowsReport");
const incomeStatementDateRangeReport_1 = require("./reports/incomeStatementDateRangeReport");
const cancelledWorkflowsReport_1 = require("./reports/cancelledWorkflowsReport");
const leaseExpirationDetailReport_1 = require("./reports/leaseExpirationDetailReport");
const leasingSummaryReport_1 = require("./reports/leasingSummaryReport");
const ownerDirectoryReport_1 = require("./reports/ownerDirectoryReport");
const loansReport_1 = require("./reports/loansReport");
const occupancySummaryReport_1 = require("./reports/occupancySummaryReport");
const ownerLeasingReport_1 = require("./reports/ownerLeasingReport");
const propertyPerformanceReport_1 = require("./reports/propertyPerformanceReport");
const propertySourceTrackingReport_1 = require("./reports/propertySourceTrackingReport");
const receivablesActivityReport_1 = require("./reports/receivablesActivityReport");
const renewalSummaryReport_1 = require("./reports/renewalSummaryReport");
const vendorLedgerReport_1 = require("./reports/vendorLedgerReport");
const rentalApplicationsReport_1 = require("./reports/rentalApplicationsReport");
const residentFinancialActivityReport_1 = require("./reports/residentFinancialActivityReport");
const screeningAssessmentReport_1 = require("./reports/screeningAssessmentReport");
const securityDepositFundsDetailReport_1 = require("./reports/securityDepositFundsDetailReport");
const tenantDirectoryReport_1 = require("./reports/tenantDirectoryReport");
const tenantLedgerReport_1 = require("./reports/tenantLedgerReport");
const trialBalanceByPropertyReport_1 = require("./reports/trialBalanceByPropertyReport");
const propertyDirectoryReport_1 = require("./reports/propertyDirectoryReport");
const propertyGroupDirectoryReport_1 = require("./reports/propertyGroupDirectoryReport");
const cashflow12MonthReport_1 = require("./reports/cashflow12MonthReport");
const incomeStatement12MonthReport_1 = require("./reports/incomeStatement12MonthReport");
const unitDirectoryReport_1 = require("./reports/unitDirectoryReport");
const unitInspectionReport_1 = require("./reports/unitInspectionReport");
const unitVacancyDetail_1 = require("./reports/unitVacancyDetail");
const vendorDirectoryReport_1 = require("./reports/vendorDirectoryReport");
const workOrderReport_1 = require("./reports/workOrderReport");
const workOrderLaborSummaryReport_1 = require("./reports/workOrderLaborSummaryReport");
dotenv_1.default.config();
// Initialize Stytch client
const stytchClient = new stytch.Client({
    project_id: process.env.STYTCH_PROJECT_ID,
    secret: process.env.STYTCH_SECRET,
});
// Store user info per session
const sessionUsers = {};
function createMcpServer(userInfo) {
    const server = new mcp_js_1.McpServer({
        name: "appfolio-mcp",
        version: "1.0.1",
    });
    // Add a whoami tool to show current user info
    if (userInfo) {
        server.tool("whoami", "Show current authenticated user information", async () => ({
            content: [
                {
                    type: "text",
                    text: `Authenticated User:\n${JSON.stringify(userInfo, null, 2)}`,
                },
            ],
        }));
    }
    // Register all your existing AppFolio tools
    (0, cashflowReport_1.registerCashflowReportTool)(server);
    (0, accountTotalsReport_1.registerAccountTotalsReportTool)(server);
    (0, agedPayablesSummaryReport_1.registerAgedPayablesSummaryReportTool)(server);
    (0, rentRollItemizedReport_1.registerRentRollItemizedReportTool)(server);
    (0, guestCardInquiriesReport_1.registerGuestCardInquiriesReportTool)(server);
    (0, leasingFunnelPerformanceReport_1.registerLeasingFunnelPerformanceReportTool)(server);
    (0, annualBudgetComparativeReport_1.registerAnnualBudgetComparativeReportTool)(server);
    (0, annualBudgetForecastReport_1.registerAnnualBudgetForecastReportTool)(server);
    (0, delinquencyAsOfReport_1.registerDelinquencyAsOfReportTool)(server);
    (0, expenseDistributionReport_1.registerExpenseDistributionReportTool)(server);
    (0, balanceSheetReport_1.registerBalanceSheetReportTool)(server);
    (0, agedReceivablesDetailReport_1.registerAgedReceivablesDetailReportTool)(server);
    (0, budgetComparativeReport_1.registerBudgetComparativeReportTool)(server);
    (0, chartOfAccountsReport_1.registerChartOfAccountsReportTool)(server);
    (0, completedWorkflowsReport_1.registerCompletedWorkflowsReportTool)(server);
    (0, fixedAssetsReport_1.registerFixedAssetsReportTool)(server);
    (0, inProgressWorkflowsReport_1.registerInProgressWorkflowsReportTool)(server);
    (0, incomeStatementDateRangeReport_1.registerIncomeStatementDateRangeReportTool)(server);
    (0, workOrderLaborSummaryReport_1.registerWorkOrderLaborSummaryReportTool)(server);
    (0, cancelledWorkflowsReport_1.registerCancelledWorkflowsReportTool)(server);
    (0, leaseExpirationDetailReport_1.registerLeaseExpirationDetailReportTool)(server);
    (0, leasingSummaryReport_1.registerLeasingSummaryReportTool)(server);
    (0, ownerDirectoryReport_1.registerOwnerDirectoryReportTool)(server);
    (0, loansReport_1.registerLoansReportTool)(server);
    (0, occupancySummaryReport_1.registerOccupancySummaryReportTool)(server);
    (0, ownerLeasingReport_1.registerOwnerLeasingReportTool)(server);
    (0, propertyPerformanceReport_1.registerPropertyPerformanceReportTool)(server);
    (0, propertySourceTrackingReport_1.registerPropertySourceTrackingReportTool)(server);
    (0, receivablesActivityReport_1.registerReceivablesActivityReportTool)(server);
    (0, renewalSummaryReport_1.registerRenewalSummaryReportTool)(server);
    (0, vendorLedgerReport_1.registerVendorLedgerReportTool)(server);
    (0, rentalApplicationsReport_1.registerRentalApplicationsReportTool)(server);
    (0, residentFinancialActivityReport_1.registerResidentFinancialActivityReportTool)(server);
    (0, screeningAssessmentReport_1.registerScreeningAssessmentReportTool)(server);
    (0, securityDepositFundsDetailReport_1.registerSecurityDepositFundsDetailReportTool)(server);
    (0, tenantDirectoryReport_1.registerTenantDirectoryReportTool)(server);
    (0, tenantLedgerReport_1.registerTenantLedgerReportTool)(server);
    (0, trialBalanceByPropertyReport_1.registerTrialBalanceByPropertyReportTool)(server);
    (0, propertyDirectoryReport_1.registerPropertyDirectoryReportTool)(server);
    (0, propertyGroupDirectoryReport_1.registerPropertyGroupDirectoryReportTool)(server);
    (0, cashflow12MonthReport_1.registerCashflow12MonthReportTool)(server);
    (0, incomeStatement12MonthReport_1.registerIncomeStatement12MonthReportTool)(server);
    (0, unitDirectoryReport_1.registerUnitDirectoryReportTool)(server);
    (0, unitInspectionReport_1.registerUnitInspectionReportTool)(server);
    (0, unitVacancyDetail_1.registerUnitVacancyDetailReportTool)(server);
    (0, vendorDirectoryReport_1.registerVendorDirectoryReportTool)(server);
    (0, workOrderReport_1.registerWorkOrderReportTool)(server);
    return server;
}
async function startStdio() {
    const server = createMcpServer();
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
}
async function startHttpServer() {
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    app.use((0, cors_1.default)({
        origin: process.env.CORS_ORIGIN || "*",
        exposedHeaders: ["Mcp-Session-Id"],
    }));
    const port = Number(process.env.HTTP_PORT || process.env.PORT || 3000);
    const useAuth = Boolean(process.env.STYTCH_PROJECT_ID && process.env.STYTCH_SECRET);
    // Session transport store
    const transports = {};
    // Stytch authentication middleware
    const stytchAuthMiddleware = async (req, res, next) => {
        if (!useAuth) {
            return next();
        }
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({
                error: "unauthorized",
                error_description: "Missing or invalid authorization header",
            });
            return;
        }
        const token = authHeader.substring(7);
        try {
            // Use Stytch's session authentication
            // The token should be a Stytch session token
            const authResponse = await stytchClient.sessions.authenticate({
                session_token: token,
            });
            // Store user info for this session if we have a session ID
            const sessionId = req.headers["mcp-session-id"];
            if (sessionId) {
                sessionUsers[sessionId] = authResponse.user;
            }
            // Attach user info to request for downstream use
            req.stytchUser = authResponse.user;
            req.stytchSession = authResponse.session;
            next();
        }
        catch (error) {
            console.error("Stytch token validation failed:", error);
            res.status(401).json({
                error: "invalid_token",
                error_description: "Token validation failed",
            });
        }
    };
    // OAuth metadata endpoints for MCP Inspector discovery
    app.get("/.well-known/oauth-protected-resource", (req, res) => {
        res.json({
            resource: `http://localhost:${port}/mcp`,
            authorization_servers: [`https://stytch.com/${process.env.STYTCH_PROJECT_ID}`],
            scopes_supported: ["read:user", "write:user"],
        });
    });
    app.get("/.well-known/oauth-authorization-server", (req, res) => {
        const environment = process.env.STYTCH_ENVIRONMENT || "test";
        res.json({
            issuer: `https://stytch.com/${process.env.STYTCH_PROJECT_ID}`,
            authorization_endpoint: `https://${environment}.stytch.com/v1/public/oauth/authorize`,
            token_endpoint: `https://${environment}.stytch.com/v1/public/oauth/token`,
            revocation_endpoint: `https://${environment}.stytch.com/v1/public/oauth/revoke`,
            registration_endpoint: `https://${environment}.stytch.com/v1/public/oauth/register`,
            response_types_supported: ["code"],
            scopes_supported: ["read:user", "write:user"],
            jwks_uri: `https://${environment}.stytch.com/v1/sessions/jwks/${process.env.STYTCH_PROJECT_ID}`,
            grant_types_supported: ["authorization_code", "refresh_token"],
            token_endpoint_auth_methods_supported: ["client_secret_post", "client_secret_basic", "none"],
            code_challenge_methods_supported: ["S256", "plain"],
        });
    });
    // Streamable HTTP endpoint
    app.all("/mcp", ...(useAuth ? [stytchAuthMiddleware] : []), async (req, res) => {
        try {
            const existingSessionIdHeader = req.headers["mcp-session-id"];
            let transport;
            if (existingSessionIdHeader && transports[existingSessionIdHeader]) {
                const existing = transports[existingSessionIdHeader];
                if (existing instanceof streamableHttp_js_1.StreamableHTTPServerTransport) {
                    transport = existing;
                }
                else {
                    res.status(400).json({
                        jsonrpc: "2.0",
                        error: { code: -32000, message: "Bad Request: Session exists but uses a different transport protocol" },
                        id: null,
                    });
                    return;
                }
            }
            else if (!existingSessionIdHeader && req.method === "POST" && (0, types_js_1.isInitializeRequest)(req.body)) {
                const sessionId = (0, node_crypto_1.randomUUID)();
                transport = new streamableHttp_js_1.StreamableHTTPServerTransport({
                    sessionIdGenerator: () => sessionId,
                    enableJsonResponse: true,
                });
                transports[sessionId] = transport;
                transport.onclose = () => {
                    delete transports[sessionId];
                    delete sessionUsers[sessionId];
                };
                // Create server with user info if authenticated
                const userInfo = req.stytchUser;
                const server = createMcpServer(userInfo);
                await server.connect(transport);
            }
            else {
                res.status(400).json({
                    jsonrpc: "2.0",
                    error: { code: -32000, message: "Bad Request: No valid session ID provided" },
                    id: null,
                });
                return;
            }
            await transport.handleRequest(req, res, req.body);
        }
        catch (error) {
            console.error("Error handling MCP request:", error);
            if (!res.headersSent) {
                res.status(500).json({
                    jsonrpc: "2.0",
                    error: { code: -32603, message: "Internal server error" },
                    id: null,
                });
            }
        }
    });
    // SSE fallback endpoint
    app.get("/sse", ...(useAuth ? [stytchAuthMiddleware] : []), async (req, res) => {
        const transport = new sse_js_1.SSEServerTransport("/messages", res);
        transports[transport.sessionId] = transport;
        res.on("close", () => {
            delete transports[transport.sessionId];
            delete sessionUsers[transport.sessionId];
        });
        const userInfo = req.stytchUser;
        const server = createMcpServer(userInfo);
        await server.connect(transport);
    });
    app.post("/messages", ...(useAuth ? [stytchAuthMiddleware] : []), async (req, res) => {
        const sessionId = req.query.sessionId || "";
        const transport = transports[sessionId];
        if (!transport || !(transport instanceof sse_js_1.SSEServerTransport)) {
            res.status(400).json({
                jsonrpc: "2.0",
                error: { code: -32000, message: "Bad Request: No SSE transport found for sessionId" },
                id: null,
            });
            return;
        }
        await transport.handlePostMessage(req, res, req.body);
    });
    app.listen(port, () => {
        console.log(`MCP HTTP server listening on port ${port}`);
        console.log(`Stytch authentication: ${useAuth ? "ENABLED" : "DISABLED"}`);
        if (useAuth) {
            console.log(`Stytch Project ID: ${process.env.STYTCH_PROJECT_ID}`);
        }
    });
}
// Start in the requested mode
const mode = (process.env.MCP_MODE || "stdio").toLowerCase();
if (mode === "http") {
    startHttpServer();
}
else {
    startStdio();
}

#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const node_crypto_1 = require("node:crypto");
const node_net_1 = __importDefault(require("node:net"));
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const streamableHttp_js_1 = require("@modelcontextprotocol/sdk/server/streamableHttp.js");
const sse_js_1 = require("@modelcontextprotocol/sdk/server/sse.js");
const bearerAuth_js_1 = require("@modelcontextprotocol/sdk/server/auth/middleware/bearerAuth.js");
const router_js_1 = require("@modelcontextprotocol/sdk/server/auth/router.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const jose_1 = require("jose");
const errors_js_1 = require("@modelcontextprotocol/sdk/server/auth/errors.js");
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
const tenantLedgerReport_1 = require("./reports/tenantLedgerReport");
dotenv_1.default.config();
function createJwksVerifier(options) {
    const { jwksUrl, issuer, audience, inlineJwksJson } = options;
    const jwks = (0, jose_1.createRemoteJWKSet)(new URL(jwksUrl), { timeoutDuration: 10000 });
    let localSetPromise = null;
    async function getLocalJwkSet() {
        if (localSetPromise)
            return localSetPromise;
        // If inline JWKS JSON provided, use that and avoid network entirely
        if (inlineJwksJson) {
            try {
                const parsed = JSON.parse(inlineJwksJson);
                localSetPromise = Promise.resolve((0, jose_1.createLocalJWKSet)(parsed));
                // eslint-disable-next-line no-console
                console.log("Using inline JWKS from OAUTH_JWKS_JSON env");
                return localSetPromise;
            }
            catch (e) {
                // eslint-disable-next-line no-console
                console.error("Invalid OAUTH_JWKS_JSON:", e?.message || e);
            }
        }
        localSetPromise = (async () => {
            try {
                const res = await fetch(jwksUrl, { headers: { accept: "application/json" } });
                if (!res.ok)
                    throw new Error(`JWKS HTTP ${res.status}`);
                const jwk = await res.json();
                return (0, jose_1.createLocalJWKSet)(jwk);
            }
            catch (e) {
                // eslint-disable-next-line no-console
                console.error("Prefetch JWKS failed:", e?.message || e);
                // Fallback to remote set by throwing to caller
                throw e;
            }
        })();
        return localSetPromise;
    }
    return {
        async verifyAccessToken(token) {
            const segments = token.split(".").length;
            try {
                const headerSegment = token.split(".")[0];
                const headerJson = JSON.parse(Buffer.from(headerSegment, "base64url").toString("utf8"));
                // eslint-disable-next-line no-console
                console.log(`Access token header: alg=${headerJson.alg || "?"}, kid=${headerJson.kid || "?"}, segments=${segments}`);
            }
            catch { }
            if (segments !== 3) {
                // eslint-disable-next-line no-console
                console.error(`Access token has ${segments} segments; expected 3 (signed JWT/JWS).`);
                if (segments === 5) {
                    throw new errors_js_1.InvalidTokenError("Encrypted (JWE) token provided. Configure Auth0 API to issue signed RS256 JWT access tokens.");
                }
                throw new errors_js_1.InvalidTokenError("Invalid token format. Expected compact JWS (three segments).");
            }
            let payload;
            try {
                // First try with locally prefetched JWKS (if available)
                try {
                    const local = await getLocalJwkSet();
                    ({ payload } = await (0, jose_1.jwtVerify)(token, local, { issuer, audience }));
                }
                catch (e) {
                    // Fallback to remote JWKS fetch if local failed (or not yet available)
                    ({ payload } = await (0, jose_1.jwtVerify)(token, jwks, {
                        issuer,
                        audience,
                    }));
                }
            }
            catch (err) {
                // eslint-disable-next-line no-console
                console.error("JWT verification failed:", err?.message || err);
                throw new errors_js_1.InvalidTokenError("Invalid token");
            }
            const scopes = typeof payload.scope === "string" ? payload.scope.split(" ") : [];
            const clientId = (payload.client_id || payload.azp || payload.sub || "unknown");
            let resourceUrl;
            const resourceClaim = payload.resource;
            if (typeof resourceClaim === "string") {
                try {
                    resourceUrl = new URL(resourceClaim);
                }
                catch { }
            }
            else if (Array.isArray(resourceClaim) && resourceClaim.length > 0 && typeof resourceClaim[0] === "string") {
                try {
                    resourceUrl = new URL(resourceClaim[0]);
                }
                catch { }
            }
            return {
                token,
                clientId,
                scopes,
                expiresAt: typeof payload.exp === "number" ? payload.exp : undefined,
                resource: resourceUrl,
                extra: payload,
            };
        },
    };
}
function createMcpServer() {
    const server = new mcp_js_1.McpServer({
        name: "appfolio-mcp",
        version: "1.0.1",
    });
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
async function findAvailablePort(startPort, maxAttempts = 20) {
    for (let port = startPort; port < startPort + maxAttempts; port++) {
        const isFree = await new Promise((resolve) => {
            const tester = node_net_1.default
                .createServer()
                .once("error", () => resolve(false))
                .once("listening", () => {
                tester.close(() => resolve(true));
            })
                .listen(port, "0.0.0.0");
        });
        if (isFree)
            return port;
    }
    throw new Error(`No available port found starting at ${startPort}`);
}
async function startStdio() {
    const server = createMcpServer();
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
}
async function startHttpServer() {
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    // CORS and security headers
    app.use((0, cors_1.default)({
        origin: process.env.CORS_ORIGIN || "*",
        exposedHeaders: ["Mcp-Session-Id"],
    }));
    // Optional OAuth 2.1 Authorization Server proxy routes (so clients like Inspector can complete OAuth flows)
    const proxyAuthorizationUrl = process.env.OAUTH_PROXY_AUTHORIZATION_URL;
    const proxyTokenUrl = process.env.OAUTH_PROXY_TOKEN_URL;
    const proxyRevocationUrl = process.env.OAUTH_PROXY_REVOCATION_URL;
    const proxyRegistrationUrl = process.env.OAUTH_PROXY_REGISTRATION_URL;
    const oauthIssuer = process.env.OAUTH_ISSUER; // Upstream issuer
    const oauthScopesSupported = (process.env.OAUTH_SCOPES_SUPPORTED || "").split(/\s+/).filter(Boolean);
    const serviceDocumentationUrl = process.env.OAUTH_SERVICE_DOC_URL;
    const requestedPort = Number(process.env.HTTP_PORT || process.env.PORT || 3000);
    const selectedPort = await findAvailablePort(requestedPort, 50);
    if (selectedPort !== requestedPort) {
        // eslint-disable-next-line no-console
        console.warn(`Port ${requestedPort} is in use; using port ${selectedPort} instead.`);
    }
    const resourceServerUrl = new URL(process.env.RESOURCE_SERVER_URL || `http://localhost:${selectedPort}/mcp`);
    // Recreate OAuth verifier/middleware now that we know the final port, and publish PR metadata
    const jwksUrl = process.env.OAUTH_JWKS_URL;
    const issuer = process.env.OAUTH_ISSUER ? process.env.OAUTH_ISSUER.replace(/\/+$/, "") : undefined; // trim trailing slash
    const audience = process.env.OAUTH_AUDIENCE;
    const inlineJwksJson = process.env.OAUTH_JWKS_JSON;
    const resourceMetadataUrlFinal = (process.env.OAUTH_RESOURCE_METADATA_URL && process.env.OAUTH_RESOURCE_METADATA_URL.trim().length > 0)
        ? process.env.OAUTH_RESOURCE_METADATA_URL
        : `${new URL(`http://localhost:${selectedPort}/.well-known/oauth-protected-resource`)}`;
    const useAuth = Boolean(jwksUrl);
    const authMiddleware = useAuth
        ? (0, bearerAuth_js_1.requireBearerAuth)({
            verifier: createJwksVerifier({ jwksUrl: jwksUrl, issuer, audience, inlineJwksJson }),
            resourceMetadataUrl: resourceMetadataUrlFinal,
        })
        : undefined;
    // Serve OAuth Protected Resource metadata explicitly so MCP clients can discover the AS and how to send bearer tokens
    app.get("/.well-known/oauth-protected-resource", (_req, res) => {
        const issuerNoSlash = oauthIssuer ? oauthIssuer.replace(/\/+$/, "") : undefined;
        res.status(200).json({
            resource: resourceServerUrl.toString(),
            authorization_servers: issuerNoSlash ? [issuerNoSlash] : [],
            bearer_methods_supported: ["header"],
            scopes_supported: oauthScopesSupported.length ? oauthScopesSupported : ["openid", "profile", "email", "offline_access"],
            // Explicitly indicate refresh token support is required
            token_types_supported: ["access_token", "refresh_token"],
        });
    });
    // Optional: quick token introspection endpoint for debugging
    app.get("/whoami", ...(authMiddleware ? [authMiddleware] : []), (req, res) => {
        const auth = req.auth || {};
        res.status(200).json({
            ok: true,
            clientId: auth.clientId,
            scopes: auth.scopes,
            expiresAt: auth.expiresAt,
            resource: auth.resource ? String(auth.resource) : undefined,
            extra: auth.extra,
        });
    });
    // Publish OAuth metadata for this MCP resource (computed after final port is selected)
    if (proxyAuthorizationUrl && proxyTokenUrl && oauthIssuer) {
        // OAuth metadata that supports both standard OAuth and Dynamic Client Registration
        const oauthMetadata = {
            issuer: oauthIssuer,
            authorization_endpoint: proxyAuthorizationUrl,
            token_endpoint: proxyTokenUrl,
            revocation_endpoint: proxyRevocationUrl,
            registration_endpoint: proxyRegistrationUrl, // Critical for MCP Inspector!
            response_types_supported: ["code"], // MCP uses authorization code flow
            scopes_supported: oauthScopesSupported.length ? oauthScopesSupported : ["read:user", "write:user", "offline_access"],
            service_documentation: serviceDocumentationUrl,
            jwks_uri: jwksUrl,
            grant_types_supported: ["authorization_code", "refresh_token"],
            subject_types_supported: ["public"],
            id_token_signing_alg_values_supported: ["RS256"],
            token_endpoint_auth_methods_supported: ["client_secret_post", "client_secret_basic", "none"],
            code_challenge_methods_supported: ["S256", "plain"],
            // Dynamic Client Registration metadata
            client_registration_types_supported: ["automatic"],
            // Indicate that refresh tokens are supported and required
            token_endpoint_auth_signing_alg_values_supported: ["RS256"],
        };
        app.use((0, router_js_1.mcpAuthMetadataRouter)({
            oauthMetadata,
            resourceServerUrl,
            serviceDocumentationUrl: serviceDocumentationUrl ? new URL(serviceDocumentationUrl) : undefined,
            scopesSupported: oauthScopesSupported.length ? oauthScopesSupported : undefined,
        }));
    }
    // Session transport store
    const transports = {};
    // Streamable HTTP endpoint (supports GET/POST/DELETE)
    const mcpHandler = async (req, res) => {
        try {
            const existingSessionIdHeader = req.headers["mcp-session-id"];
            let transport;
            console.log("existingSessionIdHeader", existingSessionIdHeader);
            console.log("transports", transports);
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
                transport = new streamableHttp_js_1.StreamableHTTPServerTransport({
                    sessionIdGenerator: () => (0, node_crypto_1.randomUUID)(),
                    enableJsonResponse: true,
                    onsessioninitialized: (sid) => {
                        transports[sid] = transport;
                    },
                });
                transport.onclose = () => {
                    const sid = transport.sessionId;
                    if (sid && transports[sid])
                        delete transports[sid];
                };
                const server = createMcpServer();
                console.log("server", server);
                console.log("transport", transport);
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
            // eslint-disable-next-line no-console
            console.error("Error handling MCP request:", error);
            if (!res.headersSent) {
                res.status(500).json({
                    jsonrpc: "2.0",
                    error: { code: -32603, message: "Internal server error" },
                    id: null,
                });
            }
        }
    };
    app.all("/mcp", ...(authMiddleware ? [authMiddleware] : []), mcpHandler);
    app.all("/mcp/", ...(authMiddleware ? [authMiddleware] : []), mcpHandler);
    // Friendly root route to verify service is up (protected when auth enabled)
    app.get("/", ...(authMiddleware ? [authMiddleware] : []), (_req, res) => {
        res.status(200).send("AppFolio MCP server is running. Use POST /mcp to initialize a session.");
    });
    // SSE fallback endpoints (deprecated transport)
    app.get("/sse", ...(authMiddleware ? [authMiddleware] : []), async (req, res) => {
        const transport = new sse_js_1.SSEServerTransport("/messages", res);
        transports[transport.sessionId] = transport;
        res.on("close", () => {
            delete transports[transport.sessionId];
        });
        const server = createMcpServer();
        await server.connect(transport);
    });
    app.post("/messages", ...(authMiddleware ? [authMiddleware] : []), async (req, res) => {
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
    app.listen(selectedPort, () => {
        // eslint-disable-next-line no-console
        console.log(`MCP HTTP server listening on port ${selectedPort}`);
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

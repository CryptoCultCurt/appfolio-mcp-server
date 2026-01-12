#!/usr/bin/env node
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { randomUUID } from "node:crypto";
import net from "node:net";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { requireBearerAuth } from "@modelcontextprotocol/sdk/server/auth/middleware/bearerAuth.js";
import { mcpAuthMetadataRouter } from "@modelcontextprotocol/sdk/server/auth/router.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { createRemoteJWKSet, createLocalJWKSet, jwtVerify } from "jose";
import { InvalidTokenError } from "@modelcontextprotocol/sdk/server/auth/errors.js";

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
import { registerPropertyGroupDirectoryReportTool } from "./reports/propertyGroupDirectoryReport";
import { registerCashflow12MonthReportTool } from "./reports/cashflow12MonthReport";
import { registerIncomeStatement12MonthReportTool } from "./reports/incomeStatement12MonthReport";
import { registerUnitDirectoryReportTool } from "./reports/unitDirectoryReport";
import { registerUnitInspectionReportTool } from "./reports/unitInspectionReport";
import { registerUnitVacancyDetailReportTool } from "./reports/unitVacancyDetail";
import { registerVendorDirectoryReportTool } from "./reports/vendorDirectoryReport";
import { registerWorkOrderReportTool } from "./reports/workOrderReport";
import { registerWorkOrderLaborSummaryReportTool } from "./reports/workOrderLaborSummaryReport";
import { registerTenantLedgerReportTool } from "./reports/tenantLedgerReport";

dotenv.config();

type JWKSVerifierOptions = {
  jwksUrl: string;
  issuer?: string;
  audience?: string;
  inlineJwksJson?: string; // optional JSON string for offline verification
};

function createJwksVerifier(options: JWKSVerifierOptions) {
  const { jwksUrl, issuer, audience, inlineJwksJson } = options;
  const jwks = createRemoteJWKSet(new URL(jwksUrl), { timeoutDuration: 10000 });
  let localSetPromise: Promise<ReturnType<typeof createLocalJWKSet>> | null = null;
  async function getLocalJwkSet() {
    if (localSetPromise) return localSetPromise;
    // If inline JWKS JSON provided, use that and avoid network entirely
    if (inlineJwksJson) {
      try {
        const parsed = JSON.parse(inlineJwksJson);
        localSetPromise = Promise.resolve(createLocalJWKSet(parsed));
        // eslint-disable-next-line no-console
        console.log("Using inline JWKS from OAUTH_JWKS_JSON env");
        return localSetPromise;
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("Invalid OAUTH_JWKS_JSON:", (e as Error)?.message || e);
      }
    }
    localSetPromise = (async () => {
      try {
        const res = await fetch(jwksUrl, { headers: { accept: "application/json" } });
        if (!res.ok) throw new Error(`JWKS HTTP ${res.status}`);
        const jwk = await res.json();
        return createLocalJWKSet(jwk);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("Prefetch JWKS failed:", (e as Error)?.message || e);
        // Fallback to remote set by throwing to caller
        throw e;
      }
    })();
    return localSetPromise;
  }
  return {
    async verifyAccessToken(token: string) {
      const segments = token.split(".").length;
      try {
        const headerSegment = token.split(".")[0];
        const headerJson = JSON.parse(Buffer.from(headerSegment, "base64url").toString("utf8"));
        // eslint-disable-next-line no-console
        console.log(`Access token header: alg=${headerJson.alg || "?"}, kid=${headerJson.kid || "?"}, segments=${segments}`);
      } catch {}
      if (segments !== 3) {
        // eslint-disable-next-line no-console
        console.error(`Access token has ${segments} segments; expected 3 (signed JWT/JWS).`);
        if (segments === 5) {
          throw new InvalidTokenError(
            "Encrypted (JWE) token provided. Configure Auth0 API to issue signed RS256 JWT access tokens."
          );
        }
        throw new InvalidTokenError("Invalid token format. Expected compact JWS (three segments).");
      }
      let payload: any;
      try {
        // First try with locally prefetched JWKS (if available)
        try {
          const local = await getLocalJwkSet();
          ({ payload } = await jwtVerify(token, local, { issuer, audience }));
        } catch (e) {
          // Fallback to remote JWKS fetch if local failed (or not yet available)
          ({ payload } = await jwtVerify(token, jwks, {
          issuer,
          audience,
          }));
        }
      } catch (err: any) {
        // eslint-disable-next-line no-console
        console.error("JWT verification failed:", err?.message || err);
        throw new InvalidTokenError("Invalid token");
      }
      const scopes = typeof payload.scope === "string" ? payload.scope.split(" ") : [];
      const clientId = (payload.client_id || payload.azp || payload.sub || "unknown") as string;
      let resourceUrl: URL | undefined;
      const resourceClaim = (payload as any).resource as unknown;
      if (typeof resourceClaim === "string") {
        try { resourceUrl = new URL(resourceClaim); } catch {}
      } else if (Array.isArray(resourceClaim) && resourceClaim.length > 0 && typeof resourceClaim[0] === "string") {
        try { resourceUrl = new URL(resourceClaim[0]); } catch {}
      }
      return {
        token,
        clientId,
        scopes,
        expiresAt: typeof payload.exp === "number" ? payload.exp : undefined,
        resource: resourceUrl,
        extra: payload as Record<string, unknown>,
      };
    },
  };
}

function createMcpServer(): McpServer {
  const server = new McpServer({
    name: "appfolio-mcp",
    version: "1.0.1",
  });

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
  registerPropertyGroupDirectoryReportTool(server);
  registerCashflow12MonthReportTool(server);
  registerIncomeStatement12MonthReportTool(server);
  registerUnitDirectoryReportTool(server);
  registerUnitInspectionReportTool(server);
  registerUnitVacancyDetailReportTool(server);
  registerVendorDirectoryReportTool(server);
  registerWorkOrderReportTool(server);
  return server;
}

async function findAvailablePort(startPort: number, maxAttempts = 20): Promise<number> {
  for (let port = startPort; port < startPort + maxAttempts; port++) {
    const isFree = await new Promise<boolean>((resolve) => {
      const tester = net
        .createServer()
        .once("error", () => resolve(false))
        .once("listening", () => {
          tester.close(() => resolve(true));
        })
        .listen(port, "0.0.0.0");
    });
    if (isFree) return port;
  }
  throw new Error(`No available port found starting at ${startPort}`);
}

async function startStdio() {
  const server = createMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

async function startHttpServer() {
  const app = express();
  app.use(express.json());

  // CORS and security headers
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || "*",
      exposedHeaders: ["Mcp-Session-Id"],
    })
  );


  // Optional OAuth 2.1 Authorization Server proxy routes (so clients like Inspector can complete OAuth flows)
  const proxyAuthorizationUrl = process.env.OAUTH_PROXY_AUTHORIZATION_URL;
  const proxyTokenUrl = process.env.OAUTH_PROXY_TOKEN_URL;
  const proxyRevocationUrl = process.env.OAUTH_PROXY_REVOCATION_URL;
  const proxyRegistrationUrl = process.env.OAUTH_PROXY_REGISTRATION_URL;
  const oauthIssuer = process.env.OAUTH_ISSUER; // Upstream issuer
  // Default to common OAuth scopes if not specified
  // Note: offline_access is required for refresh tokens
  const defaultScopes = "openid profile email offline_access";
  const oauthScopesSupported = (process.env.OAUTH_SCOPES_SUPPORTED || defaultScopes).split(/\s+/).filter(Boolean);
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
  // Allow temporary auth bypass for testing MCP clients that don't support OAuth properly
  const bypassAuth = process.env.BYPASS_AUTH_FOR_TESTING === "true";
  const inspectorMode = process.env.INSPECTOR_MODE === "true"; // Special mode for MCP Inspector OAuth bug
  const hybridMode = process.env.HYBRID_MODE === "true"; // Accept both OAuth and no-auth requests
  const useAuth = Boolean(jwksUrl) && !bypassAuth && !inspectorMode && !hybridMode;
  
  if (bypassAuth) {
    console.log("⚠️ WARNING: Authentication bypassed for testing. Do not use in production!");
  } else if (inspectorMode) {
    console.log("🔧 INSPECTOR MODE: OAuth metadata served but requests not authenticated (MCP Inspector OAuth bug workaround)");
  } else if (hybridMode) {
    console.log("🔀 HYBRID MODE: OAuth preferred but requests work without auth (maximum compatibility)");
  }
  
  // Custom auth middleware with better debugging
  const authMiddleware = useAuth
    ? (req: any, res: any, next: any) => {
        const authHeader = req.headers.authorization || req.headers.Authorization;
        console.log(`🔍 Auth Debug - Header received: "${authHeader}"`);
        console.log(`🔍 Auth Debug - All headers:`, Object.keys(req.headers).filter(h => h.toLowerCase().includes('auth')));
        
        if (!authHeader) {
          console.log(`❌ No Authorization header found`);
          return res.status(401).json({
            error: "invalid_token",
            error_description: "Missing Authorization header"
          });
        }
        
        // More flexible Bearer token parsing
        let token: string;
        if (authHeader.toLowerCase().startsWith('bearer ')) {
          token = authHeader.substring(7); // Remove "Bearer " prefix
        } else {
          // Try to handle cases where token is sent without Bearer prefix
          console.log(`⚠️ Authorization header doesn't start with 'Bearer ', treating as raw token`);
          token = authHeader;
        }
        
        console.log(`🔍 Extracted token (first 20 chars): ${token.substring(0, 20)}...`);
        
        // Use the original requireBearerAuth but with our extracted token
        const verifier = createJwksVerifier({ jwksUrl: jwksUrl as string, issuer, audience, inlineJwksJson });
        
        verifier.verifyAccessToken(token)
          .then(authResult => {
            console.log(`✅ Token verification successful for client: ${authResult.clientId}`);
            (req as any).auth = authResult;
            next();
          })
          .catch(error => {
            console.log(`❌ Token verification failed:`, error.message);
            res.status(401).json({
              error: "invalid_token", 
              error_description: error.message || "Invalid token"
            });
          });
      }
    : undefined;

  // Serve OAuth Protected Resource metadata explicitly so MCP clients can discover the AS and how to send bearer tokens
  // Serve this in both auth mode and inspector/hybrid mode
  if (useAuth || inspectorMode || hybridMode) {
    app.get("/.well-known/oauth-protected-resource", (_req, res) => {
    const issuerNoSlash = oauthIssuer ? oauthIssuer.replace(/\/+$/, "") : undefined;
    res.status(200).json({
      resource: resourceServerUrl.toString(),
      authorization_servers: issuerNoSlash ? [issuerNoSlash] : [],
      bearer_methods_supported: ["header"],
      scopes_supported: oauthScopesSupported,
      // Explicitly indicate refresh token support is required
      token_types_supported: ["access_token", "refresh_token"],
    });
    });
  }

  // Optional: quick token introspection endpoint for debugging
  app.get("/whoami", ...(authMiddleware ? [authMiddleware] : []), (req, res) => {
    const auth = (req as any).auth || {};
    res.status(200).json({
      ok: true,
      clientId: auth.clientId,
      scopes: auth.scopes,
      expiresAt: auth.expiresAt,
      resource: auth.resource ? String(auth.resource) : undefined,
      extra: auth.extra,
    });
  });

  // Session status endpoint for debugging
  app.get("/sessions", ...(authMiddleware ? [authMiddleware] : []), (req, res) => {
    const now = new Date();
    const sessionSummary = Object.keys(transports).map(sessionId => {
      const metadata = sessionMetadata[sessionId];
      return {
        sessionId,
        created: metadata?.created,
        lastUsed: metadata?.lastUsed,
        requestCount: metadata?.requestCount || 0,
        ageMinutes: metadata ? Math.round((now.getTime() - metadata.created.getTime()) / 60000) : 0,
        idleMinutes: metadata ? Math.round((now.getTime() - metadata.lastUsed.getTime()) / 60000) : 0,
        transportType: transports[sessionId].constructor.name
      };
    });
    
    res.status(200).json({
      totalSessions: Object.keys(transports).length,
      sessions: sessionSummary,
      serverUptime: process.uptime(),
      sessionTimeoutMinutes: SESSION_TIMEOUT_MS / 60000
    });
  });

  // Publish OAuth metadata for this MCP resource (computed after final port is selected)
  // Always publish OAuth metadata if configured, even in inspector/hybrid mode
  if ((proxyAuthorizationUrl && proxyTokenUrl && oauthIssuer) && (useAuth || inspectorMode || hybridMode)) {
    // OAuth metadata that supports both standard OAuth and Dynamic Client Registration
    const oauthMetadata = {
      issuer: oauthIssuer,
      authorization_endpoint: proxyAuthorizationUrl,
      token_endpoint: proxyTokenUrl,
      revocation_endpoint: proxyRevocationUrl,
      registration_endpoint: proxyRegistrationUrl,  // Critical for MCP Inspector!
      response_types_supported: ["code"] as string[],  // MCP uses authorization code flow
      scopes_supported: oauthScopesSupported,
      service_documentation: serviceDocumentationUrl,
      jwks_uri: jwksUrl,
      grant_types_supported: ["authorization_code", "refresh_token"] as string[],
      subject_types_supported: ["public"] as string[],
      id_token_signing_alg_values_supported: ["RS256"] as string[],
      token_endpoint_auth_methods_supported: ["client_secret_post", "client_secret_basic", "none"] as string[],
      code_challenge_methods_supported: ["S256", "plain"] as string[],
      // Dynamic Client Registration metadata
      client_registration_types_supported: ["automatic"] as string[],
      // Indicate that refresh tokens are supported and required
      token_endpoint_auth_signing_alg_values_supported: ["RS256"] as string[],
    };

    app.use(
      mcpAuthMetadataRouter({
        oauthMetadata,
        resourceServerUrl,
        serviceDocumentationUrl: serviceDocumentationUrl ? new URL(serviceDocumentationUrl) : undefined,
        scopesSupported: oauthScopesSupported.length ? oauthScopesSupported : undefined,
      })
    );
  }

  // Request logging middleware
  app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`📥 ${timestamp} ${req.method} ${req.url}`);
    if (req.headers.authorization) {
      console.log(`🔑 Auth header present: ${req.headers.authorization.substring(0, 20)}...`);
    } else {
      console.log(`🔑 No auth header`);
    }
    next();
  });

  // Session transport store with metadata
  const transports: Record<string, StreamableHTTPServerTransport | SSEServerTransport> = {};
  const sessionMetadata: Record<string, { created: Date; lastUsed: Date; requestCount: number }> = {};
  
  // Session cleanup - remove stale sessions every 5 minutes
  const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
  setInterval(() => {
    const now = new Date();
    const staleSessionIds = Object.keys(sessionMetadata).filter(sessionId => {
      const metadata = sessionMetadata[sessionId];
      return now.getTime() - metadata.lastUsed.getTime() > SESSION_TIMEOUT_MS;
    });
    
    staleSessionIds.forEach(sessionId => {
      console.log(`Cleaning up stale session: ${sessionId}`);
      if (transports[sessionId]) {
        try {
          // Try to close the transport gracefully
          const transport = transports[sessionId];
          if ('close' in transport && typeof transport.close === 'function') {
            transport.close();
          }
        } catch (error) {
          console.warn(`Error closing transport for session ${sessionId}:`, error);
        }
        delete transports[sessionId];
      }
      delete sessionMetadata[sessionId];
    });
    
    if (staleSessionIds.length > 0) {
      console.log(`Cleaned up ${staleSessionIds.length} stale sessions. Active sessions: ${Object.keys(transports).length}`);
    }
  }, 5 * 60 * 1000); // Run every 5 minutes

  // Helper function to create a new session
  const createNewSession = async (): Promise<StreamableHTTPServerTransport> => {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      enableJsonResponse: true,
      onsessioninitialized: (sid: string) => {
        transports[sid] = transport;
        sessionMetadata[sid] = {
          created: new Date(),
          lastUsed: new Date(),
          requestCount: 0
        };
        console.log(`New session created: ${sid} (total active: ${Object.keys(transports).length})`);
      },
    });
    
    transport.onclose = () => {
      const sid = transport.sessionId;
      if (sid && transports[sid]) {
        delete transports[sid];
        delete sessionMetadata[sid];
        console.log(`Session closed: ${sid} (remaining active: ${Object.keys(transports).length})`);
      }
    };
    
    const server = createMcpServer();
    await server.connect(transport);
    return transport;
  };
  
  // Helper function to update session activity
  const updateSessionActivity = (sessionId: string) => {
    if (sessionMetadata[sessionId]) {
      sessionMetadata[sessionId].lastUsed = new Date();
      sessionMetadata[sessionId].requestCount++;
    }
  };

  // Streamable HTTP endpoint with robust session handling
  const mcpHandler = async (req: express.Request, res: express.Response) => {
    try {
      const existingSessionIdHeader = req.headers["mcp-session-id"] as string | undefined;
      const requestId = req.body?.id || null;
      const method = req.body?.method || "unknown";
      
      console.log(`MCP Request: ${method} (session: ${existingSessionIdHeader || 'none'}, id: ${requestId})`);
      
      let transport: StreamableHTTPServerTransport | undefined;

      // Case 1: Client provided session ID - try to use existing session
      if (existingSessionIdHeader) {
        const existing = transports[existingSessionIdHeader];
        if (existing && existing instanceof StreamableHTTPServerTransport) {
          transport = existing;
          updateSessionActivity(existingSessionIdHeader);
          console.log(`Using existing session: ${existingSessionIdHeader}`);
        } else if (existing) {
          // Session exists but wrong transport type
          res.status(400).json({
            jsonrpc: "2.0",
            error: { 
              code: -32000, 
              message: "Bad Request: Session exists but uses a different transport protocol",
              data: { sessionId: existingSessionIdHeader }
            },
            id: requestId,
          });
          return;
        } else {
          // Session ID provided but doesn't exist - could be expired or invalid
          console.log(`Session ${existingSessionIdHeader} not found, creating new session`);
          transport = await createNewSession();
          
          // Return error for non-initialize requests with invalid session
          if (!isInitializeRequest(req.body)) {
            // Include new session ID in response headers BEFORE sending JSON
            res.setHeader("Mcp-Session-Id", transport.sessionId || "");
            res.status(400).json({
              jsonrpc: "2.0",
              error: { 
                code: -32001, 
                message: "Session expired or invalid. Please initialize a new session.",
                data: { 
                  expiredSessionId: existingSessionIdHeader,
                  newSessionId: transport.sessionId,
                  action: "Please retry your request with the new session ID"
                }
              },
              id: requestId,
            });
            return;
          }
        }
      }
      
      // Case 2: No session ID provided
      if (!transport) {
        if (req.method === "POST" && isInitializeRequest(req.body)) {
          // Initialize request without session - create new session
          console.log("Creating new session for initialize request");
          transport = await createNewSession();
        } else if (req.method === "POST") {
          // Non-initialize request without session - try to auto-recover
          console.log(`Auto-creating session for ${method} request`);
          transport = await createNewSession();
          
          // For some clients, we might want to return an error instead of auto-creating
          // Uncomment this block if auto-creation causes issues:
          /*
          res.status(400).json({
            jsonrpc: "2.0",
            error: { 
              code: -32002, 
              message: "No session provided. Please initialize a session first.",
              data: { 
                method: method,
                action: "Send an initialize request first, then use the returned session ID"
              }
            },
            id: requestId,
          });
          return;
          */
        } else {
          // GET/DELETE without session
          res.status(400).json({
            jsonrpc: "2.0",
            error: { 
              code: -32003, 
              message: "Session required for this request method",
              data: { method: req.method }
            },
            id: requestId,
          });
          return;
        }
      }

      // Case 3: Handle the request with the transport
      if (transport) {
        console.log(`Processing request with session: ${transport.sessionId}`);
        await transport.handleRequest(req as any, res as any, req.body);
      } else {
        // This shouldn't happen, but just in case
        res.status(500).json({
          jsonrpc: "2.0",
          error: { code: -32603, message: "Failed to create or find session transport" },
          id: requestId,
        });
      }
      
    } catch (error) {
      console.error("Error handling MCP request:", error);
      const requestId = req.body?.id || null;
      
      if (!res.headersSent) {
        // Provide more detailed error information
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        res.status(500).json({
          jsonrpc: "2.0",
          error: { 
            code: -32603, 
            message: "Internal server error",
            data: { 
              error: errorMessage,
              method: req.body?.method || "unknown",
              sessionId: req.headers["mcp-session-id"] || null
            }
          },
          id: requestId,
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
    const transport = new SSEServerTransport("/messages", res);
    transports[transport.sessionId] = transport;
    res.on("close", () => {
      delete transports[transport.sessionId];
    });
    const server = createMcpServer();
    await server.connect(transport);
  });

  app.post("/messages", ...(authMiddleware ? [authMiddleware] : []), async (req, res) => {
    const sessionId = (req.query.sessionId as string) || "";
    const transport = transports[sessionId];
    if (!transport || !(transport instanceof SSEServerTransport)) {
      res.status(400).json({
        jsonrpc: "2.0",
        error: { code: -32000, message: "Bad Request: No SSE transport found for sessionId" },
        id: null,
      });
      return;
    }
    await transport.handlePostMessage(req as any, res as any, (req as any).body);
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
} else {
  startStdio();
}
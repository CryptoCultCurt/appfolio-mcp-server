#!/usr/bin/env node
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/index.ts
var import_dotenv9 = __toESM(require("dotenv"));
var import_express = __toESM(require("express"));
var import_cors = __toESM(require("cors"));
var import_node_crypto = require("node:crypto");
var import_node_net = __toESM(require("node:net"));
var import_mcp = require("@modelcontextprotocol/sdk/server/mcp.js");
var import_stdio = require("@modelcontextprotocol/sdk/server/stdio.js");
var import_streamableHttp = require("@modelcontextprotocol/sdk/server/streamableHttp.js");
var import_sse = require("@modelcontextprotocol/sdk/server/sse.js");
var import_router = require("@modelcontextprotocol/sdk/server/auth/router.js");
var import_types = require("@modelcontextprotocol/sdk/types.js");
var import_jose = require("jose");
var import_errors = require("@modelcontextprotocol/sdk/server/auth/errors.js");

// src/reports/cashflowReport.ts
var import_zod47 = require("zod");

// src/appfolio.ts
var import_dotenv8 = __toESM(require("dotenv"));
var import_bottleneck = __toESM(require("bottleneck"));
var import_axios = __toESM(require("axios"));

// src/reports/accountTotalsReport.ts
var import_zod2 = require("zod");

// src/reports/sharedSchemas.ts
var import_zod = require("zod");
var flatPropertyFilterSchema = {
  properties_ids: import_zod.z.array(import_zod.z.string()).optional().describe("Filter by specific property IDs"),
  property_groups_ids: import_zod.z.array(import_zod.z.string()).optional().describe("Filter by property group IDs"),
  portfolios_ids: import_zod.z.array(import_zod.z.string()).optional().describe("Filter by portfolio IDs"),
  owners_ids: import_zod.z.array(import_zod.z.string()).optional().describe("Filter by owner IDs")
};
function transformToNestedProperties(input) {
  const { properties_ids, property_groups_ids, portfolios_ids, owners_ids, ...rest } = input;
  const hasProperties = properties_ids || property_groups_ids || portfolios_ids || owners_ids;
  return {
    ...rest,
    ...hasProperties && {
      properties: {
        ...properties_ids && { properties_ids },
        ...property_groups_ids && { property_groups_ids },
        ...portfolios_ids && { portfolios_ids },
        ...owners_ids && { owners_ids }
      }
    }
  };
}
var propertyVisibilitySchema = import_zod.z.enum(["active", "hidden", "all"]).default("active").optional().describe('Filter properties by status. Defaults to "active"');
var dateSchema = import_zod.z.string().describe("Date in YYYY-MM-DD format");
var monthSchema = import_zod.z.string().regex(/^\d{4}-\d{2}$/, "Date must be in YYYY-MM format").describe("Date in YYYY-MM format");
var levelOfDetailSchema = import_zod.z.enum(["detail_view", "summary_view"]).default("detail_view").optional().describe('Level of detail. Defaults to "detail_view"');
var includeZeroBalanceSchema = import_zod.z.enum(["0", "1"]).default("0").optional().describe('Include GL accounts with zero balance. Defaults to "0"');
var columnsSchema = import_zod.z.array(import_zod.z.string()).optional().describe("Array of specific columns to include in the report");
var glAccountMapIdSchema = import_zod.z.string().optional().describe("Filter by GL account map ID");

// src/reports/accountTotalsReport.ts
async function getAccountTotalsReport(args) {
  const payload = { ...args };
  if (args.gl_account_ids === void 0) {
    payload.gl_account_ids = "1";
  }
  return makeAppfolioApiCall("account_totals.json", payload);
}
var accountTotalsToolSchema = {
  property_visibility: import_zod2.z.string().describe("Property visibility filter"),
  ...flatPropertyFilterSchema,
  gl_account_ids: import_zod2.z.string().default("1").describe("GL account IDs"),
  posted_on_from: import_zod2.z.string().describe("Start date (YYYY-MM-DD)"),
  posted_on_to: import_zod2.z.string().describe("End date (YYYY-MM-DD)"),
  columns: import_zod2.z.array(import_zod2.z.string()).optional().describe("Specific columns to include")
};
var accountTotalsValidationSchema = import_zod2.z.object({
  property_visibility: import_zod2.z.string(),
  properties_ids: import_zod2.z.array(import_zod2.z.string()).optional(),
  property_groups_ids: import_zod2.z.array(import_zod2.z.string()).optional(),
  portfolios_ids: import_zod2.z.array(import_zod2.z.string()).optional(),
  owners_ids: import_zod2.z.array(import_zod2.z.string()).optional(),
  gl_account_ids: import_zod2.z.string().default("1"),
  posted_on_from: import_zod2.z.string(),
  posted_on_to: import_zod2.z.string(),
  columns: import_zod2.z.array(import_zod2.z.string()).optional()
});
function registerAccountTotalsReportTool(server) {
  server.tool(
    "get_account_totals_report",
    "Returns account totals for given filters and date range.",
    accountTotalsToolSchema,
    async (args, _extra) => {
      try {
        const parseResult = accountTotalsValidationSchema.safeParse(args);
        if (!parseResult.success) {
          const errorMessages = parseResult.error.errors.map(
            (err) => `${err.path.join(".")}: ${err.message}`
          ).join("; ");
          throw new Error(`Invalid arguments: ${errorMessages}`);
        }
        const apiArgs = transformToNestedProperties(parseResult.data);
        const result = await getAccountTotalsReport(apiArgs);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
              mimeType: "application/json"
            }
          ]
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Account Totals Report Error:`, errorMessage);
        throw error;
      }
    }
  );
}

// src/reports/agedPayablesSummaryReport.ts
var import_zod3 = require("zod");

// src/validation.ts
function validateNumericIds(ids, fieldName, entityType) {
  if (!ids) return [];
  const errors = [];
  for (const id of ids) {
    if (!/^\d+$/.test(id)) {
      errors.push({
        field: fieldName,
        value: id,
        message: `Invalid ${fieldName}: "${id}". ${entityType} IDs must be numeric strings (e.g. "123"), not ${entityType.toLowerCase()} names.`
      });
    }
  }
  return errors;
}
function validatePropertiesIds(properties) {
  if (!properties) return [];
  const errors = [];
  errors.push(...validateNumericIds(properties.owners_ids, "owner_id", "Owner"));
  errors.push(...validateNumericIds(properties.properties_ids, "property_id", "Property"));
  errors.push(...validateNumericIds(properties.property_groups_ids, "property_group_id", "Property Group"));
  errors.push(...validateNumericIds(properties.portfolios_ids, "portfolio_id", "Portfolio"));
  return errors;
}
function validateWorkflowIds(args) {
  const errors = [];
  errors.push(...validateNumericIds(args.properties_ids, "property_id", "Property"));
  errors.push(...validateNumericIds(args.units_ids, "unit_id", "Unit"));
  errors.push(...validateNumericIds(args.tenants_ids, "tenant_id", "Tenant"));
  errors.push(...validateNumericIds(args.owners_ids, "owner_id", "Owner"));
  errors.push(...validateNumericIds(args.rental_applications_ids, "rental_application_id", "Rental Application"));
  errors.push(...validateNumericIds(args.guest_cards_ids, "guest_card_id", "Guest Card"));
  errors.push(...validateNumericIds(args.guest_card_interests_ids, "guest_card_interest_id", "Guest Card Interest"));
  errors.push(...validateNumericIds(args.service_requests_ids, "service_request_id", "Service Request"));
  errors.push(...validateNumericIds(args.vendors_ids, "vendor_id", "Vendor"));
  errors.push(...validateNumericIds(args.property_groups_ids, "property_group_id", "Property Group"));
  errors.push(...validateNumericIds(args.portfolios_ids, "portfolio_id", "Portfolio"));
  return errors;
}
function throwOnValidationErrors(errors) {
  if (errors.length === 0) return;
  const errorMessages = errors.map((e) => e.message);
  const suggestion = "\n\nTip: Use directory reports (Owner Directory, Property Directory, Unit Directory, etc.) to lookup IDs by name first.";
  throw new Error(errorMessages.join("\n") + suggestion);
}
function getIdFieldDescription(fieldName, entityType, relatedReport) {
  const baseDesc = `Array of ${entityType} IDs (numeric strings, NOT ${entityType.toLowerCase()} names)`;
  const lookupHint = relatedReport ? ` Use ${relatedReport} to lookup ${entityType.toLowerCase()} IDs by name first if needed.` : "";
  return baseDesc + lookupHint;
}

// src/reports/agedPayablesSummaryReport.ts
var agedPayablesSummaryToolSchema = {
  property_visibility: import_zod3.z.string().default("active").describe("Filter properties by status"),
  ...flatPropertyFilterSchema,
  occurred_on: import_zod3.z.string().describe("As-of date (YYYY-MM-DD)"),
  party_company_id: import_zod3.z.string().optional().describe("Filter by company ID"),
  balance_amount: import_zod3.z.string().optional().describe("Balance amount to compare against"),
  balance_comparator: import_zod3.z.string().optional().describe('Comparison operator (e.g. "gt", "lt")'),
  columns: import_zod3.z.array(import_zod3.z.string()).optional().describe("Specific columns to include")
};
var agedPayablesSummaryValidationSchema = import_zod3.z.object({
  property_visibility: import_zod3.z.string().default("active"),
  properties_ids: import_zod3.z.array(import_zod3.z.string()).optional(),
  property_groups_ids: import_zod3.z.array(import_zod3.z.string()).optional(),
  portfolios_ids: import_zod3.z.array(import_zod3.z.string()).optional(),
  owners_ids: import_zod3.z.array(import_zod3.z.string()).optional(),
  occurred_on: import_zod3.z.string(),
  party_company_id: import_zod3.z.string().optional(),
  balance_amount: import_zod3.z.string().optional(),
  balance_comparator: import_zod3.z.string().optional(),
  columns: import_zod3.z.array(import_zod3.z.string()).optional()
});
function transformToApiArgs(input) {
  const { party_company_id, balance_amount, balance_comparator, ...rest } = input;
  const baseArgs = transformToNestedProperties(rest);
  return {
    ...baseArgs,
    ...party_company_id && { party_contact_info: { company_id: party_company_id } },
    ...(balance_amount || balance_comparator) && {
      balance_operator: {
        ...balance_amount && { amount: balance_amount },
        ...balance_comparator && { comparator: balance_comparator }
      }
    }
  };
}
async function getAgedPayablesSummaryReport(args) {
  if (!args.occurred_on) {
    throw new Error("Missing required argument: occurred_on (format YYYY-MM-DD)");
  }
  if (args.properties) {
    const validationErrors = validatePropertiesIds(args.properties);
    throwOnValidationErrors(validationErrors);
  }
  const { property_visibility = "active", ...rest } = args;
  const payload = { property_visibility, ...rest };
  return makeAppfolioApiCall("aged_payables_summary.json", payload);
}
function registerAgedPayablesSummaryReportTool(server) {
  server.tool(
    "get_aged_payables_summary_report",
    "Returns aged payables summary for the given filters. IMPORTANT: All ID parameters must be numeric strings (e.g. '123'), NOT names.",
    agedPayablesSummaryToolSchema,
    async (args, _extra) => {
      try {
        const parseResult = agedPayablesSummaryValidationSchema.safeParse(args);
        if (!parseResult.success) {
          const errorMessages = parseResult.error.errors.map(
            (err) => `${err.path.join(".")}: ${err.message}`
          ).join("; ");
          throw new Error(`Invalid arguments: ${errorMessages}`);
        }
        const apiArgs = transformToApiArgs(parseResult.data);
        const data = await getAgedPayablesSummaryReport(apiArgs);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(data),
              mimeType: "application/json"
            }
          ]
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Aged Payables Summary Report Error:`, errorMessage);
        throw error;
      }
    }
  );
}

// src/reports/rentRollItemizedReport.ts
var import_zod4 = require("zod");
var import_dotenv = __toESM(require("dotenv"));
import_dotenv.default.config();
var RENT_ROLL_ITEMIZED_COLUMNS = [
  "property",
  "property_name",
  "property_id",
  "property_address",
  "property_street",
  "property_street2",
  "property_city",
  "property_state",
  "property_zip",
  "property_type",
  "occupancy_id",
  "unit_id",
  "unit",
  "unit_tags",
  "unit_type",
  "bd_ba",
  "tenant",
  "status",
  "sqft",
  "market_rent",
  "computed_market_rent",
  "advertised_rent",
  "total",
  "other_charges",
  "monthly_rent_square_ft",
  "annual_rent_square_ft",
  "deposit",
  "lease_from",
  "lease_to",
  "last_rent_increase",
  "next_rent_adjustment",
  "next_rent_increase_amount",
  "next_rent_increase",
  "move_in",
  "move_out",
  "past_due",
  "nsf",
  "late",
  "amenities",
  "additional_tenants",
  "monthly_charges",
  "rent_ready",
  "rent_status",
  "legal_rent",
  "preferential_rent",
  "tenant_tags",
  "tenant_agent",
  "property_group_id",
  "portfolio_id"
];
var validateGlAccountIds = (glAccountIds) => {
  const errors = [];
  for (const id of glAccountIds) {
    if (/^\d{4}$/.test(id)) {
      errors.push(`GL account ID "${id}" appears to be a GL account number, not an ID. GL account IDs are internal database IDs (e.g. "123", "456"). Use the Chart of Accounts Report to lookup the correct gl_account_id for GL account number "${id}".`);
    } else if (!/^\d+$/.test(id)) {
      errors.push(`GL account ID "${id}" must be a numeric string (e.g. "123"). Use the Chart of Accounts Report to lookup gl_account_ids by GL account number or name.`);
    }
  }
  return errors;
};
var rentRollItemizedInputSchema = import_zod4.z.object({
  properties: import_zod4.z.object({
    properties_ids: import_zod4.z.array(import_zod4.z.string()).optional().describe(getIdFieldDescription("property", "Property Directory Report")),
    property_groups_ids: import_zod4.z.array(import_zod4.z.string()).optional().describe(getIdFieldDescription("property group", "Property Group Directory Report")),
    portfolios_ids: import_zod4.z.array(import_zod4.z.string()).optional().describe(getIdFieldDescription("portfolio", "Portfolio Directory Report")),
    owners_ids: import_zod4.z.array(import_zod4.z.string()).optional().describe(getIdFieldDescription("owner", "Owner Directory Report"))
  }).optional(),
  unit_visibility: import_zod4.z.enum(["active", "hidden", "all"]).default("active").describe('Filter units by status. Defaults to "active".'),
  tags: import_zod4.z.string().optional().describe("Tags filter"),
  gl_account_ids: import_zod4.z.union([
    import_zod4.z.array(import_zod4.z.string()),
    import_zod4.z.string().transform((str) => {
      try {
        const parsed = JSON.parse(str);
        return Array.isArray(parsed) ? parsed : [str];
      } catch {
        return [str];
      }
    })
  ]).optional().describe('Array of GL account IDs (internal database IDs, NOT GL account numbers). These are numeric strings like "123", "456". Do NOT use GL account numbers like "4630", "4635". Use the Chart of Accounts Report to lookup gl_account_ids by GL account number or name.'),
  as_of_date: import_zod4.z.string().describe("Report date in YYYY-MM-DD format"),
  columns: import_zod4.z.array(import_zod4.z.enum(RENT_ROLL_ITEMIZED_COLUMNS)).optional().describe(`Array of specific columns to include in the report. Valid columns: ${RENT_ROLL_ITEMIZED_COLUMNS.join(", ")}. If not specified, all columns are returned.`)
});
async function getRentRollItemizedReport(args) {
  if (args.properties) {
    const validationErrors = validatePropertiesIds(args.properties);
    throwOnValidationErrors(validationErrors);
  }
  if (args.gl_account_ids && args.gl_account_ids.length > 0) {
    const glAccountErrors = validateGlAccountIds(args.gl_account_ids);
    if (glAccountErrors.length > 0) {
      throw new Error(`Invalid GL account IDs: ${glAccountErrors.join(" ")}`);
    }
  }
  if (!args.as_of_date) {
    throw new Error("Missing required argument: as_of_date (format YYYY-MM-DD)");
  }
  const { unit_visibility = "active", ...rest } = args;
  const payload = { unit_visibility, ...rest };
  return makeAppfolioApiCall("rent_roll_itemized.json", payload);
}
function registerRentRollItemizedReportTool(server) {
  server.tool(
    "get_rent_roll_itemized_report",
    "Returns rent roll itemized report for the given filters. IMPORTANT: All ID parameters (properties_ids, property_groups_ids, portfolios_ids, owners_ids, gl_account_ids) must be numeric strings (e.g. '123'), NOT names. CRITICAL: gl_account_ids are internal database IDs, NOT GL account numbers! Do not use GL account numbers like '4630', '4635' - use the Chart of Accounts Report first to lookup the correct gl_account_ids.",
    rentRollItemizedInputSchema.shape,
    async (args, _extra) => {
      try {
        console.log("Rent Roll Itemized Report - Received args:", JSON.stringify(args, null, 2));
        if (args.gl_account_ids) {
          console.log("GL Account IDs type:", typeof args.gl_account_ids);
          console.log("GL Account IDs value:", args.gl_account_ids);
          console.log("GL Account IDs is array:", Array.isArray(args.gl_account_ids));
        }
        const parseResult = rentRollItemizedInputSchema.safeParse(args);
        if (!parseResult.success) {
          const errorMessages = parseResult.error.errors.map(
            (err) => `${err.path.join(".")}: ${err.message}`
          ).join("; ");
          console.error("Rent Roll Itemized Report - Schema validation failed:", errorMessages);
          throw new Error(`Invalid arguments: ${errorMessages}`);
        }
        console.log("Rent Roll Itemized Report - Schema validation passed, calling function");
        const result = await getRentRollItemizedReport(parseResult.data);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
              mimeType: "application/json"
            }
          ]
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Rent Roll Itemized Report Error:`, errorMessage);
        throw error;
      }
    }
  );
}

// src/reports/guestCardInquiriesReport.ts
var import_zod5 = require("zod");
var import_dotenv2 = __toESM(require("dotenv"));
import_dotenv2.default.config();
var GUEST_CARD_INQUIRIES_COLUMNS = [
  "name",
  "email_address",
  "phone_number",
  "received",
  "last_activity_date",
  "last_activity_type",
  "latest_interest_date",
  "latest_interest_source",
  "status",
  "move_in_preference",
  "max_rent",
  "bed_bath_preference",
  "pet_preference",
  "monthly_income",
  "credit_score",
  "lead_type",
  "source",
  "property",
  "unit",
  "assigned_user",
  "assigned_user_id",
  "guest_card_id",
  "guest_card_uuid",
  "inquiry_id",
  "occupancy_id",
  "property_id",
  "unit_id",
  "notes",
  "tenant_id",
  "rental_application_id",
  "rental_application_group_id",
  "applicants",
  "inquiry_type",
  "total_interests_received",
  "interests_received_in_range",
  "showings",
  "interest_to_showing_scheduled",
  "showing_to_application_received",
  "application_received_to_decision",
  "application_submission_to_lease_signed",
  "inquiry_to_lease_signed",
  "inactive_reason",
  "crm"
];
var guestCardInquiriesInputSchema = import_zod5.z.object({
  property_visibility: import_zod5.z.enum(["active", "inactive", "all"]).default("active").describe('Filter properties by visibility status. Defaults to "active"'),
  properties: import_zod5.z.object({
    properties_ids: import_zod5.z.array(import_zod5.z.string()).optional().describe(getIdFieldDescription("property", "Property Directory Report")),
    property_groups_ids: import_zod5.z.array(import_zod5.z.string()).optional().describe(getIdFieldDescription("property group", "Property Group Directory Report")),
    portfolios_ids: import_zod5.z.array(import_zod5.z.string()).optional().describe(getIdFieldDescription("portfolio", "Portfolio Directory Report")),
    owners_ids: import_zod5.z.array(import_zod5.z.string()).optional().describe(getIdFieldDescription("owner", "Owner Directory Report"))
  }).optional().describe("Filter results based on properties, groups, portfolios, or owners"),
  guest_card_sources: import_zod5.z.array(import_zod5.z.string()).default(["all"]).describe('Filter by guest card sources. Defaults to ["all"]'),
  guest_card_statuses: import_zod5.z.array(import_zod5.z.string()).default(["all"]).describe('Filter by guest card statuses. Defaults to ["all"]'),
  guest_card_lead_types: import_zod5.z.array(import_zod5.z.string()).default(["all"]).describe('Filter by guest card lead types. Defaults to ["all"]'),
  assigned_user: import_zod5.z.string().default("All").describe('Filter by assigned user. Defaults to "All"'),
  assigned_user_visibility: import_zod5.z.enum(["active", "inactive", "all"]).default("active").describe('Filter assigned users by visibility. Defaults to "active"'),
  guest_card_status: import_zod5.z.string().default("open").describe('Filter by guest card status. Defaults to "open"'),
  filter_date_range_by: import_zod5.z.enum(["received_on", "inquiry"]).default("inquiry").describe('Which date field to use for filtering. Defaults to "inquiry"'),
  received_on_from: import_zod5.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe("Start date for the reporting period (YYYY-MM-DD). Required."),
  received_on_to: import_zod5.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe("End date for the reporting period (YYYY-MM-DD). Required."),
  columns: import_zod5.z.array(import_zod5.z.enum(GUEST_CARD_INQUIRIES_COLUMNS)).optional().describe(`Array of specific columns to include in the report. Valid columns: ${GUEST_CARD_INQUIRIES_COLUMNS.join(", ")}. If not specified, all columns are returned.`)
});
async function getGuestCardInquiriesReport(args) {
  if (args.properties) {
    const validationErrors = validatePropertiesIds(args.properties);
    throwOnValidationErrors(validationErrors);
  }
  if (!args.received_on_from || !args.received_on_to) {
    throw new Error("Missing required arguments: received_on_from and received_on_to (format YYYY-MM-DD)");
  }
  const { guest_card_status = "open", property_visibility = "active", filter_date_range_by = "inquiry", ...rest } = args;
  const payload = { guest_card_status, property_visibility, filter_date_range_by, ...rest };
  return makeAppfolioApiCall("guest_card_inquiries.json", payload);
}
function registerGuestCardInquiriesReportTool(server) {
  server.tool(
    "get_guest_card_inquiries_report",
    "Returns guest card inquiries report for the given filters. IMPORTANT: All ID parameters (properties_ids, property_groups_ids, portfolios_ids, owners_ids) must be numeric strings (e.g. '123'), NOT names. Use respective directory reports first to lookup IDs by name if needed.",
    guestCardInquiriesInputSchema.shape,
    async (args, _extra) => {
      try {
        const parseResult = guestCardInquiriesInputSchema.safeParse(args);
        if (!parseResult.success) {
          const errorMessages = parseResult.error.errors.map(
            (err) => `${err.path.join(".")}: ${err.message}`
          ).join("; ");
          throw new Error(`Invalid arguments: ${errorMessages}`);
        }
        const result = await getGuestCardInquiriesReport(parseResult.data);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
              mimeType: "application/json"
            }
          ]
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Guest Card Inquiries Report Error:`, errorMessage);
        throw error;
      }
    }
  );
}

// src/reports/leasingFunnelPerformanceReport.ts
var import_zod6 = require("zod");
var leasingFunnelPerformanceInputSchema = import_zod6.z.object({
  property_visibility: import_zod6.z.string().default("all"),
  properties: import_zod6.z.object({
    properties_ids: import_zod6.z.array(import_zod6.z.string()).optional().describe(getIdFieldDescription("properties_ids", "Property", "Property Directory Report")),
    property_groups_ids: import_zod6.z.array(import_zod6.z.string()).optional().describe(getIdFieldDescription("property_groups_ids", "Property Group")),
    portfolios_ids: import_zod6.z.array(import_zod6.z.string()).optional().describe(getIdFieldDescription("portfolios_ids", "Portfolio")),
    owners_ids: import_zod6.z.array(import_zod6.z.string()).optional().describe(getIdFieldDescription("owners_ids", "Owner", "Owner Directory Report"))
  }).optional().describe("Filter results based on properties, groups, portfolios, or owners. All ID fields must be numeric strings, not names."),
  date_from: import_zod6.z.string(),
  date_to: import_zod6.z.string(),
  assigned_user_visibility: import_zod6.z.string().default("active"),
  assigned_user: import_zod6.z.string().default("All"),
  columns: import_zod6.z.array(import_zod6.z.string()).optional()
});
async function getLeasingFunnelPerformanceReport(args) {
  if (!args.date_from || !args.date_to) {
    throw new Error("Missing required arguments: date_from and date_to (format YYYY-MM-DD)");
  }
  if (args.properties) {
    const validationErrors = validatePropertiesIds(args.properties);
    throwOnValidationErrors(validationErrors);
  }
  const { property_visibility = "active", ...rest } = args;
  const payload = { property_visibility, ...rest };
  return makeAppfolioApiCall("leasing_funnel_performance.json", payload);
}
function registerLeasingFunnelPerformanceReportTool(server) {
  server.tool(
    "get_leasing_funnel_performance_report",
    "Returns leasing funnel performance report for the given filters. IMPORTANT: All ID parameters (owners_ids, properties_ids, etc.) must be numeric strings (e.g. '123'), NOT names. Use respective directory reports first to lookup IDs by name if needed.",
    leasingFunnelPerformanceInputSchema.shape,
    async (args, _extra) => {
      try {
        const parseResult = leasingFunnelPerformanceInputSchema.safeParse(args);
        if (!parseResult.success) {
          const errorMessages = parseResult.error.errors.map(
            (err) => `${err.path.join(".")}: ${err.message}`
          ).join("; ");
          throw new Error(`Invalid arguments: ${errorMessages}`);
        }
        const result = await getLeasingFunnelPerformanceReport(parseResult.data);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
              mimeType: "application/json"
            }
          ]
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Leasing Funnel Performance Report Error:`, errorMessage);
        throw error;
      }
    }
  );
}

// src/reports/annualBudgetComparativeReport.ts
var import_zod7 = require("zod");
var annualBudgetComparativeToolSchema = {
  property_visibility: import_zod7.z.string().optional().default("active").describe('Filter properties by status. Defaults to "active"'),
  ...flatPropertyFilterSchema,
  occurred_on_to: import_zod7.z.string().describe("The end date for the report period (YYYY-MM-DD)"),
  additional_account_types: import_zod7.z.array(import_zod7.z.string()).optional().default([]).describe("Array of additional account types to include"),
  gl_account_map_id: import_zod7.z.string().optional().describe("Filter by GL account map ID"),
  level_of_detail: import_zod7.z.enum(["detail_view", "summary_view"]).optional().default("detail_view").describe('Specify the level of detail. Defaults to "detail_view"'),
  columns: import_zod7.z.array(import_zod7.z.string()).optional().describe("Array of specific columns to include"),
  periods: import_zod7.z.any().describe("Periods")
};
var annualBudgetComparativeValidationSchema = import_zod7.z.object({
  property_visibility: import_zod7.z.string().optional().default("active"),
  properties_ids: import_zod7.z.array(import_zod7.z.string()).optional(),
  property_groups_ids: import_zod7.z.array(import_zod7.z.string()).optional(),
  portfolios_ids: import_zod7.z.array(import_zod7.z.string()).optional(),
  owners_ids: import_zod7.z.array(import_zod7.z.string()).optional(),
  occurred_on_to: import_zod7.z.string(),
  additional_account_types: import_zod7.z.array(import_zod7.z.string()).optional().default([]),
  gl_account_map_id: import_zod7.z.string().optional(),
  level_of_detail: import_zod7.z.enum(["detail_view", "summary_view"]).optional().default("detail_view"),
  columns: import_zod7.z.array(import_zod7.z.string()).optional(),
  periods: import_zod7.z.any()
});
async function getAnnualBudgetComparativeReport(args) {
  if (!args.periods) {
    throw new Error("Missing required argument: periods");
  }
  const { property_visibility = "active", ...rest } = args;
  const payload = { property_visibility, ...rest };
  return makeAppfolioApiCall("annual_budget_comparative.json", payload);
}
function registerAnnualBudgetComparativeReportTool(server) {
  server.tool(
    "get_annual_budget_comparative_report",
    "Returns annual budget comparative report for the given filters.",
    annualBudgetComparativeToolSchema,
    async (args, _extra) => {
      try {
        const parseResult = annualBudgetComparativeValidationSchema.safeParse(args);
        if (!parseResult.success) {
          const errorMessages = parseResult.error.errors.map(
            (err) => `${err.path.join(".")}: ${err.message}`
          ).join("; ");
          throw new Error(`Invalid arguments: ${errorMessages}`);
        }
        const apiArgs = transformToNestedProperties(parseResult.data);
        const result = await getAnnualBudgetComparativeReport(apiArgs);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
              mimeType: "application/json"
            }
          ]
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Annual Budget Comparative Report Error:`, errorMessage);
        throw error;
      }
    }
  );
}

// src/reports/annualBudgetForecastReport.ts
var import_zod8 = require("zod");
var annualBudgetForecastToolSchema = {
  property_visibility: import_zod8.z.enum(["active", "hidden", "all"]).optional().default("active").describe('Filter properties by status. Defaults to "active"'),
  ...flatPropertyFilterSchema,
  period_from: import_zod8.z.string().describe("Start period for the forecast (YYYY-MM). Required."),
  period_to: import_zod8.z.string().describe("End period for the forecast (YYYY-MM). Required."),
  consolidate: import_zod8.z.enum(["0", "1"]).optional().default("0").describe("Consolidate results"),
  gl_account_map_id: import_zod8.z.string().optional().describe("Filter by GL account map ID"),
  columns: import_zod8.z.array(import_zod8.z.string()).optional().describe("Specific columns to include")
};
var annualBudgetForecastValidationSchema = import_zod8.z.object({
  property_visibility: import_zod8.z.enum(["active", "hidden", "all"]).optional().default("active"),
  properties_ids: import_zod8.z.array(import_zod8.z.string()).optional(),
  property_groups_ids: import_zod8.z.array(import_zod8.z.string()).optional(),
  portfolios_ids: import_zod8.z.array(import_zod8.z.string()).optional(),
  owners_ids: import_zod8.z.array(import_zod8.z.string()).optional(),
  period_from: import_zod8.z.string(),
  period_to: import_zod8.z.string(),
  consolidate: import_zod8.z.enum(["0", "1"]).optional().default("0"),
  gl_account_map_id: import_zod8.z.string().optional(),
  columns: import_zod8.z.array(import_zod8.z.string()).optional()
});
async function getAnnualBudgetForecastReport(args) {
  if (!args.period_from || !args.period_to) {
    throw new Error("Missing required arguments: period_from and period_to (format YYYY-MM)");
  }
  const { property_visibility = "active", ...rest } = args;
  const payload = { property_visibility, ...rest };
  return makeAppfolioApiCall("annual_budget_forecast.json", payload);
}
function registerAnnualBudgetForecastReportTool(server) {
  server.tool(
    "get_annual_budget_forecast_report",
    "Returns annual budget forecast report for the given filters.",
    annualBudgetForecastToolSchema,
    async (args, _extra) => {
      try {
        const parseResult = annualBudgetForecastValidationSchema.safeParse(args);
        if (!parseResult.success) {
          const errorMessages = parseResult.error.errors.map(
            (err) => `${err.path.join(".")}: ${err.message}`
          ).join("; ");
          throw new Error(`Invalid arguments: ${errorMessages}`);
        }
        const apiArgs = transformToNestedProperties(parseResult.data);
        const result = await getAnnualBudgetForecastReport(apiArgs);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
              mimeType: "application/json"
            }
          ]
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Annual Budget Forecast Report Error:`, errorMessage);
        throw error;
      }
    }
  );
}

// src/reports/delinquencyAsOfReport.ts
var import_zod9 = require("zod");
var delinquencyColumnsList = [
  "unit",
  "name",
  "tenant_status",
  "tags",
  "phone_numbers",
  "move_in",
  "move_out",
  "primary_tenant_email",
  "unit_type",
  "property",
  "property_name",
  "property_id",
  "property_address",
  "property_street",
  "property_street2",
  "property_city",
  "property_state",
  "property_zip",
  "amount_receivable",
  "delinquent_subsidy_amount",
  "00_to30",
  "30_plus",
  "30_to60",
  "60_plus",
  "60_to90",
  "90_plus",
  "this_month",
  "last_month",
  "month_before_last",
  "delinquent_rent",
  "delinquency_notes",
  "certified_funds_only",
  "in_collections",
  "collections_agency",
  "unit_id",
  "occupancy_id",
  "property_group_id"
];
var delinquencyAsOfBaseSchema = import_zod9.z.object({
  property_visibility: import_zod9.z.enum(["active", "hidden", "all"]).default("active").describe('Filter properties by status. Defaults to "active".'),
  properties: import_zod9.z.object({
    properties_ids: import_zod9.z.array(import_zod9.z.string()).optional().describe(getIdFieldDescription("properties_ids", "Property", "property directory report")),
    property_groups_ids: import_zod9.z.array(import_zod9.z.string()).optional().describe(getIdFieldDescription("property_groups_ids", "Property Group", "property group directory report")),
    portfolios_ids: import_zod9.z.array(import_zod9.z.string()).optional().describe(getIdFieldDescription("portfolios_ids", "Portfolio", "portfolio directory report")),
    owners_ids: import_zod9.z.array(import_zod9.z.string()).optional().describe(getIdFieldDescription("owners_ids", "Owner", "owner directory report"))
  }).optional().describe("Optional. Filter by specific property-related IDs."),
  occurred_on_to: import_zod9.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe("Required. Date to run the report as of in YYYY-MM-DD format."),
  delinquency_note_range: import_zod9.z.string().optional().describe("Optional. Filter by delinquency note range."),
  tenant_statuses: import_zod9.z.array(import_zod9.z.enum(["0", "1", "2", "3", "4"])).default(["0", "4"]).optional().describe('Filter by tenant status. Valid values: "0"=Current, "1"=Past, "2"=Future, "3"=Evict, "4"=Notice. Defaults to ["0", "4"] (Current and Notice tenants).'),
  tags: import_zod9.z.string().optional().describe("Optional. Filter by property tags."),
  amount_owed_in_account: import_zod9.z.string().default("all").optional().describe('Filter by amount owed in account. Defaults to "all".'),
  balance_operator: import_zod9.z.object({
    amount: import_zod9.z.string().optional().describe("Optional. Balance amount to compare against."),
    comparator: import_zod9.z.string().optional().describe("Optional. Comparison operator for balance amount.")
  }).optional().describe("Optional. Filter by balance amount with comparison operator."),
  columns: import_zod9.z.array(import_zod9.z.enum(delinquencyColumnsList)).optional().describe(`Array of specific columns to include in the report. Valid columns: ${delinquencyColumnsList.join(", ")}`)
});
var delinquencyAsOfInputSchema = delinquencyAsOfBaseSchema.superRefine((data, ctx) => {
  if (data.properties) {
    const validationErrors = validatePropertiesIds(data.properties);
    throwOnValidationErrors(validationErrors);
  }
});
async function getDelinquencyAsOfReport(args) {
  if (!args.occurred_on_to) {
    throw new Error("Missing required argument: occurred_on_to (format YYYY-MM-DD)");
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
    amount_owed_in_account
  };
  Object.entries(rest).forEach(([key, value]) => {
    if (value !== void 0 && value !== null && value !== "") {
      if (typeof value === "object" && !Array.isArray(value)) {
        const filteredObj = Object.fromEntries(
          Object.entries(value).filter(([_, v]) => v !== void 0 && v !== null && v !== "")
        );
        if (Object.keys(filteredObj).length > 0) {
          payload[key] = filteredObj;
        }
      } else {
        payload[key] = value;
      }
    }
  });
  return makeAppfolioApiCall("delinquency_as_of.json", payload);
}
function registerDelinquencyAsOfReportTool(server) {
  server.tool(
    "get_delinquency_as_of_report",
    "Returns delinquency as of report for the given filters. IMPORTANT: All ID parameters (properties_ids, etc.) must be numeric strings (e.g. '123'), NOT names. Use respective directory reports first to lookup IDs by name if needed. NOTE: tenant_statuses uses numeric codes: 0=Current, 1=Past, 2=Future, 3=Evict, 4=Notice.",
    delinquencyAsOfBaseSchema.shape,
    async (args, _extra) => {
      try {
        const parseResult = delinquencyAsOfInputSchema.safeParse(args);
        if (!parseResult.success) {
          const errorMessages = parseResult.error.errors.map(
            (err) => `${err.path.join(".")}: ${err.message}`
          ).join("; ");
          throw new Error(`Invalid arguments: ${errorMessages}`);
        }
        const result = await getDelinquencyAsOfReport(parseResult.data);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
              mimeType: "application/json"
            }
          ]
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Delinquency As Of Report Error:`, errorMessage);
        throw error;
      }
    }
  );
}

// src/reports/expenseDistributionReport.ts
var import_zod10 = require("zod");
async function getExpenseDistributionReport(args) {
  if (!args.posted_on_from || !args.posted_on_to) {
    throw new Error("Missing required arguments: posted_on_from and posted_on_to (format YYYY-MM-DD)");
  }
  const { property_visibility = "active", ...rest } = args;
  const payload = { property_visibility, ...rest };
  return makeAppfolioApiCall("expense_distribution.json", payload);
}
var expenseDistributionInputSchema = import_zod10.z.object({
  property_visibility: import_zod10.z.string().default("active").optional(),
  properties: import_zod10.z.object({
    properties_ids: import_zod10.z.array(import_zod10.z.string()).optional(),
    property_groups_ids: import_zod10.z.array(import_zod10.z.string()).optional(),
    portfolios_ids: import_zod10.z.array(import_zod10.z.string()).optional(),
    owners_ids: import_zod10.z.array(import_zod10.z.string()).optional()
  }).optional(),
  party_contact_info: import_zod10.z.object({
    company_id: import_zod10.z.string().optional()
  }).optional(),
  posted_on_from: import_zod10.z.string().describe("Required. Start date for posted_on range in YYYY-MM-DD format."),
  posted_on_to: import_zod10.z.string().describe("Required. End date for posted_on range in YYYY-MM-DD format."),
  gl_account_map_id: import_zod10.z.string().optional(),
  columns: import_zod10.z.array(import_zod10.z.string()).optional()
});
function registerExpenseDistributionReportTool(server) {
  server.tool(
    "get_expense_distribution_report",
    "Returns expense distribution report for the given filters.",
    expenseDistributionInputSchema.shape,
    async (args, _extra) => {
      try {
        const parseResult = expenseDistributionInputSchema.safeParse(args);
        if (!parseResult.success) {
          const errorMessages = parseResult.error.errors.map(
            (err) => `${err.path.join(".")}: ${err.message}`
          ).join("; ");
          throw new Error(`Invalid arguments: ${errorMessages}`);
        }
        const result = await getExpenseDistributionReport(parseResult.data);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
              mimeType: "application/json"
            }
          ]
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Expense Distribution Report Error:`, errorMessage);
        throw error;
      }
    }
  );
}

// src/reports/balanceSheetReport.ts
var import_zod11 = require("zod");
async function getBalanceSheetReport(args) {
  if (!args.posted_on_to) {
    throw new Error("posted_on_to is required");
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
  return makeAppfolioApiCall("balance_sheet.json", payload);
}
var balanceSheetToolSchema = {
  property_visibility: import_zod11.z.enum(["active", "hidden", "all"]).default("active").optional().describe('Filter properties by status. Defaults to "active"'),
  ...flatPropertyFilterSchema,
  posted_on_to: import_zod11.z.string().describe("Required. Date to run the report as of in YYYY-MM-DD format."),
  gl_account_map_id: import_zod11.z.string().optional().describe("Filter by GL account map ID"),
  level_of_detail: import_zod11.z.enum(["detail_view", "summary_view"]).default("detail_view").optional().describe('Level of detail. Defaults to "detail_view"'),
  include_zero_balance_gl_accounts: import_zod11.z.enum(["0", "1"]).default("0").optional().describe('Include GL accounts with zero balance. Defaults to "0"'),
  columns: import_zod11.z.array(import_zod11.z.string()).optional().describe("Specific columns to include")
};
var balanceSheetValidationSchema = import_zod11.z.object({
  property_visibility: import_zod11.z.enum(["active", "hidden", "all"]).default("active").optional(),
  properties_ids: import_zod11.z.array(import_zod11.z.string()).optional(),
  property_groups_ids: import_zod11.z.array(import_zod11.z.string()).optional(),
  portfolios_ids: import_zod11.z.array(import_zod11.z.string()).optional(),
  owners_ids: import_zod11.z.array(import_zod11.z.string()).optional(),
  posted_on_to: import_zod11.z.string(),
  gl_account_map_id: import_zod11.z.string().optional(),
  level_of_detail: import_zod11.z.enum(["detail_view", "summary_view"]).default("detail_view").optional(),
  include_zero_balance_gl_accounts: import_zod11.z.enum(["0", "1"]).default("0").optional(),
  columns: import_zod11.z.array(import_zod11.z.string()).optional()
});
function registerBalanceSheetReportTool(server) {
  server.tool(
    "get_balance_sheet_report",
    "Returns the balance sheet report for the given filters.",
    balanceSheetToolSchema,
    async (args, _extra) => {
      try {
        const parseResult = balanceSheetValidationSchema.safeParse(args);
        if (!parseResult.success) {
          const errorMessages = parseResult.error.errors.map(
            (err) => `${err.path.join(".")}: ${err.message}`
          ).join("; ");
          throw new Error(`Invalid arguments: ${errorMessages}`);
        }
        const apiArgs = transformToNestedProperties(parseResult.data);
        const result = await getBalanceSheetReport(apiArgs);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
              mimeType: "application/json"
            }
          ]
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Balance Sheet Report Error:`, errorMessage);
        throw error;
      }
    }
  );
}

// src/reports/agedReceivablesDetailReport.ts
var import_zod12 = require("zod");
var VALID_AGED_RECEIVABLES_COLUMNS = [
  "payer_name",
  "property",
  "property_name",
  "property_id",
  "property_address",
  "property_street",
  "property_street2",
  "property_city",
  "property_state",
  "property_zip",
  "invoice_occurred_on",
  "account_number",
  "account_name",
  "account_id",
  "total_amount",
  "amount_receivable",
  "future_charges",
  "0_to30",
  "30_to60",
  "60_to90",
  "90_plus",
  "30_plus",
  "60_plus",
  "occupancy_name",
  "account",
  "unit_address",
  "unit_street",
  "unit_street2",
  "unit_city",
  "unit_state",
  "unit_zip",
  "unit_name",
  "unit_type",
  "unit_tags",
  "tenant_status",
  "payment_plan",
  "txn_id",
  "occupancy_id",
  "unit_id"
];
var agedReceivablesDetailBaseSchema = import_zod12.z.object({
  property_visibility: import_zod12.z.string().default("active").describe('Filter properties by status. Defaults to "active".'),
  properties: import_zod12.z.object({
    properties_ids: import_zod12.z.array(import_zod12.z.string()).optional().describe(getIdFieldDescription("properties_ids", "Property", "property directory report")),
    property_groups_ids: import_zod12.z.array(import_zod12.z.string()).optional().describe(getIdFieldDescription("property_groups_ids", "Property Group", "property group directory report")),
    portfolios_ids: import_zod12.z.array(import_zod12.z.string()).optional().describe(getIdFieldDescription("portfolios_ids", "Portfolio", "portfolio directory report")),
    owners_ids: import_zod12.z.array(import_zod12.z.string()).optional().describe(getIdFieldDescription("owners_ids", "Owner", "owner directory report"))
  }).optional().describe("Optional. Filter by specific property-related IDs."),
  tags: import_zod12.z.string().optional().describe("Optional. Filter by property tags."),
  balance_operator: import_zod12.z.object({
    amount: import_zod12.z.string().optional().describe("Optional. Balance amount to compare against."),
    comparator: import_zod12.z.string().optional().describe("Optional. Comparison operator for balance amount.")
  }).optional().describe("Optional. Filter by balance amount with comparison operator."),
  tenant_statuses: import_zod12.z.array(import_zod12.z.string()).optional().describe("Optional. Filter by tenant status."),
  occurred_on_to: import_zod12.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe("End date for transaction occurrence filter (YYYY-MM-DD format)."),
  gl_account_map_id: import_zod12.z.string().optional().describe("Optional. General ledger account map ID."),
  columns: import_zod12.z.array(import_zod12.z.enum(VALID_AGED_RECEIVABLES_COLUMNS)).optional().describe(`Array of specific columns to include in the report. Valid columns: ${VALID_AGED_RECEIVABLES_COLUMNS.join(", ")}`),
  as_of: import_zod12.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe("As-of date for the aged receivables report (YYYY-MM-DD format).")
});
var agedReceivablesDetailInputSchema = agedReceivablesDetailBaseSchema.superRefine((data, ctx) => {
  if (data.properties) {
    const validationErrors = validatePropertiesIds(data.properties);
    throwOnValidationErrors(validationErrors);
  }
  if (data.gl_account_map_id && data.gl_account_map_id !== "" && !/^\d+$/.test(data.gl_account_map_id)) {
    ctx.addIssue({
      code: import_zod12.z.ZodIssueCode.custom,
      path: ["gl_account_map_id"],
      message: "GL Account Map ID must be a numeric string"
    });
  }
});
async function getAgedReceivablesDetailReport(args) {
  if (!args.as_of) {
    throw new Error("Missing required argument: as_of (format YYYY-MM-DD)");
  }
  const { property_visibility = "active", ...rest } = args;
  const payload = { property_visibility, ...rest };
  return makeAppfolioApiCall("aged_receivables_detail.json", payload);
}
function registerAgedReceivablesDetailReportTool(server) {
  server.tool(
    "get_aged_receivables_detail_report",
    "Returns aged receivables detail for the given filters. IMPORTANT: All ID parameters (properties_ids, etc.) must be numeric strings (e.g. '123'), NOT names. Use respective directory reports first to lookup IDs by name if needed.",
    agedReceivablesDetailBaseSchema.shape,
    async (args, _extra) => {
      try {
        const parseResult = agedReceivablesDetailInputSchema.safeParse(args);
        if (!parseResult.success) {
          const errorMessages = parseResult.error.errors.map(
            (err) => `${err.path.join(".")}: ${err.message}`
          ).join("; ");
          throw new Error(`Invalid arguments: ${errorMessages}`);
        }
        const result = await getAgedReceivablesDetailReport(parseResult.data);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
              mimeType: "application/json"
            }
          ]
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Aged Receivables Detail Report Error:`, errorMessage);
        throw error;
      }
    }
  );
}

// src/reports/budgetComparativeReport.ts
var import_zod13 = require("zod");
var budgetComparativeInputSchema = import_zod13.z.object({
  property_visibility: import_zod13.z.string().default("active"),
  properties: import_zod13.z.object({
    properties_ids: import_zod13.z.array(import_zod13.z.string()).optional(),
    property_groups_ids: import_zod13.z.array(import_zod13.z.string()).optional(),
    portfolios_ids: import_zod13.z.array(import_zod13.z.string()).optional(),
    owners_ids: import_zod13.z.array(import_zod13.z.string()).optional()
  }).optional(),
  period_from: import_zod13.z.string(),
  period_to: import_zod13.z.string(),
  comparison_period_from: import_zod13.z.string(),
  comparison_period_to: import_zod13.z.string(),
  additional_account_types: import_zod13.z.array(import_zod13.z.string()).optional(),
  gl_account_map_id: import_zod13.z.string().optional(),
  level_of_detail: import_zod13.z.string().optional(),
  columns: import_zod13.z.array(import_zod13.z.string()).optional()
});
async function getBudgetComparativeReport(args) {
  if (!args.period_from || !args.period_to || !args.comparison_period_from || !args.comparison_period_to) {
    throw new Error("Missing required arguments: period_from, period_to, comparison_period_from, and comparison_period_to (format YYYY-MM-DD)");
  }
  const { property_visibility = "active", ...rest } = args;
  const payload = { property_visibility, ...rest };
  return makeAppfolioApiCall("budget_comparative.json", payload);
}
function registerBudgetComparativeReportTool(server) {
  server.tool(
    "get_budget_comparative_report",
    "Returns budget comparative report for the given filters.",
    budgetComparativeInputSchema.shape,
    async (args, _extra) => {
      try {
        const parseResult = budgetComparativeInputSchema.safeParse(args);
        if (!parseResult.success) {
          const errorMessages = parseResult.error.errors.map(
            (err) => `${err.path.join(".")}: ${err.message}`
          ).join("; ");
          throw new Error(`Invalid arguments: ${errorMessages}`);
        }
        const result = await getBudgetComparativeReport(parseResult.data);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
              mimeType: "application/json"
            }
          ]
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Budget Comparative Report Error:`, errorMessage);
        throw error;
      }
    }
  );
}

// src/reports/chartOfAccountsReport.ts
var import_zod14 = require("zod");
var import_dotenv3 = __toESM(require("dotenv"));
import_dotenv3.default.config();
var CHART_OF_ACCOUNTS_COLUMNS = [
  "number",
  "account_name",
  "account_type",
  "sub_accountof",
  "offset_account",
  "subject_to_tax_authority",
  "options",
  "fund_account",
  "hidden",
  "gl_account_id",
  "sub_account_of_id",
  "offset_account_id"
];
var chartOfAccountsArgsSchema = import_zod14.z.object({
  columns: import_zod14.z.array(import_zod14.z.enum(CHART_OF_ACCOUNTS_COLUMNS)).optional().describe(`Array of specific columns to include in the report. Valid columns: ${CHART_OF_ACCOUNTS_COLUMNS.join(", ")}. If not specified, all columns are returned. NOTE: Use 'number' for GL account number, 'account_name' for account name, and 'gl_account_id' for the internal ID.`)
});
async function getChartOfAccountsReport(args) {
  return makeAppfolioApiCall("chart_of_accounts.json", args);
}
function registerChartOfAccountsReportTool(server) {
  server.tool(
    "get_chart_of_accounts_report",
    "Returns the chart of accounts with GL account information. Use this to lookup gl_account_ids by GL account number ('number' field) or name ('account_name' field). IMPORTANT: Column names are specific - use 'number' for GL account number, 'account_name' for account name, 'gl_account_id' for internal database ID.",
    chartOfAccountsArgsSchema.shape,
    async (args, _extra) => {
      try {
        const parseResult = chartOfAccountsArgsSchema.safeParse(args);
        if (!parseResult.success) {
          const errorMessages = parseResult.error.errors.map(
            (err) => `${err.path.join(".")}: ${err.message}`
          ).join("; ");
          throw new Error(`Invalid arguments: ${errorMessages}`);
        }
        const result = await getChartOfAccountsReport(parseResult.data);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
              mimeType: "application/json"
            }
          ]
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Chart of Accounts Report Error:`, errorMessage);
        throw error;
      }
    }
  );
}

// src/reports/completedWorkflowsReport.ts
var import_zod15 = require("zod");
var completedWorkflowsArgsSchema = import_zod15.z.object({
  attachables: import_zod15.z.object({
    properties_ids: import_zod15.z.array(import_zod15.z.string()).optional().describe(getIdFieldDescription("properties_ids", "Property", "Property Directory Report")),
    units_ids: import_zod15.z.array(import_zod15.z.string()).optional().describe(getIdFieldDescription("units_ids", "Unit", "Unit Directory Report")),
    tenants_ids: import_zod15.z.array(import_zod15.z.string()).optional().describe(getIdFieldDescription("tenants_ids", "Tenant", "Tenant Directory Report")),
    owners_ids: import_zod15.z.array(import_zod15.z.string()).optional().describe(getIdFieldDescription("owners_ids", "Owner", "Owner Directory Report")),
    rental_applications_ids: import_zod15.z.array(import_zod15.z.string()).optional().describe(getIdFieldDescription("rental_applications_ids", "Rental Application")),
    guest_cards_ids: import_zod15.z.array(import_zod15.z.string()).optional().describe(getIdFieldDescription("guest_cards_ids", "Guest Card")),
    guest_card_interests_ids: import_zod15.z.array(import_zod15.z.string()).optional().describe(getIdFieldDescription("guest_card_interests_ids", "Guest Card Interest")),
    service_requests_ids: import_zod15.z.array(import_zod15.z.string()).optional().describe(getIdFieldDescription("service_requests_ids", "Service Request")),
    vendors_ids: import_zod15.z.array(import_zod15.z.string()).optional().describe(getIdFieldDescription("vendors_ids", "Vendor", "Vendor Directory Report"))
  }).optional().describe("Filter results based on specific attached entities. All ID fields must be numeric strings, not names."),
  property_visibility: import_zod15.z.enum(["active", "hidden", "all"]).default("active").describe('Filter by property visibility. Defaults to "active"'),
  properties: import_zod15.z.object({
    properties_ids: import_zod15.z.array(import_zod15.z.string()).optional().describe(getIdFieldDescription("properties_ids", "Property", "Property Directory Report")),
    property_groups_ids: import_zod15.z.array(import_zod15.z.string()).optional().describe(getIdFieldDescription("property_groups_ids", "Property Group")),
    portfolios_ids: import_zod15.z.array(import_zod15.z.string()).optional().describe(getIdFieldDescription("portfolios_ids", "Portfolio"))
  }).optional().describe("Filter results based on properties, groups, or portfolios. All ID fields must be numeric strings, not names."),
  process_template: import_zod15.z.string().default("All").optional().describe('Filter by specific process template name. Defaults to "All"'),
  workflow_step: import_zod15.z.string().default("All").optional().describe('Filter by specific workflow step name. Defaults to "All"'),
  assigned_user: import_zod15.z.string().default("All").optional().describe('Filter by assigned user ID or "All". Defaults to "All". NOTE: Expects numeric user IDs (e.g. "4"), not user names. There is no user directory report available to lookup IDs by name.'),
  date_range_from: import_zod15.z.string().optional().describe("Start date for the completion date range (YYYY-MM-DD)"),
  date_range_to: import_zod15.z.string().optional().describe("End date for the completion date range (YYYY-MM-DD)"),
  columns: import_zod15.z.array(import_zod15.z.string()).optional().describe("Array of specific columns to include in the report")
});
async function getCompletedWorkflowsReport(args) {
  const validationErrors = [];
  if (args.attachables) {
    validationErrors.push(...validateWorkflowIds(args.attachables));
  }
  if (args.properties) {
    validationErrors.push(...validatePropertiesIds(args.properties));
  }
  throwOnValidationErrors(validationErrors);
  const { property_visibility = "active", ...rest } = args;
  const payload = { property_visibility, ...rest };
  return makeAppfolioApiCall("completed_processes.json", payload);
}
function registerCompletedWorkflowsReportTool(server) {
  server.tool(
    "get_completed_workflows_report",
    "Returns a report of completed workflows (processes) based on the provided filters. IMPORTANT: All ID parameters (owners_ids, properties_ids, units_ids, etc.) must be numeric strings (e.g. '123'), NOT names. Use directory reports first to lookup IDs by name if needed.",
    completedWorkflowsArgsSchema.shape,
    async (toolArgs) => {
      const data = await getCompletedWorkflowsReport(toolArgs);
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
}

// src/reports/fixedAssetsReport.ts
var import_zod16 = require("zod");
var fixedAssetsArgsSchema = import_zod16.z.object({
  property_visibility: import_zod16.z.enum(["active", "hidden", "all"]).default("active").optional().describe('Filter properties by status. Defaults to "active"'),
  unit_ids: import_zod16.z.array(import_zod16.z.string()).optional().describe("Array of unit IDs to filter by"),
  property: import_zod16.z.object({
    property_id: import_zod16.z.string().optional()
  }).optional().describe("Filter by a specific property ID"),
  include_property_level_fixed_assets: import_zod16.z.enum(["0", "1"]).default("1").optional().describe('Include assets linked directly to the property. Defaults to "1" (true)'),
  asset_types: import_zod16.z.string().default("All").optional().describe('Filter by specific asset type name. Defaults to "All"'),
  status: import_zod16.z.string().default("all").optional().describe('Filter by asset status. Defaults to "all"'),
  columns: import_zod16.z.array(import_zod16.z.string()).optional().describe("Array of specific columns to include in the report")
});
async function getFixedAssetsReport(args) {
  const { property_visibility = "active", ...rest } = args;
  const payload = { property_visibility, ...rest };
  return makeAppfolioApiCall("fixed_assets.json", payload);
}
function registerFixedAssetsReportTool(server) {
  server.tool(
    "get_fixed_assets_report",
    "Returns a report of fixed assets based on the provided filters.",
    fixedAssetsArgsSchema.shape,
    async (args, _extra) => {
      try {
        const parseResult = fixedAssetsArgsSchema.safeParse(args);
        if (!parseResult.success) {
          const errorMessages = parseResult.error.errors.map(
            (err) => `${err.path.join(".")}: ${err.message}`
          ).join("; ");
          throw new Error(`Invalid arguments: ${errorMessages}`);
        }
        const result = await getFixedAssetsReport(parseResult.data);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
              mimeType: "application/json"
            }
          ]
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Fixed Assets Report Error:`, errorMessage);
        throw error;
      }
    }
  );
}

// src/reports/inProgressWorkflowsReport.ts
var import_zod17 = require("zod");
var inProgressWorkflowsArgsSchema = import_zod17.z.object({
  attachables: import_zod17.z.object({
    properties_ids: import_zod17.z.array(import_zod17.z.string()).optional().describe(getIdFieldDescription("properties_ids", "Property", "Property Directory Report")),
    units_ids: import_zod17.z.array(import_zod17.z.string()).optional().describe(getIdFieldDescription("units_ids", "Unit", "Unit Directory Report")),
    tenants_ids: import_zod17.z.array(import_zod17.z.string()).optional().describe(getIdFieldDescription("tenants_ids", "Tenant", "Tenant Directory Report")),
    owners_ids: import_zod17.z.array(import_zod17.z.string()).optional().describe(getIdFieldDescription("owners_ids", "Owner", "Owner Directory Report")),
    rental_applications_ids: import_zod17.z.array(import_zod17.z.string()).optional().describe(getIdFieldDescription("rental_applications_ids", "Rental Application")),
    guest_cards_ids: import_zod17.z.array(import_zod17.z.string()).optional().describe(getIdFieldDescription("guest_cards_ids", "Guest Card")),
    guest_card_interests_ids: import_zod17.z.array(import_zod17.z.string()).optional().describe(getIdFieldDescription("guest_card_interests_ids", "Guest Card Interest")),
    service_requests_ids: import_zod17.z.array(import_zod17.z.string()).optional().describe(getIdFieldDescription("service_requests_ids", "Service Request")),
    vendors_ids: import_zod17.z.array(import_zod17.z.string()).optional().describe(getIdFieldDescription("vendors_ids", "Vendor", "Vendor Directory Report"))
  }).optional().describe("Filter results based on specific attached entities. All ID fields must be numeric strings, not names."),
  property_visibility: import_zod17.z.enum(["active", "hidden", "all"]).default("active").optional().describe('Filter properties by status. Defaults to "active"'),
  properties: import_zod17.z.object({
    properties_ids: import_zod17.z.array(import_zod17.z.string()).optional().describe(getIdFieldDescription("properties_ids", "Property", "Property Directory Report")),
    property_groups_ids: import_zod17.z.array(import_zod17.z.string()).optional().describe(getIdFieldDescription("property_groups_ids", "Property Group")),
    portfolios_ids: import_zod17.z.array(import_zod17.z.string()).optional().describe(getIdFieldDescription("portfolios_ids", "Portfolio"))
  }).optional().describe("Filter results based on properties, groups, or portfolios. All ID fields must be numeric strings, not names."),
  process_template: import_zod17.z.string().default("All").optional().describe('Filter by specific process template name. Defaults to "All"'),
  workflow_step: import_zod17.z.string().default("All").optional().describe('Filter by specific workflow step name. Defaults to "All"'),
  assigned_user: import_zod17.z.string().default("All").optional().describe('Filter by assigned user ID or "All". Defaults to "All". NOTE: Expects numeric user IDs (e.g. "4"), not user names. There is no user directory report available to lookup IDs by name.'),
  date_range_from: import_zod17.z.string().optional().describe("Start date for the due date range (YYYY-MM-DD)"),
  date_range_to: import_zod17.z.string().optional().describe("End date for the due date range (YYYY-MM-DD)"),
  columns: import_zod17.z.array(import_zod17.z.string()).optional().describe("Array of specific columns to include in the report")
});
async function getInProgressWorkflowsReport(args) {
  const validationErrors = [];
  if (args.attachables) {
    validationErrors.push(...validateWorkflowIds(args.attachables));
  }
  if (args.properties) {
    validationErrors.push(...validatePropertiesIds(args.properties));
  }
  throwOnValidationErrors(validationErrors);
  const { property_visibility = "active", ...rest } = args;
  const payload = { property_visibility, ...rest };
  return makeAppfolioApiCall("in_progress_workflows.json", payload);
}
function registerInProgressWorkflowsReportTool(server) {
  server.tool(
    "get_in_progress_workflows_report",
    "Returns a report of in-progress workflows based on the provided filters. IMPORTANT: All ID parameters (owners_ids, properties_ids, units_ids, etc.) must be numeric strings (e.g. '123'), NOT names. Use directory reports first to lookup IDs by name if needed.",
    inProgressWorkflowsArgsSchema.shape,
    async (toolArgs) => {
      const data = await getInProgressWorkflowsReport(toolArgs);
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
}

// src/reports/incomeStatementDateRangeReport.ts
var import_zod18 = require("zod");
var incomeStatementDateRangeToolSchema = {
  property_visibility: import_zod18.z.enum(["active", "hidden", "all"]).default("active").optional().describe('Filter properties by status. Defaults to "active"'),
  ...flatPropertyFilterSchema,
  posted_on_from: import_zod18.z.string().describe("Start date for the posting period (YYYY-MM-DD) - Required"),
  posted_on_to: import_zod18.z.string().describe("End date for the posting period (YYYY-MM-DD) - Required"),
  gl_account_map_id: import_zod18.z.string().optional().describe("Filter by a specific GL account map ID"),
  level_of_detail: import_zod18.z.enum(["detail_view", "summary_view"]).default("detail_view").optional().describe('Specify the level of detail. Defaults to "detail_view"'),
  include_zero_balance_gl_accounts: import_zod18.z.enum(["0", "1"]).default("0").optional().describe('Include GL accounts with zero balance. Defaults to "0"'),
  fund_type: import_zod18.z.enum(["all", "operating", "capital"]).default("all").optional().describe('Filter by fund type. Defaults to "all"'),
  columns: import_zod18.z.array(import_zod18.z.string()).optional().describe("Array of specific columns to include")
};
var incomeStatementDateRangeValidationSchema = import_zod18.z.object({
  property_visibility: import_zod18.z.enum(["active", "hidden", "all"]).default("active").optional(),
  properties_ids: import_zod18.z.array(import_zod18.z.string()).optional(),
  property_groups_ids: import_zod18.z.array(import_zod18.z.string()).optional(),
  portfolios_ids: import_zod18.z.array(import_zod18.z.string()).optional(),
  owners_ids: import_zod18.z.array(import_zod18.z.string()).optional(),
  posted_on_from: import_zod18.z.string(),
  posted_on_to: import_zod18.z.string(),
  gl_account_map_id: import_zod18.z.string().optional(),
  level_of_detail: import_zod18.z.enum(["detail_view", "summary_view"]).default("detail_view").optional(),
  include_zero_balance_gl_accounts: import_zod18.z.enum(["0", "1"]).default("0").optional(),
  fund_type: import_zod18.z.enum(["all", "operating", "capital"]).default("all").optional(),
  columns: import_zod18.z.array(import_zod18.z.string()).optional()
});
async function getIncomeStatementDateRangeReport(args) {
  if (!args.posted_on_from || !args.posted_on_to) {
    throw new Error("Missing required arguments: posted_on_from and posted_on_to (format YYYY-MM-DD)");
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
  return makeAppfolioApiCall("income_statement_date_range.json", payload);
}
function registerIncomeStatementDateRangeReportTool(server) {
  server.tool(
    "get_income_statement_date_range_report",
    "Returns the income statement report for a specified date range.",
    incomeStatementDateRangeToolSchema,
    async (args, _extra) => {
      try {
        const parseResult = incomeStatementDateRangeValidationSchema.safeParse(args);
        if (!parseResult.success) {
          const errorMessages = parseResult.error.errors.map(
            (err) => `${err.path.join(".")}: ${err.message}`
          ).join("; ");
          throw new Error(`Invalid arguments: ${errorMessages}`);
        }
        const apiArgs = transformToNestedProperties(parseResult.data);
        const result = await getIncomeStatementDateRangeReport(apiArgs);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
              mimeType: "application/json"
            }
          ]
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Income Statement Date Range Report Error:`, errorMessage);
        throw error;
      }
    }
  );
}

// src/reports/workOrderLaborSummaryReport.ts
var import_zod19 = require("zod");
var workOrderLaborSummaryInputSchema = import_zod19.z.object({
  property_visibility: import_zod19.z.enum(["active", "hidden", "all"]).optional().default("active").describe('Filter properties by status. Defaults to "active"'),
  maintenance_tech: import_zod19.z.string().optional().default("All").describe('Filter by maintenance technician. Defaults to "All"'),
  labor_performed_from: import_zod19.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "labor_performed_from must be in YYYY-MM-DD format" }).describe("Start date for labor performed (YYYY-MM-DD)"),
  labor_performed_to: import_zod19.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "labor_performed_to must be in YYYY-MM-DD format" }).describe("End date for labor performed (YYYY-MM-DD)"),
  unit_turn: import_zod19.z.enum(["0", "1"]).optional().default("0").describe('Filter by unit turn. Defaults to "0" (false)'),
  properties: import_zod19.z.object({
    properties_ids: import_zod19.z.array(import_zod19.z.string()).optional(),
    property_groups_ids: import_zod19.z.array(import_zod19.z.string()).optional(),
    portfolios_ids: import_zod19.z.array(import_zod19.z.string()).optional(),
    owners_ids: import_zod19.z.array(import_zod19.z.string()).optional()
  }).optional().describe("Filter by specific properties, groups, portfolios, or owners"),
  columns: import_zod19.z.array(import_zod19.z.string()).optional().describe("Array of specific columns to include in the report"),
  // work_order_statuses is in WorkOrderLaborSummaryArgs but not in the original Zod schema from index.ts. Adding it as optional.
  work_order_statuses: import_zod19.z.array(import_zod19.z.string()).optional().describe("Filter by work order status IDs")
});
async function getWorkOrderLaborSummaryReport(args) {
  if (!args.labor_performed_from || !args.labor_performed_to) {
    throw new Error("Missing required arguments: labor_performed_from and labor_performed_to (format YYYY-MM-DD)");
  }
  const { property_visibility = "active", ...rest } = args;
  const payload = { property_visibility, ...rest };
  return makeAppfolioApiCall("work_order_labor_summary.json", payload);
}
function registerWorkOrderLaborSummaryReportTool(server) {
  server.tool(
    "get_work_order_labor_summary_report",
    "Returns a report detailing work order labor based on specified filters.",
    workOrderLaborSummaryInputSchema.shape,
    async (args, _extra) => {
      try {
        const parseResult = workOrderLaborSummaryInputSchema.safeParse(args);
        if (!parseResult.success) {
          const errorMessages = parseResult.error.errors.map(
            (err) => `${err.path.join(".")}: ${err.message}`
          ).join("; ");
          throw new Error(`Invalid arguments: ${errorMessages}`);
        }
        const result = await getWorkOrderLaborSummaryReport(parseResult.data);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
              mimeType: "application/json"
            }
          ]
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Work Order Labor Summary Report Error:`, errorMessage);
        throw error;
      }
    }
  );
}

// src/reports/cancelledWorkflowsReport.ts
var import_zod20 = require("zod");
var cancelledWorkflowsArgsSchema = import_zod20.z.object({
  attachables: import_zod20.z.object({
    properties_ids: import_zod20.z.array(import_zod20.z.string()).optional(),
    units_ids: import_zod20.z.array(import_zod20.z.string()).optional(),
    tenants_ids: import_zod20.z.array(import_zod20.z.string()).optional(),
    owners_ids: import_zod20.z.array(import_zod20.z.string()).optional(),
    rental_applications_ids: import_zod20.z.array(import_zod20.z.string()).optional(),
    guest_cards_ids: import_zod20.z.array(import_zod20.z.string()).optional(),
    guest_card_interests_ids: import_zod20.z.array(import_zod20.z.string()).optional(),
    service_requests_ids: import_zod20.z.array(import_zod20.z.string()).optional(),
    vendors_ids: import_zod20.z.array(import_zod20.z.string()).optional()
  }).optional().describe("Filter results based on specific attached entities"),
  property_visibility: import_zod20.z.enum(["active", "hidden", "all"]).default("active").describe('Filter properties by status. Defaults to "active"'),
  properties: import_zod20.z.object({
    properties_ids: import_zod20.z.array(import_zod20.z.string()).optional(),
    property_groups_ids: import_zod20.z.array(import_zod20.z.string()).optional(),
    portfolios_id: import_zod20.z.array(import_zod20.z.string()).optional()
  }).optional().describe("Filter results based on properties, groups, or portfolios"),
  process_template: import_zod20.z.string().default("All").describe('Filter by specific process template name. Defaults to "All"'),
  workflow_step: import_zod20.z.string().default("All").describe('Filter by specific workflow step name. Defaults to "All"'),
  assigned_user: import_zod20.z.string().default("All").describe('Filter by assigned user ID or "All". Defaults to "All". NOTE: Expects numeric user IDs (e.g. "4"), not user names. There is no user directory report available to lookup IDs by name.'),
  date_range_from: import_zod20.z.string().optional().describe("Start date for the cancellation date range (YYYY-MM-DD)"),
  date_range_to: import_zod20.z.string().optional().describe("End date for the cancellation date range (YYYY-MM-DD)"),
  cancelled_by: import_zod20.z.string().default("All").describe('Filter by the user who cancelled the workflow. Defaults to "All"'),
  columns: import_zod20.z.array(import_zod20.z.string()).optional().describe("Array of specific columns to include in the report")
});
async function getCancelledWorkflowsReport(args) {
  const { property_visibility = "active", ...rest } = args;
  const payload = { property_visibility, ...rest };
  return makeAppfolioApiCall("cancelled_processes.json", payload);
}
function registerCancelledWorkflowsReportTool(server) {
  server.tool(
    "get_cancelled_workflows_report",
    "Retrieves a report of cancelled workflows, allowing filtering by various criteria such as properties, process templates, and date ranges.",
    cancelledWorkflowsArgsSchema.shape,
    async (args, _extra) => {
      try {
        const parseResult = cancelledWorkflowsArgsSchema.safeParse(args);
        if (!parseResult.success) {
          const errorMessages = parseResult.error.errors.map(
            (err) => `${err.path.join(".")}: ${err.message}`
          ).join("; ");
          throw new Error(`Invalid arguments: ${errorMessages}`);
        }
        const result = await getCancelledWorkflowsReport(parseResult.data);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
              mimeType: "application/json"
            }
          ]
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Cancelled Workflows Report Error:`, errorMessage);
        throw error;
      }
    }
  );
}

// src/reports/leaseExpirationDetailReport.ts
var import_zod21 = require("zod");
var import_dotenv4 = __toESM(require("dotenv"));
import_dotenv4.default.config();
var LEASE_EXPIRATION_DETAIL_COLUMNS = [
  "property",
  "property_name",
  "property_id",
  "property_address",
  "property_street",
  "property_street2",
  "property_city",
  "property_state",
  "property_zip",
  "unit",
  "unit_tags",
  "unit_type",
  "move_in",
  "lease_expires",
  "lease_expires_month",
  "market_rent",
  "sqft",
  "tenant_name",
  "deposit",
  "rent",
  "phone_numbers",
  "unit_id",
  "occupancy_id",
  "tenant_id",
  "owner_agent",
  "tenant_agent",
  "rent_status",
  "legal_rent",
  "owners_phone_number",
  "owners",
  "last_rent_increase",
  "next_rent_adjustment",
  "next_rent_increase",
  "lease_sign_date",
  "last_lease_renewal",
  "notice_given_date",
  "move_out",
  "tenant_tags",
  "affordable_program",
  "computed_market_rent"
];
var leaseExpirationDetailArgsSchema = import_zod21.z.object({
  from_date: import_zod21.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe("The start date for the reporting period (YYYY-MM-DD). Required."),
  to_date: import_zod21.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe("The end date for the reporting period (YYYY-MM-DD). Required."),
  properties: import_zod21.z.object({
    properties_ids: import_zod21.z.array(import_zod21.z.string()).optional().describe(getIdFieldDescription("property", "Property Directory Report")),
    property_groups_ids: import_zod21.z.array(import_zod21.z.string()).optional().describe(getIdFieldDescription("property group", "Property Group Directory Report")),
    portfolios_ids: import_zod21.z.array(import_zod21.z.string()).optional().describe(getIdFieldDescription("portfolio", "Portfolio Directory Report")),
    owners_ids: import_zod21.z.array(import_zod21.z.string()).optional().describe(getIdFieldDescription("owner", "Owner Directory Report"))
  }).optional().describe("Filter results based on properties, groups, portfolios, or owners"),
  unit_visibility: import_zod21.z.enum(["active", "hidden", "all"]).default("active").describe('Filter units by status. Defaults to "active"'),
  tags: import_zod21.z.string().optional().describe("Filter by unit tags (comma-separated string)"),
  filter_lease_date_range_by: import_zod21.z.enum(["Lease Expiration Date", "Lease Start Date", "Move-in Date"]).default("Lease Expiration Date").describe('Which date field to use for the date range filter. Defaults to "Lease Expiration Date"'),
  exclude_occupancies_with_move_out: import_zod21.z.enum(["0", "1"]).default("0").describe('Exclude occupancies that have a move-out date. Defaults to "0" (false)'),
  exclude_month_to_month: import_zod21.z.enum(["0", "1"]).default("0").describe('Exclude occupancies that are month-to-month. Defaults to "0" (false)'),
  columns: import_zod21.z.array(import_zod21.z.enum(LEASE_EXPIRATION_DETAIL_COLUMNS)).optional().describe(`Array of specific columns to include in the report. Valid columns: ${LEASE_EXPIRATION_DETAIL_COLUMNS.join(", ")}. If not specified, all columns are returned.`)
});
async function getLeaseExpirationDetailReport(args) {
  if (args.properties) {
    const validationErrors = validatePropertiesIds(args.properties);
    throwOnValidationErrors(validationErrors);
  }
  if (!args.from_date || !args.to_date) {
    throw new Error("Missing required arguments: from_date and to_date (format YYYY-MM-DD)");
  }
  const { unit_visibility = "active", ...rest } = args;
  const payload = { unit_visibility, ...rest };
  return makeAppfolioApiCall("lease_expiration_detail.json", payload);
}
function registerLeaseExpirationDetailReportTool(server) {
  server.tool(
    "get_lease_expiration_detail_by_month_report",
    "Retrieves a report detailing lease expirations by month, filterable by properties, date range, and other criteria. IMPORTANT: All ID parameters (properties_ids, property_groups_ids, portfolios_ids, owners_ids) must be numeric strings (e.g. '123'), NOT names. Use respective directory reports first to lookup IDs by name if needed.",
    leaseExpirationDetailArgsSchema.shape,
    async (args, _extra) => {
      try {
        const parseResult = leaseExpirationDetailArgsSchema.safeParse(args);
        if (!parseResult.success) {
          const errorMessages = parseResult.error.errors.map(
            (err) => `${err.path.join(".")}: ${err.message}`
          ).join("; ");
          throw new Error(`Invalid arguments: ${errorMessages}`);
        }
        const result = await getLeaseExpirationDetailReport(parseResult.data);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
              mimeType: "application/json"
            }
          ]
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Lease Expiration Detail Report Error:`, errorMessage);
        throw error;
      }
    }
  );
}

// src/reports/leasingSummaryReport.ts
var import_zod22 = require("zod");
var import_dotenv5 = __toESM(require("dotenv"));
import_dotenv5.default.config();
var LEASING_SUMMARY_COLUMNS = [
  "unit_type",
  "number_of_units",
  "number_of_model_units",
  "inquiries_received",
  "showings_completed",
  "applications_received",
  "move_ins",
  "move_outs",
  "leased",
  "vacancy_postings",
  "number_of_active_campaigns",
  "number_of_ended_campaigns"
];
var leasingSummaryArgsSchema = import_zod22.z.object({
  properties: import_zod22.z.object({
    properties_ids: import_zod22.z.array(import_zod22.z.string()).optional().describe(getIdFieldDescription("property", "Property Directory Report")),
    property_groups_ids: import_zod22.z.array(import_zod22.z.string()).optional().describe(getIdFieldDescription("property group", "Property Group Directory Report")),
    portfolios_ids: import_zod22.z.array(import_zod22.z.string()).optional().describe(getIdFieldDescription("portfolio", "Portfolio Directory Report")),
    owners_ids: import_zod22.z.array(import_zod22.z.string()).optional().describe(getIdFieldDescription("owner", "Owner Directory Report"))
  }).optional().describe("Filter results based on properties, groups, portfolios, or owners"),
  unit_visibility: import_zod22.z.enum(["active", "hidden", "all"]).default("active").describe('Filter units by status. Defaults to "active"'),
  posted_on_from: import_zod22.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe("The start date for the reporting period (YYYY-MM-DD). Required."),
  posted_on_to: import_zod22.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe("The end date for the reporting period (YYYY-MM-DD). Required."),
  columns: import_zod22.z.array(import_zod22.z.enum(LEASING_SUMMARY_COLUMNS)).optional().describe(`Array of specific columns to include in the report. Valid columns: ${LEASING_SUMMARY_COLUMNS.join(", ")}. If not specified, all columns are returned.`)
});
async function getLeasingSummaryReport(args) {
  if (args.properties) {
    const validationErrors = validatePropertiesIds(args.properties);
    throwOnValidationErrors(validationErrors);
  }
  if (!args.posted_on_from || !args.posted_on_to) {
    throw new Error("Missing required arguments: posted_on_from and posted_on_to (format YYYY-MM-DD)");
  }
  const { unit_visibility = "active", ...rest } = args;
  const payload = { unit_visibility, ...rest };
  return makeAppfolioApiCall("leasing_summary.json", payload);
}
function registerLeasingSummaryReportTool(server) {
  server.tool(
    "get_leasing_summary_report",
    "Provides a summary of leasing activities, including inquiries, showings, applications, and move-ins/outs. IMPORTANT: All ID parameters (properties_ids, property_groups_ids, portfolios_ids, owners_ids) must be numeric strings (e.g. '123'), NOT names. Use respective directory reports first to lookup IDs by name if needed.",
    leasingSummaryArgsSchema.shape,
    async (args, _extra) => {
      try {
        const parseResult = leasingSummaryArgsSchema.safeParse(args);
        if (!parseResult.success) {
          const errorMessages = parseResult.error.errors.map(
            (err) => `${err.path.join(".")}: ${err.message}`
          ).join("; ");
          throw new Error(`Invalid arguments: ${errorMessages}`);
        }
        const result = await getLeasingSummaryReport(parseResult.data);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
              mimeType: "application/json"
            }
          ]
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Leasing Summary Report Error:`, errorMessage);
        throw error;
      }
    }
  );
}

// src/reports/ownerDirectoryReport.ts
var import_zod23 = require("zod");
var ownerDirectoryColumnEnum = import_zod23.z.enum([
  "name",
  "phone_numbers",
  "email",
  "alternative_payee",
  "payment_type",
  "last_payment_date",
  "hold_payments",
  "owner_packet_reports",
  "send_owner_packets_by_email",
  "properties_owned",
  "tags",
  "last_packet_sent",
  "address",
  "street",
  "street2",
  "city",
  "state",
  "zip",
  "country",
  "owner_id",
  "properties_owned_i_ds",
  "notes_for_the_owner",
  "first_name",
  "last_name",
  "owner_integration_id",
  "created_by"
]);
var ownerDirectoryArgsSchema = import_zod23.z.object({
  property_visibility: import_zod23.z.string().optional().transform((val) => val === "" ? void 0 : val).default("active").describe("Filter properties by visibility. Defaults to 'active'."),
  properties: import_zod23.z.object({
    properties_ids: import_zod23.z.array(import_zod23.z.string()).optional(),
    property_groups_ids: import_zod23.z.array(import_zod23.z.string()).optional(),
    portfolios_ids: import_zod23.z.array(import_zod23.z.string()).optional(),
    owners_ids: import_zod23.z.array(import_zod23.z.string()).optional()
  }).optional().describe("Filter results based on properties, groups, portfolios, or owners."),
  tags: import_zod23.z.string().optional().transform((val) => val === "" ? void 0 : val).describe("FILTER BY SYSTEM TAGS ONLY: Comma-separated list of actual tags assigned to owners in the system (e.g., 'vip,corporate'). NOT for searching by owner names - use the full report results for name searching."),
  owner_visibility: import_zod23.z.string().optional().transform((val) => val === "" ? void 0 : val).default("active").describe("Filter owners by visibility. Defaults to 'active'."),
  created_by: import_zod23.z.string().optional().transform((val) => val === "" ? void 0 : val).default("All").describe("Filter by who created the owner. Defaults to 'All'."),
  columns: import_zod23.z.array(ownerDirectoryColumnEnum).optional().describe("List of columns to include in the report. If omitted, default columns are used.")
});
async function getOwnerDirectoryReport(args) {
  return makeAppfolioApiCall("owner_directory.json", args);
}
function registerOwnerDirectoryReportTool(server) {
  server.tool(
    "get_owner_directory_report",
    "Retrieves a DIRECTORY report with details about property owners. This returns ALL owners (with optional filters) - to find specific owners by name, call this report and search the results client-side. IMPORTANT: All ID parameters must be numeric strings, NOT names. The 'tags' parameter is for filtering by actual system tags, NOT for text search.",
    ownerDirectoryArgsSchema.shape,
    async (args, _extra) => {
      try {
        const parseResult = ownerDirectoryArgsSchema.safeParse(args);
        if (!parseResult.success) {
          const errorMessages = parseResult.error.errors.map(
            (err) => `${err.path.join(".")}: ${err.message}`
          ).join("; ");
          throw new Error(`Invalid arguments: ${errorMessages}`);
        }
        const result = await getOwnerDirectoryReport(parseResult.data);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
              mimeType: "application/json"
            }
          ]
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Owner Directory Report Error:`, errorMessage);
        throw error;
      }
    }
  );
}

// src/reports/loansReport.ts
var import_zod24 = require("zod");
var loansArgsSchema = import_zod24.z.object({
  property_visibility: import_zod24.z.enum(["active", "hidden", "all"]).optional().default("active").describe('Filter properties by status. Defaults to "active"'),
  properties: import_zod24.z.object({
    properties_ids: import_zod24.z.array(import_zod24.z.string()).optional(),
    property_groups_ids: import_zod24.z.array(import_zod24.z.string()).optional(),
    portfolios_ids: import_zod24.z.array(import_zod24.z.string()).optional(),
    owners_ids: import_zod24.z.array(import_zod24.z.string()).optional()
  }).optional().describe("Filter results based on properties, groups, portfolios, or owners"),
  reference_to: import_zod24.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe("The reference date for the report (YYYY-MM-DD). Required."),
  show_hidden_loans: import_zod24.z.enum(["0", "1"]).optional().default("0").describe('Include loans marked as hidden. Defaults to "0" (false)'),
  columns: import_zod24.z.array(import_zod24.z.string()).optional().describe("Array of specific columns to include in the report")
});
async function getLoansReport(args) {
  if (!args.reference_to) {
    throw new Error("Missing required argument: reference_to (format YYYY-MM-DD)");
  }
  const { property_visibility = "active", ...rest } = args;
  const payload = { property_visibility, ...rest };
  return makeAppfolioApiCall("loans.json", payload);
}
function registerLoansReportTool(server) {
  server.tool(
    "get_loans_report",
    "Retrieves a report on loans associated with properties.",
    loansArgsSchema.shape,
    async (args, _extra) => {
      try {
        const parseResult = loansArgsSchema.safeParse(args);
        if (!parseResult.success) {
          const errorMessages = parseResult.error.errors.map(
            (err) => `${err.path.join(".")}: ${err.message}`
          ).join("; ");
          throw new Error(`Invalid arguments: ${errorMessages}`);
        }
        const result = await getLoansReport(parseResult.data);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
              mimeType: "application/json"
            }
          ]
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Loans Report Error:`, errorMessage);
        throw error;
      }
    }
  );
}

// src/reports/occupancySummaryReport.ts
var import_zod25 = require("zod");
var OCCUPANCY_SUMMARY_COLUMNS = [
  "unit_type",
  "number_of_units",
  "occupied",
  "percent_occupied",
  "average_square_feet",
  "average_market_rent",
  "vacant_rented",
  "vacant_unrented",
  "notice_rented",
  "notice_unrented",
  "average_rent",
  "property",
  "property_id"
];
var occupancySummaryArgsSchema = import_zod25.z.object({
  properties: import_zod25.z.object({
    properties_ids: import_zod25.z.array(import_zod25.z.string()).optional().describe(getIdFieldDescription("property", "Property Directory Report")),
    property_groups_ids: import_zod25.z.array(import_zod25.z.string()).optional().describe(getIdFieldDescription("property group", "Property Group Directory Report")),
    portfolios_ids: import_zod25.z.array(import_zod25.z.string()).optional().describe(getIdFieldDescription("portfolio", "Portfolio Directory Report")),
    owners_ids: import_zod25.z.array(import_zod25.z.string()).optional().describe(getIdFieldDescription("owner", "Owner Directory Report"))
  }).optional().describe("Filter results based on properties, groups, portfolios, or owners"),
  unit_visibility: import_zod25.z.enum(["active", "hidden", "all"]).optional().default("active").describe('Filter units by status. Defaults to "active"'),
  as_of_date: import_zod25.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe('The "as of" date for the report (YYYY-MM-DD). Required.'),
  columns: import_zod25.z.array(import_zod25.z.enum(OCCUPANCY_SUMMARY_COLUMNS)).optional().describe(`Array of specific columns to include in the report. Valid columns: ${OCCUPANCY_SUMMARY_COLUMNS.join(", ")}. If not specified, all columns are returned. NOTE: Use 'occupied' for occupied units count, 'vacant_rented' and 'vacant_unrented' for vacancy details.`)
});
async function getOccupancySummaryReport(args) {
  if (args.properties) {
    const validationErrors = validatePropertiesIds(args.properties);
    throwOnValidationErrors(validationErrors);
  }
  if (!args.as_of_date) {
    throw new Error("Missing required argument: as_of_date (format YYYY-MM-DD)");
  }
  const { unit_visibility = "active", ...rest } = args;
  const payload = { unit_visibility, ...rest };
  return makeAppfolioApiCall("occupancy_summary.json", payload);
}
function registerOccupancySummaryReportTool(server) {
  server.tool(
    "get_occupancy_summary_report",
    "Generates a summary of property occupancy, including number of units, occupied units, and vacancy rates. IMPORTANT: All ID parameters must be numeric strings (e.g. '123'), NOT names. Use directory reports to lookup IDs by name if needed. Common columns: 'number_of_units', 'occupied', 'vacant_rented', 'vacant_unrented', 'percent_occupied'.",
    occupancySummaryArgsSchema.shape,
    async (args, _extra) => {
      try {
        console.log("Occupancy Summary Report - received arguments:", JSON.stringify(args, null, 2));
        const parseResult = occupancySummaryArgsSchema.safeParse(args);
        if (!parseResult.success) {
          const errorMessages = parseResult.error.errors.map(
            (err) => `${err.path.join(".")}: ${err.message}`
          ).join("; ");
          console.error("Occupancy Summary Report - validation errors:", errorMessages);
          throw new Error(`Invalid arguments: ${errorMessages}`);
        }
        const result = await getOccupancySummaryReport(parseResult.data);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
              mimeType: "application/json"
            }
          ]
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Occupancy Summary Report Error:`, errorMessage);
        throw error;
      }
    }
  );
}

// src/reports/ownerLeasingReport.ts
var import_zod26 = require("zod");
var ownerLeasingArgsSchema = import_zod26.z.object({
  properties: import_zod26.z.object({
    properties_ids: import_zod26.z.array(import_zod26.z.string()).optional().describe(getIdFieldDescription("properties_ids", "Property", "Property Directory Report")),
    property_groups_ids: import_zod26.z.array(import_zod26.z.string()).optional().describe(getIdFieldDescription("property_groups_ids", "Property Group")),
    portfolios_ids: import_zod26.z.array(import_zod26.z.string()).optional().describe(getIdFieldDescription("portfolios_ids", "Portfolio")),
    owners_ids: import_zod26.z.array(import_zod26.z.string()).optional().describe(getIdFieldDescription("owners_ids", "Owner", "Owner Directory Report"))
  }).optional().describe("Filter results based on properties, groups, portfolios, or owners. All ID fields must be numeric strings, not names."),
  received_on_from: import_zod26.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe("The start date for the reporting period based on received date (YYYY-MM-DD). Required."),
  received_on_to: import_zod26.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe("The end date for the reporting period based on received date (YYYY-MM-DD). Required."),
  unit_visibility: import_zod26.z.enum(["active", "hidden", "all"]).optional().default("active").describe('Filter units by status. Defaults to "active"'),
  include_units_which_are_not_rent_ready: import_zod26.z.enum(["0", "1"]).optional().default("0").describe('Include units that are not marked as rent ready. Defaults to "0" (false)'),
  include_units_which_are_hidden_from_the_vacancies_dashboard: import_zod26.z.enum(["0", "1"]).optional().default("0").describe('Include units hidden from the vacancies dashboard. Defaults to "0" (false)'),
  columns: import_zod26.z.array(import_zod26.z.string()).optional().describe("Array of specific columns to include in the report")
});
async function getOwnerLeasingReport(args) {
  if (!args.received_on_from || !args.received_on_to) {
    throw new Error("Missing required arguments: received_on_from and received_on_to (format YYYY-MM-DD)");
  }
  if (args.properties) {
    const validationErrors = validatePropertiesIds(args.properties);
    throwOnValidationErrors(validationErrors);
  }
  const payload = args;
  return makeAppfolioApiCall("owner_leasing.json", payload);
}
function registerOwnerLeasingReportTool(server) {
  server.tool(
    "get_owner_leasing_report",
    "Provides a leasing report tailored for property owners, showing leasing activity within a specified date range. IMPORTANT: All ID parameters (owners_ids, properties_ids, etc.) must be numeric strings (e.g. '123'), NOT names. Use respective directory reports first to lookup IDs by name if needed.",
    ownerLeasingArgsSchema.shape,
    async (args) => {
      const data = await getOwnerLeasingReport(args);
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
}

// src/reports/propertyPerformanceReport.ts
var import_zod27 = require("zod");
var propertyPerformanceArgsSchema = import_zod27.z.object({
  property_visibility: import_zod27.z.enum(["active", "hidden", "all"]).default("active").describe('Filter properties by status. Defaults to "active"'),
  properties: import_zod27.z.object({
    properties_ids: import_zod27.z.array(import_zod27.z.string()).optional().describe(getIdFieldDescription("properties_ids", "Property", "Property Directory Report")),
    property_groups_ids: import_zod27.z.array(import_zod27.z.string()).optional().describe(getIdFieldDescription("property_groups_ids", "Property Group")),
    portfolios_ids: import_zod27.z.array(import_zod27.z.string()).optional().describe(getIdFieldDescription("portfolios_ids", "Portfolio")),
    owners_ids: import_zod27.z.array(import_zod27.z.string()).optional().describe(getIdFieldDescription("owners_ids", "Owner", "Owner Directory Report"))
  }).optional().describe("Filter results based on properties, groups, portfolios, or owners. All ID fields must be numeric strings, not names."),
  report_format: import_zod27.z.enum(["Current Year Actual", "Last Year Actual", "Prior Year Actual", "Budget Comparison"]).describe("Format for the property performance report. Required."),
  period_from: import_zod27.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe("The start date for the reporting period (YYYY-MM-DD). Required."),
  period_to: import_zod27.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe("The end date for the reporting period (YYYY-MM-DD). Required."),
  columns: import_zod27.z.array(import_zod27.z.string()).optional().describe('Array of specific columns to include in the report. Note: Available columns depend on the report_format selected. Avoid generic names like "total_income" - check the API documentation for valid column names for this report.')
});
async function getPropertyPerformanceReport(args) {
  if (!args.period_from || !args.period_to) {
    throw new Error("Missing required arguments: period_from and period_to (format YYYY-MM-DD)");
  }
  if (args.properties) {
    const validationErrors = validatePropertiesIds(args.properties);
    throwOnValidationErrors(validationErrors);
  }
  const { property_visibility = "active", ...rest } = args;
  const cleanPayload = {
    property_visibility,
    ...Object.fromEntries(
      Object.entries(rest).filter(([key, value]) => {
        if (value === null || value === void 0) return false;
        if (Array.isArray(value) && value.length === 0) return false;
        if (typeof value === "object" && value !== null) {
          const filteredObj = Object.fromEntries(
            Object.entries(value).filter(([, val]) => {
              if (Array.isArray(val) && val.length === 0) return false;
              return val !== null && val !== void 0;
            })
          );
          return Object.keys(filteredObj).length > 0;
        }
        return true;
      })
    )
  };
  return makeAppfolioApiCall("property_performance.json", cleanPayload);
}
function registerPropertyPerformanceReportTool(server) {
  server.tool(
    "get_property_performance_report",
    "Retrieves the Property Performance report, showing financial performance metrics for properties within a specified date range. IMPORTANT: All ID parameters (owners_ids, properties_ids, etc.) must be numeric strings (e.g. '123'), NOT names. Use respective directory reports first to lookup IDs by name if needed.",
    propertyPerformanceArgsSchema.shape,
    async (args) => {
      const reportData = await getPropertyPerformanceReport(args);
      return {
        content: [{ type: "text", text: JSON.stringify(reportData, null, 2) }]
      };
    }
  );
}

// src/reports/propertySourceTrackingReport.ts
var import_zod28 = require("zod");
async function getPropertySourceTrackingReport(args) {
  if (!args.received_on_from || !args.received_on_to) {
    throw new Error("Missing required arguments: received_on_from and received_on_to (format YYYY-MM-DD)");
  }
  if (args.properties) {
    const validationErrors = validatePropertiesIds(args.properties);
    throwOnValidationErrors(validationErrors);
  }
  const { unit_visibility = "active", ...rest } = args;
  const payload = { unit_visibility, ...rest };
  return makeAppfolioApiCall("prospect_source_tracking.json", payload);
}
var propertySourceTrackingInputSchema = import_zod28.z.object({
  properties: import_zod28.z.object({
    properties_ids: import_zod28.z.array(import_zod28.z.string()).optional().describe(getIdFieldDescription("properties_ids", "Property", "Property Directory Report")),
    property_groups_ids: import_zod28.z.array(import_zod28.z.string()).optional().describe(getIdFieldDescription("property_groups_ids", "Property Group")),
    portfolios_ids: import_zod28.z.array(import_zod28.z.string()).optional().describe(getIdFieldDescription("portfolios_ids", "Portfolio")),
    owners_ids: import_zod28.z.array(import_zod28.z.string()).optional().describe(getIdFieldDescription("owners_ids", "Owner", "Owner Directory Report"))
  }).optional().describe("Filter results based on properties, groups, portfolios, or owners. All ID fields must be numeric strings, not names."),
  unit_visibility: import_zod28.z.enum(["active", "hidden", "all"]).optional().describe('Filter units by status. Defaults to "active"'),
  received_on_from: import_zod28.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe("The start date for the reporting period based on received date (YYYY-MM-DD). Required."),
  received_on_to: import_zod28.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe("The end date for the reporting period based on received date (YYYY-MM-DD). Required."),
  columns: import_zod28.z.array(import_zod28.z.string()).optional().describe("Array of specific columns to include in the report")
});
function registerPropertySourceTrackingReportTool(server) {
  server.tool(
    "get_property_source_tracking_report",
    "Returns property source tracking report for the given filters. IMPORTANT: All ID parameters (owners_ids, properties_ids, etc.) must be numeric strings (e.g. '123'), NOT names. Use respective directory reports first to lookup IDs by name if needed.",
    propertySourceTrackingInputSchema.shape,
    async (args, _extra) => {
      const data = await getPropertySourceTrackingReport(args);
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
}

// src/reports/receivablesActivityReport.ts
var import_zod29 = require("zod");
var receivablesActivityArgsSchema = import_zod29.z.object({
  tenant_visibility: import_zod29.z.enum(["active", "inactive", "all"]).optional().describe('Filter tenants by status. Defaults to "active"'),
  tenant_statuses: import_zod29.z.array(import_zod29.z.string()).optional().describe('Filter by specific tenant statuses (e.g., ["0", "4"] for Current and Notice)'),
  property_visibility: import_zod29.z.enum(["active", "hidden", "all"]).optional().describe('Filter properties by status. Defaults to "active"'),
  properties: import_zod29.z.object({
    properties_ids: import_zod29.z.array(import_zod29.z.string()).optional().describe(getIdFieldDescription("properties_ids", "Property", "Property Directory Report")),
    property_groups_ids: import_zod29.z.array(import_zod29.z.string()).optional().describe(getIdFieldDescription("property_groups_ids", "Property Group")),
    portfolios_ids: import_zod29.z.array(import_zod29.z.string()).optional().describe(getIdFieldDescription("portfolios_ids", "Portfolio")),
    owners_ids: import_zod29.z.array(import_zod29.z.string()).optional().describe(getIdFieldDescription("owners_ids", "Owner", "Owner Directory Report"))
  }).optional().describe("Filter results based on properties, groups, portfolios, or owners. All ID fields must be numeric strings, not names."),
  receipt_date_from: import_zod29.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe("The start date for the reporting period based on receipt date (YYYY-MM-DD). Required."),
  receipt_date_to: import_zod29.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe("The end date for the reporting period based on receipt date (YYYY-MM-DD). Required."),
  manually_entered_only: import_zod29.z.enum(["0", "1"]).optional().describe('Include only manually entered receipts. Defaults to "0" (false)'),
  columns: import_zod29.z.array(import_zod29.z.string()).optional().describe("Array of specific columns to include in the report")
});
async function getReceivablesActivityReport(args) {
  if (!args.receipt_date_from || !args.receipt_date_to) {
    throw new Error("Missing required arguments: receipt_date_from and receipt_date_to (format YYYY-MM-DD)");
  }
  if (args.properties) {
    const validationErrors = validatePropertiesIds(args.properties);
    throwOnValidationErrors(validationErrors);
  }
  const {
    property_visibility = "active",
    manually_entered_only = "0",
    ...rest
  } = args;
  const payload = {
    property_visibility,
    manually_entered_only,
    ...rest
  };
  return makeAppfolioApiCall("receivables_activity.json", payload);
}
function registerReceivablesActivityReportTool(server) {
  server.tool(
    "get_receivables_activity_report",
    "Returns receivables activity report for the given filters. IMPORTANT: All ID parameters (owners_ids, properties_ids, etc.) must be numeric strings (e.g. '123'), NOT names. Use respective directory reports first to lookup IDs by name if needed.",
    receivablesActivityArgsSchema.shape,
    async (args, _extra) => {
      try {
        const parseResult = receivablesActivityArgsSchema.safeParse(args);
        if (!parseResult.success) {
          const errorMessages = parseResult.error.errors.map(
            (err) => `${err.path.join(".")}: ${err.message}`
          ).join("; ");
          throw new Error(`Invalid arguments: ${errorMessages}`);
        }
        const result = await getReceivablesActivityReport(parseResult.data);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
              mimeType: "application/json"
            }
          ]
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Receivables Activity Report Error:`, errorMessage);
        throw error;
      }
    }
  );
}

// src/reports/renewalSummaryReport.ts
var import_zod30 = require("zod");
var import_dotenv6 = __toESM(require("dotenv"));
import_dotenv6.default.config();
var RENEWAL_SUMMARY_COLUMNS = [
  "unit_name",
  "property",
  "property_name",
  "property_id",
  "property_address",
  "property_street",
  "property_street2",
  "property_city",
  "property_state",
  "property_zip",
  "unit_type",
  "unit_id",
  "occupancy_id",
  "tenant_name",
  "lease_start",
  "lease_end",
  "previous_lease_start",
  "previous_lease_end",
  "previous_rent",
  "rent",
  "respond_by_date",
  "renewal_sent_date",
  "countersigned_date",
  "automatic_renewal_date",
  "percent_difference",
  "dollar_difference",
  "status",
  "term",
  "lease_start_month",
  "tenant_id",
  "tenant_tags",
  "tenant_agent",
  "lease_uuid",
  "lease_document_uuid",
  "notice_given_date",
  "move_out"
];
var renewalStatusSchema = import_zod30.z.enum(["all", "Renewed", "Did Not Renew", "Month To Month", "Pending", "Cancelled by User"]);
var renewalSummaryArgsSchema = import_zod30.z.object({
  properties: import_zod30.z.object({
    properties_ids: import_zod30.z.array(import_zod30.z.string()).optional().describe(getIdFieldDescription("property", "Property Directory Report")),
    property_groups_ids: import_zod30.z.array(import_zod30.z.string()).optional().describe(getIdFieldDescription("property group", "Property Group Directory Report")),
    portfolios_ids: import_zod30.z.array(import_zod30.z.string()).optional().describe(getIdFieldDescription("portfolio", "Portfolio Directory Report")),
    owners_ids: import_zod30.z.array(import_zod30.z.string()).optional().describe(getIdFieldDescription("owner", "Owner Directory Report"))
  }).optional().describe("Filter results based on properties, groups, portfolios, or owners"),
  unit_visibility: import_zod30.z.enum(["active", "hidden", "all"]).default("active").describe('Filter units by status. Defaults to "active"'),
  start_on_from: import_zod30.z.string().regex(/^\d{4}-\d{2}$/, "Date must be in YYYY-MM format").describe("The start month for the reporting period based on lease start date (YYYY-MM). Required."),
  start_on_to: import_zod30.z.string().regex(/^\d{4}-\d{2}$/, "Date must be in YYYY-MM format").describe("The end month for the reporting period based on lease start date (YYYY-MM). Required."),
  statuses: import_zod30.z.array(renewalStatusSchema).optional().default(["all"]).describe('Filter by renewal status. Defaults to ["all"]'),
  include_tenant_transfers: import_zod30.z.enum(["0", "1"]).optional().describe('Include tenant transfers in the report. Defaults to "0" (false)'),
  columns: import_zod30.z.array(import_zod30.z.enum(RENEWAL_SUMMARY_COLUMNS)).optional().describe(`Array of specific columns to include in the report. Valid columns: ${RENEWAL_SUMMARY_COLUMNS.join(", ")}. If not specified, all columns are returned.`)
});
async function getRenewalSummaryReport(args) {
  if (args.properties) {
    const validationErrors = validatePropertiesIds(args.properties);
    throwOnValidationErrors(validationErrors);
  }
  if (!args.start_on_from || !args.start_on_to) {
    throw new Error("Missing required arguments: start_on_from and start_on_to (format YYYY-MM)");
  }
  const { unit_visibility = "active", statuses = ["all"], include_tenant_transfers = "0", ...rest } = args;
  const payload = {
    unit_visibility,
    statuses,
    include_tenant_transfers,
    ...rest
  };
  return makeAppfolioApiCall("renewal_summary.json", payload);
}
function registerRenewalSummaryReportTool(server) {
  server.tool(
    "get_renewal_summary_report",
    `Provides a summary of lease renewals. IMPORTANT: All ID parameters (properties_ids, property_groups_ids, portfolios_ids, owners_ids) must be numeric strings (e.g. '123'), NOT names. Use respective directory reports first to lookup IDs by name if needed. NOTE: All string parameters should be properly quoted JSON strings (e.g. "active", not active).`,
    renewalSummaryArgsSchema.shape,
    async (args, _extra) => {
      try {
        console.log("Renewal Summary Report - Raw args received:", JSON.stringify(args, null, 2));
        const parseResult = renewalSummaryArgsSchema.safeParse(args);
        if (!parseResult.success) {
          const errorMessages = parseResult.error.errors.map(
            (err) => `${err.path.join(".")}: ${err.message}`
          ).join("; ");
          console.error("Renewal Summary Report - Schema validation failed:", errorMessages);
          throw new Error(`Invalid arguments: ${errorMessages}. Note: All string values should be properly quoted in JSON format (e.g. "active", not active).`);
        }
        const result = await getRenewalSummaryReport(parseResult.data);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
              mimeType: "application/json"
            }
          ]
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Renewal Summary Report Error:`, errorMessage);
        throw error;
      }
    }
  );
}

// src/reports/vendorLedgerReport.ts
var import_zod31 = require("zod");
var vendorLedgerInputSchema = import_zod31.z.object({
  vendor_id: import_zod31.z.string().describe("Required. The ID of the vendor (company)."),
  property_visibility: import_zod31.z.enum(["active", "hidden", "all"]).optional().default("active").describe('Filter properties by status. Defaults to "active"'),
  properties: import_zod31.z.object({
    properties_ids: import_zod31.z.array(import_zod31.z.string()).optional().describe("Filter by specific property IDs"),
    property_groups_ids: import_zod31.z.array(import_zod31.z.string()).optional().describe("Filter by property group IDs"),
    portfolios_ids: import_zod31.z.array(import_zod31.z.string()).optional().describe("Filter by portfolio IDs"),
    owners_ids: import_zod31.z.array(import_zod31.z.string()).optional().describe("Filter by owner IDs")
  }).optional(),
  occurred_on_from: import_zod31.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe("Required. The start date for the reporting period (YYYY-MM-DD)."),
  occurred_on_to: import_zod31.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe("Required. The end date for the reporting period (YYYY-MM-DD)."),
  reverse_transaction: import_zod31.z.union([import_zod31.z.boolean(), import_zod31.z.string()]).optional().default(false).transform((val) => {
    if (typeof val === "string") return val === "true" || val === "1" ? "1" : "0";
    return val ? "1" : "0";
  }).describe("Include reversed transactions. Defaults to false."),
  columns: import_zod31.z.array(import_zod31.z.string()).optional().describe("Array of specific columns to include in the report")
});
async function getVendorLedgerReport(args) {
  if (!args.vendor_id) {
    throw new Error("Missing required argument: vendor_id");
  }
  const { occurred_on_from, occurred_on_to, ...rest } = args;
  const payload = { occurred_on_from, occurred_on_to, ...rest };
  return makeAppfolioApiCall("vendor_ledger.json", payload);
}
function registerVendorLedgerReportTool(server) {
  server.tool(
    "get_vendor_ledger_report",
    "Generates a report on vendor ledgers.",
    vendorLedgerInputSchema.shape,
    async (args, _extra) => {
      try {
        const parseResult = vendorLedgerInputSchema.safeParse(args);
        if (!parseResult.success) {
          const errorMessages = parseResult.error.errors.map(
            (err) => `${err.path.join(".")}: ${err.message}`
          ).join("; ");
          throw new Error(`Invalid arguments: ${errorMessages}`);
        }
        const result = await getVendorLedgerReport(parseResult.data);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
              mimeType: "application/json"
            }
          ]
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Vendor Ledger Report Error:`, errorMessage);
        throw error;
      }
    }
  );
}

// src/reports/rentalApplicationsReport.ts
var import_zod32 = require("zod");
var rentalApplicationsInputSchema = import_zod32.z.object({
  property_visibility: import_zod32.z.enum(["active", "hidden", "all"]).optional().default("active"),
  properties: import_zod32.z.object({
    properties_ids: import_zod32.z.array(import_zod32.z.string()).optional().describe(getIdFieldDescription("properties_ids", "Property", "Property Directory Report")),
    property_groups_ids: import_zod32.z.array(import_zod32.z.string()).optional().describe(getIdFieldDescription("property_groups_ids", "Property Group")),
    portfolios_ids: import_zod32.z.array(import_zod32.z.string()).optional().describe(getIdFieldDescription("portfolios_ids", "Portfolio")),
    owners_ids: import_zod32.z.array(import_zod32.z.string()).optional().describe(getIdFieldDescription("owners_ids", "Owner", "Owner Directory Report"))
  }).optional().describe("Filter results based on properties, groups, portfolios, or owners. All ID fields must be numeric strings, not names."),
  received_on_from: import_zod32.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional(),
  received_on_to: import_zod32.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional(),
  statuses: import_zod32.z.array(import_zod32.z.string()).optional(),
  sources: import_zod32.z.array(import_zod32.z.string()).optional(),
  columns: import_zod32.z.array(import_zod32.z.string()).optional()
});
async function getRentalApplicationsReport(args) {
  if (!args.received_on_from || !args.received_on_to) {
    throw new Error("Missing required arguments: received_on_from and received_on_to (format YYYY-MM-DD)");
  }
  if (args.properties) {
    const validationErrors = validatePropertiesIds(args.properties);
    throwOnValidationErrors(validationErrors);
  }
  const { property_visibility = "active", ...rest } = args;
  const payload = { property_visibility, ...rest };
  return makeAppfolioApiCall("rental_applications.json", payload);
}
function registerRentalApplicationsReportTool(server) {
  server.tool(
    "get_rental_applications_report",
    "Returns rental applications report for the given filters. IMPORTANT: All ID parameters (owners_ids, properties_ids, etc.) must be numeric strings (e.g. '123'), NOT names. Use respective directory reports first to lookup IDs by name if needed.",
    rentalApplicationsInputSchema.shape,
    async (args, _extra) => {
      const data = await getRentalApplicationsReport(args);
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
}

// src/reports/residentFinancialActivityReport.ts
var import_zod33 = require("zod");
var residentFinancialActivityInputSchema = import_zod33.z.object({
  property_visibility: import_zod33.z.enum(["active", "hidden", "all"]).optional().default("active"),
  properties: import_zod33.z.object({
    properties_ids: import_zod33.z.array(import_zod33.z.string()).optional().describe(getIdFieldDescription("properties_ids", "Property", "Property Directory Report")),
    property_groups_ids: import_zod33.z.array(import_zod33.z.string()).optional().describe(getIdFieldDescription("property_groups_ids", "Property Group")),
    portfolios_ids: import_zod33.z.array(import_zod33.z.string()).optional().describe(getIdFieldDescription("portfolios_ids", "Portfolio")),
    owners_ids: import_zod33.z.array(import_zod33.z.string()).optional().describe(getIdFieldDescription("owners_ids", "Owner", "Owner Directory Report"))
  }).optional().describe("Filter results based on properties, groups, portfolios, or owners. All ID fields must be numeric strings, not names."),
  occurred_on_from: import_zod33.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  occurred_on_to: import_zod33.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  include_voided: import_zod33.z.boolean().optional().default(false),
  columns: import_zod33.z.array(import_zod33.z.string()).optional()
});
async function getResidentFinancialActivityReport(args) {
  if (!args.occurred_on_from || !args.occurred_on_to) {
    throw new Error("Missing required arguments: occurred_on_from and occurred_on_to (format YYYY-MM-DD)");
  }
  if (args.properties) {
    const validationErrors = validatePropertiesIds(args.properties);
    throwOnValidationErrors(validationErrors);
  }
  const { property_visibility = "active", ...rest } = args;
  const payload = { property_visibility, ...rest };
  return makeAppfolioApiCall("resident_financial_activity.json", payload);
}
function registerResidentFinancialActivityReportTool(server) {
  server.tool(
    "get_resident_financial_activity_report",
    "Returns resident financial activity report for the given filters. IMPORTANT: All ID parameters (owners_ids, properties_ids, etc.) must be numeric strings (e.g. '123'), NOT names. Use respective directory reports first to lookup IDs by name if needed.",
    residentFinancialActivityInputSchema.shape,
    async (args, _extra) => {
      try {
        const parseResult = residentFinancialActivityInputSchema.safeParse(args);
        if (!parseResult.success) {
          const errorMessages = parseResult.error.errors.map(
            (err) => `${err.path.join(".")}: ${err.message}`
          ).join("; ");
          throw new Error(`Invalid arguments: ${errorMessages}`);
        }
        const result = await getResidentFinancialActivityReport(parseResult.data);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
              mimeType: "application/json"
            }
          ]
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Resident Financial Activity Report Error:`, errorMessage);
        throw error;
      }
    }
  );
}

// src/reports/screeningAssessmentReport.ts
var import_zod34 = require("zod");
var screeningAssessmentInputSchema = import_zod34.z.object({
  property_visibility: import_zod34.z.enum(["active", "hidden", "all"]).optional().default("active"),
  properties: import_zod34.z.object({
    properties_ids: import_zod34.z.array(import_zod34.z.string()).optional(),
    property_groups_ids: import_zod34.z.array(import_zod34.z.string()).optional(),
    portfolios_ids: import_zod34.z.array(import_zod34.z.string()).optional(),
    owners_ids: import_zod34.z.array(import_zod34.z.string()).optional()
  }).optional(),
  screening_date_from: import_zod34.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional(),
  screening_date_to: import_zod34.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional(),
  statuses: import_zod34.z.array(import_zod34.z.string()).optional(),
  decision_statuses: import_zod34.z.array(import_zod34.z.string()).optional(),
  columns: import_zod34.z.array(import_zod34.z.string()).optional()
});
async function getScreeningAssessmentReport(args) {
  const { property_visibility = "active", ...rest } = args;
  const payload = { property_visibility, ...rest };
  return makeAppfolioApiCall("screening_assessment.json", payload);
}
function registerScreeningAssessmentReportTool(server) {
  server.tool(
    "get_screening_assessment_report",
    "Returns screening assessment report for the given filters.",
    screeningAssessmentInputSchema.shape,
    async (args, _extra) => {
      try {
        const parseResult = screeningAssessmentInputSchema.safeParse(args);
        if (!parseResult.success) {
          const errorMessages = parseResult.error.errors.map(
            (err) => `${err.path.join(".")}: ${err.message}`
          ).join("; ");
          throw new Error(`Invalid arguments: ${errorMessages}`);
        }
        const result = await getScreeningAssessmentReport(parseResult.data);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
              mimeType: "application/json"
            }
          ]
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Screening Assessment Report Error:`, errorMessage);
        throw error;
      }
    }
  );
}

// src/reports/securityDepositFundsDetailReport.ts
var import_zod35 = require("zod");
var securityDepositFundsDetailInputSchema = import_zod35.z.object({
  property_visibility: import_zod35.z.enum(["active", "hidden", "all"]).optional().default("active"),
  properties: import_zod35.z.object({
    properties_ids: import_zod35.z.array(import_zod35.z.string()).optional(),
    property_groups_ids: import_zod35.z.array(import_zod35.z.string()).optional(),
    portfolios_ids: import_zod35.z.array(import_zod35.z.string()).optional(),
    owners_ids: import_zod35.z.array(import_zod35.z.string()).optional()
  }).optional(),
  as_of_date: import_zod35.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  include_voided: import_zod35.z.boolean().optional().default(false),
  columns: import_zod35.z.array(import_zod35.z.string()).optional()
});
async function getSecurityDepositFundsDetailReport(args) {
  return makeAppfolioApiCall("security_deposit_funds_detail.json", args);
}
function registerSecurityDepositFundsDetailReportTool(server) {
  server.tool(
    "get_security_deposit_funds_detail_report",
    "Returns security deposit funds detail report for the given filters.",
    securityDepositFundsDetailInputSchema.shape,
    async (args, _extra) => {
      try {
        const parseResult = securityDepositFundsDetailInputSchema.safeParse(args);
        if (!parseResult.success) {
          const errorMessages = parseResult.error.errors.map(
            (err) => `${err.path.join(".")}: ${err.message}`
          ).join("; ");
          throw new Error(`Invalid arguments: ${errorMessages}`);
        }
        const result = await getSecurityDepositFundsDetailReport(parseResult.data);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
              mimeType: "application/json"
            }
          ]
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Security Deposit Funds Detail Report Error:`, errorMessage);
        throw error;
      }
    }
  );
}

// src/reports/tenantDirectoryReport.ts
var import_zod36 = require("zod");
var tenantDirectoryInputSchema = import_zod36.z.object({
  tenant_visibility: import_zod36.z.enum(["active", "inactive", "all"]).optional().default("active"),
  tenant_types: import_zod36.z.array(import_zod36.z.string()).optional().default(["all"]),
  property_visibility: import_zod36.z.enum(["active", "hidden", "all"]).optional().default("active"),
  properties: import_zod36.z.object({
    properties_ids: import_zod36.z.array(import_zod36.z.string()).optional().describe(getIdFieldDescription("property", "Property Directory Report")),
    property_groups_ids: import_zod36.z.array(import_zod36.z.string()).optional().describe(getIdFieldDescription("property group", "Property Directory Report")),
    portfolios_ids: import_zod36.z.array(import_zod36.z.string()).optional().describe(getIdFieldDescription("portfolio", "Property Directory Report")),
    owners_ids: import_zod36.z.array(import_zod36.z.string()).optional().describe(getIdFieldDescription("owner", "Owner Directory Report"))
  }).optional(),
  columns: import_zod36.z.array(import_zod36.z.string()).optional()
});
async function getTenantDirectoryReport(args) {
  if (args.properties) {
    const validationErrors = validatePropertiesIds(args.properties);
    throwOnValidationErrors(validationErrors);
  }
  const { tenant_visibility = "active", ...rest } = args;
  const payload = { tenant_visibility, ...rest };
  return makeAppfolioApiCall("tenant_directory.json", payload);
}
function registerTenantDirectoryReportTool(server) {
  server.tool(
    "get_tenant_directory_report",
    "Returns tenant directory report for the given filters. IMPORTANT: All ID parameters (properties_ids, owners_ids, etc.) must be numeric strings (e.g. '123'), NOT names. Use respective directory reports first to lookup IDs by name if needed.",
    tenantDirectoryInputSchema.shape,
    async (args, _extra) => {
      try {
        const parseResult = tenantDirectoryInputSchema.safeParse(args);
        if (!parseResult.success) {
          const errorMessages = parseResult.error.errors.map(
            (err) => `${err.path.join(".")}: ${err.message}`
          ).join("; ");
          throw new Error(`Invalid arguments: ${errorMessages}`);
        }
        const result = await getTenantDirectoryReport(parseResult.data);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
              mimeType: "application/json"
            }
          ]
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Tenant Directory Report Error:`, errorMessage);
        throw error;
      }
    }
  );
}

// src/reports/tenantLedgerReport.ts
var import_zod37 = require("zod");
var tenantLedgerArgsSchema = import_zod37.z.object({
  parties_ids: import_zod37.z.object({
    occupancies_ids: import_zod37.z.array(import_zod37.z.string()).nonempty("At least one occupancy ID is required").describe("Required. Array of occupancy IDs to filter by.")
  }).describe("Required. Specify the occupancies to include."),
  occurred_on_from: import_zod37.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe("Required. The start date for the reporting period (YYYY-MM-DD)."),
  occurred_on_to: import_zod37.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe("Required. The end date for the reporting period (YYYY-MM-DD)."),
  transactions_shown: import_zod37.z.enum(["tenant", "owner", "all"]).optional().default("tenant").describe('Filter transactions shown. Defaults to "tenant"'),
  columns: import_zod37.z.array(import_zod37.z.string()).optional().describe("Array of specific columns to include in the report")
});
async function getTenantLedgerReport(args) {
  if (!args.parties_ids?.occupancies_ids || args.parties_ids.occupancies_ids.length === 0) {
    throw new Error("Missing required argument: parties_ids.occupancies_ids must contain at least one ID");
  }
  if (!args.occurred_on_from || !args.occurred_on_to) {
    throw new Error("Missing required arguments: occurred_on_from and occurred_on_to (format YYYY-MM-DD)");
  }
  const { transactions_shown = "tenant", ...rest } = args;
  const payload = { transactions_shown, ...rest };
  return makeAppfolioApiCall("tenant_ledger.json", payload);
}
function registerTenantLedgerReportTool(server) {
  server.tool(
    "get_tenant_ledger_report",
    "Generates a report on tenant ledgers.",
    tenantLedgerArgsSchema.shape,
    async (args, _extra) => {
      try {
        const parseResult = tenantLedgerArgsSchema.safeParse(args);
        if (!parseResult.success) {
          const errorMessages = parseResult.error.errors.map(
            (err) => `${err.path.join(".")}: ${err.message}`
          ).join("; ");
          throw new Error(`Invalid arguments: ${errorMessages}`);
        }
        const result = await getTenantLedgerReport(parseResult.data);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
              mimeType: "application/json"
            }
          ]
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Tenant Ledger Report Error:`, errorMessage);
        throw error;
      }
    }
  );
}

// src/reports/propertyDirectoryReport.ts
var import_zod38 = require("zod");
var PROPERTY_DIRECTORY_COLUMNS = [
  "property",
  "property_name",
  "property_id",
  "property_integration_id",
  "property_address",
  "property_street",
  "property_street2",
  "property_city",
  "property_state",
  "property_zip",
  "property_county",
  "market_rent",
  "units",
  "sqft",
  "management_flat_fee",
  "management_fee_percent",
  "minimum_fee",
  "maximum_fee",
  "waive_fees_when_vacant",
  "reserve",
  "home_warranty_expiration",
  "insurance_expiration",
  "tax_year_end",
  "tax_authority",
  "owners_phone_number",
  "payer_name",
  "description",
  "portfolio",
  "premium_leads_status",
  "premium_leads_monthly_cap",
  "premium_leads_activation_date",
  "owner_i_ds",
  "property_group_id",
  "portfolio_id",
  "portfolio_uuid",
  "visibility",
  "maintenance_limit",
  "maintenance_notes",
  "site_manager_name",
  "site_manager_phone_number",
  "management_fee_type",
  "lease_fee_type",
  "lease_flat_fee",
  "lease_fee_percent",
  "renewal_fee_type",
  "renewal_flat_fee",
  "renewal_fee_percent",
  "future_management_fee_start_date",
  "future_management_fee_percent",
  "future_management_flat_fee",
  "future_minimum_fee",
  "future_maximum_fee",
  "future_management_fee_type",
  "future_waive_fees_when_vacant",
  "owner_payment_type",
  "property_type",
  "property_created_on",
  "property_created_by",
  "owners",
  "prepayment_type",
  "late_fee_type",
  "late_fee_base_amount",
  "late_fee_daily_amount",
  "late_fee_grace_period",
  "late_fee_grace_period_fixed_day",
  "late_fee_grace_balance",
  "max_daily_late_fees_amount",
  "ignore_partial_payments",
  "admin_fee_amount",
  "year_built",
  "contract_expirations",
  "management_start_date",
  "management_end_date",
  "management_end_reason",
  "agent_of_record",
  "tax_region_code",
  "property_class",
  "online_maintenance_request_instructions",
  "amenities",
  "listing_type"
];
var propertyDirectoryArgsSchema = import_zod38.z.object({
  property_visibility: import_zod38.z.enum(["active", "hidden", "all"]).default("active").describe('Filter properties by status. Defaults to "active"'),
  properties: import_zod38.z.object({
    properties_ids: import_zod38.z.array(import_zod38.z.string()).optional().describe("Array of property IDs (numeric strings, NOT property names)"),
    property_groups_ids: import_zod38.z.array(import_zod38.z.string()).optional().describe("Array of property group IDs (numeric strings, NOT group names)"),
    portfolios_ids: import_zod38.z.array(import_zod38.z.string()).optional().describe("Array of portfolio IDs (numeric strings, NOT portfolio names)"),
    owners_ids: import_zod38.z.array(import_zod38.z.string()).optional().describe("Array of owner IDs (numeric strings, NOT owner names). Use Owner Directory Report to lookup owner IDs by name first if needed.")
  }).optional().describe("Filter results based on property, group, portfolio, or owner IDs. All values must be numeric ID strings, not names."),
  columns: import_zod38.z.array(import_zod38.z.enum(PROPERTY_DIRECTORY_COLUMNS)).optional().describe(`Array of specific columns to include in the report. Valid columns: ${PROPERTY_DIRECTORY_COLUMNS.join(", ")}. If not specified, all columns are returned.`)
});
async function getPropertyDirectoryReport(args) {
  const validationErrors = validatePropertiesIds(args.properties);
  throwOnValidationErrors(validationErrors);
  const { property_visibility = "active", ...rest } = args;
  const payload = { property_visibility, ...rest };
  return makeAppfolioApiCall("property_directory.json", payload);
}
function registerPropertyDirectoryReportTool(server) {
  server.tool(
    "get_property_directory_report",
    "Retrieves a property directory report with details about properties, including status, address, units count, and owner information. IMPORTANT: All ID parameters (owners_ids, properties_ids, etc.) must be numeric strings (e.g. '123'), NOT names. Use Owner Directory Report first to lookup owner IDs by name if needed.",
    propertyDirectoryArgsSchema.shape,
    async (args, _extra) => {
      try {
        const parseResult = propertyDirectoryArgsSchema.safeParse(args);
        if (!parseResult.success) {
          const errorMessages = parseResult.error.errors.map(
            (err) => `${err.path.join(".")}: ${err.message}`
          ).join("; ");
          throw new Error(`Invalid arguments: ${errorMessages}`);
        }
        const result = await getPropertyDirectoryReport(parseResult.data);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
              mimeType: "application/json"
            }
          ]
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Property Directory Report Error:`, errorMessage);
        throw error;
      }
    }
  );
}

// src/reports/cashflow12MonthReport.ts
var import_zod39 = require("zod");
var cashflow12MonthToolSchema = {
  property_visibility: import_zod39.z.enum(["active", "hidden", "all"]).optional().default("active").describe('Filter properties by status. Defaults to "active"'),
  ...flatPropertyFilterSchema,
  posted_on_from: import_zod39.z.string().regex(/^\d{4}-\d{2}$/, "Date must be in YYYY-MM format").describe("Required. The start month for the reporting period (YYYY-MM)."),
  posted_on_to: import_zod39.z.string().regex(/^\d{4}-\d{2}$/, "Date must be in YYYY-MM format").describe("Required. The end month for the reporting period (YYYY-MM)."),
  gl_account_map_id: import_zod39.z.string().optional().describe("Optional. Filter by a specific GL Account Map ID."),
  level_of_detail: import_zod39.z.enum(["detail_view", "summary_view"]).optional().default("detail_view").describe('Level of detail. Defaults to "detail_view"'),
  include_zero_balance_gl_accounts: import_zod39.z.enum(["0", "1"]).optional().default("0").describe('Include GL accounts with zero balance. Defaults to "0"'),
  exclude_suppressed_fees: import_zod39.z.enum(["0", "1"]).optional().default("0").describe('Exclude suppressed fees. Defaults to "0"'),
  columns: import_zod39.z.array(import_zod39.z.string()).optional().describe("Array of specific columns to include")
};
var cashflow12MonthValidationSchema = import_zod39.z.object({
  property_visibility: import_zod39.z.enum(["active", "hidden", "all"]).optional().default("active"),
  properties_ids: import_zod39.z.array(import_zod39.z.string()).optional(),
  property_groups_ids: import_zod39.z.array(import_zod39.z.string()).optional(),
  portfolios_ids: import_zod39.z.array(import_zod39.z.string()).optional(),
  owners_ids: import_zod39.z.array(import_zod39.z.string()).optional(),
  posted_on_from: import_zod39.z.string(),
  posted_on_to: import_zod39.z.string(),
  gl_account_map_id: import_zod39.z.string().optional(),
  level_of_detail: import_zod39.z.enum(["detail_view", "summary_view"]).optional().default("detail_view"),
  include_zero_balance_gl_accounts: import_zod39.z.enum(["0", "1"]).optional().default("0"),
  exclude_suppressed_fees: import_zod39.z.enum(["0", "1"]).optional().default("0"),
  columns: import_zod39.z.array(import_zod39.z.string()).optional()
});
async function getCashflow12MonthReport(args) {
  if (!args.posted_on_from || !args.posted_on_to) {
    throw new Error("Missing required arguments: posted_on_from and posted_on_to (format YYYY-MM)");
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
  return makeAppfolioApiCall("twelve_month_cash_flow.json", payload);
}
function registerCashflow12MonthReportTool(server) {
  server.tool(
    "get_cashflow_12_month_report",
    "Generates a 12-month cash flow report.",
    cashflow12MonthToolSchema,
    async (args, _extra) => {
      try {
        const parseResult = cashflow12MonthValidationSchema.safeParse(args);
        if (!parseResult.success) {
          const errorMessages = parseResult.error.errors.map(
            (err) => `${err.path.join(".")}: ${err.message}`
          ).join("; ");
          throw new Error(`Invalid arguments: ${errorMessages}`);
        }
        const apiArgs = transformToNestedProperties(parseResult.data);
        const result = await getCashflow12MonthReport(apiArgs);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
              mimeType: "application/json"
            }
          ]
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Cashflow 12 Month Report Error:`, errorMessage);
        throw error;
      }
    }
  );
}

// src/reports/incomeStatement12MonthReport.ts
var import_zod40 = require("zod");
var incomeStatement12MonthArgsSchema = import_zod40.z.object({
  property_visibility: import_zod40.z.enum(["active", "hidden", "all"]).optional().default("active").describe('Filter properties by status. Defaults to "active"'),
  properties: import_zod40.z.object({
    properties_ids: import_zod40.z.array(import_zod40.z.string()).optional(),
    property_groups_ids: import_zod40.z.array(import_zod40.z.string()).optional(),
    portfolios_ids: import_zod40.z.array(import_zod40.z.string()).optional(),
    owners_ids: import_zod40.z.array(import_zod40.z.string()).optional()
  }).optional().describe("Filter results based on properties, groups, portfolios, or owners"),
  fund_type: import_zod40.z.enum(["all", "operating", "escrow"]).optional().default("all").describe('Filter by fund type. Defaults to "all"'),
  posted_on_from: import_zod40.z.string().regex(/^\d{4}-\d{2}$/, "Date must be in YYYY-MM format").describe("Required. The start month for the reporting period (YYYY-MM)."),
  posted_on_to: import_zod40.z.string().regex(/^\d{4}-\d{2}$/, "Date must be in YYYY-MM format").describe("Required. The end month for the reporting period (YYYY-MM)."),
  gl_account_map_id: import_zod40.z.string().optional().describe("Optional. Filter by a specific GL Account Map ID."),
  level_of_detail: import_zod40.z.enum(["detail_view", "summary_view"]).optional().default("detail_view").describe('Level of detail. Defaults to "detail_view"'),
  include_zero_balance_gl_accounts: import_zod40.z.union([import_zod40.z.boolean(), import_zod40.z.string()]).optional().default(false).transform((val) => {
    if (typeof val === "string") return val === "true" || val === "1" ? "1" : "0";
    return val ? "1" : "0";
  }).describe("Include GL accounts with zero balance. Defaults to false."),
  columns: import_zod40.z.array(import_zod40.z.string()).optional().describe("Array of specific columns to include in the report")
});
async function getIncomeStatement12MonthReport(args) {
  if (!args.posted_on_from || !args.posted_on_to) {
    throw new Error("Missing required arguments: posted_on_from and posted_on_to (format YYYY-MM)");
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
  return makeAppfolioApiCall("twelve_month_income_statement.json", payload);
}
function registerIncomeStatement12MonthReportTool(server) {
  server.tool(
    "get_income_statement_12_month_report",
    "Generates a 12-month income statement report.",
    incomeStatement12MonthArgsSchema.shape,
    async (args, _extra) => {
      try {
        const parseResult = incomeStatement12MonthArgsSchema.safeParse(args);
        if (!parseResult.success) {
          const errorMessages = parseResult.error.errors.map(
            (err) => `${err.path.join(".")}: ${err.message}`
          ).join("; ");
          throw new Error(`Invalid arguments: ${errorMessages}`);
        }
        const result = await getIncomeStatement12MonthReport(parseResult.data);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
              mimeType: "application/json"
            }
          ]
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Income Statement 12 Month Report Error:`, errorMessage);
        throw error;
      }
    }
  );
}

// src/reports/unitDirectoryReport.ts
var import_zod41 = require("zod");
var unitDirectoryArgsSchema = import_zod41.z.object({
  properties: import_zod41.z.object({
    properties_ids: import_zod41.z.array(import_zod41.z.string()).optional().describe(getIdFieldDescription("properties_ids", "Property", "Property Directory Report")),
    property_groups_ids: import_zod41.z.array(import_zod41.z.string()).optional().describe(getIdFieldDescription("property_groups_ids", "Property Group")),
    portfolios_ids: import_zod41.z.array(import_zod41.z.string()).optional().describe(getIdFieldDescription("portfolios_ids", "Portfolio")),
    owners_ids: import_zod41.z.array(import_zod41.z.string()).optional().describe(getIdFieldDescription("owners_ids", "Owner", "Owner Directory Report"))
  }).optional().describe("Filter results based on properties, groups, portfolios, or owners. All ID fields must be numeric strings, not names."),
  unit_visibility: import_zod41.z.enum(["active", "hidden", "all"]).optional().default("active").describe('Filter units by status. Defaults to "active"'),
  tags: import_zod41.z.string().optional().describe('Optional. Filter by a comma-separated list of tags (e.g., "bbq,deck").'),
  columns: import_zod41.z.array(import_zod41.z.string()).optional().describe("Array of specific columns to include in the report")
});
async function getUnitDirectoryReport(args) {
  if (args.properties) {
    const validationErrors = validatePropertiesIds(args.properties);
    throwOnValidationErrors(validationErrors);
  }
  const { unit_visibility = "active", ...rest } = args;
  const payload = { unit_visibility, ...rest };
  return makeAppfolioApiCall("unit_directory.json", payload);
}
function registerUnitDirectoryReportTool(server) {
  server.tool(
    "get_unit_directory_report",
    "Retrieves a unit directory report with details about units in properties. IMPORTANT: All ID parameters (owners_ids, properties_ids, etc.) must be numeric strings (e.g. '123'), NOT names. Use respective directory reports first to lookup IDs by name if needed.",
    unitDirectoryArgsSchema.shape,
    async (args, _extra) => {
      try {
        const parseResult = unitDirectoryArgsSchema.safeParse(args);
        if (!parseResult.success) {
          const errorMessages = parseResult.error.errors.map(
            (err) => `${err.path.join(".")}: ${err.message}`
          ).join("; ");
          throw new Error(`Invalid arguments: ${errorMessages}`);
        }
        const result = await getUnitDirectoryReport(parseResult.data);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
              mimeType: "application/json"
            }
          ]
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Unit Directory Report Error:`, errorMessage);
        throw error;
      }
    }
  );
}

// src/reports/unitInspectionReport.ts
var import_zod42 = require("zod");
var unitInspectionArgsSchema = import_zod42.z.object({
  properties: import_zod42.z.object({
    properties_ids: import_zod42.z.array(import_zod42.z.string()).optional().describe(getIdFieldDescription("properties_ids", "Property", "Property Directory Report")),
    property_groups_ids: import_zod42.z.array(import_zod42.z.string()).optional().describe(getIdFieldDescription("property_groups_ids", "Property Group")),
    portfolios_ids: import_zod42.z.array(import_zod42.z.string()).optional().describe(getIdFieldDescription("portfolios_ids", "Portfolio")),
    owners_ids: import_zod42.z.array(import_zod42.z.string()).optional().describe(getIdFieldDescription("owners_ids", "Owner", "Owner Directory Report"))
  }).optional().describe("Filter results based on properties, groups, portfolios, or owners. All ID fields must be numeric strings, not names."),
  unit_visibility: import_zod42.z.enum(["active", "hidden", "all"]).optional().default("active").describe('Filter units by status. Defaults to "active"'),
  last_inspection_on_from: import_zod42.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional().describe("Optional. Filter units last inspected on or after this date (YYYY-MM-DD)."),
  include_blank_inspection_date: import_zod42.z.union([import_zod42.z.boolean(), import_zod42.z.string()]).optional().default(false).transform((val) => {
    if (typeof val === "string") return val === "true" || val === "1" ? "1" : "0";
    return val ? "1" : "0";
  }).describe("Include units with no inspection date. Defaults to false."),
  columns: import_zod42.z.array(import_zod42.z.string()).optional().describe("Array of specific columns to include in the report")
});
async function getUnitInspectionReport(args) {
  if (args.properties) {
    const validationErrors = validatePropertiesIds(args.properties);
    throwOnValidationErrors(validationErrors);
  }
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
  return makeAppfolioApiCall("unit_inspection.json", payload);
}
function registerUnitInspectionReportTool(server) {
  server.tool(
    "get_unit_inspection_report",
    "Generates a report on unit inspections. IMPORTANT: All ID parameters (owners_ids, properties_ids, etc.) must be numeric strings (e.g. '123'), NOT names. Use respective directory reports first to lookup IDs by name if needed.",
    unitInspectionArgsSchema.shape,
    async (args, _extra) => {
      const data = await getUnitInspectionReport(args);
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
}

// src/reports/unitVacancyDetail.ts
var import_zod43 = require("zod");
var UNIT_VACANCY_DETAIL_COLUMNS = [
  "advertised_rent",
  "posted_to_website",
  "posted_to_internet",
  "property",
  "property_name",
  "amenities",
  "lockbox_enabled",
  "affordable_program",
  "address",
  "street",
  "street2",
  "city",
  "state",
  "zip",
  "unit",
  "unit_tags",
  "unit_type",
  "bed_and_bath",
  "sqft",
  "unit_status",
  "rent_ready",
  "days_vacant",
  "last_rent",
  "schd_rent",
  "new_rent",
  "last_move_in",
  "last_move_out",
  "available_on",
  "next_move_in",
  "description",
  "amenities_price",
  "computed_market_rent",
  "ready_for_showing_on",
  "unit_turn_target_date",
  "advertised_rent_months",
  "property_id",
  "unit_id"
];
var unitVacancyDetailArgsSchema = import_zod43.z.object({
  properties: import_zod43.z.object({
    properties_ids: import_zod43.z.array(import_zod43.z.string()).optional().describe(getIdFieldDescription("properties_ids", "Property", "Property Directory Report")),
    property_groups_ids: import_zod43.z.array(import_zod43.z.string()).optional().describe(getIdFieldDescription("property_groups_ids", "Property Group")),
    portfolios_ids: import_zod43.z.array(import_zod43.z.string()).optional().describe(getIdFieldDescription("portfolios_ids", "Portfolio")),
    owners_ids: import_zod43.z.array(import_zod43.z.string()).optional().describe(getIdFieldDescription("owners_ids", "Owner", "Owner Directory Report"))
  }).optional().describe("Filter results based on properties, groups, portfolios, or owners. All ID fields must be numeric strings, not names."),
  property_visibility: import_zod43.z.enum(["active", "hidden", "all"]).optional().default("active").describe('Filter units by status. Defaults to "active"'),
  tags: import_zod43.z.string().optional().describe('Optional. Filter by a comma-separated list of tags (e.g., "bbq,deck").'),
  columns: import_zod43.z.array(import_zod43.z.enum(UNIT_VACANCY_DETAIL_COLUMNS)).optional().describe(`Array of specific columns to include in the report. Valid columns: ${UNIT_VACANCY_DETAIL_COLUMNS.join(", ")}. If not specified, all columns are returned.`)
});
async function getUnitVacancyDetailReport(args) {
  if (args.properties) {
    const validationErrors = validatePropertiesIds(args.properties);
    throwOnValidationErrors(validationErrors);
  }
  const { property_visibility = "active", ...rest } = args;
  const payload = { property_visibility, ...rest };
  return makeAppfolioApiCall("unit_vacancy.json", payload);
}
function registerUnitVacancyDetailReportTool(server) {
  server.tool(
    "get_unit_vacancy_detail_report",
    "Generates a report on unit vacancies. IMPORTANT: All ID parameters (owners_ids, properties_ids, etc.) must be numeric strings (e.g. '123'), NOT names. Use respective directory reports first to lookup IDs by name if needed.",
    unitVacancyDetailArgsSchema.shape,
    async (args, _extra) => {
      try {
        const parseResult = unitVacancyDetailArgsSchema.safeParse(args);
        if (!parseResult.success) {
          const errorMessages = parseResult.error.errors.map(
            (err) => `${err.path.join(".")}: ${err.message}`
          ).join("; ");
          throw new Error(`Invalid arguments: ${errorMessages}`);
        }
        const data = await getUnitVacancyDetailReport(parseResult.data);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(data),
              mimeType: "application/json"
            }
          ]
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Unit Vacancy Detail Report Error:`, errorMessage);
        throw error;
      }
    }
  );
}

// src/reports/vendorDirectoryReport.ts
var import_zod44 = require("zod");
var vendorDirectoryArgsSchema = import_zod44.z.object({
  workers_comp_expiration_to: import_zod44.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional().describe("Optional. Filter vendors whose Workers Comp expires on or before this date (YYYY-MM-DD)."),
  liability_expiration_to: import_zod44.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional().describe("Optional. Filter vendors whose Liability Insurance expires on or before this date (YYYY-MM-DD)."),
  epa_expiration_to: import_zod44.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional().describe("Optional. Filter vendors whose EPA Certification expires on or before this date (YYYY-MM-DD)."),
  auto_insurance_expiration_to: import_zod44.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional().describe("Optional. Filter vendors whose Auto Insurance expires on or before this date (YYYY-MM-DD)."),
  state_license_expiration_to: import_zod44.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional().describe("Optional. Filter vendors whose State License expires on or before this date (YYYY-MM-DD)."),
  contract_expiration_to: import_zod44.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional().describe("Optional. Filter vendors whose Contract expires on or before this date (YYYY-MM-DD)."),
  tags: import_zod44.z.string().optional().describe('Optional. Filter by a comma-separated list of tags (e.g., "plumbing,hvac").'),
  vendor_visibility: import_zod44.z.enum(["active", "inactive", "all"]).optional().default("active").describe('Filter vendors by status. Defaults to "active"'),
  payment_type: import_zod44.z.enum(["eCheck", "Check", "all"]).optional().describe("Optional. Filter by payment type (eCheck, Check, or all). Defaults to all if not specified."),
  created_by: import_zod44.z.string().optional().default("All").describe('Filter by who created the vendor. Defaults to "All".'),
  // User ID or 'All'
  vendor_type: import_zod44.z.string().optional().default("All").describe('Filter by vendor type. Defaults to "All".'),
  // Vendor Type name or 'All'
  columns: import_zod44.z.array(import_zod44.z.string()).optional().describe("Array of specific columns to include in the report")
});
async function getVendorDirectoryReport(args) {
  return makeAppfolioApiCall("vendor_directory.json", args);
}
function registerVendorDirectoryReportTool(server) {
  server.tool(
    "get_vendor_directory_report",
    "Retrieves a directory of vendors. IMPORTANT: All ID parameters must be numeric strings (e.g. '123'), NOT names.",
    vendorDirectoryArgsSchema.shape,
    async (args, _extra) => {
      try {
        const parseResult = vendorDirectoryArgsSchema.safeParse(args);
        if (!parseResult.success) {
          const errorMessages = parseResult.error.errors.map(
            (err) => `${err.path.join(".")}: ${err.message}`
          ).join("; ");
          throw new Error(`Invalid arguments: ${errorMessages}`);
        }
        const result = await getVendorDirectoryReport(parseResult.data);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
              mimeType: "application/json"
            }
          ]
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Vendor Directory Report Error:`, errorMessage);
        throw error;
      }
    }
  );
}

// src/reports/workOrderReport.ts
var import_zod45 = require("zod");
var VALID_WORK_ORDER_COLUMNS = [
  "property",
  "property_name",
  "property_id",
  "property_address",
  "property_street",
  "property_street2",
  "property_city",
  "property_state",
  "property_zip",
  "unit_address",
  "unit_street",
  "unit_street2",
  "unit_city",
  "unit_state",
  "unit_zip",
  "priority",
  "work_order_type",
  "service_request_number",
  "service_request_description",
  "home_warranty_expiration",
  "work_order_number",
  "job_description",
  "instructions",
  "status",
  "vendor_id",
  "vendor",
  "unit_id",
  "unit_name",
  "occupancy_id",
  "primary_tenant",
  "primary_tenant_email",
  "primary_tenant_phone_number",
  "created_at",
  "created_by",
  "assigned_user",
  "estimate_req_on",
  "estimated_on",
  "estimate_amount",
  "estimate_approval_status",
  "estimate_approved_on",
  "estimate_approval_last_requested_on",
  "scheduled_start",
  "scheduled_end",
  "work_completed_on",
  "completed_on",
  "last_billed_on",
  "canceled_on",
  "amount",
  "invoice",
  "unit_turn_id",
  "corporate_charge_amount",
  "corporate_charge_id",
  "discount_amount",
  "discount_bill_id",
  "markup_amount",
  "markup_bill_id",
  "tenant_total_charge_amount",
  "tenant_charge_ids",
  "vendor_bill_amount",
  "vendor_bill_id",
  "vendor_charge_amount",
  "vendor_charge_id",
  "inspection_id",
  "inspection_date",
  "work_order_id",
  "service_request_id",
  "recurring",
  "submitted_by_tenant",
  "requesting_tenant",
  "maintenance_limit",
  "status_notes",
  "follow_up_on",
  "vendor_trade",
  "unit_turn_category",
  "work_order_issue",
  "survey_id",
  "vendor_portal_invoices"
];
var workOrderArgsBaseSchema = import_zod45.z.object({
  property_visibility: import_zod45.z.enum(["active", "hidden", "all"]).optional().default("active").describe('Filter properties by status. Defaults to "active".'),
  unit_ids: import_zod45.z.array(import_zod45.z.string()).optional().describe("Optional. Filter by specific unit IDs."),
  property: import_zod45.z.object({
    property_id: import_zod45.z.string().describe(getIdFieldDescription("property_id", "Property", "property directory report"))
  }).optional().describe("Optional. Filter by a single property ID."),
  parties_ids: import_zod45.z.object({ occupancies_ids: import_zod45.z.array(import_zod45.z.string()).optional() }).optional().describe("Optional. Filter by specific occupancy IDs."),
  party_contact_info: import_zod45.z.object({ company_id: import_zod45.z.string() }).optional().describe("Optional. Filter by a specific vendor ID (company)."),
  assigned_user: import_zod45.z.string().optional().default("All").describe('Filter by assigned user ID or "All". Defaults to "All".'),
  created_by: import_zod45.z.string().optional().default("All").describe('Filter by creator user ID or "All". Defaults to "All".'),
  priority: import_zod45.z.enum(["All", "Low", "Medium", "High", "Urgent"]).optional().default("All").describe('Filter by priority. Defaults to "All".'),
  from_inspection: import_zod45.z.boolean().optional().default(false).describe("Optional. Filter by whether the work order originated from an inspection. Defaults to false."),
  current_estimate_approval_status: import_zod45.z.enum(["All", "Pending", "Approved", "Declined"]).optional().default("All").describe('Filter by estimate approval status. Defaults to "All".'),
  work_order_statuses: import_zod45.z.array(import_zod45.z.string()).optional().describe("Optional. Filter by specific work order status IDs."),
  work_order_types: import_zod45.z.array(import_zod45.z.enum(["unit_turn", "tenant_requested", "other"])).optional().describe("Optional. Filter by specific work order types."),
  unit_turn_category: import_zod45.z.array(import_zod45.z.string()).optional().default(["all"]).describe('Filter by unit turn category. Defaults to ["all"].'),
  status_date_range_from: import_zod45.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional().describe("Optional. Start date for status date range filter (YYYY-MM-DD)."),
  status_date_range_to: import_zod45.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional().describe("Optional. End date for status date range filter (YYYY-MM-DD)."),
  status_date: import_zod45.z.enum(["all", "created_at", "completed_on"]).optional().default("all").describe('Field to use for status date range filtering. Defaults to "all".'),
  columns: import_zod45.z.array(import_zod45.z.enum(VALID_WORK_ORDER_COLUMNS)).optional().describe(`Array of specific columns to include in the report. Valid columns: ${VALID_WORK_ORDER_COLUMNS.join(", ")}`)
});
var workOrderArgsSchema = workOrderArgsBaseSchema.superRefine((data, ctx) => {
  if (data.property?.property_id) {
    const validationErrors = validatePropertiesIds({ properties_ids: [data.property.property_id] });
    throwOnValidationErrors(validationErrors);
  }
  if (data.unit_ids) {
    for (let i = 0; i < data.unit_ids.length; i++) {
      if (!/^\d+$/.test(data.unit_ids[i])) {
        ctx.addIssue({
          code: import_zod45.z.ZodIssueCode.custom,
          path: ["unit_ids", i],
          message: "Unit ID must be a numeric string"
        });
      }
    }
  }
  if (data.parties_ids?.occupancies_ids) {
    for (let i = 0; i < data.parties_ids.occupancies_ids.length; i++) {
      if (!/^\d+$/.test(data.parties_ids.occupancies_ids[i])) {
        ctx.addIssue({
          code: import_zod45.z.ZodIssueCode.custom,
          path: ["parties_ids", "occupancies_ids", i],
          message: "Occupancy ID must be a numeric string"
        });
      }
    }
  }
  if (data.party_contact_info?.company_id && !/^\d+$/.test(data.party_contact_info.company_id)) {
    ctx.addIssue({
      code: import_zod45.z.ZodIssueCode.custom,
      path: ["party_contact_info", "company_id"],
      message: "Company ID must be a numeric string"
    });
  }
});
async function getWorkOrderReport(args) {
  const {
    property_visibility = "active",
    assigned_user = "All",
    created_by = "All",
    priority = "All",
    current_estimate_approval_status = "All",
    status_date = "all",
    unit_turn_category = ["all"],
    // Default based on API description
    from_inspection = false,
    // Explicitly set default
    ...rest
  } = args;
  const payload = {
    property_visibility,
    assigned_user,
    created_by,
    priority,
    current_estimate_approval_status,
    status_date,
    unit_turn_category,
    ...rest
  };
  if (from_inspection) {
    payload.from_inspection = from_inspection;
  }
  return makeAppfolioApiCall("work_order.json", payload);
}
function registerWorkOrderReportTool(server) {
  server.tool(
    "get_work_order_report",
    "Generates a report on work orders. IMPORTANT: All ID parameters (unit_ids, property_id, etc.) must be numeric strings (e.g. '123'), NOT names. Use respective directory reports first to lookup IDs by name if needed.",
    workOrderArgsBaseSchema.shape,
    async (args, _extra) => {
      try {
        const parseResult = workOrderArgsSchema.safeParse(args);
        if (!parseResult.success) {
          const errorMessages = parseResult.error.errors.map(
            (err) => `${err.path.join(".")}: ${err.message}`
          ).join("; ");
          throw new Error(`Invalid arguments: ${errorMessages}`);
        }
        const result = await getWorkOrderReport(parseResult.data);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
              mimeType: "application/json"
            }
          ]
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Work Order Report Error:`, errorMessage);
        throw error;
      }
    }
  );
}

// src/reports/propertyGroupDirectoryReport.ts
var import_zod46 = require("zod");
var import_dotenv7 = __toESM(require("dotenv"));
import_dotenv7.default.config();
var PROPERTY_GROUP_DIRECTORY_COLUMNS = [
  "property",
  "property_name",
  "property_id",
  "property_address",
  "property_street",
  "property_street2",
  "property_city",
  "property_state",
  "property_zip",
  "property_county",
  "property_legacy_street1",
  "property_group_name",
  "portfolio",
  "property_group_id",
  "portfolio_id"
];
var propertyGroupDirectoryArgsSchema = import_zod46.z.object({
  property_visibility: import_zod46.z.enum(["active", "inactive", "all"]).default("active").describe("Property visibility filter"),
  properties: import_zod46.z.object({
    properties_ids: import_zod46.z.array(import_zod46.z.string()).optional().describe(getIdFieldDescription("property", "Property Directory Report")),
    property_groups_ids: import_zod46.z.array(import_zod46.z.string()).optional().describe(getIdFieldDescription("property group", "Property Group Directory Report")),
    portfolios_ids: import_zod46.z.array(import_zod46.z.string()).optional().describe(getIdFieldDescription("portfolio", "Portfolio Directory Report")),
    owners_ids: import_zod46.z.array(import_zod46.z.string()).optional().describe(getIdFieldDescription("owner", "Owner Directory Report"))
  }).optional().describe("Property filtering options"),
  orphans_only: import_zod46.z.enum(["0", "1"]).default("0").describe("Filter to show only orphaned properties (1) or all properties (0)"),
  columns: import_zod46.z.array(import_zod46.z.enum(PROPERTY_GROUP_DIRECTORY_COLUMNS)).optional().describe(`Array of specific columns to include in the report. Valid columns: ${PROPERTY_GROUP_DIRECTORY_COLUMNS.join(", ")}. If not specified, all columns are returned.`)
});
async function getPropertyGroupDirectoryReport(args) {
  if (args.properties) {
    const validationErrors = validatePropertiesIds(args.properties);
    throwOnValidationErrors(validationErrors);
  }
  const payload = {
    property_visibility: args.property_visibility,
    properties: args.properties || {},
    orphans_only: args.orphans_only,
    ...args.columns && { columns: args.columns }
  };
  return makeAppfolioApiCall("property_group_directory.json", payload);
}
function registerPropertyGroupDirectoryReportTool(server) {
  server.tool(
    "get_property_group_directory_report",
    'Get property group directory report from AppFolio. Shows properties organized by property groups and portfolios. IMPORTANT: All ID parameters (properties_ids, property_groups_ids, portfolios_ids, owners_ids) must be numeric strings (e.g. "123"), NOT names. Use respective directory reports first to lookup IDs by name if needed.',
    propertyGroupDirectoryArgsSchema.shape,
    async (args, _extra) => {
      try {
        const parseResult = propertyGroupDirectoryArgsSchema.safeParse(args);
        if (!parseResult.success) {
          const errorMessages = parseResult.error.errors.map(
            (err) => `${err.path.join(".")}: ${err.message}`
          ).join("; ");
          throw new Error(`Invalid arguments: ${errorMessages}`);
        }
        const result = await getPropertyGroupDirectoryReport(parseResult.data);
        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2),
            mimeType: "application/json"
          }]
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Property Group Directory Report Error:`, errorMessage);
        throw error;
      }
    }
  );
}

// src/appfolio.ts
import_dotenv8.default.config();
var appfolioLimiter = new import_bottleneck.default({
  reservoir: 200,
  // initial value
  reservoirRefreshAmount: 200,
  reservoirRefreshInterval: 60 * 1e3,
  // 1 minute
  maxConcurrent: 10,
  minTime: 100
  // 10 requests per second, also helps with reservoir not depleting too fast
});
async function makeAppfolioApiCall(endpoint, payload) {
  const { VHOST, USERNAME, PASSWORD } = process.env;
  if (!VHOST || !USERNAME || !PASSWORD) {
    throw new Error("Missing AppFolio API credentials");
  }
  const url = `https://${VHOST}.appfolio.com/api/v2/reports/${endpoint}`;
  try {
    const response = await appfolioLimiter.schedule(
      () => import_axios.default.post(url, payload, {
        auth: { username: USERNAME, password: PASSWORD },
        headers: { "Content-Type": "application/json" }
      })
    );
    return response.data;
  } catch (error) {
    if (import_axios.default.isAxiosError(error)) {
      const status = error.response?.status;
      const statusText = error.response?.statusText;
      const responseData = error.response?.data;
      let errorMessage = "Unknown API error";
      if (responseData) {
        if (typeof responseData === "string") {
          errorMessage = responseData;
        } else if (responseData.error) {
          errorMessage = responseData.error;
        } else if (responseData.message) {
          errorMessage = responseData.message;
        } else if (responseData.errors && Array.isArray(responseData.errors)) {
          errorMessage = responseData.errors.join(", ");
        }
      }
      if (status === 400) {
        throw new Error(`Bad Request: ${errorMessage}. Please check your parameters and try again.`);
      } else if (status === 401) {
        throw new Error(`Authentication failed: ${errorMessage}. Please check your AppFolio credentials.`);
      } else if (status === 403) {
        throw new Error(`Access denied: ${errorMessage}. You may not have permission to access this resource.`);
      } else if (status === 404) {
        throw new Error(`Resource not found: ${errorMessage}. The requested endpoint may not exist.`);
      } else if (status === 422) {
        throw new Error(`Validation error: ${errorMessage}. Please check your parameters and try again.`);
      } else if (status === 500) {
        throw new Error(`Internal server error: ${errorMessage}. This may be due to invalid parameters or a temporary server issue. Please verify your parameters and try again.`);
      } else if (status) {
        throw new Error(`HTTP ${status} ${statusText}: ${errorMessage}`);
      } else {
        throw new Error(`Network error: ${error.message}`);
      }
    }
    throw error;
  }
}

// src/reports/cashflowReport.ts
async function getCashflowReport(args) {
  return makeAppfolioApiCall("cash_flow_detail.json", args);
}
var cashflowInputSchema = {
  property_visibility: import_zod47.z.string().describe("Property visibility filter"),
  properties_ids: import_zod47.z.array(import_zod47.z.string()).optional().describe("Filter by specific property IDs"),
  property_groups_ids: import_zod47.z.array(import_zod47.z.string()).optional().describe("Filter by property group IDs"),
  portfolios_ids: import_zod47.z.array(import_zod47.z.string()).optional().describe("Filter by portfolio IDs"),
  owners_ids: import_zod47.z.array(import_zod47.z.string()).optional().describe("Filter by owner IDs"),
  posted_on_from: import_zod47.z.string().describe("Start date for the posting period (YYYY-MM-DD) - Required"),
  posted_on_to: import_zod47.z.string().describe("End date for the posting period (YYYY-MM-DD) - Required"),
  gl_account_map_id: import_zod47.z.string().optional().describe("Filter by GL account map ID"),
  exclude_suppressed_fees: import_zod47.z.string().optional().describe('Exclude suppressed fees ("0" or "1")'),
  columns: import_zod47.z.array(import_zod47.z.string()).optional().describe("Specific columns to include")
};
var cashflowValidationSchema = import_zod47.z.object({
  property_visibility: import_zod47.z.string(),
  properties_ids: import_zod47.z.array(import_zod47.z.string()).optional(),
  property_groups_ids: import_zod47.z.array(import_zod47.z.string()).optional(),
  portfolios_ids: import_zod47.z.array(import_zod47.z.string()).optional(),
  owners_ids: import_zod47.z.array(import_zod47.z.string()).optional(),
  posted_on_from: import_zod47.z.string(),
  posted_on_to: import_zod47.z.string(),
  gl_account_map_id: import_zod47.z.string().optional(),
  exclude_suppressed_fees: import_zod47.z.string().optional(),
  columns: import_zod47.z.array(import_zod47.z.string()).optional()
});
function transformToApiArgs2(input) {
  const { properties_ids, property_groups_ids, portfolios_ids, owners_ids, ...rest } = input;
  const hasProperties = properties_ids || property_groups_ids || portfolios_ids || owners_ids;
  return {
    ...rest,
    ...hasProperties && {
      properties: {
        ...properties_ids && { properties_ids },
        ...property_groups_ids && { property_groups_ids },
        ...portfolios_ids && { portfolios_ids },
        ...owners_ids && { owners_ids }
      }
    }
  };
}
function registerCashflowReportTool(server) {
  server.tool(
    "get_cashflow_report",
    "Returns Cash Flow Details including income and expenses for given time period.",
    cashflowInputSchema,
    async (args, _extra) => {
      try {
        const parseResult = cashflowValidationSchema.safeParse(args);
        if (!parseResult.success) {
          const errorMessages = parseResult.error.errors.map(
            (err) => `${err.path.join(".")}: ${err.message}`
          ).join("; ");
          throw new Error(`Invalid arguments: ${errorMessages}`);
        }
        const apiArgs = transformToApiArgs2(parseResult.data);
        const result = await getCashflowReport(apiArgs);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
              mimeType: "application/json"
            }
          ]
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Cashflow Report Error:`, errorMessage);
        throw error;
      }
    }
  );
}

// src/reports/trialBalanceByPropertyReport.ts
var import_zod48 = require("zod");
var trialBalanceByPropertyArgsSchema = import_zod48.z.object({
  property_visibility: import_zod48.z.enum(["active", "hidden", "all"]).optional().default("active").describe('Filter properties by status. Defaults to "active"'),
  properties: import_zod48.z.object({
    properties_ids: import_zod48.z.array(import_zod48.z.string()).optional(),
    property_groups_ids: import_zod48.z.array(import_zod48.z.string()).optional(),
    portfolios_ids: import_zod48.z.array(import_zod48.z.string()).optional(),
    owners_ids: import_zod48.z.array(import_zod48.z.string()).optional()
  }).optional().describe("Filter results based on properties, groups, portfolios, or owners"),
  posted_on_from: import_zod48.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe("Required. The start date for the reporting period (YYYY-MM-DD)."),
  posted_on_to: import_zod48.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe("Required. The end date for the reporting period (YYYY-MM-DD)."),
  gl_account_map_id: import_zod48.z.string().optional().describe("Optional. Filter by a specific GL Account Map ID."),
  columns: import_zod48.z.array(import_zod48.z.string()).optional().describe("Array of specific columns to include in the report")
});
async function getTrialBalanceByPropertyReport(args) {
  if (!args.posted_on_from || !args.posted_on_to) {
    throw new Error("Missing required arguments: posted_on_from and posted_on_to (format YYYY-MM-DD)");
  }
  const { property_visibility = "active", ...rest } = args;
  const payload = { property_visibility, ...rest };
  return makeAppfolioApiCall("trial_balance_by_property.json", payload);
}
function registerTrialBalanceByPropertyReportTool(server) {
  server.tool(
    "get_trial_balance_by_property_report",
    "Generates a trial balance report by property.",
    trialBalanceByPropertyArgsSchema.shape,
    async (args, _extra) => {
      try {
        const parseResult = trialBalanceByPropertyArgsSchema.safeParse(args);
        if (!parseResult.success) {
          const errorMessages = parseResult.error.errors.map(
            (err) => `${err.path.join(".")}: ${err.message}`
          ).join("; ");
          throw new Error(`Invalid arguments: ${errorMessages}`);
        }
        const result = await getTrialBalanceByPropertyReport(parseResult.data);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
              mimeType: "application/json"
            }
          ]
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Trial Balance By Property Report Error:`, errorMessage);
        throw error;
      }
    }
  );
}

// src/index.ts
import_dotenv9.default.config();
function createJwksVerifier(options) {
  const { jwksUrl, issuer, audience, inlineJwksJson } = options;
  const jwks = (0, import_jose.createRemoteJWKSet)(new URL(jwksUrl), { timeoutDuration: 1e4 });
  let localSetPromise = null;
  async function getLocalJwkSet() {
    if (localSetPromise) return localSetPromise;
    if (inlineJwksJson) {
      try {
        const parsed = JSON.parse(inlineJwksJson);
        localSetPromise = Promise.resolve((0, import_jose.createLocalJWKSet)(parsed));
        console.log("Using inline JWKS from OAUTH_JWKS_JSON env");
        return localSetPromise;
      } catch (e) {
        console.error("Invalid OAUTH_JWKS_JSON:", e?.message || e);
      }
    }
    localSetPromise = (async () => {
      try {
        const res = await fetch(jwksUrl, { headers: { accept: "application/json" } });
        if (!res.ok) throw new Error(`JWKS HTTP ${res.status}`);
        const jwk = await res.json();
        return (0, import_jose.createLocalJWKSet)(jwk);
      } catch (e) {
        console.error("Prefetch JWKS failed:", e?.message || e);
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
        console.log(`Access token header: alg=${headerJson.alg || "?"}, kid=${headerJson.kid || "?"}, segments=${segments}`);
      } catch {
      }
      if (segments !== 3) {
        console.error(`Access token has ${segments} segments; expected 3 (signed JWT/JWS).`);
        if (segments === 5) {
          throw new import_errors.InvalidTokenError(
            "Encrypted (JWE) token provided. Configure Auth0 API to issue signed RS256 JWT access tokens."
          );
        }
        throw new import_errors.InvalidTokenError("Invalid token format. Expected compact JWS (three segments).");
      }
      let payload;
      try {
        try {
          const local = await getLocalJwkSet();
          ({ payload } = await (0, import_jose.jwtVerify)(token, local, { issuer, audience }));
        } catch (e) {
          ({ payload } = await (0, import_jose.jwtVerify)(token, jwks, {
            issuer,
            audience
          }));
        }
      } catch (err) {
        console.error("JWT verification failed:", err?.message || err);
        throw new import_errors.InvalidTokenError("Invalid token");
      }
      const scopes = typeof payload.scope === "string" ? payload.scope.split(" ") : [];
      const clientId = payload.client_id || payload.azp || payload.sub || "unknown";
      let resourceUrl;
      const resourceClaim = payload.resource;
      if (typeof resourceClaim === "string") {
        try {
          resourceUrl = new URL(resourceClaim);
        } catch {
        }
      } else if (Array.isArray(resourceClaim) && resourceClaim.length > 0 && typeof resourceClaim[0] === "string") {
        try {
          resourceUrl = new URL(resourceClaim[0]);
        } catch {
        }
      }
      return {
        token,
        clientId,
        scopes,
        expiresAt: typeof payload.exp === "number" ? payload.exp : void 0,
        resource: resourceUrl,
        extra: payload
      };
    }
  };
}
function createMcpServer() {
  const server = new import_mcp.McpServer({
    name: "appfolio-mcp",
    version: "1.0.1"
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
async function findAvailablePort(startPort, maxAttempts = 20) {
  for (let port = startPort; port < startPort + maxAttempts; port++) {
    const isFree = await new Promise((resolve) => {
      const tester = import_node_net.default.createServer().once("error", () => resolve(false)).once("listening", () => {
        tester.close(() => resolve(true));
      }).listen(port, "0.0.0.0");
    });
    if (isFree) return port;
  }
  throw new Error(`No available port found starting at ${startPort}`);
}
async function startStdio() {
  const server = createMcpServer();
  const transport = new import_stdio.StdioServerTransport();
  await server.connect(transport);
}
async function startHttpServer() {
  const app = (0, import_express.default)();
  app.use(import_express.default.json());
  app.use(
    (0, import_cors.default)({
      origin: process.env.CORS_ORIGIN || "*",
      exposedHeaders: ["Mcp-Session-Id"]
    })
  );
  const proxyAuthorizationUrl = process.env.OAUTH_PROXY_AUTHORIZATION_URL;
  const proxyTokenUrl = process.env.OAUTH_PROXY_TOKEN_URL;
  const proxyRevocationUrl = process.env.OAUTH_PROXY_REVOCATION_URL;
  const proxyRegistrationUrl = process.env.OAUTH_PROXY_REGISTRATION_URL;
  const oauthIssuer = process.env.OAUTH_ISSUER;
  const defaultScopes = "openid profile email";
  const oauthScopesSupported = (process.env.OAUTH_SCOPES_SUPPORTED || defaultScopes).split(/\s+/).filter(Boolean);
  const serviceDocumentationUrl = process.env.OAUTH_SERVICE_DOC_URL;
  const requestedPort = Number(process.env.HTTP_PORT || process.env.PORT || 3e3);
  const selectedPort = await findAvailablePort(requestedPort, 50);
  if (selectedPort !== requestedPort) {
    console.warn(`Port ${requestedPort} is in use; using port ${selectedPort} instead.`);
  }
  const resourceServerUrl = new URL(process.env.RESOURCE_SERVER_URL || `http://localhost:${selectedPort}/mcp`);
  const jwksUrl = process.env.OAUTH_JWKS_URL;
  const issuer = process.env.OAUTH_ISSUER ? process.env.OAUTH_ISSUER.replace(/\/+$/, "") : void 0;
  const audience = process.env.OAUTH_AUDIENCE;
  const inlineJwksJson = process.env.OAUTH_JWKS_JSON;
  const resourceMetadataUrlFinal = process.env.OAUTH_RESOURCE_METADATA_URL && process.env.OAUTH_RESOURCE_METADATA_URL.trim().length > 0 ? process.env.OAUTH_RESOURCE_METADATA_URL : `${new URL(`http://localhost:${selectedPort}/.well-known/oauth-protected-resource`)}`;
  const bypassAuth = process.env.BYPASS_AUTH_FOR_TESTING === "true";
  const inspectorMode = process.env.INSPECTOR_MODE === "true";
  const hybridMode = process.env.HYBRID_MODE === "true";
  const useAuth = Boolean(jwksUrl) && !bypassAuth && !inspectorMode && !hybridMode;
  if (bypassAuth) {
    console.log("\u26A0\uFE0F WARNING: Authentication bypassed for testing. Do not use in production!");
  } else if (inspectorMode) {
    console.log("\u{1F527} INSPECTOR MODE: OAuth metadata served but requests not authenticated (MCP Inspector OAuth bug workaround)");
  } else if (hybridMode) {
    console.log("\u{1F500} HYBRID MODE: OAuth preferred but requests work without auth (maximum compatibility)");
  }
  const authMiddleware = useAuth ? (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    console.log(`\u{1F50D} Auth Debug - Header received: "${authHeader}"`);
    console.log(`\u{1F50D} Auth Debug - All headers:`, Object.keys(req.headers).filter((h) => h.toLowerCase().includes("auth")));
    if (!authHeader) {
      console.log(`\u274C No Authorization header found`);
      return res.status(401).json({
        error: "invalid_token",
        error_description: "Missing Authorization header"
      });
    }
    let token;
    if (authHeader.toLowerCase().startsWith("bearer ")) {
      token = authHeader.substring(7);
    } else {
      console.log(`\u26A0\uFE0F Authorization header doesn't start with 'Bearer ', treating as raw token`);
      token = authHeader;
    }
    console.log(`\u{1F50D} Extracted token (first 20 chars): ${token.substring(0, 20)}...`);
    const verifier = createJwksVerifier({ jwksUrl, issuer, audience, inlineJwksJson });
    verifier.verifyAccessToken(token).then((authResult) => {
      console.log(`\u2705 Token verification successful for client: ${authResult.clientId}`);
      req.auth = authResult;
      next();
    }).catch((error) => {
      console.log(`\u274C Token verification failed:`, error.message);
      res.status(401).json({
        error: "invalid_token",
        error_description: error.message || "Invalid token"
      });
    });
  } : void 0;
  if (useAuth || inspectorMode || hybridMode) {
    app.get("/.well-known/oauth-protected-resource", (_req, res) => {
      const issuerNoSlash = oauthIssuer ? oauthIssuer.replace(/\/+$/, "") : void 0;
      res.status(200).json({
        resource: resourceServerUrl.toString(),
        authorization_servers: issuerNoSlash ? [issuerNoSlash] : [],
        bearer_methods_supported: ["header"],
        scopes_supported: oauthScopesSupported,
        // Explicitly indicate refresh token support is required
        token_types_supported: ["access_token", "refresh_token"]
      });
    });
  }
  app.get("/whoami", ...authMiddleware ? [authMiddleware] : [], (req, res) => {
    const auth = req.auth || {};
    res.status(200).json({
      ok: true,
      clientId: auth.clientId,
      scopes: auth.scopes,
      expiresAt: auth.expiresAt,
      resource: auth.resource ? String(auth.resource) : void 0,
      extra: auth.extra
    });
  });
  app.get("/sessions", ...authMiddleware ? [authMiddleware] : [], (req, res) => {
    const now = /* @__PURE__ */ new Date();
    const sessionSummary = Object.keys(transports).map((sessionId) => {
      const metadata = sessionMetadata[sessionId];
      return {
        sessionId,
        created: metadata?.created,
        lastUsed: metadata?.lastUsed,
        requestCount: metadata?.requestCount || 0,
        ageMinutes: metadata ? Math.round((now.getTime() - metadata.created.getTime()) / 6e4) : 0,
        idleMinutes: metadata ? Math.round((now.getTime() - metadata.lastUsed.getTime()) / 6e4) : 0,
        transportType: transports[sessionId].constructor.name
      };
    });
    res.status(200).json({
      totalSessions: Object.keys(transports).length,
      sessions: sessionSummary,
      serverUptime: process.uptime(),
      sessionTimeoutMinutes: SESSION_TIMEOUT_MS / 6e4
    });
  });
  if (proxyAuthorizationUrl && proxyTokenUrl && oauthIssuer && (useAuth || inspectorMode || hybridMode)) {
    const oauthMetadata = {
      issuer: oauthIssuer,
      authorization_endpoint: proxyAuthorizationUrl,
      token_endpoint: proxyTokenUrl,
      revocation_endpoint: proxyRevocationUrl,
      registration_endpoint: proxyRegistrationUrl,
      // Critical for MCP Inspector!
      response_types_supported: ["code"],
      // MCP uses authorization code flow
      scopes_supported: oauthScopesSupported,
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
      token_endpoint_auth_signing_alg_values_supported: ["RS256"]
    };
    app.use(
      (0, import_router.mcpAuthMetadataRouter)({
        oauthMetadata,
        resourceServerUrl,
        serviceDocumentationUrl: serviceDocumentationUrl ? new URL(serviceDocumentationUrl) : void 0,
        scopesSupported: oauthScopesSupported.length ? oauthScopesSupported : void 0
      })
    );
  }
  app.use((req, res, next) => {
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    console.log(`\u{1F4E5} ${timestamp} ${req.method} ${req.url}`);
    if (req.headers.authorization) {
      console.log(`\u{1F511} Auth header present: ${req.headers.authorization.substring(0, 20)}...`);
    } else {
      console.log(`\u{1F511} No auth header`);
    }
    next();
  });
  const transports = {};
  const sessionMetadata = {};
  const SESSION_TIMEOUT_MS = 30 * 60 * 1e3;
  setInterval(() => {
    const now = /* @__PURE__ */ new Date();
    const staleSessionIds = Object.keys(sessionMetadata).filter((sessionId) => {
      const metadata = sessionMetadata[sessionId];
      return now.getTime() - metadata.lastUsed.getTime() > SESSION_TIMEOUT_MS;
    });
    staleSessionIds.forEach((sessionId) => {
      console.log(`Cleaning up stale session: ${sessionId}`);
      if (transports[sessionId]) {
        try {
          const transport = transports[sessionId];
          if ("close" in transport && typeof transport.close === "function") {
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
  }, 5 * 60 * 1e3);
  const createNewSession = async () => {
    const transport = new import_streamableHttp.StreamableHTTPServerTransport({
      sessionIdGenerator: () => (0, import_node_crypto.randomUUID)(),
      enableJsonResponse: true,
      onsessioninitialized: (sid) => {
        transports[sid] = transport;
        sessionMetadata[sid] = {
          created: /* @__PURE__ */ new Date(),
          lastUsed: /* @__PURE__ */ new Date(),
          requestCount: 0
        };
        console.log(`New session created: ${sid} (total active: ${Object.keys(transports).length})`);
      }
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
  const updateSessionActivity = (sessionId) => {
    if (sessionMetadata[sessionId]) {
      sessionMetadata[sessionId].lastUsed = /* @__PURE__ */ new Date();
      sessionMetadata[sessionId].requestCount++;
    }
  };
  const mcpHandler = async (req, res) => {
    try {
      const existingSessionIdHeader = req.headers["mcp-session-id"];
      const requestId = req.body?.id || null;
      const method = req.body?.method || "unknown";
      console.log(`MCP Request: ${method} (session: ${existingSessionIdHeader || "none"}, id: ${requestId})`);
      let transport;
      if (existingSessionIdHeader) {
        const existing = transports[existingSessionIdHeader];
        if (existing && existing instanceof import_streamableHttp.StreamableHTTPServerTransport) {
          transport = existing;
          updateSessionActivity(existingSessionIdHeader);
          console.log(`Using existing session: ${existingSessionIdHeader}`);
        } else if (existing) {
          res.status(400).json({
            jsonrpc: "2.0",
            error: {
              code: -32e3,
              message: "Bad Request: Session exists but uses a different transport protocol",
              data: { sessionId: existingSessionIdHeader }
            },
            id: requestId
          });
          return;
        } else {
          console.log(`Session ${existingSessionIdHeader} not found, creating new session`);
          transport = await createNewSession();
          if (!(0, import_types.isInitializeRequest)(req.body)) {
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
              id: requestId
            });
            return;
          }
        }
      }
      if (!transport) {
        if (req.method === "POST" && (0, import_types.isInitializeRequest)(req.body)) {
          console.log("Creating new session for initialize request");
          transport = await createNewSession();
        } else if (req.method === "POST") {
          console.log(`Auto-creating session for ${method} request`);
          transport = await createNewSession();
        } else {
          res.status(400).json({
            jsonrpc: "2.0",
            error: {
              code: -32003,
              message: "Session required for this request method",
              data: { method: req.method }
            },
            id: requestId
          });
          return;
        }
      }
      if (transport) {
        console.log(`Processing request with session: ${transport.sessionId}`);
        await transport.handleRequest(req, res, req.body);
      } else {
        res.status(500).json({
          jsonrpc: "2.0",
          error: { code: -32603, message: "Failed to create or find session transport" },
          id: requestId
        });
      }
    } catch (error) {
      console.error("Error handling MCP request:", error);
      const requestId = req.body?.id || null;
      if (!res.headersSent) {
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
          id: requestId
        });
      }
    }
  };
  app.all("/mcp", ...authMiddleware ? [authMiddleware] : [], mcpHandler);
  app.all("/mcp/", ...authMiddleware ? [authMiddleware] : [], mcpHandler);
  app.get("/", ...authMiddleware ? [authMiddleware] : [], (_req, res) => {
    res.status(200).send("AppFolio MCP server is running. Use POST /mcp to initialize a session.");
  });
  app.get("/sse", ...authMiddleware ? [authMiddleware] : [], async (req, res) => {
    const transport = new import_sse.SSEServerTransport("/messages", res);
    transports[transport.sessionId] = transport;
    res.on("close", () => {
      delete transports[transport.sessionId];
    });
    const server = createMcpServer();
    await server.connect(transport);
  });
  app.post("/messages", ...authMiddleware ? [authMiddleware] : [], async (req, res) => {
    const sessionId = req.query.sessionId || "";
    const transport = transports[sessionId];
    if (!transport || !(transport instanceof import_sse.SSEServerTransport)) {
      res.status(400).json({
        jsonrpc: "2.0",
        error: { code: -32e3, message: "Bad Request: No SSE transport found for sessionId" },
        id: null
      });
      return;
    }
    await transport.handlePostMessage(req, res, req.body);
  });
  app.listen(selectedPort, () => {
    console.log(`MCP HTTP server listening on port ${selectedPort}`);
  });
}
var mode = (process.env.MCP_MODE || "stdio").toLowerCase();
if (mode === "http") {
  startHttpServer();
} else {
  startStdio();
}

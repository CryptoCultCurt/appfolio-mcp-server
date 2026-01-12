import { z } from 'zod';

/**
 * Shared schema definitions for property filtering.
 * 
 * IMPORTANT: These schemas are FLATTENED to avoid TypeScript type depth issues
 * with the MCP SDK's server.tool() method. The nested `properties` object causes
 * "Type instantiation is excessively deep and possibly infinite" errors.
 */

// Flattened property filter fields for MCP tool registration
export const flatPropertyFilterSchema = {
  properties_ids: z.array(z.string()).optional().describe('Filter by specific property IDs'),
  property_groups_ids: z.array(z.string()).optional().describe('Filter by property group IDs'),
  portfolios_ids: z.array(z.string()).optional().describe('Filter by portfolio IDs'),
  owners_ids: z.array(z.string()).optional().describe('Filter by owner IDs'),
};

// Type for flat property filter
export type FlatPropertyFilter = {
  properties_ids?: string[];
  property_groups_ids?: string[];
  portfolios_ids?: string[];
  owners_ids?: string[];
};

// Type for nested property filter (API format)
export type NestedPropertyFilter = {
  properties?: {
    properties_ids?: string[];
    property_groups_ids?: string[];
    portfolios_ids?: string[];
    owners_ids?: string[];
  };
};

/**
 * Transform flat property filter fields into the nested API format.
 * Use this in tool handlers before calling the API.
 */
export function transformToNestedProperties<T extends FlatPropertyFilter>(
  input: T
): Omit<T, keyof FlatPropertyFilter> & NestedPropertyFilter {
  const { properties_ids, property_groups_ids, portfolios_ids, owners_ids, ...rest } = input;
  
  const hasProperties = properties_ids || property_groups_ids || portfolios_ids || owners_ids;
  
  return {
    ...rest,
    ...(hasProperties && {
      properties: {
        ...(properties_ids && { properties_ids }),
        ...(property_groups_ids && { property_groups_ids }),
        ...(portfolios_ids && { portfolios_ids }),
        ...(owners_ids && { owners_ids }),
      }
    })
  } as Omit<T, keyof FlatPropertyFilter> & NestedPropertyFilter;
}

// Common property visibility schema
export const propertyVisibilitySchema = z.enum(["active", "hidden", "all"]).default("active").optional()
  .describe('Filter properties by status. Defaults to "active"');

// Common date schemas
export const dateSchema = z.string().describe('Date in YYYY-MM-DD format');
export const monthSchema = z.string().regex(/^\d{4}-\d{2}$/, "Date must be in YYYY-MM format")
  .describe('Date in YYYY-MM format');

// Common level of detail schema
export const levelOfDetailSchema = z.enum(["detail_view", "summary_view"]).default("detail_view").optional()
  .describe('Level of detail. Defaults to "detail_view"');

// Common include zero balance schema
export const includeZeroBalanceSchema = z.enum(["0", "1"]).default("0").optional()
  .describe('Include GL accounts with zero balance. Defaults to "0"');

// Common columns schema
export const columnsSchema = z.array(z.string()).optional()
  .describe('Array of specific columns to include in the report');

// GL Account Map ID schema
export const glAccountMapIdSchema = z.string().optional()
  .describe('Filter by GL account map ID');

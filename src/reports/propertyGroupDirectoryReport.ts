import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import dotenv from 'dotenv';
import { makeAppfolioApiCall } from '../appfolio';
import { validatePropertiesIds, throwOnValidationErrors, getIdFieldDescription } from '../validation';

dotenv.config();

// Available columns extracted from the sample response
export const PROPERTY_GROUP_DIRECTORY_COLUMNS = [
  'property',
  'property_name', 
  'property_id',
  'property_address',
  'property_street',
  'property_street2',
  'property_city',
  'property_state',
  'property_zip',
  'property_county',
  'property_legacy_street1',
  'property_group_name',
  'portfolio',
  'property_group_id',
  'portfolio_id'
] as const;

// Zod schema for input validation
export const propertyGroupDirectoryArgsSchema = z.object({
  property_visibility: z.enum(['active', 'inactive', 'all']).default('active')
    .describe('Property visibility filter'),
  properties: z.object({
    properties_ids: z.array(z.string()).optional()
      .describe(getIdFieldDescription('property', 'Property Directory Report')),
    property_groups_ids: z.array(z.string()).optional()
      .describe(getIdFieldDescription('property group', 'Property Group Directory Report')),
    portfolios_ids: z.array(z.string()).optional()
      .describe(getIdFieldDescription('portfolio', 'Portfolio Directory Report')),
    owners_ids: z.array(z.string()).optional()
      .describe(getIdFieldDescription('owner', 'Owner Directory Report'))
  }).optional().describe('Property filtering options'),
  orphans_only: z.enum(['0', '1']).default('0')
    .describe('Filter to show only orphaned properties (1) or all properties (0)'),
  columns: z.array(z.enum(PROPERTY_GROUP_DIRECTORY_COLUMNS)).optional()
    .describe(`Array of specific columns to include in the report. Valid columns: ${PROPERTY_GROUP_DIRECTORY_COLUMNS.join(', ')}. If not specified, all columns are returned.`)
});

// TypeScript types
export type PropertyGroupDirectoryArgs = z.infer<typeof propertyGroupDirectoryArgsSchema>;

export interface PropertyGroupDirectoryResult {
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
    property_county: string;
    property_legacy_street1: string;
    property_group_name: string;
    portfolio: string;
    property_group_id: number;
    portfolio_id: number;
  }>;
  next_page_url: string;
}

// Main report function
export async function getPropertyGroupDirectoryReport(args: PropertyGroupDirectoryArgs): Promise<PropertyGroupDirectoryResult> {
  // Validate properties IDs if provided
  if (args.properties) {
    const validationErrors = validatePropertiesIds(args.properties);
    throwOnValidationErrors(validationErrors);
  }

  const payload = {
    property_visibility: args.property_visibility,
    properties: args.properties || {},
    orphans_only: args.orphans_only,
    ...(args.columns && { columns: args.columns })
  };

  return makeAppfolioApiCall<PropertyGroupDirectoryResult>('property_group_directory.json', payload);
}

// MCP tool registration
export function registerPropertyGroupDirectoryReportTool(server: McpServer) {
  server.tool(
    'get_property_group_directory_report',
    'Get property group directory report from AppFolio. Shows properties organized by property groups and portfolios. IMPORTANT: All ID parameters (properties_ids, property_groups_ids, portfolios_ids, owners_ids) must be numeric strings (e.g. "123"), NOT names. Use respective directory reports first to lookup IDs by name if needed.',
    propertyGroupDirectoryArgsSchema.shape as any,
    async (args: any, _extra: unknown) => {
      try {
        // Validate arguments against schema
        const parseResult = propertyGroupDirectoryArgsSchema.safeParse(args);
        if (!parseResult.success) {
          const errorMessages = parseResult.error.errors.map(err => 
            `${err.path.join('.')}: ${err.message}`
          ).join('; ');
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

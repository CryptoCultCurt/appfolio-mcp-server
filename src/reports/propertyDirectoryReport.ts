import { appfolioLimiter } from '../appfolio';
import axios from 'axios';
import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const { VHOST, USERNAME, PASSWORD } = process.env;

// Zod schema for Property Directory Report arguments
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


export async function getPropertyDirectoryReport(args: any): Promise<any> {
  if (!VHOST || !USERNAME || !PASSWORD) throw new Error('Missing AppFolio API credentials');
  const url = `https://${VHOST}.appfolio.com/api/v2/reports/property_directory.json`;
  const response = await appfolioLimiter.schedule(() => axios.post(url, args, {
    auth: { username: USERNAME, password: PASSWORD },
    headers: { 'Content-Type': 'application/json' },
  }));
  return response.data;
}

export function registerPropertyDirectoryReportTool(server: McpServer) {
  server.tool(
    "get_property_directory_report",
    "Returns property directory details for the given filters.",
    propertyDirectoryInputSchema.shape,
    async (args: any) => {
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
}
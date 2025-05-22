import axios from 'axios';
import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'; 
import dotenv from 'dotenv';
import { appfolioLimiter } from '../appfolio';

dotenv.config(); // Ensure environment variables are loaded

const { VHOST, USERNAME, PASSWORD } = process.env;

// Originally from src/appfolio.ts (lines 19-36)
export type AgedReceivablesDetailArgs = {
  property_visibility?: string; // Zod default will handle this for tool input
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

// Originally from src/appfolio.ts (lines 38-81)
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

// Originally from src/index.ts (lines 42-78)
const agedReceivablesDetailInputSchema = z.object({
  property_visibility: z.string().default("active"),
  properties: z.object({
    properties_ids: z.array(z.string()).optional(),
    property_groups_ids: z.array(z.string()).optional(),
    portfolios_ids: z.array(z.string()).optional(),
    owners_ids: z.array(z.string()).optional(),
  }).optional(),
  tags: z.string().optional(),
  balance_operator: z.object({
    amount: z.string().optional(),
    comparator: z.string().optional()
  }).optional(),
  tenant_statuses: z.array(z.string()).optional(),
  occurred_on_to: z.string(),
  gl_account_map_id: z.string().optional(),
  columns: z.array(z.string()).optional(),
});

// Originally from src/appfolio.ts (function starting line 1664)
export async function getAgedReceivablesDetailReport(args: AgedReceivablesDetailArgs): Promise<AgedReceivablesDetailResult> {
  if (!VHOST || !USERNAME || !PASSWORD) {
    throw new Error('Missing AppFolio API credentials');
  }
  
  // Zod schema handles the default for property_visibility, so args can be used directly.
  const payload = args;

  const url = `https://${VHOST}.appfolio.com/api/v2/reports/aged_receivables_detail.json`;
  const response = await appfolioLimiter.schedule(() => axios.post(url, payload, {
    auth: { username: USERNAME, password: PASSWORD },
    headers: { 'Content-Type': 'application/json' },
  }));
  return response.data;
}

// New registration function for MCP
export function registerAgedReceivablesDetailReportTool(server: McpServer) {
  server.tool(
    "get_aged_receivables_detail_report",
    "Returns aged receivables detail for the given filters.", // Description from original registration
    agedReceivablesDetailInputSchema.shape,
    async (toolArgs: z.infer<typeof agedReceivablesDetailInputSchema>) => {
      const data = await getAgedReceivablesDetailReport(toolArgs as AgedReceivablesDetailArgs);
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

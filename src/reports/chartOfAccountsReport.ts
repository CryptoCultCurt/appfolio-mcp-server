import axios from 'axios';
import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import dotenv from 'dotenv';
import { appfolioLimiter } from '../appfolio';

dotenv.config();

const { VHOST, USERNAME, PASSWORD } = process.env;

// Originally from src/appfolio.ts (lines 61-63)
export type ChartOfAccountsArgs = {
  columns?: string[];
};

// Originally from src/appfolio.ts (lines 65-79)
export type ChartOfAccountsResult = {
  results: Array<{
    number: string;
    account_name: string;
    account_type: string;
    sub_accountof: string;
    offset_account: string;
    subject_to_tax_authority: string;
    options: string;
    fund_account: string;
    hidden: string;
    gl_account_id: number;
    sub_account_of_id: number | null;
    offset_account_id: number | null;
  }>;
  next_page_url: string;
};

// Originally from src/index.ts (line 73)
const chartOfAccountsArgsSchema = z.object({
  columns: z.array(z.string()).optional().describe('Array of specific columns to include in the report')
});

// Originally from src/appfolio.ts (function starting line 1603)
export async function getChartOfAccountsReport(args: ChartOfAccountsArgs): Promise<ChartOfAccountsResult> {
  if (!VHOST || !USERNAME || !PASSWORD) {
    throw new Error('Missing AppFolio API credentials');
  }

  const payload = { ...args }; // Simple payload, just pass args

  const url = `https://${VHOST}.appfolio.com/api/v2/reports/chart_of_accounts.json`;
  const response = await appfolioLimiter.schedule(() => axios.post(url, payload, {
    auth: { username: USERNAME, password: PASSWORD },
    headers: { 'Content-Type': 'application/json' },
  }));

  return response.data;
}

// New registration function for MCP
export function registerChartOfAccountsReportTool(server: McpServer) {
  server.tool(
    "get_chart_of_accounts_report",
    "Returns the chart of accounts.", // Description from original registration
    chartOfAccountsArgsSchema.shape,
    async (toolArgs: z.infer<typeof chartOfAccountsArgsSchema>) => {
      const data = await getChartOfAccountsReport(toolArgs as ChartOfAccountsArgs);
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

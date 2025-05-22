import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { appfolioLimiter } from '../appfolio';
import axios from 'axios';

const { VHOST, USERNAME, PASSWORD } = process.env;

export type TenantDirectoryArgs = {
  tenant_visibility?: "active" | "inactive" | "all";
  tenant_types?: string[];
  property_visibility?: "active" | "hidden" | "all";
  properties?: {
    properties_ids?: string[];
    property_groups_ids?: string[];
    portfolios_ids?: string[];
    owners_ids?: string[];
  };
  columns?: string[];
};

export type TenantDirectoryResult = {
  results: Array<{
    tenant_id: number;
    tenant_name: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    mobile_phone: string;
    work_phone: string;
    other_phone: string;
    fax: string;
    status: string;
    move_in_date: string | null;
    move_out_date: string | null;
    lease_start_date: string | null;
    lease_end_date: string | null;
    lease_termination_date: string | null;
    lease_termination_reason: string | null;
    lease_termination_notes: string | null;
    lease_termination_fee: string | null;
    lease_termination_fee_paid: string | null;
    lease_termination_fee_waived: string | null;
    lease_termination_fee_waived_reason: string | null;
    lease_termination_fee_waived_notes: string | null;
    lease_termination_fee_waived_by: string | null;
    lease_termination_fee_waived_at: string | null;
    lease_termination_fee_paid_date: string | null;
    lease_termination_fee_paid_by: string | null;
    lease_termination_fee_paid_notes: string | null;
    lease_termination_fee_paid_amount: string | null;
    lease_termination_fee_paid_payment_id: number | null;
    lease_termination_fee_paid_payment_type: string | null;
    lease_termination_fee_paid_payment_method: string | null;
    lease_termination_fee_paid_payment_status: string | null;
    lease_termination_fee_paid_payment_date: string | null;
    lease_termination_fee_paid_payment_amount: string | null;
    lease_termination_fee_paid_payment_notes: string | null;
    lease_termination_fee_paid_payment_created_by: string | null;
    lease_termination_fee_paid_payment_created_at: string | null;
    lease_termination_fee_paid_payment_updated_at: string | null;
    lease_termination_fee_paid_payment_deleted_at: string | null;
    lease_termination_fee_paid_payment_deleted_by: string | null;
    lease_termination_fee_paid_payment_deleted_reason: string | null;
    lease_termination_fee_paid_payment_deleted_notes: string | null;
    property_id: number;
    property_name: string;
    property_address: string;
    property_street: string;
    property_street2: string | null;
    property_city: string;
    property_state: string;
    property_zip: string;
    unit_id: number;
    unit_number: string;
    unit_type: string | null;
    unit_square_feet: number | null;
    unit_bedrooms: number | null;
    unit_bathrooms: number | null;
    unit_floor: number | null;
    unit_floor_plan: string | null;
    unit_floor_plan_id: number | null;
    unit_floor_plan_square_feet: number | null;
    unit_floor_plan_bedrooms: number | null;
    unit_floor_plan_bathrooms: number | null;
    unit_floor_plan_floor: number | null;
    unit_floor_plan_name: string | null;
    unit_floor_plan_description: string | null;
    unit_floor_plan_amenities: string | null;
    unit_floor_plan_amenities_list: string[] | null;
    unit_floor_plan_amenities_string: string | null;
    unit_floor_plan_amenities_html: string | null;
    unit_floor_plan_image_url: string | null;
    unit_floor_plan_image_thumbnail_url: string | null;
    unit_floor_plan_image_small_url: string | null;
    unit_floor_plan_image_medium_url: string | null;
    unit_floor_plan_image_large_url: string | null;
    unit_floor_plan_image_original_url: string | null;
    unit_floor_plan_image_updated_at: string | null;
    unit_floor_plan_image_created_at: string | null;
    unit_floor_plan_image_updated_by: string | null;
    unit_floor_plan_image_created_by: string | null;
    unit_floor_plan_image_deleted_at: string | null;
    unit_floor_plan_image_deleted_by: string | null;
    unit_floor_plan_image_deleted_reason: string | null;
    unit_floor_plan_image_deleted_notes: string | null;
    created_by: string | null;
    created_at: string;
    updated_at: string;
  }>;
  next_page_url: string | null;
};

const tenantDirectoryInputSchema = z.object({
  tenant_visibility: z.enum(["active", "inactive", "all"]).optional().default("active"),
  tenant_types: z.array(z.string()).optional().default(["all"]),
  property_visibility: z.enum(["active", "hidden", "all"]).optional().default("active"),
  properties: z.object({
    properties_ids: z.array(z.string()).optional(),
    property_groups_ids: z.array(z.string()).optional(),
    portfolios_ids: z.array(z.string()).optional(),
    owners_ids: z.array(z.string()).optional()
  }).optional(),
  columns: z.array(z.string()).optional()
});

export async function getTenantDirectoryReport(args: TenantDirectoryArgs): Promise<TenantDirectoryResult> {
  if (!VHOST || !USERNAME || !PASSWORD) throw new Error('Missing AppFolio API credentials');
  
  const payload = { ...args };
  
  const url = `https://${VHOST}.appfolio.com/api/v2/reports/tenant_directory.json`;
  const response = await appfolioLimiter.schedule(() => axios.post(url, payload, {
    auth: { username: USERNAME, password: PASSWORD },
    headers: { 'Content-Type': 'application/json' },
  }));

  return response.data;
}

export function registerTenantDirectoryReportTool(server: McpServer) {
  server.tool(
    "get_tenant_directory_report",
    "Returns tenant directory report for the given filters.",
    tenantDirectoryInputSchema.shape,
    async (args: any, _extra: any) => {
      const data = await getTenantDirectoryReport(args as TenantDirectoryArgs);
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

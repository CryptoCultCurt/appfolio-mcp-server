/**
 * Validation utilities for AppFolio MCP Server
 */

export interface IdValidationError {
  field: string;
  value: string;
  message: string;
}

/**
 * Validates that all values in an array are numeric strings (IDs, not names)
 */
export function validateNumericIds(
  ids: string[] | undefined, 
  fieldName: string,
  entityType: string
): IdValidationError[] {
  if (!ids) return [];
  
  const errors: IdValidationError[] = [];
  
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

/**
 * Validates all standard property-related ID fields
 */
export function validatePropertiesIds(properties: {
  owners_ids?: string[];
  properties_ids?: string[];
  property_groups_ids?: string[];
  portfolios_ids?: string[];
} | undefined): IdValidationError[] {
  if (!properties) return [];
  
  const errors: IdValidationError[] = [];
  
  errors.push(...validateNumericIds(properties.owners_ids, 'owner_id', 'Owner'));
  errors.push(...validateNumericIds(properties.properties_ids, 'property_id', 'Property'));
  errors.push(...validateNumericIds(properties.property_groups_ids, 'property_group_id', 'Property Group'));
  errors.push(...validateNumericIds(properties.portfolios_ids, 'portfolio_id', 'Portfolio'));
  
  return errors;
}

/**
 * Validates all workflow-related ID fields
 */
export function validateWorkflowIds(args: {
  properties_ids?: string[];
  units_ids?: string[];
  tenants_ids?: string[];
  owners_ids?: string[];
  rental_applications_ids?: string[];
  guest_cards_ids?: string[];
  guest_card_interests_ids?: string[];
  service_requests_ids?: string[];
  vendors_ids?: string[];
  property_groups_ids?: string[];
  portfolios_ids?: string[];
}): IdValidationError[] {
  const errors: IdValidationError[] = [];
  
  errors.push(...validateNumericIds(args.properties_ids, 'property_id', 'Property'));
  errors.push(...validateNumericIds(args.units_ids, 'unit_id', 'Unit'));
  errors.push(...validateNumericIds(args.tenants_ids, 'tenant_id', 'Tenant'));
  errors.push(...validateNumericIds(args.owners_ids, 'owner_id', 'Owner'));
  errors.push(...validateNumericIds(args.rental_applications_ids, 'rental_application_id', 'Rental Application'));
  errors.push(...validateNumericIds(args.guest_cards_ids, 'guest_card_id', 'Guest Card'));
  errors.push(...validateNumericIds(args.guest_card_interests_ids, 'guest_card_interest_id', 'Guest Card Interest'));
  errors.push(...validateNumericIds(args.service_requests_ids, 'service_request_id', 'Service Request'));
  errors.push(...validateNumericIds(args.vendors_ids, 'vendor_id', 'Vendor'));
  errors.push(...validateNumericIds(args.property_groups_ids, 'property_group_id', 'Property Group'));
  errors.push(...validateNumericIds(args.portfolios_ids, 'portfolio_id', 'Portfolio'));
  
  return errors;
}

/**
 * Validates any additional single ID fields
 */
export function validateSingleIds(args: {
  [key: string]: string | undefined;
}): IdValidationError[] {
  const errors: IdValidationError[] = [];
  
  for (const [fieldName, value] of Object.entries(args)) {
    if (value && fieldName.endsWith('_id') && !/^\d+$/.test(value)) {
      const entityType = fieldName.replace('_id', '').replace('_', ' ');
      errors.push({
        field: fieldName,
        value: value,
        message: `Invalid ${fieldName}: "${value}". ${entityType} IDs must be numeric strings (e.g. "123"), not ${entityType.toLowerCase()} names.`
      });
    }
  }
  
  return errors;
}

/**
 * Throws an error with helpful messages if validation fails
 */
export function throwOnValidationErrors(errors: IdValidationError[]): void {
  if (errors.length === 0) return;
  
  const errorMessages = errors.map(e => e.message);
  const suggestion = "\n\nTip: Use directory reports (Owner Directory, Property Directory, Unit Directory, etc.) to lookup IDs by name first.";
  
  throw new Error(errorMessages.join('\n') + suggestion);
}

/**
 * Schema description generator for ID fields
 */
export function getIdFieldDescription(fieldName: string, entityType: string, relatedReport?: string): string {
  const baseDesc = `Array of ${entityType} IDs (numeric strings, NOT ${entityType.toLowerCase()} names)`;
  const lookupHint = relatedReport 
    ? ` Use ${relatedReport} to lookup ${entityType.toLowerCase()} IDs by name first if needed.`
    : '';
  return baseDesc + lookupHint;
}

export type AdminResource = "staff" | "vehicles" | "drivers" | "packages" | "pricing";
export type AdminField = {
  name: string; label: string; kind?: "text" | "number" | "date" | "datetime-local" | "textarea" | "select";
  options?: readonly string[]; optional?: boolean; min?: number; max?: number; step?: string; maxLength?: number; hint?: string;
};
export type AdminAction = {
  id: string; label: string; method: "POST" | "PATCH" | "PUT" | "DELETE"; path: string;
  fields: readonly AdminField[]; record?: boolean; stops?: boolean; confirmation?: string;
};
export type AdminDefinition = { title: string; description: string; listPath: string; paginated?: boolean; actions: readonly AdminAction[] };
const field = (name: string, label: string, options: Partial<AdminField> = {}): AdminField => ({ name, label, ...options });
const number = (name: string, label: string, min = 0, step = "1"): AdminField => field(name, label, { kind: "number", min, step });
const select = (name: string, label: string, options: readonly string[]): AdminField => field(name, label, { kind: "select", options });
const staffProfile = [field("firstName", "First name", { maxLength: 100 }), field("lastName", "Last name", { maxLength: 100 }), field("phoneNumber", "Phone number", { hint: "International format, for example +639000000001." }), field("birthDate", "Birth date", { kind: "date", optional: true }), field("homeAddress", "Home address", { optional: true, maxLength: 255 })];
const vehicle = [field("vehicleTypeId", "Vehicle type ID", { hint: "Use an existing vehicle type ID from a vehicle or the vehicle catalog below." }), field("plateNumber", "Plate number", { maxLength: 30 }), field("vehicleModel", "Vehicle model", { maxLength: 150 }), number("passengerCapacity", "Passenger capacity", 1), select("fuelType", "Fuel type", ["GASOLINE", "DIESEL", "ELECTRIC", "HYBRID"]), number("fuelEfficiency", "Fuel efficiency (km/L)", 0.01, "0.01"), field("yearModel", "Model year", { kind: "number", min: 1900, max: new Date().getUTCFullYear() + 1 }), field("color", "Color", { maxLength: 80 })];
const license = [field("licenseNumber", "Licence number", { maxLength: 100 }), field("licenseExpiry", "Licence expiry", { kind: "date" })];
const packageFields = [field("packageName", "Package name", { maxLength: 150 }), field("description", "Description", { kind: "textarea", maxLength: 5000 }), number("basePrice", "Base price (PHP)", 0, "0.01"), number("estimatedDurationMinutes", "Duration (minutes)", 1)];
export const stopFields: readonly AdminField[] = [
  field("locationName", "Location name", { maxLength: 150 }), field("formattedAddress", "Address", { maxLength: 255 }),
  field("activity", "Activity", { maxLength: 255 }), number("latitude", "Latitude", -90, "any"),
  { ...number("longitude", "Longitude", -180, "any"), max: 180 }, number("defaultStopMinutes", "Stop duration (minutes)"),
].map(item => item.name === "latitude" ? { ...item, max: 90 } : item);
export const adminResources: Record<AdminResource, AdminDefinition> = {
  staff: { title: "Staff", description: "Onboard existing Auth identities and maintain employment records.", listPath: "admin/staff", paginated: true, actions: [
    { id: "create", label: "Create staff profile", method: "POST", path: "admin/staff", fields: [field("userId", "Auth user ID", { hint: "An existing Supabase Auth account without an application profile is required." }), ...staffProfile] },
    { id: "edit", label: "Edit profile", method: "PATCH", path: "admin/staff/:id/profile", record: true, fields: staffProfile },
    { id: "employment", label: "Change employment status", method: "PATCH", path: "admin/staff/:id/employment-status", record: true, fields: [select("employmentStatus", "Employment status", ["ACTIVE", "INACTIVE", "SUSPENDED"])], confirmation: "Changing employment can revoke access and affect a linked Driver. Confirm the selected status." },
  ] },
  vehicles: { title: "Vehicles", description: "Maintain vehicle records, readiness and designated Driver pairings.", listPath: "staff/vehicles", paginated: true, actions: [
    { id: "create", label: "Create vehicle", method: "POST", path: "admin/fleet/vehicles", fields: vehicle },
    { id: "edit", label: "Edit vehicle", method: "PATCH", path: "admin/fleet/vehicles/:id", record: true, fields: vehicle },
    { id: "status", label: "Change readiness", method: "PATCH", path: "staff/vehicles/:id/status", record: true, fields: [select("vehicleStatus", "Vehicle status", ["AVAILABLE", "UNAVAILABLE", "MAINTENANCE", "INACTIVE"])] },
    { id: "pair", label: "Set designated Driver", method: "PUT", path: "staff/vehicles/:id/designated-driver", record: true, fields: [field("driverId", "Driver ID", { optional: true, hint: "Use an existing Driver ID. Leave blank to remove the pairing." })] },
    { id: "delete", label: "Remove vehicle", method: "DELETE", path: "admin/fleet/vehicles/:id", record: true, fields: [], confirmation: "This removes the vehicle from the active fleet. Existing booking history is retained." },
  ] },
  drivers: { title: "Drivers", description: "Link Staff to Driver records and maintain licences and readiness.", listPath: "staff/drivers", paginated: true, actions: [
    { id: "create", label: "Create Driver", method: "POST", path: "admin/fleet/drivers", fields: [field("staffId", "Staff ID", { hint: "Use an active Staff record without an existing Driver link." }), ...license] },
    { id: "edit", label: "Edit licence", method: "PATCH", path: "admin/fleet/drivers/:id", record: true, fields: license },
    { id: "status", label: "Change readiness", method: "PATCH", path: "staff/drivers/:id/status", record: true, fields: [select("driverStatus", "Driver status", ["AVAILABLE", "UNAVAILABLE", "INACTIVE"])] },
    { id: "deactivate", label: "Deactivate Driver", method: "POST", path: "admin/fleet/drivers/:id/deactivate", record: true, fields: [], confirmation: "Deactivate this Driver? Existing assignments and holds can prevent this action." },
  ] },
  packages: { title: "Tour Packages", description: "Maintain package details, ordered stops and catalog activation.", listPath: "staff/tour-packages", actions: [
    { id: "create", label: "Create package", method: "POST", path: "admin/tour-packages", fields: packageFields, stops: true },
    { id: "edit", label: "Edit package", method: "PATCH", path: "admin/tour-packages/:id", record: true, fields: packageFields },
    { id: "stops", label: "Replace route", method: "PUT", path: "admin/tour-packages/:id/stops", record: true, fields: [], stops: true, confirmation: "Replace this package route? Existing booking snapshots remain unchanged." },
    { id: "activate", label: "Activate package", method: "POST", path: "admin/tour-packages/:id/activate", record: true, fields: [] },
    { id: "deactivate", label: "Deactivate package", method: "POST", path: "admin/tour-packages/:id/deactivate", record: true, fields: [], confirmation: "Hide this package from the customer catalog?" },
  ] },
  pricing: { title: "Pricing", description: "Create effective pricing configurations and control activation.", listPath: "admin/pricing-configurations", actions: [
    { id: "create", label: "Create pricing configuration", method: "POST", path: "admin/pricing-configurations", fields: [field("vehicleTypeId", "Vehicle type ID"), number("baseRate", "Base rate (PHP)", 0, "0.01"), number("minAdjustmentPct", "Minimum adjustment (%)", 0, "0.01"), number("maxAdjustmentPct", "Maximum adjustment (%)", 0, "0.01"), field("effectiveFrom", "Effective from", { kind: "datetime-local" }), field("effectiveUntil", "Effective until", { kind: "datetime-local", optional: true })] },
    { id: "activate", label: "Activate pricing", method: "POST", path: "admin/pricing-configurations/:id/activate", record: true, fields: [], confirmation: "Activate this configuration? Overlapping active periods are rejected by the backend." },
    { id: "deactivate", label: "Deactivate pricing", method: "POST", path: "admin/pricing-configurations/:id/deactivate", record: true, fields: [], confirmation: "Deactivate this configuration? New quotes need an active effective price." },
  ] },
};
export const resourceKeys = Object.keys(adminResources) as AdminResource[];
export function isAdminResource(value: string): value is AdminResource { return resourceKeys.includes(value as AdminResource); }
export function isAdministrator(role: string | null | undefined): boolean { return role === "ADMIN"; }
export function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null && !Array.isArray(value); }
export function text(value: unknown): string { return typeof value === "string" || typeof value === "number" ? String(value) : ""; }
export function recordTitle(resource: AdminResource, row: Record<string, unknown>): string {
  const user = isRecord(row.user) ? row.user : isRecord(row.staff) && isRecord(row.staff.user) ? row.staff.user : {};
  return [user.firstName, user.lastName].filter(Boolean).join(" ") || text(row.vehicleModel) || text(row.packageName) || (resource === "pricing" ? "PHP " + text(row.baseRate) : text(row.licenseNumber)) || "Record";
}
export function recordStatus(row: Record<string, unknown>): string {
  return text(row.employmentStatus || row.vehicleStatus || row.driverStatus || row.packageStatus) || (typeof row.isActive === "boolean" ? row.isActive ? "ACTIVE" : "INACTIVE" : "");
}

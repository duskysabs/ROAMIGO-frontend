export const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const paymentMethods = ["BANK_TRANSFER", "E_WALLET", "CASH", "OTHER"] as const;
export const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
export type QueueResource = "payments" | "assignments";
export type AccountingCommand = { operation: "record" | "approve" | "reject" | "retry"; id: string; values: Record<string, string>; confirmed: true };

export function commandPath(resource: string, body: unknown): { path: string; values: Record<string, string> } | null {
  if (!isRecord(body) || Object.keys(body).some(key => !["operation", "id", "values", "confirmed"].includes(key)) ||
      typeof body.id !== "string" || !uuidPattern.test(body.id) || body.confirmed !== true || !isRecord(body.values)) return null;
  const values = body.values;
  const reason = typeof values.reason === "string" ? values.reason.trim() : "";
  if (resource === "assignments" && body.operation === "retry" && Object.keys(values).length === 0) {
    return { path: "staff/assignment-requests/" + body.id + "/retry", values: {} };
  }
  if (resource !== "payments" || reason.length < 3 || reason.length > 500) return null;
  if ((body.operation === "approve" || body.operation === "reject") && Object.keys(values).every(key => key === "reason")) {
    return { path: "staff/payment-reviews/" + body.id + "/" + body.operation, values: { reason } };
  }
  if (body.operation !== "record" || Object.keys(values).some(key => !["method", "reference", "amount", "reason"].includes(key)) ||
      typeof values.method !== "string" || !paymentMethods.some(method => method === values.method) ||
      typeof values.reference !== "string" || !/^[A-Z0-9][A-Z0-9._:/-]{2,99}$/.test(values.reference.trim().toUpperCase()) ||
      typeof values.amount !== "string" || !/^(?:0|[1-9]\d{0,9})\.\d{2}$/.test(values.amount) || Number(values.amount) <= 0) return null;
  return { path: "staff/bookings/" + body.id + "/payments/manual", values: {
    method: values.method, reference: values.reference.trim().toUpperCase(), amount: values.amount, reason,
  } };
}
export type PendingPayment = {
  id: string; bookingId: string; amount: string; currency: string; paymentMethod: string;
  paymentStatus: string; providerReference: string; createdAt: string;
  audits: { action: string; reason: string; occurredAt: string }[];
};
export type PendingAssignment = {
  bookingId: string; attempts: number; lastFailure: string | null; isRecovery: boolean;
  booking: { startDatetime: string; endDatetime: string; bookingStatus: string };
};
export type QueuePage = { payments: PendingPayment[]; assignments: PendingAssignment[]; nextCursor: string | null };
const validDate = (value: unknown) => typeof value === "string" && Number.isFinite(Date.parse(value));
const strings = (row: Record<string, unknown>, keys: string[]) => keys.every(key => typeof row[key] === "string");
export function parseQueue(resource: QueueResource, value: unknown): QueuePage {
  if (!isRecord(value) || !Array.isArray(value.items) || !(value.nextCursor === null || (typeof value.nextCursor === "string" && uuidPattern.test(value.nextCursor)))) throw new Error("The queue response was invalid. Please refresh.");
  if (resource === "payments") {
    const payments = value.items.map(row => {
      if (!isRecord(row) || !strings(row, ["id", "bookingId", "amount", "currency", "paymentMethod", "paymentStatus", "providerReference", "createdAt"]) ||
          !uuidPattern.test(String(row.id)) || !uuidPattern.test(String(row.bookingId)) || row.currency !== "PHP" || row.paymentStatus !== "PENDING" || !Number.isFinite(Number(row.amount)) || Number(row.amount) <= 0 || !validDate(row.createdAt) ||
          !Array.isArray(row.audits) || row.audits.some(audit => !isRecord(audit) || !strings(audit, ["action", "reason", "occurredAt"]) || !validDate(audit.occurredAt))) throw new Error("The payment response was invalid. Please refresh.");
      return row as PendingPayment;
    });
    return { payments, assignments: [], nextCursor: value.nextCursor };
  }
  const assignments = value.items.map(row => {
    if (!isRecord(row) || typeof row.bookingId !== "string" || !uuidPattern.test(row.bookingId) || typeof row.attempts !== "number" || !Number.isSafeInteger(row.attempts) || row.attempts < 0 || typeof row.isRecovery !== "boolean" ||
        !(row.lastFailure === null || typeof row.lastFailure === "string") || !isRecord(row.booking) ||
        !strings(row.booking, ["startDatetime", "endDatetime", "bookingStatus"]) || !validDate(row.booking.startDatetime) || !validDate(row.booking.endDatetime)) throw new Error("The assignment response was invalid. Please refresh.");
    return row as PendingAssignment;
  });
  return { payments: [], assignments, nextCursor: value.nextCursor };
}
export function assignmentMessage(value: unknown): string {
  if (!isRecord(value)) return "Assignment status is unavailable. Check the assignment queue.";
  if (value.status === "ASSIGNED") return "An internal driver and vehicle were assigned and dispatched.";
  if (value.status === "COMPLETED") return "This booking is already completed.";
  const reasons: Record<string, string> = {
    NO_ELIGIBLE_PAIR: "No eligible driver and vehicle pair is available.",
    EARLIER_PAID_BOOKING_PENDING: "An earlier overlapping paid booking takes priority.",
    OUTSOURCED_FULFILMENT_REQUIRES_REVIEW: "Outsourced fulfilment needs staff review.",
    TRIP_INTERVAL_ELAPSED: "The trip interval has elapsed.",
    FULL_PAYMENT_REQUIRED: "The exact full payment must be verified first.",
    BOOKING_STATE_CHANGED: "The booking state changed. Review it before retrying.",
    RETRY_REQUIRED: "The allocation attempt needs another retry.",
    DISPATCH_REQUIRES_REVIEW: "Dispatch requires staff review.",
  };
  return "Assignment remains pending. " + (typeof value.reason === "string" && Object.hasOwn(reasons, value.reason) ? reasons[value.reason] : "Review the booking and resource readiness before retrying.");
}

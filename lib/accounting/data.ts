export const accountingNavigation = [
  ["", "Dashboard", 6], ["payments", "Payments", 7],
  ["receivables", "Accounts Receivable", 8], ["refunds", "Refunds", 9],
  ["customers", "Customer Accounts", 10], ["reports", "Accounting Reports", 11],
  ["notifications", "Notifications", 12],
] as const;
export type Payment = { id: string; booking: string; customer: string; channel: string; amount: number; received: string; status: string; notes: string };
export const initialPayments: Payment[] = [
  { id: "PAY-6319", booking: "BKG-2026-0721", customer: "Nina Cruz", channel: "PayMongo", amount: 6800, received: "2026-07-21", status: "Paid", notes: "Online payment" },
  { id: "PAY-6320", booking: "BKG-2026-0720", customer: "Marco Lim", channel: "GCash / PayMongo", amount: 3360, received: "2026-07-21", status: "Paid", notes: "Online payment" },
  { id: "PAY-6321", booking: "BKG-2026-0718", customer: "Ramon Diaz", channel: "Cash", amount: 5000, received: "2026-07-21", status: "Paid", notes: "Manual collection" },
  { id: "PAY-6322", booking: "BKG-2026-0717", customer: "Leah Ong", channel: "Bank Deposit", amount: 7200, received: "2026-07-21", status: "Needs Review", notes: "Deposit awaiting verification" },
];
export const receivables = [
  { customer: "Marco Lim", booking: "BKG-2026-0722", approved: 24500, paid: 8000, due: "2026-07-25", aging: "Current" },
  { customer: "Mika Flores", booking: "BKG-2026-0708", approved: 14400, paid: 7200, due: "2026-07-19", aging: "3 days overdue" },
  { customer: "Paolo Sy", booking: "BKG-2026-0698", approved: 18900, paid: 5000, due: "2026-07-15", aging: "7 days overdue" },
];
export type Refund = { id: string; booking: string; customer: string; amount: number; reason: string; status: string; notes: string };
export const initialRefunds: Refund[] = [
  { id: "RFD-204", booking: "BKG-2026-0688", customer: "Carla Gomez", amount: 4200, reason: "Eligible cancellation", status: "Refunded", notes: "Completed refund" },
  { id: "RFD-205", booking: "BKG-2026-0704", customer: "Ben Uy", amount: 3900, reason: "Trip cancelled by customer", status: "Requested", notes: "" },
  { id: "RFD-206", booking: "BKG-2026-0712", customer: "Maria Santos", amount: 5100, reason: "Eligible cancellation", status: "Requested", notes: "" },
  { id: "RFD-207", booking: "BKG-2026-0718", customer: "Angela Reyes", amount: 3000, reason: "Cancellation outside policy", status: "Rejected", notes: "Outside the refund policy" },
];
export const accounts = [
  { customer: "Angela Reyes", contact: "0917 555 3012", bookings: 3, balance: 0, type: "Individual" },
  { customer: "Marco Lim", contact: "0920 881 4430", bookings: 2, balance: 7840, type: "Corporate" },
  { customer: "Nina Cruz", contact: "0918 443 2011", bookings: 5, balance: 0, type: "Individual" },
  { customer: "Jared Tan", contact: "0916 220 1890", bookings: 1, balance: 0, type: "Individual" },
];

// Reference period for the standalone receivables fixture.
export const receivablesReference = { dateLabel: "July 22, 2026", dueSoonDays: 3 };
export const receivablesSummary = {
  total: receivables.reduce((sum, r) => sum + r.approved - r.paid, 0),
  count: receivables.length,
  dueSoon: receivables.filter(r => r.aging === "Current").reduce((sum, r) => sum + r.approved - r.paid, 0),
  overdue: receivables.filter(r => r.aging !== "Current").reduce((sum, r) => sum + r.approved - r.paid, 0),
  overdueCount: receivables.filter(r => r.aging !== "Current").length,
};

export type BookingStatus = "Under Review" | "Confirmed" | "For Payment" | "Cancelled" | "Completed";
export type StaffBooking = {
  id: string; type: "Custom Trip" | "Tour Package" | "Direct Ride";
  route: string; date: string; start: string; end: string; passengers: number;
  vehicleId: string; customerId: string; status: BookingStatus; notes: string;
  quotation: number | null; decisionNotes: string;
};
export const customers = [
  { id: "CUS-2026-0287", name: "Juan Miguel Dela Cruz", email: "juanmiguel.delacruz@example.com", phone: "+63 917 555 0823", address: "Banilad, Cebu City", type: "Noncorporate" },
  { id: "CUS-2026-0288", name: "Juanito Dela Cruz", email: "juanito.delacruz@example.com", phone: "+63 917 123 4567", address: "Lapu-Lapu City, Cebu", type: "Corporate" },
  { id: "CUS-2026-0289", name: "Maria Alejandra", email: "maria.alejandra@example.com", phone: "+63 917 555 0824", address: "Mandaue City, Cebu", type: "Noncorporate" },
  { id: "CUS-2026-0290", name: "Kevin Paul Tan", email: "kevin.tan@example.com", phone: "+63 917 555 0825", address: "Cebu City", type: "Corporate" },
  { id: "CUS-2026-0291", name: "Jerome Reyes", email: "jerome.reyes@example.com", phone: "+63 917 555 0826", address: "Talisay City, Cebu", type: "Noncorporate" },
];
export const vehicles = [
  { id: "V-01", name: "Toyota Coaster", plate: "NFO 1234", type: "Mini Bus", capacity: 25, readiness: 100, status: "Available", driver: "Alvin Jay Celis", rate: 10500, image: "/images/staff/fleet-imgImage11.png" },
  { id: "V-02", name: "Toyota Hiace", plate: "NGN 1234", type: "Van", capacity: 15, readiness: 95, status: "Available", driver: "Christian B. Apurado", rate: 7000, image: "/images/staff/fleet-imgImage13.png" },
  { id: "V-03", name: "Toyota Innova", plate: "GAF 1234", type: "MPV", capacity: 7, readiness: 90, status: "Assigned", driver: "Juan Dela Cruz", rate: 4500, image: "/images/staff/fleet-imgImage10.png" },
  { id: "V-04", name: "Toyota Innova", plate: "GBK 1234", type: "MPV", capacity: 7, readiness: 90, status: "Available", driver: "Mark Joseph Lirio", rate: 4500, image: "/images/staff/fleet-imgImage10.png" },
  { id: "V-05", name: "Toyota Innova", plate: "BFE 1234", type: "MPV", capacity: 7, readiness: 90, status: "Assigned", driver: "Rey Abad", rate: 4500, image: "/images/staff/fleet-imgImage10.png" },
  { id: "V-06", name: "Toyota Innova", plate: "AFG 1234", type: "MPV", capacity: 7, readiness: 80, status: "Under Inspection", driver: "Isaac Gomez", rate: 4500, image: "/images/staff/fleet-imgImage10.png" },
  { id: "V-07", name: "Toyota Innova", plate: "GER 1234", type: "MPV", capacity: 7, readiness: 30, status: "Under Maintenance", driver: "Nilo Tamayo", rate: 4500, image: "/images/staff/fleet-imgImage10.png" },
];
export const initialBookings: StaffBooking[] = [
  { id: "BKG-2026-0163", type: "Custom Trip", route: "Quest Hotel & Conference Center Cebu → Santander Pebbles Resort", date: "2026-05-25", start: "06:00", end: "20:00", passengers: 11, vehicleId: "V-02", customerId: customers[0].id, status: "Under Review", notes: "Please be early. We have 2 children going, please prepare child seats.", quotation: null, decisionNotes: "" },
  { id: "BKG-2026-0162", type: "Tour Package", route: "Oslob Whale Watching Tour Package", date: "2026-05-24", start: "06:00", end: "20:00", passengers: 6, vehicleId: "V-02", customerId: customers[1].id, status: "Confirmed", notes: "Please be early for the pickup.", quotation: 11150, decisionNotes: "Price approved." },
  { id: "BKG-2026-0161", type: "Direct Ride", route: "Mandarin Hotel → Mactan International Airport", date: "2026-05-23", start: "06:00", end: "08:00", passengers: 4, vehicleId: "V-04", customerId: customers[2].id, status: "Cancelled", notes: "", quotation: null, decisionNotes: "Customer cancelled." },
  { id: "BKG-2026-0160", type: "Custom Trip", route: "Mandarin Hotel → Mactan International Airport", date: "2026-05-22", start: "06:00", end: "20:00", passengers: 21, vehicleId: "V-01", customerId: customers[3].id, status: "Confirmed", notes: "Travelling with fragile equipment.", quotation: 14650, decisionNotes: "Price approved." },
  { id: "BKG-2026-0159", type: "Custom Trip", route: "Mandarin Hotel → Mactan International Airport", date: "2026-05-21", start: "06:00", end: "20:00", passengers: 4, vehicleId: "V-04", customerId: customers[4].id, status: "For Payment", notes: "", quotation: 8650, decisionNotes: "Price approved." },
  { id: "BKG-2026-0158", type: "Custom Trip", route: "Mandarin Hotel → Mactan International Airport", date: "2026-05-20", start: "06:00", end: "20:00", passengers: 4, vehicleId: "V-04", customerId: customers[0].id, status: "Completed", notes: "", quotation: 8650, decisionNotes: "Price approved." },
  { id: "BKG-2026-0157", type: "Custom Trip", route: "Cebu City → Moalboal", date: "2026-05-26", start: "07:00", end: "18:00", passengers: 8, vehicleId: "V-02", customerId: customers[2].id, status: "Under Review", notes: "Hotel pickup requested.", quotation: null, decisionNotes: "" },
  { id: "BKG-2026-0156", type: "Tour Package", route: "Cebu City Heritage Tour", date: "2026-05-27", start: "08:00", end: "17:00", passengers: 5, vehicleId: "V-04", customerId: customers[1].id, status: "For Payment", notes: "", quotation: 8650, decisionNotes: "Price approved." },
];
export const staffNavigation = [
  { href: "/staff", label: "Dashboard", icon: "▦" },
  { href: "/staff/bookings", label: "Bookings", icon: "▣" },
  { href: "/staff/calendar", label: "Calendar", icon: "▥" },
  { href: "/staff/fleet", label: "Fleet Availability", icon: "▦" },
  { href: "/staff/customers", label: "Customer Records", icon: "♧" },
  { href: "/staff/reports", label: "Booking Reports", icon: "▧" },
];
export const money = (value: number) => new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(value);
export const dateLabel = (value: string) => new Date(`${value}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
export function vehicleAvailable(vehicleId: string, date: string, start: string, end: string, bookings: StaffBooking[], excludeId?: string) {
  const vehicle = vehicles.find(v => v.id === vehicleId);
  return Boolean(vehicle && vehicle.status === "Available" && !bookings.some(b => b.id !== excludeId && b.vehicleId === vehicleId && b.date === date && b.status !== "Cancelled" && b.status !== "Completed" && b.start < end && b.end > start));
}
export function filterBookings(bookings: StaffBooking[], query: string, type = "All Types", status = "All Statuses", vehicle = "All Vehicle Types") {
  const term = query.toLowerCase().trim();
  return bookings.filter(b => (type === "All Types" || b.type === type) && (status === "All Statuses" || b.status === status) && (vehicle === "All Vehicle Types" || vehicles.find(v => v.id === b.vehicleId)?.name === vehicle) && `${b.id} ${b.route} ${customers.find(c => c.id === b.customerId)?.name ?? ""}`.toLowerCase().includes(term));
}
export function csvCell(value: string | number) {
  const text = String(value);
  return `"${(/^[=+@\-\t\r]/.test(text) ? "'" : "") + text.replaceAll('"', '""')}"`;
}

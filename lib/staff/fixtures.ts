// Presentation fixtures for the Booking workspace. Replace these with API data when integrated.

export const statusData = [["Confirmed", 238, "65%"], ["Under Review", 67, "18%"], ["Awaiting Payment", 28, "8%"], ["Cancelled", 17, "5%"], ["Completed", 18, "5%"]] as const;

export const demand = [["Toyota Hiace", 142, "38.6%", "imgImage12"], ["Toyota Innova", 98, "26.6%", "imgImage8"], ["Toyota Fortuner", 76, "20.7%", "imgImage10"], ["Toyota Coaster", 36, "9.8%", "imgImage11"], ["Hyundai Elantra", 16, "4.3%", "imgImage9"]] as const;

export const destinations = [["Mactan International Airport", 112], ["Moalboal", 68], ["Oslob", 45], ["Danao", 32], ["Santander", 28]] as const;

export const monthlyStats = [{ label: "Total Bookings", value: 368, note: "May 1 – May 31, 2026", tone: "red" }, { label: "Confirmed Trips", value: 142, note: "May 1 – May 31, 2026", tone: "green" }, { label: "Active Assignments", value: 156, note: "May 1 – May 31, 2026", tone: "blue" }, { label: "Pending Bookings", value: 20, note: "May 1 – May 31, 2026", tone: "purple" }, { label: "Rebooking Requests", value: 28, note: "May 1 – May 31, 2026", tone: "amber" }, { label: "Cancellations", value: 21, note: "May 1 – May 31, 2026", tone: "red" }];

export const reportPeriod = "2026-05";
export const reportTotal = monthlyStats[0].value;
export const destinationAxis = [0, 30, 60, 90, 120];

export const notices = [
  { id: "1", title: "Booking Request BKG-2026-0163", text: "Juan Dela Cruz has a booking for May 29–31, 2026.", date: "May 23, 2026", time: "10:24 AM", href: "/staff/bookings/BKG-2026-0163" },
  { id: "2", title: "Vehicle Unavailable for BKG-2026-1111", text: "Vehicle unavailable for booking.", date: "May 23, 2026", time: "9:13 AM", href: "/staff/fleet" },
  { id: "3", title: "Booking Approved for BKG-2026-1534", text: "Booking for Ethan has been approved by Maria.", date: "May 23, 2026", time: "8:30 AM", href: "/staff/bookings" },
  { id: "4", title: "Vehicle Maintenance for MAI-2026-3014", text: "Toyota Innova · GBK 1435 · Due for oil change.", date: "May 23, 2026", time: "8:30 AM", href: "/staff/fleet" },
];

export const dashboardFleetReadiness = [
        ["Toyota Coaster", "50%", "imgImage15"], ["Toyota Innova", "80%", "imgImage19"], ["Toyota Hiace", "70%", "imgImage16"], ["Toyota Fortuner", "30%", "imgImage20"], ["Hyundai Elantra", "100%", "imgImage21"],
      ];

export const dashboardTasks = [
  { href: "/staff/bookings/BKG-2026-0163", title: "New Booking!", detail: "BKG-2026-0163 · Mandaue → Badian" },
  { href: "/staff/fleet", title: "Vehicle Registration Expiring Soon", detail: "Toyota Coaster · NFO 1234" },
  { href: "/staff/bookings/BKG-2026-0161", title: "Booking was cancelled!", detail: "BKG-2026-0161 · Mandaue → Lapu-Lapu" },
];

export const fleetReadinessOverview = [["Vehicle Documents", 100, "All documents valid"], ["Insurance Coverage", 80, "1 vehicle expiring soon"], ["Maintenance", 100, "Maintenance overview"]];

export const fleetAvailabilityGradient = "conic-gradient(#52ab61 0 43%, #7b43b0 43% 71%, #ffb000 71% 85%, #858585 85% 100%)";

export const fleetPermitReminder = "Toyota Hiace insurance expires soon. Coordinate with the Fleet Supervisor.";

export const pricingCharges: [string, number][] = [["Distance Charge", 550], ["Duration Charge", 350], ["Fuel Charge", 3000], ["Demand / Schedule Factor", 150], ["Misc. Charge", 100]];

export const bookingDetailDefaults = { submitted: "May 18, 2026", stopMinutes: 180, stopName: "Oslob Whale Watching" };

export const bookingFormDefaults: { type: "Custom Trip"; date: string; start: string; end: string; passengers: number; vehicleId: string; referencePrefix: string } = {
  type: "Custom Trip", date: "2026-05-28", start: "06:00", end: "20:00", passengers: 1, vehicleId: "V-02", referencePrefix: "BKG-2026",
};
export const tourPackages = ["Oslob Whale Watching Tour Package", "Cebu City Heritage Tour"];
export const calendarAnchor = "2026-05-24";

export const vehiclePresentationImages: Record<string, { create: string; details: string }> = {
  "V-01": { create: "/images/staff/create-imgImage11.png", details: "/images/staff/details-imgImage11.png" },
  "V-02": { create: "/images/staff/create-imgImage13.png", details: "/images/staff/details-imgImage13.png" },
};

import type { CSSProperties } from "react";

const paths: Record<string, string> = {
  dashboard: "M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z",
  bookings: "M8 3H5v18h14V3h-3 M8 2h8v4H8z M8 11h8 M8 15h5",
  calendar: "M3 5h18v16H3z M7 2v6 M17 2v6 M3 10h18 M7 14h2 M15 14h2",
  fleet: "M4 16V7h13l3 5v4 M3 16h18 M7 16a2 2 0 1 0 0 .01 M17 16a2 2 0 1 0 0 .01 M4 11h15",
  customers: "M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0 M5 21v-3a7 7 0 0 1 14 0v3 M19 4a3 3 0 0 1 0 6 M22 19v-2a5 5 0 0 0-3-4",
  reports: "M4 3v18h17 M8 16v-4 M13 16V8 M18 16V5",
  notifications: "M5 17h14l-2-3V9a5 5 0 0 0-10 0v5z M10 21h4",
  search: "M16 10a6 6 0 1 1-12 0 6 6 0 0 1 12 0 M15 15l6 6",
  arrow: "M5 12h14 M13 6l6 6-6 6",
};

export default function StaffIcon({ name, style }: { name: string; style?: CSSProperties }) {
  return <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={style}><path d={paths[name] ?? paths.bookings} /></svg>;
}

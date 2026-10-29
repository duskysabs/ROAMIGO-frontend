"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { initialBookings, type StaffBooking } from "@/lib/staff/data";

type StaffContextValue = {
  bookings: StaffBooking[];
  updateBooking: (booking: StaffBooking) => void;
  addBooking: (booking: StaffBooking) => void;
  query: string;
  setQuery: (query: string) => void;
  message: string;
  announce: (message: string) => void;
};
const StaffContext = createContext<StaffContextValue | null>(null);

export function StaffProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] = useState(initialBookings);
  const [query, setQuery] = useState("");
  const [message, announce] = useState("");
  return <StaffContext value={{ bookings, query, setQuery, message, announce,
    updateBooking: booking => setBookings(items => items.map(item => item.id === booking.id ? booking : item)),
    addBooking: booking => setBookings(items => [booking, ...items]),
  }}>{children}</StaffContext>;
}

export function useStaff() {
  const context = useContext(StaffContext);
  if (!context) throw new Error("Staff components require StaffProvider.");
  return context;
}

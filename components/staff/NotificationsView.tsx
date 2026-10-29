"use client";

import Link from "next/link";
import { useState } from "react";
import Button from "@/components/ui/button";
import { useStaff } from "./StaffProvider";
import { Empty, PageHeading } from "./StaffUI";

const notices = [
  { id: "1", title: "Booking Request BKG-2026-0163", text: "Juan Dela Cruz has a booking for May 29–31, 2026.", time: "10:24 AM", href: "/staff/bookings/BKG-2026-0163" },
  { id: "2", title: "Vehicle Unavailable for BKG-2026-1111", text: "Vehicle unavailable for booking.", time: "9:13 AM", href: "/staff/fleet" },
  { id: "3", title: "Booking Approved for BKG-2026-1534", text: "Booking for Ethan has been approved by Maria.", time: "8:30 AM", href: "/staff/bookings" },
  { id: "4", title: "Vehicle Maintenance for MAI-2026-3014", text: "Toyota Innova · GBK 1435 · Due for oil change.", time: "8:30 AM", href: "/staff/fleet" },
];
export default function NotificationsView() {
  const { query, announce } = useStaff();
  const [read, setRead] = useState<string[]>([]);
  const shown = notices.filter(n => `${n.title} ${n.text}`.toLowerCase().includes(query.toLowerCase()));
  return <><PageHeading title="Notifications" description="Role-based alerts for bookings, inquiries, price approvals, payments, fleet, and schedules." action={<Button size="sm" variant="outline" className="staff-button" disabled={read.length === notices.length} onClick={() => { setRead(notices.map(n => n.id)); announce("All preview notifications marked as read."); }}>Mark all as read</Button>} /><div className="staff-notices">{shown.map(n => <Link key={n.id} href={n.href} className={`staff-notice ${read.includes(n.id) ? "read" : ""}`} onClick={() => setRead(items => [...new Set([...items, n.id])])}><span className="staff-notice-icon" aria-hidden="true" /><div><strong>{n.title}</strong><p>{n.text}</p></div><time><strong>{n.time}</strong><span>May 23, 2026</span><small>{read.includes(n.id) ? "Read" : "Unread"}</small></time></Link>)}{!shown.length ? <Empty /> : null}</div></>;
}

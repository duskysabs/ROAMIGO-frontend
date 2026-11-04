"use client";

import { notices } from "@/lib/staff/fixtures";

import Link from "next/link";
import { useState } from "react";
import Button from "@/components/ui/button";
import { useStaff } from "./StaffProvider";
import { Empty, PageHeading } from "./StaffUI";


export default function NotificationsView() {
  const { query, announce } = useStaff();
  const [read, setRead] = useState<string[]>([]);
  const shown = notices.filter(n => `${n.title} ${n.text}`.toLowerCase().includes(query.toLowerCase()));
  return <><PageHeading title="Notifications" description="Role-based alerts for bookings, inquiries, price approvals, payments, fleet, and schedules." action={<Button size="sm" variant="outline" className="staff-button" disabled={read.length === notices.length} onClick={() => { setRead(notices.map(n => n.id)); announce("All notifications marked as read."); }}>Mark all as read</Button>} /><div className="staff-notices">{shown.map(n => <Link key={n.id} href={n.href} className={`staff-notice ${read.includes(n.id) ? "read" : ""}`} onClick={() => setRead(items => [...new Set([...items, n.id])])}><span className="staff-notice-icon" aria-hidden="true" /><div><strong>{n.title}</strong><p>{n.text}</p></div><time><strong>{n.time}</strong><span>{n.date}</span><small>{read.includes(n.id) ? "Read" : "Unread"}</small></time></Link>)}{!shown.length ? <Empty /> : null}</div></>;
}

"use client";

import Link from "next/link";
import { useState } from "react";
import Button from "@/components/ui/button";
import { customers, dateLabel, vehicles } from "@/lib/staff/data";
import { useStaff } from "./StaffProvider";
import { Badge, Empty, PageHeading, Panel } from "./StaffUI";

const isoDay = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
function weekStart(value: string) { const date = new Date(`${value}T12:00:00`); date.setDate(date.getDate() - date.getDay()); return date; }

export default function CalendarView() {
  const { bookings, query } = useStaff();
  const [anchor, setAnchor] = useState("2026-05-24");
  const [mode, setMode] = useState<"Week" | "Month">("Week");
  const start = mode === "Week" ? weekStart(anchor) : weekStart(`${anchor.slice(0, 7)}-01`);
  const days = Array.from({ length: mode === "Week" ? 7 : 42 }, (_, i) => { const d = new Date(start); d.setDate(d.getDate() + i); return d; });
  const visible = bookings.filter(b => !["Cancelled", "Completed"].includes(b.status) && `${b.id} ${b.route}`.toLowerCase().includes(query.toLowerCase()));
  const range = mode === "Week" ? `${dateLabel(isoDay(days[0]))} – ${dateLabel(isoDay(days[6]))}` : new Date(`${anchor}T12:00:00`).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  function move(direction: number) { const d = new Date(`${anchor}T12:00:00`); if (mode === "Week") d.setDate(d.getDate() + direction * 7); else { d.setDate(1); d.setMonth(d.getMonth() + direction); } setAnchor(isoDay(d)); }
  return <><PageHeading title="Booking Calendar" description="Confirmed trips, tentative bookings, assignments, maintenance, and conflicts." /><div className="staff-calendar-columns"><Panel><div className="staff-calendar-toolbar"><div><Button size="sm" className="staff-button" variant="outline" aria-label="Previous period" onClick={() => move(-1)}>‹</Button><Button size="sm" className="staff-button" variant="outline" aria-label="Next period" onClick={() => move(1)}>›</Button><strong>{range}</strong></div><div><Button size="sm" variant="outline" className="staff-button" onClick={() => setAnchor(new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Manila" }))}>Today</Button>{(["Week", "Month"] as const).map(m => <Button key={m} size="sm" variant={mode === m ? "primary" : "outline"} className="staff-button" aria-pressed={mode === m} onClick={() => setMode(m)}>{m}</Button>)}</div></div><div className="staff-calendar-scroll"><div className={`staff-calendar-grid ${mode === "Month" ? "month" : "week"}`}>{days.map(day => { const date = isoDay(day); const daily = visible.filter(b => b.date === date); return <section key={date} className="staff-calendar-day"><header><small>{day.toLocaleDateString("en-US", { weekday: "short" })}</small><strong>{day.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</strong></header><div>{daily.map(b => <Link key={b.id} href={`/staff/bookings/${b.id}`} className={`staff-calendar-event ${b.status === "Under Review" ? "tentative" : ""}`}><strong>{b.start} – {b.end}</strong><b>{b.route}</b><span>{vehicles.find(v => v.id === b.vehicleId)?.name}</span><span>Guest: {customers.find(c => c.id === b.customerId)?.name}</span><Badge status={b.status} /></Link>)}</div></section>; })}</div></div><p className="staff-footnote">Sample schedule: May 2026. Select a booking to review its details.</p></Panel><Panel title="Upcoming Bookings" subtitle={`${visible.length} bookings`}>{visible.length ? visible.toSorted((a, b) => `${a.date}${a.start}`.localeCompare(`${b.date}${b.start}`)).slice(0, 6).map(b => <Link className="staff-upcoming" key={b.id} href={`/staff/bookings/${b.id}`}><span>{dateLabel(b.date)}<small>{b.start}</small></span><span><strong>{b.route}</strong><small>{vehicles.find(v => v.id === b.vehicleId)?.name}</small></span><Badge status={b.status} /></Link>) : <Empty />}<Link className="staff-text-link staff-form-pad" href="/staff/bookings">View all upcoming bookings →</Link></Panel></div></>;
}

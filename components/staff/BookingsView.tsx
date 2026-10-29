"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import Button from "@/components/ui/button";
import { customers, dateLabel, filterBookings, vehicles, type StaffBooking } from "@/lib/staff/data";
import { useStaff } from "./StaffProvider";
import { Badge, Empty, PageHeading, Pagination, Panel, Stats } from "./StaffUI";
import CreateBooking from "./CreateBooking";

export function BookingTable({ bookings }: { bookings: StaffBooking[] }) {
  const [page, setPage] = useState(1);
  const currentPage = Math.min(page, Math.max(1, Math.ceil(bookings.length / 6)));
  return <><div className="staff-table-wrap"><table className="staff-table booking-table"><thead><tr>{["Booking ID", "Booking Type", "Route/Package Name", "Schedule", "Passengers", "Suitable Vehicle", "Booking Status", "Action"].map(title => <th key={title}>{title}</th>)}</tr></thead><tbody>{bookings.slice((currentPage - 1) * 6, currentPage * 6).map(booking => <tr key={booking.id}><td><strong>{booking.id}</strong></td><td>{booking.type}</td><td className="staff-route-cell">{booking.route}</td><td>{dateLabel(booking.date)}<small>{booking.start} – {booking.end}</small></td><td>{booking.passengers}</td><td>{vehicles.find(v => v.id === booking.vehicleId)?.name}</td><td><Badge status={booking.status} /></td><td><Button href={`/staff/bookings/${booking.id}`} size="sm" variant="outline" className="staff-button">View</Button></td></tr>)}</tbody></table>{!bookings.length ? <Empty /> : null}</div><Pagination page={currentPage} count={bookings.length} size={6} onChange={setPage} /></>;
}

export function WorkflowSummary() {
  const { bookings } = useStaff();
  return <Panel title="Pricing Workflow Summary" className="staff-workflow"><ol>{[
    ["Base rate retrieved", "From the selected vehicle record"],
    ["Pricing factors processed", "Distance, duration, fuel, demand, season, schedule, and availability"],
    ["ML suggestion generated", "Awaiting Booking Staff decision"],
    ["Final quotation approved", "Accepted or adjusted by Booking Staff"],
  ].map(([title, desc], i) => <li key={title}><span className={`tone-${["blue", "purple", "amber", "green"][i]}`}>{i + 1}</span><strong>{title}</strong><small>{desc}</small></li>)}</ol><h2>Recent Pricing Decisions</h2>{bookings.filter(b => b.quotation).slice(0, 5).map(b => <Link className="staff-decision-item" href={`/staff/bookings/${b.id}`} key={b.id}><strong>{b.id}</strong><small>{b.decisionNotes || "Quotation approved"}</small></Link>)}</Panel>;
}

export default function BookingsView({ dashboard = false }: { dashboard?: boolean }) {
  const { bookings, query } = useStaff();
  const [draft, setDraft] = useState({ query: "", type: "All Types", status: "All Statuses", vehicle: "All Vehicle Types" });
  const [filters, setFilters] = useState(draft);
  const [creating, setCreating] = useState(false);
  const filtered = filterBookings(bookings, `${query} ${filters.query}`.trim(), filters.type, filters.status, filters.vehicle);
  const underReview = bookings.filter(b => b.status === "Under Review").length;
  const confirmed = bookings.filter(b => b.status === "Confirmed").length;
  const awaiting = bookings.filter(b => b.status === "For Payment").length;
  const cancelled = bookings.filter(b => b.status === "Cancelled").length;
  const stats = dashboard ? [
    { label: "Bookings", value: bookings.length, note: "in preview dataset" },
    { label: "Bookings Under Review", value: underReview, note: "awaiting staff decision" },
    { label: "Upcoming Confirmed Trips", value: confirmed, note: "in preview schedule" },
    { label: "Available Vehicles", value: vehicles.filter(v => v.status === "Available").length, note: `Out of ${vehicles.length} units` },
  ] : [
    { label: "Bookings", value: bookings.length, note: "in preview dataset", tone: "purple" },
    { label: "Bookings Under Review", value: underReview, note: "awaiting staff decision", tone: "amber" },
    { label: "Awaiting Payment", value: awaiting, note: "approved quotations", tone: "green" },
    { label: "Cancelled", value: cancelled, note: "in preview dataset", tone: "red" },
  ];
  return <><PageHeading title={dashboard ? "Your operations at a glance" : "Bookings"} description={dashboard ? "Keep trips moving. Review requests, manage schedules, and check fleet readiness." : "Review the selected booking before forwarding it for administrator price approval."} action={<Button size="sm" className="staff-button" onClick={() => setCreating(true)}>+ Create booking</Button>} />
    <Stats items={stats} /><div className="staff-columns"><div className="staff-stack">
      {!dashboard ? <form className="staff-filter-bar" onSubmit={e => { e.preventDefault(); setFilters(draft); }}><input aria-label="Search booking list" placeholder="Search reference, customer, route, or package..." value={draft.query} onChange={e => setDraft({ ...draft, query: e.target.value })} /><select aria-label="Booking type" value={draft.type} onChange={e => setDraft({ ...draft, type: e.target.value })}>{["All Types", "Custom Trip", "Tour Package", "Direct Ride"].map(s => <option key={s}>{s}</option>)}</select><select aria-label="Booking status" value={draft.status} onChange={e => setDraft({ ...draft, status: e.target.value })}>{["All Statuses", "Under Review", "Confirmed", "For Payment", "Cancelled", "Completed"].map(s => <option key={s}>{s}</option>)}</select><select aria-label="Vehicle type" value={draft.vehicle} onChange={e => setDraft({ ...draft, vehicle: e.target.value })}>{["All Vehicle Types", ...new Set(vehicles.map(v => v.name))].map(s => <option key={s}>{s}</option>)}</select><Button type="submit" size="sm" variant="outline" className="staff-button">Filter</Button><Button size="sm" className="staff-button staff-add" onClick={() => setCreating(true)} type="button">Add Booking</Button></form> : null}
      <Panel title={dashboard ? "Recent bookings" : "Bookings list"} subtitle={`${filtered.length} bookings · Review requests and manage upcoming trips`} action={dashboard ? <Link className="staff-text-link" href="/staff/bookings">View all bookings →</Link> : undefined}><BookingTable bookings={filtered} /></Panel>
    </div><div className="staff-stack">{dashboard ? <><Panel title="To Do" subtitle="3 Tasks"><Link className="staff-task" href="/staff/bookings/BKG-2026-0163"><strong>New Booking!</strong><small>BKG-2026-0163 · Mandaue → Badian</small></Link><Link className="staff-task" href="/staff/fleet"><strong>Vehicle Registration Expiring Soon</strong><small>Toyota Coaster · NFO 1234</small></Link><Link className="staff-task" href="/staff/bookings/BKG-2026-0161"><strong>Booking was cancelled!</strong><small>BKG-2026-0161 · Mandaue → Lapu-Lapu</small></Link></Panel><Panel title="Fleet Readiness" subtitle="Percentage of total vehicles that are available"><div className="staff-fleet-mini">{[
        ["Toyota Coaster", "50%", "imgImage15"], ["Toyota Innova", "80%", "imgImage19"], ["Toyota Hiace", "70%", "imgImage16"], ["Toyota Fortuner", "30%", "imgImage20"], ["Hyundai Elantra", "100%", "imgImage21"],
      ].map(([name, percent, asset]) => <Link key={name} href="/staff/fleet"><Image src={`/images/staff/dashboard-${asset}.png`} width={144} height={81} alt={name} /><div><strong>{name}</strong><span><b>{percent}</b><small>Available</small></span></div></Link>)}</div><p className="staff-footnote">Readiness percentages shown from the design sample.</p></Panel></> : <WorkflowSummary />}</div></div>
    {creating ? <CreateBooking onClose={() => setCreating(false)} /> : null}
  </>;
}

export function CustomerName({ id }: { id: string }) { return customers.find(c => c.id === id)?.name ?? "Unknown customer"; }

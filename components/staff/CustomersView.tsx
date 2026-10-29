"use client";

import Link from "next/link";
import { useState } from "react";
import { customers, dateLabel, vehicles } from "@/lib/staff/data";
import { useStaff } from "./StaffProvider";
import { Badge, Empty, PageHeading, Panel } from "./StaffUI";

export default function CustomersView({ customerId }: { customerId?: string }) {
  const { bookings, query } = useStaff();
  const [search, setSearch] = useState("");
  const [type, setType] = useState("All Types");
  const [selectedId, setSelectedId] = useState(customerId ?? customers[1].id);
  const selected = customers.find(c => c.id === selectedId) ?? customers[1];
  const term = `${query} ${search}`.trim().toLowerCase();
  const shown = customers.filter(c => `${c.name} ${c.email} ${c.phone}`.toLowerCase().includes(term) && (type === "All Types" || c.type === type));
  const history = bookings.filter(b => b.customerId === selected.id);
  return <><PageHeading title="Customer Records" description="View Cebu customer contact details, booking history, and service notes." /><div className="staff-customer-columns"><div className="staff-stack"><div className="staff-filter-bar"><input aria-label="Search customers" placeholder="Search by name, phone, or email..." value={search} onChange={e => setSearch(e.target.value)} /><select aria-label="Customer type" value={type} onChange={e => setType(e.target.value)}>{["All Types", "Corporate", "Noncorporate"].map(t => <option key={t}>{t}</option>)}</select></div><Panel><div className="staff-table-wrap"><table className="staff-table customer-table"><thead><tr>{["Customer", "Contact", "Address", "Bookings", "Customer Type"].map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>{shown.map(c => <tr key={c.id} className={c.id === selected.id ? "selected" : ""}><td><button className="staff-text-button" onClick={() => setSelectedId(c.id)} aria-pressed={c.id === selected.id}>{c.name}</button></td><td>{c.phone}<small>{c.email}</small></td><td>{c.address}</td><td>{bookings.filter(b => b.customerId === c.id).length}</td><td>{c.type}</td></tr>)}</tbody></table>{!shown.length ? <Empty /> : null}</div></Panel></div><Panel title="Customer Details" className="staff-customer-detail"><div className="staff-form-pad"><h2>{selected.name}</h2><p className="staff-footnote">{selected.id} · {history.length} total preview bookings</p><div className="staff-customer-info"><Panel title="Customer Information"><dl className="staff-fields">{[["Full Name", selected.name], ["Address", selected.address], ["Customer Type", selected.type], ["ID Number", selected.id]].map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl></Panel><Panel title="Contact Details"><dl className="staff-fields"><div><dt>Mobile Number</dt><dd><a href={`tel:${selected.phone.replaceAll(" ", "")}`}>{selected.phone}</a></dd></div><div><dt>Email Address</dt><dd><a href={`mailto:${selected.email}`}>{selected.email}</a></dd></div></dl></Panel></div><Panel title="Recent Bookings" action={<Link className="staff-text-link" href="/staff/bookings">View All</Link>}>{history.map(b => <Link className="staff-history-item" href={`/staff/bookings/${b.id}`} key={b.id}><span>{dateLabel(b.date)}</span><span><strong>{vehicles.find(v => v.id === b.vehicleId)?.name} | {b.id}</strong><small>{b.route}</small></span><Badge status={b.status} /><span>›</span></Link>)}{!history.length ? <Empty text="No bookings for this customer." /> : null}</Panel><Panel title="Booking Notes">{history.filter(b => b.notes).map(b => <Link className="staff-task" key={b.id} href={`/staff/bookings/${b.id}`}><strong>{b.notes}</strong><small>{dateLabel(b.date)} · {b.id}</small></Link>)}{!history.some(b => b.notes) ? <Empty text="No service notes recorded." /> : null}</Panel></div></Panel></div></>;
}

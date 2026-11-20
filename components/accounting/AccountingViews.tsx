"use client";
import Link from "next/link";
import { Children, cloneElement, isValidElement, useState, type ReactElement, type ReactNode } from "react";
import Button from "@/components/ui/button";
import { Badge, Empty, Modal, PageHeading, Panel } from "@/components/staff/StaffUI";
import { csvCell, money } from "@/lib/staff/data";
import { accounts, receivables, receivablesReference, receivablesSummary, type Payment, type Refund } from "@/lib/accounting/data";
import { useAccounting } from "./AccountingProvider";
import { AccountingIcon } from "./AccountingShell";

function Table({ headings, children }: { headings: string[]; children: ReactNode }) {
  const rows = Children.map(children, row => {
    if (!isValidElement<{ children: ReactNode }>(row)) return row;
    const cells = Children.map(Children.toArray(row.props.children), (cell, index) => isValidElement(cell)
      ? cloneElement(cell as ReactElement<{ "data-label"?: string }>, { "data-label": headings[index] }) : cell);
    return cloneElement(row, {}, cells);
  });
  return <div className="staff-table-wrap staff-responsive-table"><table className="staff-table"><thead><tr>{headings.map(h => <th scope="col" key={h}>{h}</th>)}</tr></thead><tbody>{rows}</tbody></table></div>;
}
function Metric({ label, value, note, icon }: { label: string; value: string | number; note: string; icon?: number }) {
  return <Panel><div className="accounting-metric">{icon !== undefined ? <span className={`accounting-stat-icon icon-${icon}`}><AccountingIcon index={icon} size={19} /></span> : null}<div><small>{label}</small><strong>{value}</strong><small>{note}</small></div></div></Panel>;
}
function Search({ value, onChange, children }: { value: string; onChange: (value: string) => void; children?: ReactNode }) {
  return <div className="staff-filter-bar"><input aria-label="Search accounting records" placeholder="Search customer, booking, or reference…" value={value} onChange={e => onChange(e.target.value)} />{children}</div>;
}
function Details({ title, record, onClose, children }: { title: string; record: Record<string, string | number>; onClose: () => void; children?: ReactNode }) {
  return <Modal title={title} onClose={onClose}><div className="staff-form-pad"><dl className="staff-fields">{Object.entries(record).map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value || "—"}</dd></div>)}</dl>{children}</div></Modal>;
}
function PaymentRows({ payments, onView }: { payments: Payment[]; onView?: (payment: Payment) => void }) {
  return <Table headings={onView ? ["Payment ID", "Booking", "Customer", "Channel", "Amount", "Received", "Status", "Action"] : ["Payment", "Customer", "Amount", "Status"]}>{payments.map(p => <tr key={p.id}><td>{p.id}</td>{onView ? <td>{p.booking}</td> : null}<td>{p.customer}</td>{onView ? <td>{p.channel}</td> : null}<td><strong>{money(p.amount)}</strong></td>{onView ? <td>{p.received}</td> : null}<td><Badge status={p.status} /></td>{onView ? <td><Button className="staff-button" size="sm" variant="outline" onClick={() => onView(p)}>{p.status === "Needs Review" ? "Review" : "View"}</Button></td> : null}</tr>)}</Table>;
}

export function AccountingDashboard() {
  const { payments, refunds } = useAccounting();
  const collected = payments.filter(p => p.status === "Paid").reduce((sum, p) => sum + p.amount, 0);
  return <><PageHeading title="Accounting Dashboard" description="Track collections, verification queues, receivables, and refund processing." /><div className="accounting-metrics">
    <Metric label="Verified collections" value={money(collected)} note="Recorded transactions" icon={0} />
    <Metric label="Outstanding balance" value={money(receivables.reduce((sum, r) => sum + r.approved - r.paid, 0))} note={`Across ${receivablesSummary.count} bookings`} icon={1} />
    <Metric label="Refund requests" value={refunds.filter(r => r.status === "Requested").length} note="Available for review" icon={2} />
    <Metric label="Overdue accounts" value={receivablesSummary.overdueCount} note={money(receivablesSummary.overdue)} icon={3} />
  </div><div className="accounting-columns"><Panel title="Recent payment activity" subtitle="Latest recorded transactions" action={<Link className="staff-text-link" href="/accounting/payments">Pending reviews <AccountingIcon index={4} size={14} /></Link>}><PaymentRows payments={payments.slice(0, 4)} /></Panel>
    <Panel title="Receivables requiring follow-up" subtitle={`Aging as of ${receivablesReference.dateLabel}`} action={<Link className="staff-text-link" href="/accounting/receivables">Open ledger <AccountingIcon index={4} size={14} /></Link>}>{receivables.map(r => <Link className="accounting-receivable" href="/accounting/receivables" key={r.booking}><div><strong>{r.customer}</strong><small>{r.booking}</small></div><div><strong>{money(r.approved - r.paid)}</strong><Badge status={r.aging} /></div></Link>)}</Panel></div></>;
}

export function ReceivablesView() {
  const [query, setQuery] = useState(""); const [overdue, setOverdue] = useState(false);
  const [selected, setSelected] = useState<(typeof receivables)[number] | null>(null);
  const shown = receivables.filter(r => `${r.customer} ${r.booking}`.toLowerCase().includes(query.toLowerCase()) && (!overdue || r.aging !== "Current"));
  return <><PageHeading title="Accounts Receivable" description="Track unpaid and partially paid bookings by due date and aging." /><div className="accounting-metrics three"><Metric label="Total receivable" value={money(receivablesSummary.total)} note={`${receivablesSummary.count} accounts`} icon={1} /><Metric label="Due soon" value={money(receivablesSummary.dueSoon)} note={`Within ${receivablesReference.dueSoonDays} days of ${receivablesReference.dateLabel}`} /><Metric label="Overdue" value={money(receivablesSummary.overdue)} note={`${receivablesSummary.overdueCount} accounts`} icon={3} /></div><Panel><Search value={query} onChange={setQuery}><Button variant="outline" size="sm" className="staff-button" aria-pressed={overdue} onClick={() => setOverdue(!overdue)}>{overdue ? "Show all" : "Overdue only"}</Button></Search></Panel><Panel><Table headings={["Customer", "Booking", "Approved amount", "Amount paid", "Balance", "Due date", "Aging", "Action"]}>{shown.map(r => <tr key={r.booking}><td>{r.customer}</td><td>{r.booking}</td><td>{money(r.approved)}</td><td>{money(r.paid)}</td><td><strong>{money(r.approved - r.paid)}</strong></td><td>{r.due}</td><td><Badge status={r.aging} /></td><td><Button variant="outline" size="sm" className="staff-button" onClick={() => setSelected(r)}>View</Button></td></tr>)}</Table>{!shown.length ? <Empty /> : null}</Panel>{selected ? <Details title="Receivable details" record={{ Customer: selected.customer, Booking: selected.booking, Approved: money(selected.approved), Paid: money(selected.paid), Balance: money(selected.approved - selected.paid), "Due date": selected.due, Aging: selected.aging }} onClose={() => setSelected(null)}></Details> : null}</>;
}

export function RefundsView() {
  const { refunds, setRefunds } = useAccounting(); const [selected, setSelected] = useState<Refund | null>(null); const [message, setMessage] = useState("");
  return <><PageHeading title="Refund Management" description="Review and process refund requests in the accounting workspace." /><div className="accounting-metrics">{["Requested", "Processing", "Refunded", "Rejected"].map(status => <Metric key={status} label={status} value={refunds.filter(r => r.status === status).length} note="Recorded transactions" />)}</div><Panel><Table headings={["Refund ID", "Booking", "Customer", "Calculated refund", "Reason", "Status", "Action"]}>{refunds.map(r => <tr key={r.id}><td>{r.id}</td><td>{r.booking}</td><td>{r.customer}</td><td>{money(r.amount)}</td><td>{r.reason}</td><td><Badge status={r.status} /></td><td><Button className="staff-button" size="sm" variant="outline" onClick={() => setSelected(r)}>View</Button></td></tr>)}</Table></Panel><p role="status">{message}</p>{selected ? <Details title="Refund request" record={{ Reference: selected.id, Booking: selected.booking, Customer: selected.customer, Amount: money(selected.amount), Reason: selected.reason, Status: selected.status, Notes: selected.notes }} onClose={() => setSelected(null)}>{["Requested", "Processing"].includes(selected.status) ? <form onSubmit={e => { e.preventDefault(); const data = new FormData(e.currentTarget); const notes = String(data.get("notes") ?? "").trim(); if (!notes) return; const status = String(data.get("decision")); setRefunds(items => items.map(r => r.id === selected.id && r.status === selected.status ? { ...r, status, notes } : r)); setSelected(null); setMessage(`Refund status updated to ${status.toLowerCase()}.`); }}><label>Decision<select name="decision">{selected.status === "Requested" ? <><option>Processing</option><option>Rejected</option></> : <option>Refunded</option>}</select></label><label>Decision notes / reference<textarea name="notes" required maxLength={2000} /></label><Button type="submit" className="staff-button">Confirm decision</Button></form> : null}</Details> : null}</>;
}

export function CustomerAccountsView() {
  const [query, setQuery] = useState(""); const [type, setType] = useState("All types"); const [selected, setSelected] = useState<(typeof accounts)[number] | null>(null);
  const shown = accounts.filter(a => `${a.customer} ${a.contact}`.toLowerCase().includes(query.toLowerCase()) && (type === "All types" || a.type === type));
  return <><PageHeading title="Customer Accounts" description="Review payment history, balances, credit facilities, and accounting notes." /><Panel><Search value={query} onChange={setQuery}><select aria-label="Customer type" value={type} onChange={e => setType(e.target.value)}>{["All types", "Corporate", "Individual"].map(t => <option key={t}>{t}</option>)}</select></Search></Panel><Panel><Table headings={["Customer", "Contact", "Bookings", "Balance", "Customer type", "Action"]}>{shown.map(a => <tr key={a.customer}><td>{a.customer}</td><td>{a.contact}</td><td>{a.bookings}</td><td>{money(a.balance)}</td><td>{a.type}</td><td><Button className="staff-button" size="sm" variant="outline" onClick={() => setSelected(a)}>View</Button></td></tr>)}</Table>{!shown.length ? <Empty /> : null}</Panel>{selected ? <Details title="Customer account" record={{ Customer: selected.customer, Contact: selected.contact, Bookings: selected.bookings, Balance: money(selected.balance), Type: selected.type }} onClose={() => setSelected(null)}></Details> : null}</>;
}

export function AccountingReportsView() {
  const { payments, refunds } = useAccounting(); const [message, setMessage] = useState("");
  function exportReport(kind: string) {
    let rows: (string | number)[][];
    if (kind === "Receivables Report") rows = [["Customer", "Booking", "Balance", "Due date", "Aging"], ...receivables.map(r => [r.customer, r.booking, r.approved - r.paid, r.due, r.aging])];
    else if (kind === "Refund Report") rows = [["Refund", "Booking", "Customer", "Amount", "Status", "Notes"], ...refunds.map(r => [r.id, r.booking, r.customer, r.amount, r.status, r.notes])];
    else rows = [["Payment", "Booking", "Customer", "Channel", "Amount", "Received", "Status"], ...payments.filter(p => p.status === "Paid").map(p => [p.id, p.booking, p.customer, p.channel, p.amount, p.received, p.status])];
    const url = URL.createObjectURL(new Blob(["\uFEFF" + rows.map(row => row.map(csvCell).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = `roamigo-${kind.toLowerCase().replaceAll(" ", "-")}.csv`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); setMessage(`${kind} exported successfully.`);
  }
  return <><PageHeading title="Accounting Reports" description="Generate accounting reports and export-ready summaries." /><div className="accounting-report-grid">{[["Daily Collection Report", "Verified payments with received dates"], ["Receivables Report", "Current, due soon, and overdue accounts"], ["Refund Report", "Refund requests and completed refunds"], ["Revenue Report", "Verified collections by booking"]].map(([title, description]) => <Panel key={title}><div className="accounting-report"><div><h2>{title}</h2><small>{description}</small></div><Button size="sm" variant="outline" className="staff-button" onClick={() => exportReport(title)}>Generate</Button></div></Panel>)}</div><p role="status">{message}</p></>;
}

export function AccountingNotificationsView() {
  const { payments, refunds } = useAccounting();
  const [read, setRead] = useState<string[]>([]);
  const items = [...payments.filter(p => p.status === "Needs Review").map(p => ({ id: p.id, title: `Payment ${p.id} is awaiting verification`, text: `Review the ${p.channel} collection.`, href: "/accounting/payments" })), ...refunds.filter(r => r.status === "Requested").map(r => ({ id: r.id, title: `Refund ${r.id} needs review`, text: r.reason, href: "/accounting/refunds" }))];
  return <><PageHeading title="Notifications" description="Accounting alerts for tasks that require your attention." /><div className="staff-stack">{items.map(item => <Panel key={item.id}><div className="accounting-report"><AccountingIcon index={5} size={18} /><Link href={item.href}><h2>{item.title}</h2><small>{item.text}</small></Link><Button className="staff-button" size="sm" variant="outline" disabled={read.includes(item.id)} onClick={() => setRead(ids => [...ids, item.id])}>{read.includes(item.id) ? "Read" : "Mark read"}</Button></div></Panel>)}{!items.length ? <Empty text="No accounting tasks require review." /> : null}</div></>;
}

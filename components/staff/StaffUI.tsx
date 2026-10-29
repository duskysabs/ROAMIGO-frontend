"use client";

import { useEffect, useRef, type ReactNode } from "react";
import StaffIcon from "./StaffIcon";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";

export function Panel({ title, subtitle, action, children, className = "" }: { title?: string; subtitle?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return <Card className={`staff-panel ${className}`} padding="sm">{title ? <div className="staff-panel-head"><div><h2>{title}</h2>{subtitle ? <p>{subtitle}</p> : null}</div>{action}</div> : null}{children}</Card>;
}
export function PageHeading({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="staff-page-heading"><div><h1>{title}</h1><p>{description}</p></div>{action}</div>;
}
export function Badge({ status }: { status: string }) {
  const tone = ["Confirmed", "For Payment", "Assigned"].includes(status) ? "blue" : ["Available", "Completed", "Best Match"].includes(status) ? "green" : ["Cancelled", "Unavailable", "Rejected"].includes(status) ? "red" : "amber";
  return <span className={`staff-badge ${tone}`}>{status}</span>;
}
export function Stats({ items }: { items: { label: string; value: string | number; note: string; tone?: string }[] }) {
  return <div className="staff-stats" data-count={items.length} style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>{items.map((item, i) => <Card className="staff-stat" key={item.label} padding="sm"><span className={`staff-stat-icon tone-${item.tone ?? ["red", "amber", "green", "blue"][i % 4]}`} aria-hidden="true"><StaffIcon name={["bookings", "calendar", "fleet", "reports"][i % 4]} /></span><div><p>{item.label}</p><strong>{item.value}</strong><small>{item.note}</small></div></Card>)}</div>;
}
export function Modal({ title, children, onClose, wide = false }: { title: string; children: ReactNode; onClose: () => void; wide?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { const dialog = ref.current; dialog?.showModal(); return () => dialog?.close(); }, []);
  return <dialog aria-labelledby="staff-dialog-title" ref={ref} className={`staff-dialog ${wide ? "wide" : ""}`} onCancel={e => { e.preventDefault(); onClose(); }} onClick={e => { if (e.target === e.currentTarget) { const r = e.currentTarget.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) onClose(); } }}><header><h2 id="staff-dialog-title">{title}</h2><button onClick={onClose} aria-label="Close dialog">×</button></header>{children}</dialog>;
}
export function Pagination({ page, count, size, onChange }: { page: number; count: number; size: number; onChange: (page: number) => void }) {
  const pages = Math.max(1, Math.ceil(count / size));
  return <div className="staff-pagination"><span>{count ? `Showing ${(page - 1) * size + 1} to ${Math.min(page * size, count)} of ${count}` : "No matching records"}</span><div><button aria-label="Previous page" disabled={page === 1} onClick={() => onChange(page - 1)}>‹</button>{Array.from({ length: pages }, (_, i) => <button aria-label={`Page ${i + 1}`} aria-current={page === i + 1 ? "page" : undefined} key={i} onClick={() => onChange(i + 1)}>{i + 1}</button>)}<button aria-label="Next page" disabled={page === pages} onClick={() => onChange(page + 1)}>›</button></div></div>;
}
export function Empty({ text = "No matching records found. Try changing your search or filters." }: { text?: string }) {
  return <p className="staff-empty">{text}</p>;
}
export function ActionButton({ children, onClick, disabled = false }: { children: ReactNode; onClick: () => void; disabled?: boolean }) {
  return <Button size="sm" variant="outline" className="staff-button" onClick={onClick} disabled={disabled}>{children}</Button>;
}

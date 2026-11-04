"use client";

import { statusData, demand, destinations, monthlyStats, reportPeriod, reportTotal, destinationAxis } from "@/lib/staff/fixtures";

import Image from "next/image";
import { useState } from "react";
import Button from "@/components/ui/button";
import { csvCell, customers, vehicles } from "@/lib/staff/data";
import { useStaff } from "./StaffProvider";
import { PageHeading, Panel, Stats } from "./StaffUI";

export default function ReportsView() {
  const { bookings, announce } = useStaff();
  const [month, setMonth] = useState(reportPeriod);
  const reportBookings = bookings.filter(b => b.date.startsWith(month));
  function exportReport(title: string) {
    let rows: (string | number)[][];
    if (title === "Booking Status Summary") rows = [["Status", "Bookings", "Share"], ...statusData.map(r => [...r])];
    else if (title === "Demand By Vehicle") rows = [["Vehicle", "Bookings", "Share"], ...demand.map(r => [r[0], r[1], r[2]])];
    else if (title === "Top Destinations") rows = [["Destination", "Bookings"], ...destinations.map(r => [...r])];
    else {
      const filtered = title === "Upcoming Trips" ? reportBookings.filter(b => ["Confirmed", "For Payment"].includes(b.status)) : title === "Cancellation Summary" ? reportBookings.filter(b => b.status === "Cancelled") : reportBookings;
      rows = [["Booking ID", "Customer", "Route", "Date", "Status", "Vehicle"], ...filtered.map(b => [b.id, customers.find(c => c.id === b.customerId)?.name ?? "", b.route, b.date, b.status, vehicles.find(v => v.id === b.vehicleId)?.name ?? ""])];
    }
    const url = URL.createObjectURL(new Blob(["\uFEFF" + rows.map(row => row.map(csvCell).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a"); a.href = url; a.download = `roamigo-${title.toLowerCase().replaceAll(" ", "-")}-${month}.csv`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    announce(`${title} exported as CSV.`);
  }
  return <><PageHeading title="Booking Reports" description="Operational reports for Cebu booking activity." action={<label className="staff-report-month">Reporting period<input type="month" value={month} onChange={e => setMonth(e.target.value || reportPeriod)} /></label>} />
  {month === reportPeriod ? <><Stats items={monthlyStats} /><div className="staff-report-charts"><Panel title="Booking Status Summary"><div className="staff-report-chart"><div className="staff-image-donut"><Image src="/images/staff/reports-imgDonut.png" width={150} height={150} alt="Monthly booking status distribution" /><div><strong>{reportTotal}</strong><small>Total</small></div></div><ul className="staff-legend">{statusData.map(([name, count, percent], i) => <li key={name}><Image src={`/images/staff/reports-imgRectangle${43 + i}.svg`} alt="" width={8} height={8} /><span>{name}</span><b>{count}</b><small>({percent})</small></li>)}</ul></div></Panel><Panel title="Top Destinations Cebu"><div className="staff-bars">{destinations.map(([name, count]) => <div key={name}><span>{name}</span><div><i style={{ width: `${count / destinationAxis.at(-1)! * 100}%` }} /><small>{count}</small></div></div>)}<footer>{destinationAxis.map(tick => <span key={tick}>{tick}</span>)}</footer></div></Panel><Panel title="Demand by Vehicle Type"><div className="staff-report-chart"><div className="staff-image-donut"><Image src="/images/staff/reports-imgDonut1.png" width={150} height={150} alt="Monthly demand by vehicle type" /><div><strong>{reportTotal}</strong><small>Total</small></div></div><ul className="staff-legend demand">{demand.map(([name, count, percent, asset], i) => <li key={name}><Image src={`/images/staff/reports-imgRectangle${i === 4 ? 49 : 43 + i}.svg`} alt="" width={8} height={8} /><span>{name}<small>{count}　({percent})</small></span><Image src={`/images/staff/reports-${asset}.png`} alt={name} width={70} height={35} /></li>)}</ul></div></Panel></div></> : <Panel><p className="staff-empty">No monthly summary available for {month}. {reportBookings.length} bookings fall in this period.</p></Panel>}
  <Panel title="Exportable Reports"><div className="staff-export-grid">{["Daily Booking List", "Upcoming Trips", "Booking Status Summary", "Cancellation Summary", "Demand By Vehicle", "Top Destinations"].map(title => { const monthly = ["Booking Status Summary", "Demand By Vehicle", "Top Destinations"].includes(title); return <article key={title}><div><span aria-hidden="true" /><h3>{title}</h3></div><p>{monthly ? "Monthly activity summary." : "Booking records for the selected period."}</p><footer><small>{month}</small><Button className="staff-button" size="sm" variant="outline" disabled={monthly && month !== reportPeriod} onClick={() => exportReport(title)}>Export ↓</Button></footer></article>; })}</div></Panel></>;
}

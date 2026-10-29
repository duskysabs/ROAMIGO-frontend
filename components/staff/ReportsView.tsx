"use client";

import Image from "next/image";
import { useState } from "react";
import Button from "@/components/ui/button";
import { csvCell, customers, vehicles } from "@/lib/staff/data";
import { useStaff } from "./StaffProvider";
import { PageHeading, Panel, Stats } from "./StaffUI";

const statusData = [["Confirmed", 238, "65%"], ["Under Review", 67, "18%"], ["Awaiting Payment", 28, "8%"], ["Cancelled", 17, "5%"], ["Completed", 18, "5%"]] as const;
const demand = [["Toyota Hiace", 142, "38.6%", "imgImage12"], ["Toyota Innova", 98, "26.6%", "imgImage8"], ["Toyota Fortuner", 76, "20.7%", "imgImage10"], ["Toyota Coaster", 36, "9.8%", "imgImage11"], ["Hyundai Elantra", 16, "4.3%", "imgImage9"]] as const;
const destinations = [["Mactan International Airport", 112], ["Moalboal", 68], ["Oslob", 45], ["Danao", 32], ["Santander", 28]] as const;
export default function ReportsView() {
  const { bookings, announce } = useStaff();
  const [month, setMonth] = useState("2026-05");
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
    const a = document.createElement("a"); a.href = url; a.download = `roamigo-preview-${title.toLowerCase().replaceAll(" ", "-")}-${month}.csv`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    announce(`${title} exported as a sample CSV.`);
  }
  return <><PageHeading title="Booking Reports" description="Operational reports for Cebu booking activity." action={<label className="staff-report-month">Reporting period<input type="month" value={month} onChange={e => setMonth(e.target.value || "2026-05")} /></label>} />
  {month === "2026-05" ? <><Stats items={[{ label: "Total Bookings", value: 368, note: "May 1 – May 31, 2026", tone: "red" }, { label: "Confirmed Trips", value: 142, note: "May 1 – May 31, 2026", tone: "green" }, { label: "Active Assignments", value: 156, note: "May 1 – May 31, 2026", tone: "blue" }, { label: "Pending Bookings", value: 20, note: "May 1 – May 31, 2026", tone: "purple" }, { label: "Rebooking Requests", value: 28, note: "May 1 – May 31, 2026", tone: "amber" }, { label: "Cancellations", value: 21, note: "May 1 – May 31, 2026", tone: "red" }]} /><p className="staff-footnote staff-report-note">Monthly figures below reproduce the Figma reporting sample. Booking-list exports use the interactive preview records.</p><div className="staff-report-charts"><Panel title="Booking Status Summary"><div className="staff-report-chart"><div className="staff-image-donut"><Image src="/images/staff/reports-imgDonut.png" width={150} height={150} alt="Monthly sample booking status distribution" /><div><strong>368</strong><small>Total</small></div></div><ul className="staff-legend">{statusData.map(([name, count, percent], i) => <li key={name}><Image src={`/images/staff/reports-imgRectangle${43 + i}.svg`} alt="" width={8} height={8} /><span>{name}</span><b>{count}</b><small>({percent})</small></li>)}</ul></div></Panel><Panel title="Top Destinations Cebu"><div className="staff-bars">{destinations.map(([name, count]) => <div key={name}><span>{name}</span><div><i style={{ width: `${count / 120 * 100}%` }} /><small>{count}</small></div></div>)}<footer>0 <span>30</span><span>60</span><span>90</span><span>120</span></footer></div></Panel><Panel title="Demand by Vehicle Type"><div className="staff-report-chart"><div className="staff-image-donut"><Image src="/images/staff/reports-imgDonut1.png" width={150} height={150} alt="Monthly sample demand by vehicle type" /><div><strong>368</strong><small>Total</small></div></div><ul className="staff-legend demand">{demand.map(([name, count, percent, asset], i) => <li key={name}><Image src={`/images/staff/reports-imgRectangle${i === 4 ? 49 : 43 + i}.svg`} alt="" width={8} height={8} /><span>{name}<small>{count}　({percent})</small></span><Image src={`/images/staff/reports-${asset}.png`} alt={name} width={70} height={35} /></li>)}</ul></div></Panel></div></> : <Panel><p className="staff-empty">No monthly reporting sample for {month}. {reportBookings.length} interactive preview bookings fall in this period.</p></Panel>}
  <Panel title="Exportable Reports"><div className="staff-export-grid">{["Daily Booking List", "Upcoming Trips", "Booking Status Summary", "Cancellation Summary", "Demand By Vehicle", "Top Destinations"].map(title => { const monthly = ["Booking Status Summary", "Demand By Vehicle", "Top Destinations"].includes(title); return <article key={title}><div><span aria-hidden="true" /><h3>{title}</h3></div><p>{monthly ? "Monthly design sample summary." : "Records from the interactive preview."}</p><footer><small>{month}</small><Button className="staff-button" size="sm" variant="outline" disabled={monthly && month !== "2026-05"} onClick={() => exportReport(title)}>Export ↓</Button></footer></article>; })}</div></Panel></>;
}

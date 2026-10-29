"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { customers, money, vehicleAvailable, vehicles, type StaffBooking } from "@/lib/staff/data";
import { useStaff } from "./StaffProvider";
import { Badge, Modal, Panel } from "./StaffUI";

export default function CreateBooking({ onClose }: { onClose: () => void }) {
  const { bookings, addBooking, announce } = useStaff();
  const router = useRouter();
  const [type, setType] = useState<StaffBooking["type"]>("Custom Trip");
  const [date, setDate] = useState("2026-05-28");
  const [start, setStart] = useState("06:00");
  const [end, setEnd] = useState("20:00");
  const [passengers, setPassengers] = useState(1);
  const [vehicleId, setVehicleId] = useState("V-02");
  const [stops, setStops] = useState<string[]>([]);
  const [error, setError] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    if (end <= start) { setError("Drop-off time must be after pickup time."); return; }
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle || passengers > vehicle.capacity || !vehicleAvailable(vehicleId, date, start, end, bookings)) { setError("Select an available vehicle with enough passenger seats."); return; }
    const id = `BKG-2026-${String(Math.max(...bookings.map(b => Number(b.id.split("-").pop()))) + 1).padStart(4, "0")}`;
    const route = type === "Tour Package" ? String(data.get("package")) : [String(data.get("pickup")).trim(), ...stops.filter(s => s.trim()), String(data.get("dropoff")).trim()].join(" → ");
    if (!route || (type !== "Tour Package" && (!String(data.get("pickup")).trim() || !String(data.get("dropoff")).trim()))) { setError("Enter pickup and drop-off locations."); return; }
    addBooking({ id, type, route, date, start, end, passengers, vehicleId, customerId: String(data.get("customer")), status: "Under Review", notes: String(data.get("notes")).trim(), quotation: null, decisionNotes: "" });
    announce(`${id} created in preview. No request was sent to the backend.`); onClose(); router.push(`/staff/bookings/${id}`);
  }
  return <Modal title="Enter Trip Details" onClose={onClose} wide><form onSubmit={submit} className="staff-create-form"><div className="staff-create-type"><label>Booking type<select value={type} onChange={e => setType(e.target.value as StaffBooking["type"])}>{["Custom Trip", "Tour Package", "Direct Ride"].map(t => <option key={t}>{t}</option>)}</select></label><span>Sample booking · Preview only</span></div><div className="staff-create-grid"><div className="staff-stack"><Panel title="Routes"><div className="staff-form-pad">{type === "Tour Package" ? <label>Tour package<select name="package"><option>Oslob Whale Watching Tour Package</option><option>Cebu City Heritage Tour</option></select></label> : <><label>Pickup<Input name="pickup" required placeholder="Enter pickup location..." /></label>{stops.map((stop, i) => <label key={i}>Stop {i + 1}<span className="staff-inline"><Input required value={stop} onChange={e => setStops(stops.map((s, j) => j === i ? e.target.value : s))} /><button type="button" aria-label={`Remove stop ${i + 1}`} onClick={() => setStops(stops.filter((_, j) => j !== i))}>×</button></span></label>)}{type === "Custom Trip" ? <Button type="button" variant="outline" size="sm" className="staff-button" onClick={() => setStops([...stops, ""])}>Add Stop</Button> : null}<label>Drop-off<Input name="dropoff" required placeholder="Enter drop-off location..." /></label></>}<p className="staff-return">Return to Bodega</p></div></Panel><Panel title="Customer Information"><div className="staff-form-pad"><label>Select customer<select name="customer" required>{customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label></div></Panel></div>
    <div className="staff-stack"><div className="staff-map-preview">MAP PREVIEW<small>Route map will be connected with the routing service.</small></div><Panel title="Trip Information"><div className="staff-form-pad"><label>Trip date<Input type="date" required value={date} onChange={e => setDate(e.target.value)} /></label><div className="staff-form-row"><label>Pickup time<Input type="time" required value={start} onChange={e => setStart(e.target.value)} /></label><label>Drop-off time<Input type="time" required value={end} onChange={e => setEnd(e.target.value)} /></label></div><label>Number of passengers<Input type="number" min={1} max={25} required value={passengers} onChange={e => setPassengers(Number(e.target.value))} /></label></div></Panel><label>Booking notes<textarea name="notes" rows={3} maxLength={2000} placeholder="Add customer requests..." /></label></div>
    <Panel title="Suitable Vehicles for Requested Schedule"><div className="staff-form-pad">{vehicles.filter(v => v.status === "Available").map((v, i) => { const available = passengers <= v.capacity && vehicleAvailable(v.id, date, start, end, bookings); return <label key={v.id} className={`staff-vehicle-option ${vehicleId === v.id ? "selected" : ""}`}><input type="radio" name="vehicle" value={v.id} checked={vehicleId === v.id} disabled={!available} onChange={() => setVehicleId(v.id)} /><Image src={v.id === "V-01" ? "/images/staff/create-imgImage11.png" : v.id === "V-02" ? "/images/staff/create-imgImage13.png" : v.image} alt={v.name} width={106} height={60} /><span><strong>{v.name}</strong><small>Base rate: {money(v.rate)}</small><small>Driver: {v.driver}</small><small>{v.plate} · {v.capacity} seats</small><Badge status={available ? (i === 0 ? "Available" : "Best Match") : "Unavailable"} /></span></label>; })}</div></Panel></div>{error ? <p className="staff-error" role="alert">{error}</p> : null}<div className="staff-modal-actions"><Button type="button" variant="outline" className="staff-button" onClick={onClose}>Discard</Button><Button type="submit" className="staff-button">Submit Booking Request</Button></div></form></Modal>;
}

"use client";
import { createContext, useContext, useState, type ReactNode } from "react";
import { initialPayments, initialRefunds, type Payment, type Refund } from "@/lib/accounting/data";
type Value = { payments: Payment[]; refunds: Refund[]; setPayments: React.Dispatch<React.SetStateAction<Payment[]>>; setRefunds: React.Dispatch<React.SetStateAction<Refund[]>> };
const Context = createContext<Value | null>(null);
export function AccountingProvider({ children }: { children: ReactNode }) {
  const [payments, setPayments] = useState(initialPayments);
  const [refunds, setRefunds] = useState(initialRefunds);
  return <Context value={{ payments, setPayments, refunds, setRefunds }}>{children}</Context>;
}
export function useAccounting() {
  const value = useContext(Context);
  if (!value) throw new Error("AccountingProvider is required");
  return value;
}

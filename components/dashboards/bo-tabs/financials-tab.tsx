"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Icons, SectionCard, KpiCard, SimpleBarChart, FilterChip, Badge } from "./bo-shared";

// ─── Types ────────────────────────────────────────────────────────────────────

type Period = "monthly" | "quarterly" | "ytd";
type TxType = "income" | "expense";
type TxCategory =
  | "rent" | "amenity" | "parking" | "late_fee" | "other_income"
  | "utilities" | "maintenance" | "insurance" | "staffing" | "marketing" | "admin" | "other_expense";

const INCOME_CATS: TxCategory[] = ["rent", "amenity", "parking", "late_fee", "other_income"];
const EXPENSE_CATS: TxCategory[] = ["utilities", "maintenance", "insurance", "staffing", "marketing", "admin", "other_expense"];
const BUDGET_CATS: TxCategory[] = ["utilities", "maintenance", "insurance", "staffing", "marketing", "admin"];

const CAT_LABEL: Record<TxCategory, string> = {
  rent: "Rent", amenity: "Amenity Fees", parking: "Parking",
  late_fee: "Late Fees", other_income: "Other Income",
  utilities: "Utilities", maintenance: "Maintenance", insurance: "Insurance",
  staffing: "Staffing", marketing: "Marketing", admin: "Administration",
  other_expense: "Other Expense",
};

interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  type: TxType;
  category: TxCategory;
  amount: number;
  description: string;
}

interface ArrearsItem {
  id: string;
  unit: string;
  tenant: string;
  days: number;
  amount: number;
  risk: "high" | "medium" | "low";
  status: "outstanding" | "reminded" | "escalated" | "paid";
}

interface TxForm {
  type: TxType;
  category: TxCategory;
  amount: string;
  description: string;
  date: string;
}

type BankAccountType = "checking" | "savings";
type BankAccountStatus = "active" | "pending_verification" | "archived";

interface OwnerBankAccount {
  id: string;
  bankName: string;
  accountHolder: string;
  accountType: BankAccountType;
  routingLast4: string;
  accountLast4: string;
  nickname: string;
  status: BankAccountStatus;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BankEvent {
  id: string;
  bankId: string;
  message: string;
  at: string;
}

interface BankForm {
  bankName: string;
  accountHolder: string;
  accountType: BankAccountType;
  routingLast4: string;
  accountLast4: string;
  nickname: string;
}

// ─── Seed Transactions ────────────────────────────────────────────────────────

let _tid = 0;
function tid() { return `tx${++_tid}`; }

const SEED_TRANSACTIONS: Transaction[] = [
  // Jan 2026
  { id: tid(), date: "2026-01-01", type: "income",  category: "rent",        amount: 40200, description: "Jan rent — 20 units" },
  { id: tid(), date: "2026-01-05", type: "income",  category: "amenity",     amount: 1100,  description: "Gym & pool bookings" },
  { id: tid(), date: "2026-01-05", type: "income",  category: "parking",     amount: 2800,  description: "Parking stalls" },
  { id: tid(), date: "2026-01-10", type: "income",  category: "late_fee",    amount: 350,   description: "Late payment fees" },
  { id: tid(), date: "2026-01-15", type: "expense", category: "utilities",   amount: 8200,  description: "Hydro, gas, water" },
  { id: tid(), date: "2026-01-12", type: "expense", category: "maintenance", amount: 4800,  description: "HVAC filters + lobby repair" },
  { id: tid(), date: "2026-01-01", type: "expense", category: "insurance",   amount: 4000,  description: "Property insurance premium" },
  { id: tid(), date: "2026-01-31", type: "expense", category: "staffing",    amount: 6200,  description: "Salaries & contractors" },
  { id: tid(), date: "2026-01-25", type: "expense", category: "marketing",   amount: 1800,  description: "Listings & photography" },
  { id: tid(), date: "2026-01-31", type: "expense", category: "admin",       amount: 2280,  description: "Software & legal" },
  // Feb 2026
  { id: tid(), date: "2026-02-01", type: "income",  category: "rent",        amount: 40200, description: "Feb rent — 20 units" },
  { id: tid(), date: "2026-02-05", type: "income",  category: "amenity",     amount: 1240,  description: "Gym, pool, lounge bookings" },
  { id: tid(), date: "2026-02-05", type: "income",  category: "parking",     amount: 2800,  description: "Parking stalls" },
  { id: tid(), date: "2026-02-10", type: "income",  category: "late_fee",    amount: 280,   description: "Late payment fees" },
  { id: tid(), date: "2026-02-15", type: "expense", category: "utilities",   amount: 7900,  description: "Hydro, gas, water" },
  { id: tid(), date: "2026-02-14", type: "expense", category: "maintenance", amount: 5200,  description: "Elevator service + unit 302 repair" },
  { id: tid(), date: "2026-02-01", type: "expense", category: "insurance",   amount: 4000,  description: "Property insurance premium" },
  { id: tid(), date: "2026-02-28", type: "expense", category: "staffing",    amount: 6200,  description: "Salaries & contractors" },
  { id: tid(), date: "2026-02-20", type: "expense", category: "marketing",   amount: 900,   description: "Online listings renewal" },
  { id: tid(), date: "2026-02-28", type: "expense", category: "admin",       amount: 2280,  description: "Software & legal" },
  // Mar 2026
  { id: tid(), date: "2026-03-01", type: "income",  category: "rent",        amount: 41400, description: "Mar rent — 21 units (new lease unit 808)" },
  { id: tid(), date: "2026-03-05", type: "income",  category: "amenity",     amount: 1380,  description: "Gym, pool, party room bookings" },
  { id: tid(), date: "2026-03-05", type: "income",  category: "parking",     amount: 2900,  description: "21 stalls" },
  { id: tid(), date: "2026-03-10", type: "income",  category: "late_fee",    amount: 420,   description: "Late payment fees" },
  { id: tid(), date: "2026-03-15", type: "expense", category: "utilities",   amount: 7400,  description: "Hydro, gas, water" },
  { id: tid(), date: "2026-03-10", type: "expense", category: "maintenance", amount: 4600,  description: "Roof inspection + minor repairs" },
  { id: tid(), date: "2026-03-01", type: "expense", category: "insurance",   amount: 4000,  description: "Property insurance premium" },
  { id: tid(), date: "2026-03-31", type: "expense", category: "staffing",    amount: 6500,  description: "Salaries, bonus, contractors" },
  { id: tid(), date: "2026-03-15", type: "expense", category: "marketing",   amount: 800,   description: "Spring listing refresh" },
  { id: tid(), date: "2026-03-31", type: "expense", category: "admin",       amount: 2280,  description: "Software & legal" },
  // Apr 2026 (running)
  { id: tid(), date: "2026-04-01", type: "income",  category: "rent",        amount: 41400, description: "Apr rent — 21 units" },
  { id: tid(), date: "2026-04-01", type: "expense", category: "insurance",   amount: 4000,  description: "Property insurance premium" },
];

const SEED_ARREARS: ArrearsItem[] = [
  { id: "a1", unit: "302",  tenant: "J. Martinez",  days: 90, amount: 4200, risk: "high",   status: "outstanding" },
  { id: "a2", unit: "718",  tenant: "A. Chen",      days: 60, amount: 2800, risk: "high",   status: "outstanding" },
  { id: "a3", unit: "1105", tenant: "R. Singh",     days: 45, amount: 2100, risk: "medium", status: "outstanding" },
  { id: "a4", unit: "504",  tenant: "L. Okafor",    days: 30, amount: 1400, risk: "medium", status: "outstanding" },
  { id: "a5", unit: "215",  tenant: "P. Williams",  days: 15, amount: 700,  risk: "low",    status: "outstanding" },
  { id: "a6", unit: "910",  tenant: "N. Kowalski",  days: 10, amount: 700,  risk: "low",    status: "outstanding" },
];

const DEFAULT_BUDGETS: Partial<Record<TxCategory, number>> = {
  utilities: 84000, maintenance: 62000, insurance: 48000,
  staffing: 72000, marketing: 18000, admin: 28400,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function periodRange(period: Period): { from: Date; to: Date } {
  const now = new Date();
  if (period === "monthly") {
    return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: now };
  }
  if (period === "quarterly") {
    // Show last completed quarter so we always have full data
    const q = Math.floor(now.getMonth() / 3);
    const prevQ = q === 0 ? 3 : q - 1;
    const prevYear = q === 0 ? now.getFullYear() - 1 : now.getFullYear();
    return {
      from: new Date(prevYear, prevQ * 3, 1),
      to:   new Date(prevYear, prevQ * 3 + 3, 0),
    };
  }
  return { from: new Date(now.getFullYear(), 0, 1), to: now };
}

function filterByPeriod(txs: Transaction[], period: Period): Transaction[] {
  const { from, to } = periodRange(period);
  return txs.filter((t) => { const d = new Date(t.date); return d >= from && d <= to; });
}

function fmtUsd(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(n >= 100_000 ? 0 : 1)}K`;
  return `$${n.toLocaleString()}`;
}

function exportCsv(txs: Transaction[]) {
  const rows = txs.map((t) =>
    `${t.date},${t.type},${CAT_LABEL[t.category]},${t.amount},"${t.description.replace(/"/g, '""')}"`
  );
  const csv = ["Date,Type,Category,Amount,Description", ...rows].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a   = Object.assign(document.createElement("a"), {
    href: url, download: `financials-${new Date().toISOString().slice(0, 10)}.csv`,
  });
  a.click();
  URL.revokeObjectURL(url);
}

const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function buildNoiChart(txs: Transaction[]) {
  const year = new Date().getFullYear();
  return MONTHS_SHORT.map((label, i) => {
    const mo = txs.filter((t) => {
      const d = new Date(t.date);
      return d.getFullYear() === year && d.getMonth() === i;
    });
    const rev  = mo.filter((t) => t.type === "income").reduce ((s, t) => s + t.amount, 0);
    const opex = mo.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const noi  = (rev - opex) / 1000;
    return { label, value: Math.max(noi, 0), color: noi >= 15 ? "bg-green-500/60" : noi > 0 ? "bg-accent/50" : "bg-border/30" };
  });
}

const EMPTY_FORM: TxForm = {
  type: "income", category: "rent", amount: "", description: "",
  date: new Date().toISOString().slice(0, 10),
};

const EMPTY_BANK_FORM: BankForm = {
  bankName: "",
  accountHolder: "",
  accountType: "checking",
  routingLast4: "",
  accountLast4: "",
  nickname: "",
};

function formatDateTime(ts: string): string {
  return new Date(ts).toLocaleString();
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function FinancialsTab() {
  const [period,       setPeriod]       = useState<Period>("quarterly");
  const [arrearsFilter,setArrearsFilter]= useState<"all" | "high" | "medium" | "low">("all");
  const [showLedger,   setShowLedger]   = useState(false);
  const [showAdd,      setShowAdd]      = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>(SEED_TRANSACTIONS);
  const [arrears,      setArrears]      = useState<ArrearsItem[]>(SEED_ARREARS);
  const [budgets,      setBudgets]      = useState<Partial<Record<TxCategory, number>>>(DEFAULT_BUDGETS);
  const [editBudget,   setEditBudget]   = useState<TxCategory | null>(null);
  const [form,         setForm]         = useState<TxForm>(EMPTY_FORM);
  const [banks,        setBanks]        = useState<OwnerBankAccount[]>([]);
  const [bankEvents,   setBankEvents]   = useState<BankEvent[]>([]);
  const [showAddBank,  setShowAddBank]  = useState(false);
  const [editingBankId,setEditingBankId]= useState<string | null>(null);
  const [bankForm,     setBankForm]     = useState<BankForm>(EMPTY_BANK_FORM);
  const [toast,        setToast]        = useState<string | null>(null);

  // Persist to localStorage
  useEffect(() => {
    try {
      const tx = localStorage.getItem("fin_tx");
      if (tx) setTransactions(JSON.parse(tx));
      const ar = localStorage.getItem("fin_arrears");
      if (ar) setArrears(JSON.parse(ar));
      const bg = localStorage.getItem("fin_budgets");
      if (bg) setBudgets(JSON.parse(bg));
      const bk = localStorage.getItem("fin_owner_banks");
      if (bk) setBanks(JSON.parse(bk));
      const be = localStorage.getItem("fin_owner_bank_events");
      if (be) setBankEvents(JSON.parse(be));
    } catch { /* ignore stale/corrupt data */ }
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  // ── Derived KPIs ──────────────────────────────────────────────────────────
  const periodTxs = filterByPeriod(transactions, period);
  const revenue   = periodTxs.filter((t) => t.type === "income") .reduce((s, t) => s + t.amount, 0);
  const opex      = periodTxs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const noi       = revenue - opex;
  const margin    = revenue > 0 ? (noi / revenue) * 100 : 0;

  const chartData   = buildNoiChart(transactions);

  // Budget actuals always show YTD so you see the full year picture
  const ytdTxs      = filterByPeriod(transactions, "ytd");
  const maxBudget   = Math.max(...BUDGET_CATS.map((cat) => {
    const actual = ytdTxs.filter((t) => t.category === cat && t.type === "expense").reduce((s, t) => s + t.amount, 0);
    return Math.max(actual, budgets[cat] ?? 0);
  }), 1);
  const budgetRows  = BUDGET_CATS.map((cat) => {
    const actual  = ytdTxs.filter((t) => t.category === cat && t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const budget  = budgets[cat] ?? 0;
    return { cat, label: CAT_LABEL[cat], budget, actual, variance: budget - actual };
  });

  const activeArrears   = arrears.filter((a) => a.status !== "paid");
  const filteredArrears = arrearsFilter === "all"
    ? activeArrears
    : activeArrears.filter((a) => a.risk === arrearsFilter);
  const totalArrears    = activeArrears.reduce((s, a) => s + a.amount, 0);

  // ── Actions ───────────────────────────────────────────────────────────────
  const addTransaction = useCallback(() => {
    const amt = parseFloat(form.amount);
    if (isNaN(amt) || amt <= 0 || !form.description.trim()) return;
    const tx: Transaction = { id: `tx${Date.now()}`, date: form.date, type: form.type, category: form.category, amount: amt, description: form.description.trim() };
    setTransactions((prev) => {
      const next = [tx, ...prev].sort((a, b) => b.date.localeCompare(a.date));
      try { localStorage.setItem("fin_tx", JSON.stringify(next)); } catch { /* noop */ }
      return next;
    });
    setForm({ ...EMPTY_FORM, date: new Date().toISOString().slice(0, 10) });
    setShowAdd(false);
    showToast(`${form.type === "income" ? "Income" : "Expense"} of ${fmtUsd(amt)} added`);
  }, [form, showToast]);

  const updateArrears = useCallback((id: string, status: ArrearsItem["status"]) => {
    setArrears((prev) => {
      const next = prev.map((a) => a.id === id ? { ...a, status } : a);
      try { localStorage.setItem("fin_arrears", JSON.stringify(next)); } catch { /* noop */ }
      return next;
    });
    const msgs: Record<string, string> = { reminded: "Reminder sent to tenant", paid: "Marked as paid", escalated: "Escalated to legal team" };
    showToast(msgs[status] ?? "Updated");
  }, [showToast]);

  const saveBudget = useCallback((cat: TxCategory, val: string) => {
    const n = parseFloat(val);
    setEditBudget(null);
    if (isNaN(n) || n <= 0) return;
    setBudgets((prev) => {
      const next = { ...prev, [cat]: n };
      try { localStorage.setItem("fin_budgets", JSON.stringify(next)); } catch { /* noop */ }
      return next;
    });
    showToast(`${CAT_LABEL[cat]} budget updated`);
  }, [showToast]);

  const periodLabel = period === "ytd" ? "Year-to-Date" : period === "quarterly" ? "Last Quarter" : "This Month";

  const writeBanks = useCallback((next: OwnerBankAccount[]) => {
    setBanks(next);
    try { localStorage.setItem("fin_owner_banks", JSON.stringify(next)); } catch { /* noop */ }
  }, []);

  const appendBankEvent = useCallback((bankId: string, message: string) => {
    const evt: BankEvent = {
      id: `be${Date.now()}${Math.random().toString(16).slice(2, 6)}`,
      bankId,
      message,
      at: new Date().toISOString(),
    };
    setBankEvents((prev) => {
      const next = [evt, ...prev].slice(0, 50);
      try { localStorage.setItem("fin_owner_bank_events", JSON.stringify(next)); } catch { /* noop */ }
      return next;
    });
  }, []);

  const resetBankForm = useCallback(() => {
    setBankForm(EMPTY_BANK_FORM);
    setEditingBankId(null);
    setShowAddBank(false);
  }, []);

  const upsertBank = useCallback(() => {
    const bankName = bankForm.bankName.trim();
    const accountHolder = bankForm.accountHolder.trim();
    const nickname = bankForm.nickname.trim() || `${bankName || "Bank"} (${bankForm.accountLast4 || "****"})`;
    const routingLast4 = bankForm.routingLast4.replace(/\D/g, "").slice(-4);
    const accountLast4 = bankForm.accountLast4.replace(/\D/g, "").slice(-4);

    if (!bankName || !accountHolder || routingLast4.length !== 4 || accountLast4.length !== 4) {
      showToast("Enter bank name, holder, and last 4 digits for routing/account");
      return;
    }

    const now = new Date().toISOString();
    if (editingBankId) {
      const prevBank = banks.find((b) => b.id === editingBankId);
      const next = banks.map((b) => b.id === editingBankId ? {
        ...b,
        bankName,
        accountHolder,
        nickname,
        accountType: bankForm.accountType,
        routingLast4,
        accountLast4,
        updatedAt: now,
      } : b);
      writeBanks(next);
      appendBankEvent(editingBankId, `Updated bank details${prevBank?.nickname ? ` for ${prevBank.nickname}` : ""}`);
      showToast("Bank account updated");
      resetBankForm();
      return;
    }

    const id = `bank${Date.now()}`;
    const bank: OwnerBankAccount = {
      id,
      bankName,
      accountHolder,
      accountType: bankForm.accountType,
      routingLast4,
      accountLast4,
      nickname,
      status: "pending_verification",
      isDefault: banks.length === 0,
      createdAt: now,
      updatedAt: now,
    };
    writeBanks([bank, ...banks]);
    appendBankEvent(id, "Bank account added and pending verification");
    showToast("Bank account added");
    resetBankForm();
  }, [appendBankEvent, bankForm, banks, editingBankId, resetBankForm, showToast, writeBanks]);

  const setDefaultBank = useCallback((bankId: string) => {
    const next = banks.map((b) => ({ ...b, isDefault: b.id === bankId, updatedAt: b.id === bankId ? new Date().toISOString() : b.updatedAt }));
    writeBanks(next);
    appendBankEvent(bankId, "Set as default payout bank");
    showToast("Default bank updated");
  }, [appendBankEvent, banks, showToast, writeBanks]);

  const setBankStatus = useCallback((bankId: string, status: BankAccountStatus) => {
    const statusLabel: Record<BankAccountStatus, string> = {
      active: "Bank verified and active",
      pending_verification: "Bank moved to pending verification",
      archived: "Bank archived",
    };

    let next = banks.map((b) => b.id === bankId ? { ...b, status, updatedAt: new Date().toISOString() } : b);
    const activeAvailable = next.filter((b) => b.status === "active");
    if (!next.some((b) => b.isDefault && b.status === "active") && activeAvailable.length > 0) {
      next = next.map((b, i) => ({ ...b, isDefault: b.id === activeAvailable[0].id && i >= 0 }));
    }
    if (next.length > 0 && !next.some((b) => b.isDefault) && status !== "archived") {
      next = next.map((b, i) => ({ ...b, isDefault: i === 0 }));
    }

    writeBanks(next);
    appendBankEvent(bankId, statusLabel[status]);
    showToast(statusLabel[status]);
  }, [appendBankEvent, banks, showToast, writeBanks]);

  const beginEditBank = useCallback((bank: OwnerBankAccount) => {
    setEditingBankId(bank.id);
    setBankForm({
      bankName: bank.bankName,
      accountHolder: bank.accountHolder,
      accountType: bank.accountType,
      routingLast4: bank.routingLast4,
      accountLast4: bank.accountLast4,
      nickname: bank.nickname,
    });
    setShowAddBank(true);
  }, []);

  const defaultBank = banks.find((b) => b.isDefault);

  return (
    <div className="space-y-6">

      {/* ── Toast ─────────────────────────────────────────────────────────── */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-card border border-accent/40 rounded-lg px-4 py-2.5 shadow-xl font-mono text-xs text-accent">
          <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
          {toast}
        </div>
      )}

      {/* ── Controls row ──────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {(["monthly", "quarterly", "ytd"] as Period[]).map((p) => (
            <FilterChip
              key={p}
              label={p === "ytd" ? "Year-to-Date" : p === "quarterly" ? "Last Quarter" : "This Month"}
              active={period === p}
              onClick={() => setPeriod(p)}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportCsv(filterByPeriod(transactions, period))}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-border/40 rounded font-mono text-[10px] text-muted-foreground hover:text-foreground hover:border-accent/40 transition-colors"
          >
            {Icons.download} Export CSV
          </button>
          <button
            onClick={() => setShowAdd((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-accent/40 rounded bg-accent/10 font-mono text-[10px] text-accent hover:bg-accent/20 transition-colors"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
            Add Transaction
          </button>
        </div>
      </div>

      {/* ── Add Transaction Form ───────────────────────────────────────────── */}
      {showAdd && (
        <SectionCard title="New Transaction">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="space-y-1">
              <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className="w-full bg-background border border-border/40 rounded px-2 py-1.5 font-mono text-xs focus:outline-none focus:border-accent/60"
              />
            </div>
            <div className="space-y-1">
              <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Type</label>
              <select
                value={form.type}
                onChange={(e) => {
                  const t = e.target.value as TxType;
                  setForm((f) => ({ ...f, type: t, category: t === "income" ? "rent" : "utilities" }));
                }}
                className="w-full bg-background border border-border/40 rounded px-2 py-1.5 font-mono text-xs focus:outline-none focus:border-accent/60"
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as TxCategory }))}
                className="w-full bg-background border border-border/40 rounded px-2 py-1.5 font-mono text-xs focus:outline-none focus:border-accent/60"
              >
                {(form.type === "income" ? INCOME_CATS : EXPENSE_CATS).map((c) => (
                  <option key={c} value={c}>{CAT_LABEL[c]}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Amount ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                className="w-full bg-background border border-border/40 rounded px-2 py-1.5 font-mono text-xs focus:outline-none focus:border-accent/60"
              />
            </div>
            <div className="space-y-1">
              <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Description</label>
              <input
                type="text"
                placeholder="e.g. Unit 202 rent"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && addTransaction()}
                className="w-full bg-background border border-border/40 rounded px-2 py-1.5 font-mono text-xs focus:outline-none focus:border-accent/60"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={addTransaction}
              className="px-4 py-1.5 bg-accent/20 border border-accent/40 text-accent rounded font-mono text-[10px] hover:bg-accent/30 transition-colors"
            >
              Save Transaction
            </button>
            <button
              onClick={() => { setShowAdd(false); setForm(EMPTY_FORM); }}
              className="px-4 py-1.5 border border-border/40 text-muted-foreground rounded font-mono text-[10px] hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          </div>
        </SectionCard>
      )}

      {/* ── KPI row ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <KpiCard label="Gross Revenue"        value={fmtUsd(revenue)} color="text-green-500" />
        <KpiCard label="Operating Expenses"   value={fmtUsd(opex)}    color="text-red-400" />
        <KpiCard label="Net Operating Income" value={fmtUsd(noi)}     change={`${margin.toFixed(1)}% margin`} positive={noi > 0} color="text-accent" />
        <KpiCard label="NOI Margin"           value={`${margin.toFixed(1)}%`} color="text-blue-500" />
        <KpiCard label="Yield (Cap Rate)"     value="6.8%"            change="+0.3% YoY" positive color="text-purple-500" />
      </div>

      {/* ── NOI Trend Chart ───────────────────────────────────────────────── */}
      <SectionCard
        title="NOI Trend — 2026 ($K)"
        actions={
          <button onClick={() => exportCsv(transactions)} className="text-muted-foreground hover:text-foreground transition-colors" title="Export all transactions">
            {Icons.download}
          </button>
        }
      >
        <div className="h-28">
          <SimpleBarChart data={chartData} maxHeight={100} />
        </div>
        <p className="font-mono text-[9px] text-muted-foreground mt-2">
          Showing 2026 — add transactions to update chart in real time
        </p>
      </SectionCard>

      {/* ── Arrears + Budget ──────────────────────────────────────────────── */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* Arrears & Collections */}
        <SectionCard
          title="Arrears & Collections"
          actions={
            <div className="flex items-center gap-1">
              {(["all", "high", "medium", "low"] as const).map((f) => (
                <FilterChip key={f} label={f} active={arrearsFilter === f} onClick={() => setArrearsFilter(f)} />
              ))}
            </div>
          }
        >
          <div className="space-y-2">
            {filteredArrears.length === 0 && (
              <p className="font-mono text-xs text-green-500 py-6 text-center">No outstanding arrears in this category</p>
            )}
            {filteredArrears.map((a) => {
              const borderBg =
                a.status === "escalated" ? "border-red-500/60 bg-red-500/10" :
                a.status === "reminded"  ? "border-yellow-500/40 bg-yellow-500/5" :
                a.risk   === "high"      ? "border-red-500/40 bg-red-500/5" :
                a.risk   === "medium"    ? "border-yellow-500/40 bg-yellow-500/5" :
                                          "border-border/40";
              const badgeCls =
                a.status === "escalated" ? "border-red-500/60 text-red-400" :
                a.status === "reminded"  ? "border-yellow-500/40 text-yellow-400" :
                a.risk   === "high"      ? "border-red-500/40 text-red-500" :
                a.risk   === "medium"    ? "border-yellow-500/40 text-yellow-500" :
                                          "border-green-500/40 text-green-500";
              return (
                <div key={a.id} className={`border rounded-md p-3 ${borderBg}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-2 h-2 rounded-full shrink-0 mt-0.5 ${a.risk === "high" ? "bg-red-500" : a.risk === "medium" ? "bg-yellow-500" : "bg-green-500"}`} />
                      <div className="min-w-0">
                        <p className="font-mono text-xs truncate">Unit {a.unit} — {a.tenant}</p>
                        <p className="font-mono text-[10px] text-muted-foreground">{a.days} days overdue</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-mono text-xs font-semibold">${a.amount.toLocaleString()}</p>
                      <Badge className={badgeCls}>
                        {a.status !== "outstanding" ? a.status : a.risk}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2.5 pt-2 border-t border-border/20">
                    <button
                      onClick={() => updateArrears(a.id, "reminded")}
                      disabled={a.status === "reminded" || a.status === "escalated"}
                      className="font-mono text-[10px] px-2 py-0.5 border border-border/30 rounded hover:border-accent/40 hover:text-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Send Reminder
                    </button>
                    <button
                      onClick={() => updateArrears(a.id, "escalated")}
                      disabled={a.status === "escalated"}
                      className="font-mono text-[10px] px-2 py-0.5 border border-red-500/30 text-red-400 rounded hover:border-red-500/60 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Escalate
                    </button>
                    <button
                      onClick={() => updateArrears(a.id, "paid")}
                      className="font-mono text-[10px] px-2 py-0.5 border border-green-500/30 text-green-500 rounded hover:border-green-500/60 transition-colors ml-auto"
                    >
                      Mark Paid ✓
                    </button>
                  </div>
                </div>
              );
            })}
            <div className="flex items-center justify-between pt-3 border-t border-border/20">
              <span className="font-mono text-[10px] text-muted-foreground">
                {activeArrears.length} outstanding arrears
              </span>
              <span className="font-[var(--font-bebas)] text-lg text-red-400">${totalArrears.toLocaleString()}</span>
            </div>
          </div>
        </SectionCard>

        {/* Budget vs Actuals */}
        <SectionCard
          title="Budget vs Actuals (YTD)"
          actions={<span className="font-mono text-[9px] text-muted-foreground">Click budget to edit</span>}
        >
          <div className="space-y-3">
            {budgetRows.map(({ cat, label, budget, actual, variance }) => (
              <div key={cat} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px]">{label}</span>
                  <span className={`font-mono text-[10px] font-semibold ${variance >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {variance >= 0 ? "+" : ""}{(variance / 1000).toFixed(1)}K
                  </span>
                </div>
                <div className="relative h-3 w-full bg-border/20 rounded-full overflow-hidden">
                  <div className="absolute inset-y-0 left-0 bg-accent/20 rounded-full" style={{ width: `${(budget / maxBudget) * 100}%` }} />
                  <div
                    className={`absolute inset-y-0 left-0 rounded-full ${actual > budget ? "bg-red-500/50" : "bg-green-500/50"}`}
                    style={{ width: `${(actual / maxBudget) * 100}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[9px] font-mono text-muted-foreground">
                  {editBudget === cat ? (
                    <input
                      type="number"
                      defaultValue={budget}
                      autoFocus
                      onBlur={(e)    => saveBudget(cat, e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") saveBudget(cat, (e.target as HTMLInputElement).value); if (e.key === "Escape") setEditBudget(null); }}
                      className="w-24 bg-background border border-accent/40 rounded px-1 py-0 text-[9px] font-mono focus:outline-none"
                    />
                  ) : (
                    <button onClick={() => setEditBudget(cat)} className="hover:text-accent transition-colors underline underline-offset-2">
                      Budget: ${(budget / 1000).toFixed(0)}K
                    </button>
                  )}
                  <span>Actual: ${(actual / 1000).toFixed(1)}K</span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* ── Yield & Dividend ──────────────────────────────────────────────── */}
      <SectionCard title="Yield & Dividend Monitoring">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Annual Yield",       value: "6.8%",    sub: "Target: 6.5%",   color: "text-green-500"  },
            { label: "Quarterly Dividend", value: "$124.2K", sub: "+3.4% vs Q3",    color: "text-accent"     },
            { label: "Debt Service Ratio", value: "1.42×",   sub: "Min: 1.25×",     color: "text-blue-500"   },
            { label: "Cash-on-Cash",       value: "9.2%",    sub: "+0.6% YoY",      color: "text-purple-500" },
          ].map(({ label, value, sub, color }) => (
            <div key={label} className="text-center p-4 border border-border/20 rounded-lg">
              <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{label}</p>
              <p className={`text-3xl font-[var(--font-bebas)] ${color} mt-1`}>{value}</p>
              <p className="text-[10px] font-mono text-muted-foreground mt-1">{sub}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ── Owner Bank Accounts + Tracking ───────────────────────────────── */}
      <div className="grid md:grid-cols-2 gap-6">
        <SectionCard
          title="Owner Payout Banks"
          actions={
            <button
              onClick={() => {
                if (showAddBank && !editingBankId) {
                  resetBankForm();
                  return;
                }
                setEditingBankId(null);
                setBankForm(EMPTY_BANK_FORM);
                setShowAddBank((v) => !v);
              }}
              className="font-mono text-[10px] px-2 py-1 border border-accent/40 rounded text-accent hover:bg-accent/10 transition-colors"
            >
              {showAddBank && !editingBankId ? "Close" : "Add Bank"}
            </button>
          }
        >
          <div className="space-y-3">
            {showAddBank && (
              <div className="border border-border/30 rounded-md p-3 bg-card/40 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={bankForm.bankName}
                    onChange={(e) => setBankForm((f) => ({ ...f, bankName: e.target.value }))}
                    placeholder="Bank name"
                    className="w-full bg-background border border-border/40 rounded px-2 py-1.5 font-mono text-xs focus:outline-none focus:border-accent/60"
                  />
                  <input
                    type="text"
                    value={bankForm.accountHolder}
                    onChange={(e) => setBankForm((f) => ({ ...f, accountHolder: e.target.value }))}
                    placeholder="Account holder"
                    className="w-full bg-background border border-border/40 rounded px-2 py-1.5 font-mono text-xs focus:outline-none focus:border-accent/60"
                  />
                  <select
                    value={bankForm.accountType}
                    onChange={(e) => setBankForm((f) => ({ ...f, accountType: e.target.value as BankAccountType }))}
                    className="w-full bg-background border border-border/40 rounded px-2 py-1.5 font-mono text-xs focus:outline-none focus:border-accent/60"
                  >
                    <option value="checking">Checking</option>
                    <option value="savings">Savings</option>
                  </select>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    value={bankForm.routingLast4}
                    onChange={(e) => setBankForm((f) => ({ ...f, routingLast4: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                    placeholder="Routing last 4"
                    className="w-full bg-background border border-border/40 rounded px-2 py-1.5 font-mono text-xs focus:outline-none focus:border-accent/60"
                  />
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    value={bankForm.accountLast4}
                    onChange={(e) => setBankForm((f) => ({ ...f, accountLast4: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                    placeholder="Account last 4"
                    className="w-full bg-background border border-border/40 rounded px-2 py-1.5 font-mono text-xs focus:outline-none focus:border-accent/60"
                  />
                  <input
                    type="text"
                    value={bankForm.nickname}
                    onChange={(e) => setBankForm((f) => ({ ...f, nickname: e.target.value }))}
                    placeholder="Nickname (optional)"
                    className="w-full bg-background border border-border/40 rounded px-2 py-1.5 font-mono text-xs focus:outline-none focus:border-accent/60"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={upsertBank}
                    className="font-mono text-[10px] px-3 py-1.5 border border-accent/40 rounded text-accent bg-accent/10 hover:bg-accent/20 transition-colors"
                  >
                    {editingBankId ? "Update Bank" : "Save Bank"}
                  </button>
                  <button
                    onClick={resetBankForm}
                    className="font-mono text-[10px] px-3 py-1.5 border border-border/40 rounded text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {banks.length === 0 && (
              <p className="font-mono text-xs text-muted-foreground text-center py-6 border border-dashed border-border/30 rounded-md">
                No payout bank linked yet. Add one or more bank accounts.
              </p>
            )}

            {banks.map((bank) => (
              <div key={bank.id} className="border border-border/30 rounded-md p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-mono text-xs truncate">{bank.nickname || bank.bankName}</p>
                    <p className="font-mono text-[10px] text-muted-foreground truncate">
                      {bank.bankName} · {bank.accountType} · ****{bank.accountLast4} · RT ****{bank.routingLast4}
                    </p>
                    <p className="font-mono text-[10px] text-muted-foreground truncate">Holder: {bank.accountHolder}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {bank.isDefault && <Badge className="border-accent/40 text-accent">default</Badge>}
                    <Badge
                      className={
                        bank.status === "active"
                          ? "border-green-500/40 text-green-500"
                          : bank.status === "pending_verification"
                          ? "border-yellow-500/40 text-yellow-500"
                          : "border-border/40 text-muted-foreground"
                      }
                    >
                      {bank.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {!bank.isDefault && bank.status === "active" && (
                    <button
                      onClick={() => setDefaultBank(bank.id)}
                      className="font-mono text-[10px] px-2 py-0.5 border border-accent/40 rounded text-accent hover:bg-accent/10 transition-colors"
                    >
                      Set Default
                    </button>
                  )}
                  {bank.status !== "active" && (
                    <button
                      onClick={() => setBankStatus(bank.id, "active")}
                      className="font-mono text-[10px] px-2 py-0.5 border border-green-500/40 rounded text-green-500 hover:bg-green-500/10 transition-colors"
                    >
                      Verify
                    </button>
                  )}
                  {bank.status !== "pending_verification" && (
                    <button
                      onClick={() => setBankStatus(bank.id, "pending_verification")}
                      className="font-mono text-[10px] px-2 py-0.5 border border-yellow-500/40 rounded text-yellow-500 hover:bg-yellow-500/10 transition-colors"
                    >
                      Mark Pending
                    </button>
                  )}
                  {bank.status !== "archived" && (
                    <button
                      onClick={() => setBankStatus(bank.id, "archived")}
                      className="font-mono text-[10px] px-2 py-0.5 border border-border/40 rounded text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Archive
                    </button>
                  )}
                  <button
                    onClick={() => beginEditBank(bank)}
                    className="font-mono text-[10px] px-2 py-0.5 border border-border/40 rounded text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Edit
                  </button>
                  <span className="ml-auto font-mono text-[9px] text-muted-foreground">
                    Updated {formatDateTime(bank.updatedAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Bank Tracking">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="border border-border/20 rounded p-2.5">
                <p className="font-mono text-[9px] text-muted-foreground uppercase">Linked Banks</p>
                <p className="font-[var(--font-bebas)] text-xl">{banks.length}</p>
              </div>
              <div className="border border-border/20 rounded p-2.5">
                <p className="font-mono text-[9px] text-muted-foreground uppercase">Active Banks</p>
                <p className="font-[var(--font-bebas)] text-xl text-green-500">{banks.filter((b) => b.status === "active").length}</p>
              </div>
            </div>

            <div className="border border-border/20 rounded p-2.5">
              <p className="font-mono text-[9px] text-muted-foreground uppercase mb-1">Default Payout Destination</p>
              {defaultBank ? (
                <p className="font-mono text-xs">
                  {defaultBank.bankName} · ****{defaultBank.accountLast4} ({defaultBank.accountType})
                </p>
              ) : (
                <p className="font-mono text-xs text-muted-foreground">No default bank set</p>
              )}
            </div>

            <div className="border border-border/20 rounded p-2.5">
              <p className="font-mono text-[9px] text-muted-foreground uppercase mb-2">Bank Activity Timeline</p>
              {bankEvents.length === 0 ? (
                <p className="font-mono text-xs text-muted-foreground">No bank updates tracked yet</p>
              ) : (
                <div className="space-y-1.5 max-h-56 overflow-y-auto">
                  {bankEvents.map((evt) => {
                    const bank = banks.find((b) => b.id === evt.bankId);
                    return (
                      <div key={evt.id} className="text-[10px] font-mono border-b border-border/10 pb-1.5 last:border-0">
                        <p className="text-foreground">{evt.message}</p>
                        <p className="text-muted-foreground">
                          {bank ? `${bank.bankName} • ` : ""}{formatDateTime(evt.at)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </SectionCard>
      </div>

      {/* ── Transaction Ledger ────────────────────────────────────────────── */}
      <SectionCard
        title="Transaction Ledger"
        actions={
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-muted-foreground">{periodTxs.length} transactions — {periodLabel}</span>
            <FilterChip label={showLedger ? "Hide" : "Show"} active={showLedger} onClick={() => setShowLedger((v) => !v)} />
          </div>
        }
      >
        {showLedger ? (
          <div className="space-y-0.5 max-h-80 overflow-y-auto">
            {periodTxs.length === 0 && (
              <p className="font-mono text-xs text-muted-foreground py-4 text-center">No transactions for this period. Add one above.</p>
            )}
            {periodTxs.map((t) => (
              <div key={t.id} className="flex items-center justify-between py-1.5 border-b border-border/10 last:border-0 gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${t.type === "income" ? "bg-green-500" : "bg-red-400"}`} />
                  <span className="font-mono text-[10px] text-muted-foreground w-20 shrink-0">{t.date}</span>
                  <span className="font-mono text-[10px] truncate">{t.description}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge className="border-border/30 text-muted-foreground hidden md:inline-flex">{CAT_LABEL[t.category]}</Badge>
                  <span className={`font-mono text-xs font-semibold w-20 text-right ${t.type === "income" ? "text-green-500" : "text-red-400"}`}>
                    {t.type === "income" ? "+" : "−"}${t.amount.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="font-mono text-xs text-muted-foreground">
            {periodTxs.length} transactions — click Show to view the full ledger
          </p>
        )}
      </SectionCard>

    </div>
  );
}


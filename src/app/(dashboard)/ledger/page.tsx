"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  TrendingDown,
  Download,
  X,
  Wallet,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

interface NewExpenseLine {
  category: string;
  description: string;
  amount: string;
  vehicleNo: string;
}

export default function LedgerPage() {
  const [ledgerList, setLedgerList] = useState<any[]>([]);
  const [tripsList, setTripsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedEntry, setSelectedEntry] = useState<any | null>(null);
  
  // Income form states
  const [incomeTrip, setIncomeTrip] = useState("");
  const [incomeAmount, setIncomeAmount] = useState("");
  const [incomeCategory, setIncomeCategory] = useState("Freight Payment");
  const [incomeMode, setIncomeMode] = useState("UPI");
  const [incomeRef, setIncomeRef] = useState("");
  const [incomeDesc, setIncomeDesc] = useState("");
  
  const [isIncomeDialogOpen, setIsIncomeDialogOpen] = useState(false);
  const [isSavingIncome, setIsSavingIncome] = useState(false);

  // Expense form states
  const [expenseLines, setExpenseLines] = useState<NewExpenseLine[]>([
    { category: "Fuel", description: "", amount: "", vehicleNo: "" },
  ]);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [isSavingExpense, setIsSavingExpense] = useState(false);

  const fetchLedgerData = async () => {
    try {
      setLoading(true);
      const [ledgerRes, tripsRes] = await Promise.all([
        fetch("/api/ledger"),
        fetch("/api/trips"),
      ]);
      if (ledgerRes.ok) setLedgerList(await ledgerRes.json());
      if (tripsRes.ok) setTripsList(await tripsRes.json());
    } catch (error) {
      console.error("Failed to fetch ledger page data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedgerData();
  }, []);

  const handleSaveIncome = async () => {
    if (!incomeAmount || !incomeCategory || !incomeMode || !incomeDesc) return;
    const selectedTrip = tripsList.find(t => t.tripId === incomeTrip || t._id === incomeTrip);

    try {
      setIsSavingIncome(true);
      const res = await fetch("/api/ledger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: new Date().toISOString().split("T")[0],
          type: "Income",
          category: incomeCategory,
          amount: Number(incomeAmount),
          description: incomeDesc + (selectedTrip ? ` (Trip: ${selectedTrip.tripId})` : ""),
          paymentMode: incomeMode,
          reference: incomeRef || undefined,
          tripId: selectedTrip ? selectedTrip.tripId : undefined,
          vehicleNo: selectedTrip ? selectedTrip.vehicleNo : undefined,
          consignment: selectedTrip ? selectedTrip.consignment : undefined,
        }),
      });

      if (res.ok) {
        const saved = await res.json();
        setLedgerList((prev) => [saved, ...prev]);
        setIncomeTrip("");
        setIncomeAmount("");
        setIncomeCategory("Freight Payment");
        setIncomeMode("UPI");
        setIncomeRef("");
        setIncomeDesc("");
        setIsIncomeDialogOpen(false);
        fetchLedgerData();
      }
    } catch (error) {
      console.error("Failed to save income:", error);
    } finally {
      setIsSavingIncome(false);
    }
  };

  const handleSaveExpenses = async () => {
    const invalid = expenseLines.some(l => !l.amount || !l.category || !l.description);
    if (invalid) return;

    try {
      setIsSavingExpense(true);
      const payload = expenseLines.map(line => ({
        date: new Date().toISOString().split("T")[0],
        type: "Expense" as const,
        category: line.category,
        amount: Number(line.amount),
        description: line.description,
        paymentMode: "Bank Transfer" as const,
        vehicleNo: line.vehicleNo ? line.vehicleNo.toUpperCase() : undefined,
      }));

      const res = await fetch("/api/ledger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const saved = await res.json();
        const savedArray = Array.isArray(saved) ? saved : [saved];
        setLedgerList((prev) => [...savedArray, ...prev]);
        setExpenseLines([{ category: "Fuel", description: "", amount: "", vehicleNo: "" }]);
        setIsExpenseDialogOpen(false);
        fetchLedgerData();
      }
    } catch (error) {
      console.error("Failed to save expenses:", error);
    } finally {
      setIsSavingExpense(false);
    }
  };

  const filteredEntries = ledgerList.filter((entry) => {
    const matchesSearch =
      entry.description.toLowerCase().includes(search.toLowerCase()) ||
      entry.category.toLowerCase().includes(search.toLowerCase()) ||
      (entry.vehicleNo &&
        entry.vehicleNo.toLowerCase().includes(search.toLowerCase())) ||
      (entry.tripId &&
        entry.tripId.toLowerCase().includes(search.toLowerCase()));
    const matchesType =
      typeFilter === "all" || entry.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalIncome = ledgerList
    .filter((e) => e.type === "Income")
    .reduce((sum, e) => sum + e.amount, 0);
  const totalExpenses = ledgerList
    .filter((e) => e.type === "Expense")
    .reduce((sum, e) => sum + e.amount, 0);
  const netBalance = totalIncome - totalExpenses;

  const selectedTripData = incomeTrip
    ? tripsList.find((t) => t.tripId === incomeTrip || t._id === incomeTrip)
    : null;

  const addExpenseLine = () => {
    setExpenseLines([
      ...expenseLines,
      { category: "Fuel", description: "", amount: "", vehicleNo: "" },
    ]);
  };

  const removeExpenseLine = (index: number) => {
    if (expenseLines.length > 1) {
      setExpenseLines(expenseLines.filter((_, i) => i !== index));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
        <span className="w-6 h-6 rounded-full border-2 border-[#0B1F4D] border-t-transparent animate-spin" />
        <p className="text-sm text-slate-500 font-heading">Loading financial ledger...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header with Action Buttons (rounded 14px, 52px height) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl md:text-3xl font-black text-[#0B1F4D]">
            Financial Ledger
          </h2>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Unified billing records and itemized operational expenses
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Add Income Dialog */}
          <Dialog open={isIncomeDialogOpen} onOpenChange={setIsIncomeDialogOpen}>
            <DialogTrigger render={<Button className="h-[52px] rounded-[14px] bg-[#2E9E44] hover:bg-[#2E9E44]/90 text-white font-bold px-6 gap-2" />}>
              <Plus className="w-5 h-5" /> Add Income
            </DialogTrigger>
            <DialogContent className="max-w-md rounded-[20px] bg-white border border-[#E5E7EB] text-[#0B1F4D]">
              <DialogHeader>
                <DialogTitle className="font-heading text-lg font-black flex items-center gap-2">
                  <ArrowUpRight className="w-5 h-5 text-[#2E9E44]" /> Record Income
                </DialogTitle>
                <DialogDescription className="text-slate-400 font-medium">
                  Log customer payment receipts or other cargo revenue.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4 text-xs font-semibold">
                <div>
                  <Label className="text-xs font-bold text-[#0B1F4D]">Select Trip Link (Optional)</Label>
                  <Select value={incomeTrip} onValueChange={(val) => setIncomeTrip(val || "")}>
                    <SelectTrigger className="mt-1 h-11 bg-white border-[#E5E7EB] rounded-[10px] text-sm">
                      <SelectValue placeholder="Select active dispatch to link" />
                    </SelectTrigger>
                    <SelectContent>
                      {tripsList.map((t) => (
                        <SelectItem key={t._id || t.id} value={t.tripId || t.id}>
                          {t.tripId || t.id} - {t.origin} → {t.destination}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedTripData && (
                  <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl space-y-1.5 font-medium text-xs">
                    <p className="text-[10px] text-emerald-600 font-bold uppercase">Linked Cargo details</p>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Vehicle</span>
                      <span className="font-mono font-bold text-[#0B1F4D]">{selectedTripData.vehicleNo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Customer</span>
                      <span className="font-bold text-[#0B1F4D]">{selectedTripData.consignment}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Outstanding Balance</span>
                      <span className="font-mono font-bold text-[#F59E0B]">{formatCurrency(selectedTripData.pendingBalance)}</span>
                    </div>
                  </div>
                )}
                <div>
                  <Label className="text-xs font-bold text-[#0B1F4D]">Amount (₹)</Label>
                  <Input
                    type="number"
                    placeholder="Enter revenue amount"
                    className="mt-1 h-11 text-sm bg-white border-[#E5E7EB] rounded-[10px]"
                    value={incomeAmount}
                    onChange={(e) => setIncomeAmount(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold text-[#0B1F4D]">Category</Label>
                  <Select value={incomeCategory} onValueChange={(val) => setIncomeCategory(val || "")}>
                    <SelectTrigger className="mt-1 h-11 bg-white border-[#E5E7EB] rounded-[10px] text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Freight Payment">Freight Payment</SelectItem>
                      <SelectItem value="Demurrage">Demurrage</SelectItem>
                      <SelectItem value="Other Income">Other Income</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-bold text-[#0B1F4D]">Payment Method</Label>
                  <Select value={incomeMode} onValueChange={(val) => setIncomeMode(val || "")}>
                    <SelectTrigger className="mt-1 h-11 bg-white border-[#E5E7EB] rounded-[10px] text-sm">
                      <SelectValue placeholder="Select mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UPI">UPI</SelectItem>
                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Cheque">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-bold text-[#0B1F4D]">Reference No. (Optional)</Label>
                  <Input
                    placeholder="NEFT/UPI/Cheque reference ID"
                    className="mt-1 h-11 text-sm bg-white border-[#E5E7EB] rounded-[10px]"
                    value={incomeRef}
                    onChange={(e) => setIncomeRef(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold text-[#0B1F4D]">Log Description</Label>
                  <Input
                    placeholder="Payment description notes"
                    className="mt-1 h-11 text-sm bg-white border-[#E5E7EB] rounded-[10px]"
                    value={incomeDesc}
                    onChange={(e) => setIncomeDesc(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter className="gap-2">
                <DialogClose render={<Button variant="outline" className="h-11 px-6 rounded-lg text-[#0B1F4D] border-[#E5E7EB]" />}>
                  Cancel
                </DialogClose>
                <Button
                  className="h-11 px-6 rounded-lg bg-[#0B1F4D] text-white font-bold"
                  onClick={handleSaveIncome}
                  disabled={isSavingIncome || !incomeAmount || !incomeDesc}
                >
                  {isSavingIncome ? "Saving..." : "Save Income"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Add Expense Dialog */}
          <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
            <DialogTrigger render={<Button className="h-[52px] rounded-[14px] bg-[#EF4444] hover:bg-[#EF4444]/90 text-white font-bold px-6 gap-2" />}>
              <Plus className="w-5 h-5" /> Add Expense
            </DialogTrigger>
            <DialogContent className="max-w-lg rounded-[20px] bg-white border border-[#E5E7EB] text-[#0B1F4D]">
              <DialogHeader>
                <DialogTitle className="font-heading text-lg font-black flex items-center gap-2">
                  <ArrowDownRight className="w-5 h-5 text-[#EF4444]" /> Record Expense
                </DialogTitle>
                <DialogDescription className="text-slate-400 font-medium">
                  Record fleet expenses. Auto-links based on Active Trip status.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4 text-xs font-semibold">
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 font-medium">
                  <p className="text-[10px] text-amber-700 font-bold uppercase mb-0.5">Auto-link Policy</p>
                  Line items containing a Vehicle Number will link to their active dispatch automatically.
                </div>
                
                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                  {expenseLines.map((line, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Item #{idx + 1}</span>
                        {expenseLines.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeExpenseLine(idx)}
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Select
                          value={line.category}
                          onValueChange={(val) => {
                            const updated = [...expenseLines];
                            updated[idx].category = val || "";
                            setExpenseLines(updated);
                          }}
                        >
                          <SelectTrigger className="h-9 text-xs bg-white border-[#E5E7EB] rounded-lg">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {["Fuel", "Toll", "Driver Advance", "Loading", "Unloading", "Repair", "RTO", "Office Rent", "Salary", "Other"].map((c) => (
                              <SelectItem key={c} value={c}>
                                {c}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          placeholder="Amount"
                          value={line.amount}
                          onChange={(e) => {
                            const updated = [...expenseLines];
                            updated[idx].amount = e.target.value;
                            setExpenseLines(updated);
                          }}
                          className="h-9 text-xs bg-white border-[#E5E7EB] rounded-lg text-[#0B1F4D]"
                        />
                      </div>
                      <Input
                        placeholder="Vehicle Registration No. (Optional)"
                        value={line.vehicleNo}
                        onChange={(e) => {
                          const updated = [...expenseLines];
                          updated[idx].vehicleNo = e.target.value;
                          setExpenseLines(updated);
                        }}
                        className="h-9 text-xs bg-white border-[#E5E7EB] rounded-lg text-[#0B1F4D]"
                      />
                      <Input
                        placeholder="Expense description notes"
                        value={line.description}
                        onChange={(e) => {
                          const updated = [...expenseLines];
                          updated[idx].description = e.target.value;
                          setExpenseLines(updated);
                        }}
                        className="h-9 text-xs bg-white border-[#E5E7EB] rounded-lg text-[#0B1F4D]"
                      />
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addExpenseLine}
                  className="w-full text-xs h-9 border-[#E5E7EB] text-[#0B1F4D] rounded-lg bg-white"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Multi-line Expense
                </Button>
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex justify-between font-bold text-xs">
                  <span className="text-slate-500">Expenses Sum</span>
                  <span className="text-[#EF4444] font-mono">
                    {formatCurrency(expenseLines.reduce((sum, l) => sum + (Number(l.amount) || 0), 0))}
                  </span>
                </div>
              </div>
              <DialogFooter className="gap-2">
                <DialogClose render={<Button variant="outline" className="h-11 px-6 rounded-lg text-[#0B1F4D] border-[#E5E7EB]" />}>
                  Cancel
                </DialogClose>
                <Button
                  className="h-11 px-6 rounded-lg bg-[#0B1F4D] text-white font-bold"
                  onClick={handleSaveExpenses}
                  disabled={isSavingExpense || expenseLines.some(l => !l.amount || !l.category || !l.description)}
                >
                  {isSavingExpense ? "Saving..." : "Save Expenses"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards with rounded-2xl (20px) corners */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: "Total Revenue", value: formatCurrency(totalIncome), color: "text-[#2E9E44]", circleBg: "bg-emerald-50 text-emerald-600", icon: TrendingUp },
          { label: "Total Expenses", value: formatCurrency(totalExpenses), color: "text-[#EF4444]", circleBg: "bg-red-50 text-red-500", icon: TrendingDown },
          { label: "Net Balance", value: formatCurrency(netBalance), color: netBalance >= 0 ? "text-[#0B1F4D]" : "text-rose-600", circleBg: "bg-[#0B1F4D]/10 text-[#0B1F4D]", icon: Wallet },
        ].map((card) => (
          <Card key={card.label} className="border border-[#E5E7EB] rounded-[20px] bg-white shadow-sm ring-0">
            <CardContent className="p-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{card.label}</p>
                <p className={cn("text-xl md:text-2xl font-heading font-black tracking-tight mt-1", card.color)}>{card.value}</p>
              </div>
              <div className={cn("w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-sm", card.circleBg)}>
                <card.icon className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search, Filter & Export */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by description, category, vehicle number, trip ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-11 text-sm bg-white border-[#E5E7EB] rounded-[12px] shadow-sm text-[#0B1F4D] placeholder-slate-400"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={typeFilter} onValueChange={(val) => setTypeFilter(val || "")}>
            <SelectTrigger className="h-11 text-sm w-[130px] bg-white border-[#E5E7EB] rounded-[12px] shadow-sm text-[#0B1F4D]">
              <SelectValue placeholder="All Ledger" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Income">Income</SelectItem>
              <SelectItem value="Expense">Expenses</SelectItem>
            </SelectContent>
          </Select>
          <Button className="h-[44px] rounded-[12px] bg-[#0B1F4D] hover:bg-[#0B1F4D]/90 text-white font-bold px-4 gap-1.5 shadow-md">
            <Download className="w-4 h-4" /> Export
          </Button>
        </div>
      </div>

      {/* Responsive Ledger lists/table */}
      {filteredEntries.length === 0 ? (
        <Card className="border border-[#E5E7EB] rounded-[20px] bg-white py-12 text-center shadow-sm">
          <CardContent className="space-y-3">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-500">No ledger statements found matching filters</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Mobile view: Premium Expense Cards */}
          <div className="md:hidden space-y-4">
            {filteredEntries.map((entry) => (
              <Card 
                key={entry._id || entry.id} 
                className="border border-[#E5E7EB] rounded-[20px] bg-white shadow-sm ring-0 p-5 hover:shadow-md transition-all cursor-pointer"
                onClick={() => setSelectedEntry(entry)}
              >
                <CardContent className="p-0 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">{formatDate(entry.date)}</span>
                    <Badge variant="outline" className={cn("text-[8px] font-bold rounded-full py-0.5 px-2", entry.type === "Income" ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" : "bg-red-500/10 text-red-700 border-red-500/20")}>
                      {entry.type}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{entry.category}</p>
                    <p className="text-sm font-semibold text-[#0B1F4D] mt-0.5">{entry.description}</p>
                  </div>
                  <div className="flex justify-between items-center text-xs pt-1">
                    <span className="font-mono text-slate-400">Vehicle: {entry.vehicleNo || "—"}</span>
                    <span className={cn("font-mono font-black text-sm", entry.type === "Income" ? "text-emerald-600" : "text-red-600")}>
                      {entry.type === "Income" ? "+" : "-"} {formatCurrency(entry.amount)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Desktop view: Table with Premium Styling */}
          <div className="hidden md:block">
            <Card className="border border-[#E5E7EB] rounded-[20px] bg-white shadow-sm ring-0 overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#E5E7EB] bg-slate-50 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                        <th className="text-left py-3.5 px-5">Date</th>
                        <th className="text-left py-3.5 px-5">Type</th>
                        <th className="text-left py-3.5 px-5">Category</th>
                        <th className="text-left py-3.5 px-5">Description</th>
                        <th className="text-left py-3.5 px-5">Vehicle</th>
                        <th className="text-left py-3.5 px-5">Trip</th>
                        <th className="text-left py-3.5 px-5">Method</th>
                        <th className="text-right py-3.5 px-5">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEntries.map((entry) => (
                        <tr
                          key={entry._id || entry.id}
                          className="border-b border-[#E5E7EB] hover:bg-slate-50 transition-colors cursor-pointer text-xs font-semibold"
                          onClick={() => setSelectedEntry(entry)}
                        >
                          <td className="py-3.5 px-5 text-slate-500">{formatDate(entry.date)}</td>
                          <td className="py-3.5 px-5">
                            <Badge variant="outline" className={cn("text-[9px] rounded-full font-bold", entry.type === "Income" ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" : "bg-red-500/10 text-red-700 border-red-500/20")}>
                              {entry.type}
                            </Badge>
                          </td>
                          <td className="py-3.5 px-5 text-[#0B1F4D]">{entry.category}</td>
                          <td className="py-3.5 px-5 text-slate-500 max-w-[240px] truncate">{entry.description}</td>
                          <td className="py-3.5 px-5 font-mono text-slate-500">{entry.vehicleNo || "—"}</td>
                          <td className="py-3.5 px-5 font-mono text-slate-500">{entry.tripId || "—"}</td>
                          <td className="py-3.5 px-5">
                            <Badge variant="secondary" className="text-[10px] font-bold">{entry.paymentMode}</Badge>
                          </td>
                          <td className={cn("py-3.5 px-5 text-right font-mono font-black text-sm", entry.type === "Income" ? "text-emerald-600" : "text-red-600")}>
                            {entry.type === "Income" ? "+" : "-"} {formatCurrency(entry.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Entry Detail Dialog */}
      <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
        <DialogContent className="max-w-md rounded-[20px] bg-white border border-[#E5E7EB] text-[#0B1F4D]">
          {selectedEntry && (
            <>
              <DialogHeader>
                <DialogTitle className="font-heading text-lg font-black flex items-center gap-2">
                  {selectedEntry.type === "Income" ? (
                    <ArrowUpRight className="w-5 h-5 text-[#2E9E44]" />
                  ) : (
                    <ArrowDownRight className="w-5 h-5 text-[#EF4444]" />
                  )}
                  {selectedEntry.category}
                </DialogTitle>
                <DialogDescription className="text-slate-400 font-medium">
                  {selectedEntry.description}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-4 text-xs font-semibold">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <p className="text-[9px] text-slate-400 uppercase tracking-wider mb-1">Billing Amount</p>
                  <p className={cn("text-2xl font-heading font-black", selectedEntry.type === "Income" ? "text-emerald-600" : "text-red-600")}>
                    {selectedEntry.type === "Income" ? "+" : "-"} {formatCurrency(selectedEntry.amount)}
                  </p>
                </div>
                <div className="space-y-1">
                  {[
                    { label: "Date Created", value: formatDate(selectedEntry.date) },
                    { label: "Ledger Type", value: selectedEntry.type },
                    { label: "Payment Category", value: selectedEntry.category },
                    { label: "Payment Mode", value: selectedEntry.paymentMode },
                    { label: "Reference ID", value: selectedEntry.reference || "—" },
                    { label: "Linked Vehicle", value: selectedEntry.vehicleNo || "—" },
                    { label: "Linked Trip", value: selectedEntry.tripId || "—" },
                    { label: "Linked Customer", value: selectedEntry.consignment || "—" },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between py-2 border-b border-slate-100 font-medium">
                      <span className="text-slate-400">{item.label}</span>
                      <span className="text-[#0B1F4D]">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

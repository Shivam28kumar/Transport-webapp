"use client";

import { useState } from "react";
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
} from "lucide-react";
import { type LedgerEntry } from "@/lib/mock-data";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { useEffect } from "react";

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
    
    // Find selected trip to get vehicleNo and consignment details
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
        // Reset form
        setIncomeTrip("");
        setIncomeAmount("");
        setIncomeCategory("Freight Payment");
        setIncomeMode("UPI");
        setIncomeRef("");
        setIncomeDesc("");
        setIsIncomeDialogOpen(false);
        // Refresh page data
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
    if (invalid) {
      return;
    }

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
        
        // Reset form
        setExpenseLines([{ category: "Fuel", description: "", amount: "", vehicleNo: "" }]);
        setIsExpenseDialogOpen(false);
        // Refresh page data
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
        <span className="w-6 h-6 rounded-full border-2 border-[#0a192f] border-t-transparent animate-spin" />
        <p className="text-sm text-muted-foreground font-heading">Loading financial ledger...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight">
            Financial Ledger
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Unified income & expense records with trip linking
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Add Income Dialog */}
          <Dialog open={isIncomeDialogOpen} onOpenChange={setIsIncomeDialogOpen}>
            <DialogTrigger
              render={
                <Button
                  size="sm"
                  className="gap-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" /> Add Income
                </Button>
              }
            />
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="font-heading text-emerald-700 flex items-center gap-2">
                  <ArrowUpRight className="w-5 h-5" /> Record Income
                </DialogTitle>
                <DialogDescription>
                  Record freight payment or other revenue.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <Label className="text-xs">Select Trip (Optional)</Label>
                  <Select value={incomeTrip} onValueChange={(val) => setIncomeTrip(val || "")}>
                    <SelectTrigger className="mt-1 h-9 text-sm">
                      <SelectValue placeholder="Select trip to auto-fill" />
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
                  <div className="p-3 bg-emerald-50 rounded-lg space-y-1.5">
                    <p className="text-xs text-muted-foreground">
                      Auto-filled from trip
                    </p>
                    <div className="flex justify-between text-sm">
                      <span>Vehicle</span>
                      <span className="font-mono font-medium">
                        {selectedTripData.vehicleNo}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Consignment</span>
                      <span className="font-medium">
                        {selectedTripData.consignment}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Pending Balance</span>
                      <span className="font-mono font-medium text-amber-600">
                        {formatCurrency(selectedTripData.pendingBalance)}
                      </span>
                    </div>
                  </div>
                )}
                <div>
                  <Label className="text-xs">Amount (₹)</Label>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    className="mt-1 h-9 text-sm"
                    value={incomeAmount}
                    onChange={(e) => setIncomeAmount(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs">Category</Label>
                  <Select value={incomeCategory} onValueChange={(val) => setIncomeCategory(val || "")}>
                    <SelectTrigger className="mt-1 h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Freight Payment">
                        Freight Payment
                      </SelectItem>
                      <SelectItem value="Demurrage">Demurrage</SelectItem>
                      <SelectItem value="Other Income">Other Income</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Payment Mode</Label>
                  <Select value={incomeMode} onValueChange={(val) => setIncomeMode(val || "")}>
                    <SelectTrigger className="mt-1 h-9 text-sm">
                      <SelectValue placeholder="Select mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UPI">UPI</SelectItem>
                      <SelectItem value="Bank Transfer">
                        Bank Transfer
                      </SelectItem>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Cheque">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Reference No. (Optional)</Label>
                  <Input
                    placeholder="NEFT/UPI/Cheque reference"
                    className="mt-1 h-9 text-sm"
                    value={incomeRef}
                    onChange={(e) => setIncomeRef(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs">Description</Label>
                  <Input
                    placeholder="Payment description"
                    className="mt-1 h-9 text-sm"
                    value={incomeDesc}
                    onChange={(e) => setIncomeDesc(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose render={<Button variant="outline" size="sm" />}>
                  Cancel
                </DialogClose>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600"
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
            <DialogTrigger
              render={
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 border-red-200 text-red-600 hover:bg-red-50"
                >
                  <ArrowDownRight className="w-3.5 h-3.5" /> Add Expense
                </Button>
              }
            />
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-heading text-red-700 flex items-center gap-2">
                  <ArrowDownRight className="w-5 h-5" /> Record Expenses
                </DialogTitle>
                <DialogDescription>
                  Add one or more expense entries. Trip linking is automatic.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="p-3 bg-amber-50 rounded-lg">
                  <p className="text-xs text-amber-800">
                    <strong>Auto-link Rule:</strong> Expenses with a vehicle
                    number will be automatically linked to the active trip for
                    that vehicle.
                  </p>
                </div>
                {expenseLines.map((line, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-muted/30 rounded-lg space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">
                        Expense #{idx + 1}
                      </span>
                      {expenseLines.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeExpenseLine(idx)}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        >
                          <X className="w-3 h-3" />
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
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            "Fuel",
                            "Toll",
                            "Driver Advance",
                            "Loading",
                            "Unloading",
                            "Repair",
                            "RTO",
                            "Office Rent",
                            "Salary",
                            "Other",
                          ].map((c) => (
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
                        className="h-8 text-xs"
                      />
                    </div>
                    <Input
                      placeholder="Vehicle No. (for auto-trip-link)"
                      value={line.vehicleNo}
                      onChange={(e) => {
                        const updated = [...expenseLines];
                        updated[idx].vehicleNo = e.target.value;
                        setExpenseLines(updated);
                      }}
                      className="h-8 text-xs"
                    />
                    <Input
                      placeholder="Description"
                      value={line.description}
                      onChange={(e) => {
                        const updated = [...expenseLines];
                        updated[idx].description = e.target.value;
                        setExpenseLines(updated);
                      }}
                      className="h-8 text-xs"
                    />
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addExpenseLine}
                  className="w-full text-xs gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Another Expense Line
                </Button>
                <div className="p-3 bg-red-50 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-heading font-bold text-red-600">
                      {formatCurrency(
                        expenseLines.reduce(
                          (sum, l) => sum + (Number(l.amount) || 0),
                          0
                        )
                      )}
                    </span>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <DialogClose render={<Button variant="outline" size="sm" />}>
                  Cancel
                </DialogClose>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-red-500 to-red-600"
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="shadow-sm border-l-4 border-l-emerald-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Total Income
                </p>
                <p className="text-xl font-heading font-bold text-emerald-600">
                  {formatCurrency(totalIncome)}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-emerald-50">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Total Expenses
                </p>
                <p className="text-xl font-heading font-bold text-red-600">
                  {formatCurrency(totalExpenses)}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-red-50">
                <TrendingDown className="w-5 h-5 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Net Balance
                </p>
                <p
                  className={cn(
                    "text-xl font-heading font-bold",
                    netBalance >= 0 ? "text-blue-600" : "text-red-600"
                  )}
                >
                  {formatCurrency(netBalance)}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-blue-50">
                <Wallet className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by description, category, vehicle, trip ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
        <Select value={typeFilter} onValueChange={(val) => setTypeFilter(val || "")}>
          <SelectTrigger className="h-9 text-sm w-[140px]">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Income">Income Only</SelectItem>
            <SelectItem value="Expense">Expenses Only</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
          <Download className="w-3.5 h-3.5" /> Export
        </Button>
      </div>

      {/* Ledger Table */}
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Type
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Category
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Description
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Trip
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Mode
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((entry) => (
                  <tr
                    key={entry._id || entry.id}
                    className="border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedEntry(entry)}
                  >
                    <td className="py-3 px-4 text-xs">
                      {formatDate(entry.date)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        {entry.type === "Income" ? (
                          <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3 text-red-500" />
                        )}
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px]",
                            entry.type === "Income"
                              ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
                              : "bg-red-500/10 text-red-700 border-red-500/20"
                          )}
                        >
                          {entry.type}
                        </Badge>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs">{entry.category}</td>
                    <td className="py-3 px-4 text-xs max-w-[200px] truncate">
                      {entry.description}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs">
                      {entry.vehicleNo || "—"}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs">
                      {entry.tripId || "—"}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="secondary" className="text-[10px]">
                        {entry.paymentMode}
                      </Badge>
                    </td>
                    <td
                      className={cn(
                        "py-3 px-4 text-right font-mono font-medium",
                        entry.type === "Income"
                          ? "text-emerald-600"
                          : "text-red-600"
                      )}
                    >
                      {entry.type === "Income" ? "+" : "-"}
                      {formatCurrency(entry.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Entry Detail Dialog */}
      <Dialog
        open={!!selectedEntry}
        onOpenChange={() => setSelectedEntry(null)}
      >
        <DialogContent className="max-w-md">
          {selectedEntry && (
            <>
              <DialogHeader>
                <DialogTitle className="font-heading flex items-center gap-2">
                  {selectedEntry.type === "Income" ? (
                    <ArrowUpRight className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <ArrowDownRight className="w-5 h-5 text-red-500" />
                  )}
                  {selectedEntry.category}
                </DialogTitle>
                <DialogDescription>
                  {selectedEntry.description}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-4">
                <div className="p-4 rounded-lg bg-muted/30 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                    Amount
                  </p>
                  <p
                    className={cn(
                      "text-2xl font-heading font-bold",
                      selectedEntry.type === "Income"
                        ? "text-emerald-600"
                        : "text-red-600"
                    )}
                  >
                    {selectedEntry.type === "Income" ? "+" : "-"}
                    {formatCurrency(selectedEntry.amount)}
                  </p>
                </div>
                <div className="space-y-2">
                  {[
                    { label: "Date", value: formatDate(selectedEntry.date) },
                    { label: "Type", value: selectedEntry.type },
                    { label: "Category", value: selectedEntry.category },
                    {
                      label: "Payment Mode",
                      value: selectedEntry.paymentMode,
                    },
                    {
                      label: "Reference",
                      value: selectedEntry.reference || "—",
                    },
                    {
                      label: "Vehicle",
                      value: selectedEntry.vehicleNo || "—",
                    },
                    {
                      label: "Trip ID",
                      value: selectedEntry.tripId || "—",
                    },
                    {
                      label: "Consignment",
                      value: selectedEntry.consignment || "—",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex justify-between py-1.5 text-sm border-b border-border/30"
                    >
                      <span className="text-muted-foreground">
                        {item.label}
                      </span>
                      <span className="font-medium">{item.value}</span>
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

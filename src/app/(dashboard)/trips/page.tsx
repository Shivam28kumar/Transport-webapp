"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
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
  Route,
  Search,
  Plus,
  Truck,
  User,
  IndianRupee,
  TrendingUp,
  Package,
  Clock,
  FileText,
  CheckCircle2,
  AlertCircle,
  Receipt,
  X,
} from "lucide-react";
import { cn, formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import { useEffect } from "react";

interface NewExpense {
  category: string;
  amount: string;
  description: string;
}

export default function TripsPage() {
  const [tripsList, setTripsList] = useState<any[]>([]);
  const [trucksList, setTrucksList] = useState<any[]>([]);
  const [driversList, setDriversList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTrip, setSelectedTrip] = useState<any | null>(null);
  const [newExpenses, setNewExpenses] = useState<NewExpense[]>([]);
  
  // Create Trip form states
  const [newOrigin, setNewOrigin] = useState("");
  const [newDestination, setNewDestination] = useState("");
  const [newConsignment, setNewConsignment] = useState("");
  const [newMaterial, setNewMaterial] = useState("");
  const [newStartDate, setNewStartDate] = useState("");
  const [selectedTruckId, setSelectedTruckId] = useState("");
  const [selectedDriverId, setSelectedDriverId] = useState("");
  
  const [freightRate, setFreightRate] = useState("");
  const [quantity, setQuantity] = useState("");
  const [advance, setAdvance] = useState("");
  const [isSavingTrip, setIsSavingTrip] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const fetchTripsData = async () => {
    try {
      setLoading(true);
      const [tripsRes, trucksRes, driversRes] = await Promise.all([
        fetch("/api/trips"),
        fetch("/api/trucks"),
        fetch("/api/drivers"),
      ]);
      if (tripsRes.ok) setTripsList(await tripsRes.json());
      if (trucksRes.ok) setTrucksList(await trucksRes.json());
      if (driversRes.ok) setDriversList(await driversRes.json());
    } catch (error) {
      console.error("Failed to fetch trips page data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTripsData();
  }, []);

  const handleSaveTrip = async () => {
    const truckObj = trucksList.find(t => t._id === selectedTruckId);
    const driverObj = driversList.find(d => d._id === selectedDriverId);

    if (!newOrigin || !newDestination || !newConsignment || !newMaterial || !newStartDate || !truckObj || !driverObj) {
      return;
    }

    try {
      setIsSavingTrip(true);
      
      const payload = {
        origin: newOrigin,
        destination: newDestination,
        consignment: newConsignment,
        material: newMaterial,
        startDate: newStartDate,
        truckId: truckObj._id,
        vehicleNo: truckObj.vehicleNo,
        driverId: driverObj._id,
        driverName: driverObj.name,
        freightRate: Number(freightRate) || 0,
        quantity: Number(quantity) || 0,
        advance: Number(advance) || 0,
        expenses: newExpenses.map(e => ({
          category: e.category,
          amount: Number(e.amount) || 0,
          description: e.description,
          date: newStartDate,
        })),
        tripStatus: "Planned"
      };

      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const savedTrip = await res.json();
        setTripsList(prev => [savedTrip, ...prev]);
        
        // Reset form
        setNewOrigin("");
        setNewDestination("");
        setNewConsignment("");
        setNewMaterial("");
        setNewStartDate("");
        setSelectedTruckId("");
        setSelectedDriverId("");
        setFreightRate("");
        setQuantity("");
        setAdvance("");
        setNewExpenses([]);
        setIsCreateDialogOpen(false);
      }
    } catch (error) {
      console.error("Failed to save trip:", error);
    } finally {
      setIsSavingTrip(false);
    }
  };

  const filteredTrips = tripsList.filter((trip) => {
    const matchesSearch =
      (trip.tripId || trip.id || "").toLowerCase().includes(search.toLowerCase()) ||
      trip.origin.toLowerCase().includes(search.toLowerCase()) ||
      trip.destination.toLowerCase().includes(search.toLowerCase()) ||
      trip.vehicleNo.toLowerCase().includes(search.toLowerCase()) ||
      trip.consignment.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || trip.tripStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = tripsList.reduce((sum, t) => sum + t.totalFare, 0);
  const totalNetProfit = tripsList.reduce((sum, t) => sum + t.netProfit, 0);
  const inTransitCount = tripsList.filter(
    (t) => t.tripStatus === "In Transit"
  ).length;

  const calcTotalFare =
    (Number(freightRate) || 0) * (Number(quantity) || 0);
  const calcPending = calcTotalFare - (Number(advance) || 0);
  const calcExpensesTotal = newExpenses.reduce(
    (sum, e) => sum + (Number(e.amount) || 0),
    0
  );
  const calcNetProfit = calcTotalFare - calcExpensesTotal;
  const calcPaymentStatus =
    Number(advance) === 0
      ? "Pending"
      : Number(advance) >= calcTotalFare
      ? "Complete"
      : "Partial";

  const addExpenseRow = () => {
    setNewExpenses([
      ...newExpenses,
      { category: "Fuel", amount: "", description: "" },
    ]);
  };

  const removeExpenseRow = (index: number) => {
    setNewExpenses(newExpenses.filter((_, i) => i !== index));
  };

  const getDocDot = (doc: string | undefined) => (
    <div
      className={cn(
        "w-2 h-2 rounded-full",
        doc ? "bg-emerald-500" : "bg-gray-300"
      )}
    />
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
        <span className="w-6 h-6 rounded-full border-2 border-[#0a192f] border-t-transparent animate-spin" />
        <p className="text-sm text-muted-foreground font-heading">Loading trip dispatches...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight">
            Trip Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Industrial dispatch, freight calculations & profit audit
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger
            render={
              <Button
                size="sm"
                className="gap-1.5 bg-gradient-to-r from-[#0a192f] to-[#1d3461] hover:from-[#112240] hover:to-[#0a192f]"
              >
                <Plus className="w-3.5 h-3.5" /> Create Trip
              </Button>
            }
          />
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-heading">
                Create New Trip
              </DialogTitle>
              <DialogDescription>
                Configure dispatch details, freight, and expenses.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Dual Column Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">Origin</Label>
                    <Input
                      placeholder="e.g. Jamshedpur"
                      className="mt-1 h-9 text-sm"
                      value={newOrigin}
                      onChange={(e) => setNewOrigin(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Destination</Label>
                    <Input
                      placeholder="e.g. Kolkata"
                      className="mt-1 h-9 text-sm"
                      value={newDestination}
                      onChange={(e) => setNewDestination(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Consignment</Label>
                    <Input
                      placeholder="e.g. Tata Steel Ltd."
                      className="mt-1 h-9 text-sm"
                      value={newConsignment}
                      onChange={(e) => setNewConsignment(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Material</Label>
                    <Input
                      placeholder="e.g. HR Coils"
                      className="mt-1 h-9 text-sm"
                      value={newMaterial}
                      onChange={(e) => setNewMaterial(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Start Date</Label>
                    <Input
                      type="date"
                      className="mt-1 h-9 text-sm"
                      value={newStartDate}
                      onChange={(e) => setNewStartDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">Select Truck</Label>
                    <Select value={selectedTruckId} onValueChange={(val) => setSelectedTruckId(val || "")}>
                      <SelectTrigger className="mt-1 h-9 text-sm">
                        <SelectValue placeholder="Select vehicle" />
                      </SelectTrigger>
                      <SelectContent>
                        {trucksList.map((t) => (
                          <SelectItem key={t._id} value={t._id}>
                            {t.vehicleNo} ({t.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Select Driver</Label>
                    <Select value={selectedDriverId} onValueChange={(val) => setSelectedDriverId(val || "")}>
                      <SelectTrigger className="mt-1 h-9 text-sm">
                        <SelectValue placeholder="Select driver" />
                      </SelectTrigger>
                      <SelectContent>
                        {driversList.map((d) => (
                          <SelectItem key={d._id} value={d._id}>
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Freight Rate (₹/Ton)</Label>
                      <Input
                        type="number"
                        placeholder="3200"
                        value={freightRate}
                        onChange={(e) => setFreightRate(e.target.value)}
                        className="mt-1 h-9 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Quantity (Tons)</Label>
                      <Input
                        type="number"
                        placeholder="32"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="mt-1 h-9 text-sm"
                      />
                    </div>
                  </div>
                  {/* Auto-calculated fields */}
                  <div className="p-3 bg-muted/50 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Fare</span>
                      <span className="font-heading font-bold text-emerald-600">
                        {formatCurrency(calcTotalFare)}
                      </span>
                    </div>
                    <Separator />
                    <div>
                      <Label className="text-xs">Advance Amount</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={advance}
                        onChange={(e) => setAdvance(e.target.value)}
                        className="mt-1 h-9 text-sm"
                      />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Pending Balance
                      </span>
                      <span className="font-mono font-medium text-amber-600">
                        {formatCurrency(Math.max(0, calcPending))}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm items-center">
                      <span className="text-muted-foreground">
                        Payment Status
                      </span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px]",
                          getStatusColor(calcPaymentStatus)
                        )}
                      >
                        {calcPaymentStatus}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Embedded Expenses */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-heading font-semibold text-sm flex items-center gap-2">
                    <Receipt className="w-4 h-4" /> Trip Expenses
                  </h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addExpenseRow}
                    className="text-xs gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Expense
                  </Button>
                </div>
                {newExpenses.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4 bg-muted/30 rounded-lg">
                    No expenses added yet. Click &quot;Add Expense&quot; to
                    begin.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {newExpenses.map((exp, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Select
                          value={exp.category}
                          onValueChange={(val) => {
                            const updated = [...newExpenses];
                            updated[idx].category = val || "";
                            setNewExpenses(updated);
                          }}
                        >
                          <SelectTrigger className="h-8 text-xs w-[130px]">
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
                          value={exp.amount}
                          onChange={(e) => {
                            const updated = [...newExpenses];
                            updated[idx].amount = e.target.value;
                            setNewExpenses(updated);
                          }}
                          className="h-8 text-xs w-[100px]"
                        />
                        <Input
                          placeholder="Description"
                          value={exp.description}
                          onChange={(e) => {
                            const updated = [...newExpenses];
                            updated[idx].description = e.target.value;
                            setNewExpenses(updated);
                          }}
                          className="h-8 text-xs flex-1"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeExpenseRow(idx)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-3 p-3 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Total Expenses
                    </span>
                    <span className="font-mono text-red-600">
                      {formatCurrency(calcExpensesTotal)}
                    </span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between text-sm">
                    <span className="font-heading font-semibold">
                      Net Profit
                    </span>
                    <span
                      className={cn(
                        "font-heading font-bold",
                        calcNetProfit >= 0
                          ? "text-emerald-600"
                          : "text-red-600"
                      )}
                    >
                      {formatCurrency(calcNetProfit)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" size="sm" />}>
                Cancel
              </DialogClose>
              <Button
                size="sm"
                className="bg-gradient-to-r from-[#0a192f] to-[#1d3461]"
                onClick={handleSaveTrip}
                disabled={isSavingTrip || !newOrigin || !newDestination || !newConsignment || !newMaterial || !newStartDate || !selectedTruckId || !selectedDriverId}
              >
                {isSavingTrip ? "Creating..." : "Save Trip"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: "Total Trips",
            value: tripsList.length,
            icon: Route,
            color: "text-blue-500",
          },
          {
            label: "In Transit",
            value: inTransitCount,
            icon: Truck,
            color: "text-amber-500",
          },
          {
            label: "Total Revenue",
            value: formatCurrency(totalRevenue),
            icon: IndianRupee,
            color: "text-emerald-500",
          },
          {
            label: "Net Profit",
            value: formatCurrency(totalNetProfit),
            icon: TrendingUp,
            color: "text-violet-500",
          },
        ].map((stat) => (
          <Card key={stat.label} className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-lg font-heading font-bold">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    {stat.label}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by Trip ID, route, vehicle, consignment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
        <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || "")}>
          <SelectTrigger className="h-9 text-sm w-[160px]">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Planned">Planned</SelectItem>
            <SelectItem value="In Transit">In Transit</SelectItem>
            <SelectItem value="Delivered">Delivered</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Trip Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredTrips.map((trip) => (
          <Card
            key={trip._id || trip.id}
            className="shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
            onClick={() => setSelectedTrip(trip)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground">
                      {trip.id}
                    </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px]",
                        getStatusColor(trip.tripStatus)
                      )}
                    >
                      {trip.tripStatus}
                    </Badge>
                  </div>
                  <h3 className="font-heading font-semibold text-sm mt-1">
                    {trip.origin} → {trip.destination}
                  </h3>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px]",
                    getStatusColor(trip.paymentStatus)
                  )}
                >
                  {trip.paymentStatus}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mb-3">
                <span className="flex items-center gap-1">
                  <Truck className="w-3 h-3" /> {trip.vehicleNo}
                </span>
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" /> {trip.driverName}
                </span>
                <span className="flex items-center gap-1">
                  <Package className="w-3 h-3" /> {trip.consignment}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {formatDate(trip.startDate)}
                </span>
              </div>

              <Separator className="my-2" />

              <div className="grid grid-cols-4 gap-2 text-center">
                <div>
                  <p className="text-[10px] text-muted-foreground">
                    Total Fare
                  </p>
                  <p className="text-xs font-heading font-bold">
                    {formatCurrency(trip.totalFare)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Expenses</p>
                  <p className="text-xs font-mono text-red-600">
                    {formatCurrency(trip.totalExpenses)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Pending</p>
                  <p className="text-xs font-mono text-amber-600">
                    {formatCurrency(trip.pendingBalance)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">
                    Net Profit
                  </p>
                  <p
                    className={cn(
                      "text-xs font-heading font-bold",
                      trip.netProfit >= 0
                        ? "text-emerald-600"
                        : "text-red-600"
                    )}
                  >
                    {formatCurrency(trip.netProfit)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-3 pt-2 border-t border-border/50">
                <span className="text-[10px] text-muted-foreground">
                  Docs:
                </span>
                <div className="flex items-center gap-1.5">
                  {[
                    { key: "lrCopy" as const, label: "LR" },
                    { key: "invoice" as const, label: "INV" },
                    { key: "pod" as const, label: "POD" },
                    { key: "paymentReceipt" as const, label: "RCT" },
                  ].map((doc) => (
                    <div key={doc.key} className="flex items-center gap-1">
                      {getDocDot(trip.documents?.[doc.key])}
                      <span className="text-[9px] text-muted-foreground">
                        {doc.label}
                      </span>
                    </div>
                  ))}
                </div>
                <span className="text-[10px] text-muted-foreground ml-auto">
                  ₹{trip.freightRate}/ton × {trip.quantity}T
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Trip Detail Dialog */}
      <Dialog
        open={!!selectedTrip}
        onOpenChange={() => setSelectedTrip(null)}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedTrip && (
            <>
              <DialogHeader>
                <DialogTitle className="font-heading flex items-center gap-2">
                  <Route className="w-5 h-5" /> {selectedTrip.tripId || selectedTrip.id}
                </DialogTitle>
                <DialogDescription>
                  {selectedTrip.origin} → {selectedTrip.destination} ·{" "}
                  {selectedTrip.consignment}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      getStatusColor(selectedTrip.tripStatus)
                    )}
                  >
                    {selectedTrip.tripStatus}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      getStatusColor(selectedTrip.paymentStatus)
                    )}
                  >
                    Payment: {selectedTrip.paymentStatus}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { label: "Vehicle", value: selectedTrip.vehicleNo, icon: Truck },
                    { label: "Driver", value: selectedTrip.driverName, icon: User },
                    { label: "Material", value: selectedTrip.material, icon: Package },
                    { label: "Start Date", value: formatDate(selectedTrip.startDate), icon: Clock },
                    { label: "Freight Rate", value: `₹${selectedTrip.freightRate}/ton`, icon: IndianRupee },
                    { label: "Quantity", value: `${selectedTrip.quantity} Tons`, icon: Package },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <item.icon className="w-3 h-3 text-muted-foreground" />
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                          {item.label}
                        </p>
                      </div>
                      <p className="text-sm font-medium">{item.value}</p>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="p-4 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg space-y-2">
                  <h4 className="font-heading font-semibold text-sm">
                    Profit Audit
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <p className="text-[10px] text-muted-foreground">
                        Total Fare
                      </p>
                      <p className="text-base font-heading font-bold text-emerald-600">
                        {formatCurrency(selectedTrip.totalFare)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">
                        Total Expenses
                      </p>
                      <p className="text-base font-mono text-red-600">
                        {formatCurrency(selectedTrip.totalExpenses)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">
                        Pending
                      </p>
                      <p className="text-base font-mono text-amber-600">
                        {formatCurrency(selectedTrip.pendingBalance)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">
                        Net Profit
                      </p>
                      <p
                        className={cn(
                          "text-base font-heading font-bold",
                          selectedTrip.netProfit >= 0
                            ? "text-emerald-600"
                            : "text-red-600"
                        )}
                      >
                        {formatCurrency(selectedTrip.netProfit)}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-heading font-semibold text-sm flex items-center gap-2 mb-3">
                    <Receipt className="w-4 h-4" /> Trip Expenses (
                    {(selectedTrip.expenses || []).length})
                  </h4>
                  {(!selectedTrip.expenses || selectedTrip.expenses.length === 0) ? (
                    <p className="text-xs text-muted-foreground text-center py-4 bg-muted/30 rounded-lg">
                      No expenses recorded for this trip.
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      {selectedTrip.expenses.map((exp: any) => (
                        <div
                          key={exp._id || exp.id}
                          className="flex items-center justify-between p-2.5 bg-muted/30 rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-[10px]">
                              {exp.category}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {exp.description}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-mono font-medium text-red-600">
                              {formatCurrency(exp.amount)}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {formatDate(exp.date)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                <div>
                  <h4 className="font-heading font-semibold text-sm flex items-center gap-2 mb-3">
                    <FileText className="w-4 h-4" /> Document Vault
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      { label: "LR Copy", key: "lrCopy" as const },
                      { label: "Invoice", key: "invoice" as const },
                      { label: "POD", key: "pod" as const },
                      {
                        label: "Payment Receipt",
                        key: "paymentReceipt" as const,
                      },
                    ].map((doc) => (
                      <div
                        key={doc.key}
                        className={cn(
                          "p-3 rounded-lg border-2 border-dashed text-center",
                          selectedTrip.documents?.[doc.key]
                            ? "border-emerald-300 bg-emerald-50"
                            : "border-gray-200 bg-gray-50"
                        )}
                      >
                        {selectedTrip.documents?.[doc.key] ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                        )}
                        <p className="text-xs font-medium">{doc.label}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {selectedTrip.documents?.[doc.key]
                            ? "Uploaded"
                            : "Not uploaded"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

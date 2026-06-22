"use client";

import { useState, useEffect } from "react";
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
  CheckCircle2,
  AlertCircle,
  Receipt,
  X,
  Edit,
  ArrowRight,
} from "lucide-react";
import { cn, formatCurrency, formatDate, getStatusColor } from "@/lib/utils";

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

  const [editingTrip, setEditingTrip] = useState<any | null>(null);
  const [newTripStatus, setNewTripStatus] = useState("Planned");
  const [monthFilter, setMonthFilter] = useState("all");

  const formatMonthYear = (monthStr: string) => {
    const [year, month] = monthStr.split("-");
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleString("default", { month: "short", year: "2-digit" });
  };

  const handleStartEditTrip = (trip: any) => {
    setNewOrigin(trip.origin || "");
    setNewDestination(trip.destination || "");
    setNewConsignment(trip.consignment || "");
    setNewMaterial(trip.material || "");
    setNewStartDate(trip.startDate ? trip.startDate.split('T')[0] : "");
    setSelectedTruckId(trip.truckId || "");
    setSelectedDriverId(trip.driverId || "");
    setFreightRate((trip.freightRate || 0).toString());
    setQuantity((trip.quantity || 0).toString());
    setAdvance((trip.advance || 0).toString());
    setNewExpenses(trip.expenses || []);
    setNewTripStatus(trip.tripStatus || "Planned");
    setEditingTrip(trip);
    setSelectedTrip(null);
    setIsCreateDialogOpen(true);
  };

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

    try {
      setIsSavingTrip(true);
      const isEdit = !!editingTrip;
      const payload = {
        origin: newOrigin || "",
        destination: newDestination || "",
        consignment: newConsignment || "",
        material: newMaterial || "",
        startDate: newStartDate || "",
        truckId: truckObj?._id || "",
        vehicleNo: truckObj?.vehicleNo || "Unassigned",
        driverId: driverObj?._id || "",
        driverName: driverObj?.name || "Unassigned",
        freightRate: Number(freightRate) || 0,
        quantity: Number(quantity) || 0,
        advance: Number(advance) || 0,
        expenses: newExpenses.map(e => ({
          category: e.category,
          amount: Number(e.amount) || 0,
          description: e.description || "",
          date: newStartDate || "",
        })),
        tripStatus: isEdit ? newTripStatus : "Planned"
      };

      const res = await fetch(isEdit ? `/api/trips/${editingTrip._id}` : "/api/trips", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const savedTrip = await res.json();
        if (isEdit) {
          setTripsList(prev => prev.map(t => t._id === savedTrip._id ? savedTrip : t));
        } else {
          setTripsList(prev => [savedTrip, ...prev]);
        }
        
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
        setNewTripStatus("Planned");
        setEditingTrip(null);
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
      (trip.origin || "").toLowerCase().includes(search.toLowerCase()) ||
      (trip.destination || "").toLowerCase().includes(search.toLowerCase()) ||
      (trip.vehicleNo || "").toLowerCase().includes(search.toLowerCase()) ||
      (trip.consignment || "").toLowerCase().includes(search.toLowerCase());
    
    // Status Filter Chip mapping
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "Ongoing" && trip.tripStatus === "In Transit") ||
      (statusFilter === "Completed" && (trip.tripStatus === "Completed" || trip.tripStatus === "Delivered")) ||
      (statusFilter === "Planned" && trip.tripStatus === "Planned");
    
    let matchesMonth = true;
    if (monthFilter !== "all" && trip.startDate) {
      const tripMonth = trip.startDate.substring(0, 7); // "YYYY-MM"
      matchesMonth = tripMonth === monthFilter;
    }

    return matchesSearch && matchesStatus && matchesMonth;
  });

  const totalRevenue = tripsList.reduce((sum, t) => sum + (t.totalFare || 0), 0);
  const totalNetProfit = tripsList.reduce((sum, t) => sum + (t.netProfit || 0), 0);
  const totalPendingAmount = tripsList.reduce((sum, t) => sum + (t.pendingBalance || 0), 0);
  const totalReceivedFund = totalNetProfit - totalPendingAmount;
  const inTransitCount = tripsList.filter(
    (t) => t.tripStatus === "In Transit"
  ).length;

  const uniqueMonths = Array.from(
    new Set(
      tripsList
        .filter((t) => t.startDate)
        .map((t) => t.startDate.substring(0, 7))
    )
  ).sort().reverse();

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
        <span className="w-6 h-6 rounded-full border-2 border-[#0B1F4D] border-t-transparent animate-spin" />
        <p className="text-sm text-slate-500 font-heading">Loading logistics data...</p>
      </div>
    );
  }

  // Filter chips options
  const statusChips = [
    { key: "all", label: "All Dispatches" },
    { key: "Planned", label: "Planned" },
    { key: "Ongoing", label: "Ongoing" },
    { key: "Completed", label: "Completed" },
  ];

  return (
    <div className="space-y-6 relative pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl md:text-3xl font-black text-[#0B1F4D]">
            Trip Dispatch
          </h2>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Dispatch, route logistics, and freight profitability logs
          </p>
        </div>
      </div>

      {/* Top Summaries (horizontal) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: formatCurrency(totalRevenue), color: "text-[#0B1F4D]" },
          { label: "Net Profit", value: formatCurrency(totalNetProfit), color: "text-[#2E9E44]" },
          { label: "Outstanding Fund", value: formatCurrency(totalPendingAmount), color: "text-[#F59E0B]" },
          { label: "Received Fund", value: formatCurrency(totalReceivedFund), color: "text-[#2E9E44]" },
        ].map((item) => (
          <Card key={item.label} className="border border-[#E5E7EB] rounded-[20px] bg-white shadow-sm ring-0">
            <CardContent className="p-4 flex flex-col justify-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</span>
              <span className={cn("text-lg md:text-xl font-heading font-black tracking-tight mt-1", item.color)}>
                {item.value}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search & Status Filters */}
      <div className="space-y-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by Trip ID, route, vehicle number, customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-11 text-sm bg-white border-[#E5E7EB] rounded-[12px] shadow-sm text-[#0B1F4D] placeholder-slate-400"
          />
        </div>

        {/* Filter chips bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {/* Status chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {statusChips.map((chip) => (
              <Button
                key={chip.key}
                onClick={() => setStatusFilter(chip.key)}
                className={cn(
                  "h-9 px-4 rounded-full text-xs font-bold transition-all duration-200 shrink-0",
                  statusFilter === chip.key
                    ? "bg-[#0B1F4D] text-white hover:bg-[#0B1F4D]/90"
                    : "border border-[#E5E7EB] text-slate-400 hover:text-[#0B1F4D] hover:bg-slate-50 bg-white"
                )}
              >
                {chip.label}
              </Button>
            ))}
          </div>

          {/* Month scroller chips replaces the old dropdown select */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none max-w-full md:max-w-[450px]">
            <Button
              onClick={() => setMonthFilter("all")}
              className={cn(
                "h-9 px-4 rounded-full text-xs font-bold transition-all duration-200 shrink-0",
                monthFilter === "all"
                  ? "bg-[#0B1F4D] text-white hover:bg-[#0B1F4D]/90"
                  : "border border-[#E5E7EB] text-slate-400 hover:text-[#0B1F4D] hover:bg-slate-50 bg-white"
              )}
            >
              All Months
            </Button>
            {uniqueMonths.map((m) => (
              <Button
                key={m}
                onClick={() => setMonthFilter(m)}
                className={cn(
                  "h-9 px-4 rounded-full text-xs font-bold transition-all duration-200 shrink-0",
                  monthFilter === m
                    ? "bg-[#0B1F4D] text-white hover:bg-[#0B1F4D]/90"
                    : "border border-[#E5E7EB] text-slate-400 hover:text-[#0B1F4D] hover:bg-slate-50 bg-white"
                )}
              >
                {formatMonthYear(m)}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Cards list separated by 24px space */}
      <div className="space-y-6 pt-2">
        {filteredTrips.length === 0 ? (
          <Card className="border border-[#E5E7EB] rounded-[20px] bg-white py-12 text-center shadow-sm">
            <CardContent className="space-y-3">
              <AlertCircle className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-500">No active dispatches found matching filters</p>
            </CardContent>
          </Card>
        ) : (
          filteredTrips.map((trip) => {
            // Extract Diesel (Fuel) expense
            const dieselCost = (trip.expenses || [])
              .filter((e: any) => e.category === "Fuel")
              .reduce((sum: number, e: any) => sum + (Number(e.amount) || 0), 0);

            return (
              <Card
                key={trip._id || trip.id}
                className="border border-[#E5E7EB] rounded-[20px] shadow-sm hover:shadow-md transition-all duration-300 bg-white overflow-hidden group cursor-pointer ring-0"
                onClick={() => setSelectedTrip(trip)}
              >
                <CardContent className="p-6 space-y-4">
                  {/* Status, Truck & Customer Row */}
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-400">
                          {trip.tripId || trip.id}
                        </span>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[8px] font-bold rounded-full py-0.5 px-2",
                            getStatusColor(trip.tripStatus)
                          )}
                        >
                          {trip.tripStatus}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[8px] font-bold rounded-full py-0.5 px-2",
                            getStatusColor(trip.paymentStatus)
                          )}
                        >
                          {trip.paymentStatus}
                        </Badge>
                      </div>
                      <h3 className="font-heading font-black text-lg text-[#0B1F4D] tracking-tight mt-1 flex items-center gap-2">
                        <Truck className="w-4 h-4 text-slate-500" /> {trip.vehicleNo || "Unassigned"}
                      </h3>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Customer</p>
                      <p className="text-sm font-bold text-[#0B1F4D]">{trip.consignment || "N/A"}</p>
                    </div>
                  </div>

                  <Separator className="bg-slate-100" />

                  {/* Route & Driver Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    {/* Origin to Destination */}
                    <div className="flex items-center gap-3">
                      <div className="bg-[#0B1F4D]/5 p-2 rounded-lg">
                        <Route className="w-4 h-4 text-[#0B1F4D]" />
                      </div>
                      <div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase">Route</div>
                        <div className="text-xs font-semibold text-[#0B1F4D] flex items-center gap-1.5 mt-0.5">
                          <span>{trip.origin || "N/A"}</span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                          <span>{trip.destination || "N/A"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Driver */}
                    <div className="flex items-center gap-3">
                      <div className="bg-[#0B1F4D]/5 p-2 rounded-lg">
                        <User className="w-4 h-4 text-[#0B1F4D]" />
                      </div>
                      <div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase">Driver</div>
                        <div className="text-xs font-semibold text-[#0B1F4D] mt-0.5">{trip.driverName || "Unassigned"}</div>
                      </div>
                    </div>

                    {/* Trip Date */}
                    <div className="flex items-center gap-3">
                      <div className="bg-[#0B1F4D]/5 p-2 rounded-lg">
                        <Clock className="w-4 h-4 text-[#0B1F4D]" />
                      </div>
                      <div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase">Dispatch Date</div>
                        <div className="text-xs font-semibold text-[#0B1F4D] mt-0.5">{formatDate(trip.startDate)}</div>
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-slate-100" />

                  {/* Pricing Financial Details */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 text-center bg-slate-50 p-4 rounded-xl">
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Total Fare</p>
                      <p className="text-xs font-bold text-[#0B1F4D] mt-0.5">{formatCurrency(trip.totalFare || 0)}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Advance</p>
                      <p className="text-xs font-mono font-bold text-emerald-600 mt-0.5">{formatCurrency(trip.advance || 0)}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Pending</p>
                      <p className="text-xs font-mono font-bold text-[#F59E0B] mt-0.5">{formatCurrency(trip.pendingBalance || 0)}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Diesel Exp</p>
                      <p className="text-xs font-mono font-bold text-rose-500 mt-0.5">{formatCurrency(dieselCost)}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Total Exp</p>
                      <p className="text-xs font-mono font-bold text-[#EF4444] mt-0.5">{formatCurrency(trip.totalExpenses || 0)}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Net Profit</p>
                      <p className={cn(
                        "text-xs font-heading font-black mt-0.5",
                        (trip.netProfit || 0) >= 0 ? "text-[#2E9E44]" : "text-rose-600"
                      )}>
                        {formatCurrency(trip.netProfit || 0)}
                      </p>
                    </div>
                  </div>

                  {/* Actions summary footer */}
                  <div className="flex items-center justify-between pt-2">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">
                      Load Audit: {trip.quantity || 0} Tons @ ₹{trip.freightRate || 0}/Ton
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 hover:bg-slate-100 text-[#0B1F4D] text-xs font-bold gap-1 rounded-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartEditTrip(trip);
                      }}
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit Dispatch
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Floating Create Trip FAB (bottom right) */}
      <Dialog 
        open={isCreateDialogOpen} 
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) {
            setEditingTrip(null);
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
            setNewTripStatus("Planned");
          }
        }}
      >
        <DialogTrigger
          render={
            <Button
              className="fixed bottom-24 right-6 z-40 bg-[#0B1F4D] text-white hover:bg-[#0B1F4D]/90 h-14 w-14 rounded-full shadow-xl shadow-[#0B1F4D]/35 flex items-center justify-center scale-100 hover:scale-105 active:scale-95 transition-all"
              onClick={() => {
                setEditingTrip(null);
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
                setNewTripStatus("Planned");
              }}
            />
          }
        >
          <Plus className="w-6 h-6 text-white" />
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-[20px] bg-white border border-[#E5E7EB] text-[#0B1F4D]">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg font-black text-[#0B1F4D]">
              {editingTrip ? "Edit Trip Dispatch" : "Create New Dispatch"}
            </DialogTitle>
            <DialogDescription className="text-slate-400 font-medium">
              Configure dispatch details, freight rates, asset assignments, and advance payments.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <Label className="text-xs font-bold text-[#0B1F4D]">Origin Route</Label>
                  <Input
                    placeholder="e.g. Jamshedpur"
                    className="mt-1 h-11 text-sm bg-white border-[#E5E7EB] rounded-[10px] text-[#0B1F4D] placeholder-slate-400"
                    value={newOrigin}
                    onChange={(e) => setNewOrigin(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold text-[#0B1F4D]">Destination Route</Label>
                  <Input
                    placeholder="e.g. Kolkata"
                    className="mt-1 h-11 text-sm bg-white border-[#E5E7EB] rounded-[10px] text-[#0B1F4D] placeholder-slate-400"
                    value={newDestination}
                    onChange={(e) => setNewDestination(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold text-[#0B1F4D]">Customer (Consignment)</Label>
                  <Input
                    placeholder="e.g. Tata Steel Ltd."
                    className="mt-1 h-11 text-sm bg-white border-[#E5E7EB] rounded-[10px] text-[#0B1F4D] placeholder-slate-400"
                    value={newConsignment}
                    onChange={(e) => setNewConsignment(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold text-[#0B1F4D]">Material Description</Label>
                  <Input
                    placeholder="e.g. HR Coils"
                    className="mt-1 h-11 text-sm bg-white border-[#E5E7EB] rounded-[10px] text-[#0B1F4D] placeholder-slate-400"
                    value={newMaterial}
                    onChange={(e) => setNewMaterial(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold text-[#0B1F4D]">Start Date</Label>
                  <Input
                    type="date"
                    className="mt-1 h-11 text-sm bg-white border-[#E5E7EB] rounded-[10px] text-[#0B1F4D]"
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                  />
                </div>
                {editingTrip && (
                  <div>
                    <Label className="text-xs font-bold text-[#0B1F4D]">Trip Status</Label>
                    <Select value={newTripStatus} onValueChange={(val) => setNewTripStatus(val || "")}>
                      <SelectTrigger className="mt-1 h-11 text-sm bg-white border-[#E5E7EB] rounded-[10px]">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Planned">Planned</SelectItem>
                        <SelectItem value="In Transit">In Transit</SelectItem>
                        <SelectItem value="Delivered">Delivered</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-xs font-bold text-[#0B1F4D]">Select Vehicle</Label>
                  <Select value={selectedTruckId} onValueChange={(val) => setSelectedTruckId(val || "")}>
                    <SelectTrigger className="mt-1 h-11 text-sm bg-white border-[#E5E7EB] rounded-[10px]">
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
                  <Label className="text-xs font-bold text-[#0B1F4D]">Select Driver</Label>
                  <Select value={selectedDriverId} onValueChange={(val) => setSelectedDriverId(val || "")}>
                    <SelectTrigger className="mt-1 h-11 text-sm bg-white border-[#E5E7EB] rounded-[10px]">
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
                    <Label className="text-xs font-bold text-[#0B1F4D]">Freight (₹/Ton)</Label>
                    <Input
                      type="number"
                      placeholder="3200"
                      value={freightRate}
                      onChange={(e) => setFreightRate(e.target.value)}
                      className="mt-1 h-11 text-sm bg-white border-[#E5E7EB] rounded-[10px] text-[#0B1F4D] placeholder-slate-400"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-bold text-[#0B1F4D]">Weight (Tons)</Label>
                    <Input
                      type="number"
                      placeholder="32"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="mt-1 h-11 text-sm bg-white border-[#E5E7EB] rounded-[10px] text-[#0B1F4D] placeholder-slate-400"
                    />
                  </div>
                </div>
                
                {/* Math Calculations Display */}
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-500">Gross Freight</span>
                    <span className="text-[#2E9E44]">
                      {formatCurrency(calcTotalFare)}
                    </span>
                  </div>
                  <Separator />
                  <div>
                    <Label className="text-[10px] font-bold text-[#0B1F4D]">Advance Payment Paid</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={advance}
                      onChange={(e) => setAdvance(e.target.value)}
                      className="mt-1 h-10 text-sm bg-white border-[#E5E7EB] rounded-[8px] text-[#0B1F4D] placeholder-slate-400"
                    />
                  </div>
                  <div className="flex justify-between font-semibold pt-1">
                    <span className="text-slate-500">Pending Amount</span>
                    <span className="text-[#F59E0B]">
                      {formatCurrency(Math.max(0, calcPending))}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="bg-slate-100" />

            {/* Embedded Expenses Log */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-heading font-bold text-sm flex items-center gap-2 text-[#0B1F4D]">
                  <Receipt className="w-4 h-4 text-slate-500" /> Dispatch Expenses
                </h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addExpenseRow}
                  className="text-xs h-8 border-[#E5E7EB] text-[#0B1F4D] rounded-lg bg-white"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Expense
                </Button>
              </div>

              {newExpenses.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4 bg-slate-50 rounded-xl font-medium">No expenses mapped yet.</p>
              ) : (
                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
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
                        <SelectTrigger className="h-9 text-xs w-[130px] bg-white border-[#E5E7EB] rounded-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {["Fuel", "Toll", "Driver Advance", "Loading", "Unloading", "Repair", "RTO", "Other"].map((c) => (
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
                        className="h-9 text-xs w-[100px] bg-white border-[#E5E7EB] rounded-lg text-[#0B1F4D]"
                      />
                      <Input
                        placeholder="Note"
                        value={exp.description}
                        onChange={(e) => {
                          const updated = [...newExpenses];
                          updated[idx].description = e.target.value;
                          setNewExpenses(updated);
                        }}
                        className="h-9 text-xs flex-1 bg-white border-[#E5E7EB] rounded-lg text-[#0B1F4D]"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeExpenseRow(idx)}
                        className="h-9 w-9 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-3 p-3 bg-gradient-to-r from-emerald-50 to-[#0B1F4D]/5 rounded-xl flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-500">Expenses: <span className="text-[#EF4444] font-mono">{formatCurrency(calcExpensesTotal)}</span></span>
                <span className="text-slate-500">Net Profit: <span className={cn("font-heading font-black", calcNetProfit >= 0 ? "text-[#2E9E44]" : "text-rose-600")}>{formatCurrency(calcNetProfit)}</span></span>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <DialogClose render={<Button variant="outline" className="h-11 px-6 rounded-lg text-[#0B1F4D] border-[#E5E7EB]" />}>
              Cancel
            </DialogClose>
            <Button
              className="h-11 px-6 rounded-lg bg-[#0B1F4D] text-white hover:bg-[#0B1F4D]/90 font-bold"
              onClick={handleSaveTrip}
              disabled={isSavingTrip}
            >
              {isSavingTrip ? "Saving..." : (editingTrip ? "Update Dispatch" : "Confirm Dispatch")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Trip Details Dialog Drawer */}
      <Dialog open={!!selectedTrip} onOpenChange={() => setSelectedTrip(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-[20px] bg-white border border-[#E5E7EB] text-[#0B1F4D]">
          {selectedTrip && (
            <>
              <DialogHeader>
                <DialogTitle className="font-heading text-lg font-black text-[#0B1F4D] flex items-center gap-2">
                  <Route className="w-5 h-5 text-[#0B1F4D]" /> Dispatch {selectedTrip.tripId || selectedTrip.id}
                </DialogTitle>
                <DialogDescription className="text-slate-400 font-medium">
                  Route: {selectedTrip.origin} → {selectedTrip.destination}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={cn("text-[8px] font-bold rounded-full py-0.5 px-2", getStatusColor(selectedTrip.tripStatus))}>
                      {selectedTrip.tripStatus}
                    </Badge>
                    <Badge variant="outline" className={cn("text-[8px] font-bold rounded-full py-0.5 px-2", getStatusColor(selectedTrip.paymentStatus))}>
                      Payment: {selectedTrip.paymentStatus}
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    className="h-9 px-4 text-xs font-bold gap-1 border-[#E5E7EB] text-[#0B1F4D] rounded-lg"
                    onClick={() => handleStartEditTrip(selectedTrip)}
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit Details
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { label: "Vehicle Number", value: selectedTrip.vehicleNo || "N/A", icon: Truck },
                    { label: "Assignee Driver", value: selectedTrip.driverName || "N/A", icon: User },
                    { label: "Material Load", value: selectedTrip.material || "N/A", icon: Package },
                    { label: "Customer Name", value: selectedTrip.consignment || "N/A", icon: Package },
                    { label: "Dispatch Date", value: formatDate(selectedTrip.startDate), icon: Clock },
                    { label: "Freight Cargo Billing", value: `₹${selectedTrip.freightRate || 0}/ton × ${selectedTrip.quantity || 0} tons`, icon: IndianRupee },
                  ].map((item) => (
                    <div key={item.label} className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <div className="flex items-center gap-1.5 mb-1">
                        <item.icon className="w-3.5 h-3.5 text-slate-400" />
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</p>
                      </div>
                      <p className="text-xs font-bold text-[#0B1F4D]">{item.value}</p>
                    </div>
                  ))}
                </div>

                <Separator className="bg-slate-100" />

                {/* Audit summary */}
                <div className="p-4 bg-gradient-to-r from-emerald-50 to-[#0B1F4D]/5 border border-slate-100 rounded-xl space-y-3">
                  <h4 className="font-heading font-black text-sm text-[#0B1F4D]">Freight Profit Audit</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Gross Fare</p>
                      <p className="text-sm font-bold text-[#0B1F4D]">{formatCurrency(selectedTrip.totalFare || 0)}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Ledger Expenses</p>
                      <p className="text-sm font-mono font-bold text-[#EF4444]">{formatCurrency(selectedTrip.totalExpenses || 0)}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Pending Receivable</p>
                      <p className="text-sm font-mono font-bold text-[#F59E0B]">{formatCurrency(selectedTrip.pendingBalance || 0)}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Net Profit</p>
                      <p className={cn("text-sm font-heading font-black", (selectedTrip.netProfit || 0) >= 0 ? "text-[#2E9E44]" : "text-rose-600")}>
                        {formatCurrency(selectedTrip.netProfit || 0)}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator className="bg-slate-100" />

                {/* Expense List */}
                <div>
                  <h4 className="font-heading font-bold text-sm flex items-center gap-2 mb-3 text-[#0B1F4D]">
                    <Receipt className="w-4 h-4 text-slate-500" /> Itemized Expense Log ({(selectedTrip.expenses || []).length})
                  </h4>
                  {(!selectedTrip.expenses || selectedTrip.expenses.length === 0) ? (
                    <p className="text-xs text-slate-400 text-center py-4 bg-slate-50 rounded-xl font-medium">No expenses logged for this dispatch.</p>
                  ) : (
                    <div className="space-y-2 max-h-[180px] overflow-y-auto">
                      {selectedTrip.expenses.map((exp: any, i: number) => (
                        <div key={i} className="flex justify-between items-center p-3 bg-slate-50 hover:bg-slate-100/70 border border-slate-100 rounded-lg text-xs font-semibold">
                          <div className="space-y-0.5">
                            <p className="text-[#0B1F4D]">{exp.category} <span className="text-[10px] text-slate-400 font-normal">({exp.description || "no description"})</span></p>
                            <p className="text-[9px] text-slate-400 font-normal">{exp.date ? formatDate(exp.date) : "N/A"}</p>
                          </div>
                          <span className="font-mono text-rose-600 font-bold">{formatCurrency(exp.amount || 0)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

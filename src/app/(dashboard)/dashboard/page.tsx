"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  TrendingUp,
  Truck,
  Route,
  ArrowDownRight,
  Sparkles,
  IndianRupee,
  AlertCircle,
  Clock,
  CheckCircle2,
  BarChart3,
  Loader2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatCurrency, cn, getStatusColor } from "@/lib/utils";

interface DashboardStats {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  activeTrucks: number;
  totalTrucks: number;
  ongoingTrips: number;
  outstandingCollection: number;
  monthlyPerformance: { month: string; income: number; expenses: number }[];
  tripStatusCounts: { completed: number; inTransit: number; planned: number; delivered: number };
  recentTrips: any[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const [isOutstandingOpen, setIsOutstandingOpen] = useState(false);
  const [pendingTrips, setPendingTrips] = useState<any[]>([]);
  const [loadingPending, setLoadingPending] = useState(false);

  const fetchPendingTrips = async () => {
    try {
      setLoadingPending(true);
      const res = await fetch("/api/trips");
      if (res.ok) {
        const trips = await res.json();
        const pending = trips.filter((t: any) => (t.pendingBalance || 0) > 0);
        setPendingTrips(pending);
      }
    } catch (error) {
      console.error("Failed to fetch pending trips:", error);
    } finally {
      setLoadingPending(false);
    }
  };

  const handleOpenOutstanding = () => {
    setIsOutstandingOpen(true);
    fetchPendingTrips();
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateInsight = () => {
    if (!stats) return;
    setAiLoading(true);
    setTimeout(() => {
      setAiInsight(
        `📊 Veltrix AI analysis indicates fleet margins are stable at ${stats.totalRevenue > 0 ? ((stats.netProfit / stats.totalRevenue) * 100).toFixed(1) : 0}%. High-priority collect target remains ${formatCurrency(stats.outstandingCollection)} pending balance. We recommend reviewing the outstanding timeline to avoid cash flow locks.`
      );
      setAiLoading(false);
    }, 1500);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 sm:h-28 rounded-[16px] sm:rounded-[20px]" />)}
        </div>
        <Skeleton className="h-32 rounded-[20px]" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-[350px] rounded-[20px]" />
          <div className="space-y-6">
            <Skeleton className="h-40 rounded-[20px]" />
            <Skeleton className="h-44 rounded-[20px]" />
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <AlertCircle className="w-12 h-12 text-[#F59E0B]" />
        <h2 className="font-heading text-xl font-bold text-[#0B1F4D]">Connection Outage</h2>
        <p className="text-sm text-slate-500">Seed the database to initialize mock tables.</p>
        <Button onClick={async () => {
          const res = await fetch("/api/seed", { method: "POST" });
          if (res.ok) {
            window.location.reload();
          }
        }} className="h-[52px] rounded-[14px] bg-[#0B1F4D] text-white hover:bg-[#0B1F4D]/90 px-6 font-bold shadow-lg shadow-[#0B1F4D]/15">
          Seed Database Schema
        </Button>
      </div>
    );
  }

  // Horizontal KPI metrics with icons inside colored circles
  const kpiCards = [
    {
      title: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      subtitle: "Gross billing flow",
      icon: IndianRupee,
      circleBg: "bg-emerald-500/10 text-emerald-600",
    },
    {
      title: "Net Profit",
      value: formatCurrency(stats.netProfit),
      subtitle: `${stats.totalRevenue > 0 ? ((stats.netProfit / stats.totalRevenue) * 100).toFixed(0) : 0}% margin`,
      icon: TrendingUp,
      circleBg: "bg-emerald-500/10 text-emerald-600",
    },
    {
      title: "Active Fleet",
      value: `${stats.activeTrucks}/${stats.totalTrucks}`,
      subtitle: "Truck capacity live",
      icon: Truck,
      circleBg: "bg-[#0B1F4D]/10 text-[#0B1F4D]",
    },
    {
      title: "Ongoing Trips",
      value: stats.ongoingTrips.toString(),
      subtitle: "Dispatched in transit",
      icon: Route,
      circleBg: "bg-[#F59E0B]/10 text-[#F59E0B]",
    },
  ];

  // Map monthly performance data for Income vs Expenses vs Profit
  const performanceData = stats.monthlyPerformance.map(item => ({
    ...item,
    profit: Math.max(0, item.income - item.expenses)
  }));

  return (
    <div className="space-y-8 pb-10">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl md:text-3xl font-black text-[#0B1F4D]">Command Center</h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">Enterprise logistics analytics & audit workspace</p>
        </div>
        <span className="text-xs font-semibold text-slate-400 hidden sm:inline-block">
          {new Date().toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}
        </span>
      </div>

      {/* Section 1: Four horizontal KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {kpiCards.map((kpi) => (
          <Card key={kpi.title} className="border border-[#E5E7EB] rounded-[16px] sm:rounded-[20px] shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300 ring-0 bg-white">
            <CardContent className="p-3.5 sm:p-5 flex items-center justify-between gap-2 sm:gap-4">
              <div className="space-y-0.5 sm:space-y-1 min-w-0">
                <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">{kpi.title}</p>
                <p className="text-base sm:text-xl md:text-2xl font-heading font-black tracking-tight text-[#0B1F4D] truncate">{kpi.value}</p>
                <p className="text-[9px] sm:text-[11px] text-slate-400 font-medium truncate">{kpi.subtitle}</p>
              </div>
              <div className={cn("w-9 h-9 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0 shadow-sm", kpi.circleBg)}>
                <kpi.icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Section 2: Outstanding Collection Banner */}
      <Card 
        className="border-0 shadow-lg bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white rounded-[20px] p-6 hover:shadow-xl hover:scale-[1.01] transition-all duration-300 cursor-pointer group ring-0"
        onClick={handleOpenOutstanding}
      >
        <CardContent className="p-0 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wider text-amber-100 font-bold">Outstanding Collection</p>
            <p className="text-4xl md:text-5xl font-heading font-black tracking-tight">{formatCurrency(stats.outstandingCollection)}</p>
            <p className="text-sm text-amber-50 font-medium">Pending dispatch balances across live transport accounts</p>
          </div>
          <Button 
            className="h-[52px] px-8 bg-white text-[#0B1F4D] hover:bg-amber-50 font-black rounded-[14px] shadow-lg shadow-black/10 group-hover:scale-105 transition-transform shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenOutstanding();
            }}
          >
            Review Unpaid Trips
          </Button>
        </CardContent>
      </Card>

      {/* Grid containing Estimator, Charts and Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Section 3: Smart Profit Estimator */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-[#E5E7EB] rounded-[20px] bg-white p-6 shadow-sm overflow-hidden relative ring-0">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#0B1F4D]/5 rounded-full blur-3xl pointer-events-none" />
            <CardContent className="p-0 flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="space-y-4 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-ping" />
                  <Badge className="bg-[#0B1F4D]/10 text-[#0B1F4D] hover:bg-[#0B1F4D]/10 text-[10px] font-bold rounded-full">AI Powered</Badge>
                </div>
                <h3 className="font-heading text-xl font-bold text-[#0B1F4D]">Smart Profit Estimator</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Forecast net earnings and review collect alerts using automated 30-day analytics models.
                </p>
                {aiInsight && (
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-[14px] text-xs text-[#0B1F4D] font-medium leading-relaxed shadow-sm">
                    {aiInsight}
                  </div>
                )}
                <Button 
                  onClick={generateInsight} 
                  disabled={aiLoading} 
                  className="h-[52px] bg-[#0B1F4D] text-white hover:bg-[#0B1F4D]/90 px-8 rounded-[14px] shadow-lg shadow-[#0B1F4D]/25 font-black shrink-0"
                >
                  {aiLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</> : "Run Insights Audit"}
                </Button>
              </div>
              
              {/* Illustration Area */}
              <div className="w-full lg:w-56 h-40 rounded-[14px] bg-[#0B1F4D]/5 border border-dashed border-[#0B1F4D]/20 flex flex-col items-center justify-center p-4 text-center shrink-0">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md mb-2">
                  <Sparkles className="w-5 h-5 text-[#F59E0B]" />
                </div>
                <p className="text-xs font-semibold text-[#0B1F4D]">System Estimator</p>
                <p className="text-[10px] text-slate-400 mt-1">Status: Operational</p>
              </div>
            </CardContent>
          </Card>

          {/* Section 4: Monthly Performance Chart */}
          <Card className="border border-[#E5E7EB] rounded-[20px] bg-white p-6 shadow-sm ring-0">
            <CardHeader className="pb-4 px-0 pt-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-heading text-lg font-bold text-[#0B1F4D]">Monthly Performance</CardTitle>
                  <CardDescription className="text-xs font-medium text-slate-400">Income vs Expenses vs Profit</CardDescription>
                </div>
                <BarChart3 className="w-5 h-5 text-slate-400" />
              </div>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performanceData} barGap={4} barSize={12}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value: any) => [formatCurrency(Number(value || 0))]} contentStyle={{ borderRadius: "14px", border: "1px solid #e5e7eb", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", fontSize: "11px" }} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                    <Bar dataKey="income" fill="#2E9E44" radius={[4, 4, 0, 0]} name="Income" />
                    <Bar dataKey="expenses" fill="#EF4444" radius={[4, 4, 0, 0]} name="Expenses" />
                    <Bar dataKey="profit" fill="#0B1F4D" radius={[4, 4, 0, 0]} name="Net Profit" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Section 5: Live Activity Feed (Timeline design) */}
        <div className="space-y-6">
          <Card className="border border-[#E5E7EB] rounded-[20px] shadow-sm bg-white p-6 ring-0 flex flex-col h-full">
            <CardHeader className="pb-4 px-0 pt-0">
              <CardTitle className="font-heading text-lg font-bold text-[#0B1F4D] flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#0B1F4D]" /> Live Activity Feed
              </CardTitle>
              <CardDescription className="text-xs font-medium text-slate-400">Timeline of recent dispatches</CardDescription>
            </CardHeader>
            <CardContent className="px-0 flex-1">
              {stats.recentTrips.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No recent dispatches logged</p>
              ) : (
                <div className="relative border-l-2 border-[#E5E7EB] ml-4 pl-6 space-y-6">
                  {stats.recentTrips.map((trip: any) => {
                    const statusColor = trip.tripStatus === "Completed" || trip.tripStatus === "Delivered"
                      ? "bg-[#2E9E44]"
                      : trip.tripStatus === "In Transit"
                      ? "bg-[#0B1F4D]"
                      : "bg-[#F59E0B]";
                    return (
                      <div key={trip.tripId || trip._id} className="relative group">
                        <span className={cn("absolute -left-[31px] top-1 flex items-center justify-center w-6 h-6 rounded-full text-white shadow-md border-2 border-white", statusColor)}>
                          <Truck className="w-3 h-3 text-white" />
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-500">{trip.tripId}</span>
                            <Badge variant="outline" className={cn("text-[8px] font-bold rounded-full py-0.5 px-2", getStatusColor(trip.tripStatus))}>
                              {trip.tripStatus}
                            </Badge>
                            <span className="text-[10px] text-slate-400 ml-auto font-medium">
                              {trip.startDate ? new Date(trip.startDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "N/A"}
                            </span>
                          </div>
                          <p className="text-xs font-bold mt-1 text-[#0B1F4D]">
                            {(trip.origin || "N/A")} → {(trip.destination || "N/A")}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                            Vehicle: {trip.vehicleNo || "Unassigned"} · Driver: {trip.driverName || "Unassigned"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Outstanding Collections Modal */}
      <Dialog open={isOutstandingOpen} onOpenChange={setIsOutstandingOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white border border-[#E5E7EB] text-[#0B1F4D] rounded-[20px]">
          <DialogHeader>
            <DialogTitle className="font-heading flex items-center gap-2 text-[#0B1F4D] text-lg font-black">
              <AlertCircle className="w-5 h-5 text-[#F59E0B]" /> Outstanding Accounts
            </DialogTitle>
            <DialogDescription className="text-slate-400 font-medium">
              List of active transport balances pending collection.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            {loadingPending ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-[#F59E0B]" />
                <p className="text-xs text-slate-400 font-medium">Querying ledger...</p>
              </div>
            ) : pendingTrips.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6 font-medium">All billing balances are fully cleared!</p>
            ) : (
              <div className="overflow-x-auto border border-[#E5E7EB] rounded-[14px]">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[#E5E7EB] bg-slate-50 text-slate-400 uppercase tracking-wider text-[9px] font-bold">
                      <th className="text-left py-2.5 px-3">Trip ID</th>
                      <th className="text-left py-2.5 px-3">Route / Customer</th>
                      <th className="text-left py-2.5 px-3">Vehicle</th>
                      <th className="text-right py-2.5 px-3">Total Fare</th>
                      <th className="text-right py-2.5 px-3">Outstanding</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingTrips.map((trip) => (
                      <tr key={trip._id || trip.id} className="border-b border-[#E5E7EB] hover:bg-slate-50 transition-colors font-medium">
                        <td className="py-2.5 px-3 font-mono font-bold text-[#0B1F4D]">{trip.tripId || trip.id}</td>
                        <td className="py-2.5 px-3">
                          <p className="font-bold text-[#0B1F4D]">{trip.consignment || "N/A"}</p>
                          <p className="text-[10px] text-slate-400">{(trip.origin || "N/A")} → {(trip.destination || "N/A")}</p>
                        </td>
                        <td className="py-2.5 px-3 font-mono">
                          <p>{trip.vehicleNo || "Unassigned"}</p>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono">{formatCurrency(trip.totalFare || 0)}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-black text-[#F59E0B]">{formatCurrency(trip.pendingBalance || 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

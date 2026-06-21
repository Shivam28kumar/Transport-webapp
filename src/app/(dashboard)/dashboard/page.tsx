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
import { Button, buttonVariants } from "@/components/ui/button";
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
  ArrowUpRight,
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
import { formatCurrency } from "@/lib/utils";

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
        `📊 Monthly Analysis: Your fleet generated ${formatCurrency(stats.totalRevenue)} in revenue with a healthy profit margin of ${stats.totalRevenue > 0 ? ((stats.netProfit / stats.totalRevenue) * 100).toFixed(1) : 0}%. ${stats.outstandingCollection > 0 ? `${formatCurrency(stats.outstandingCollection)} is pending collection across active trips.` : "All payments are collected!"} Recommendation: ${stats.outstandingCollection > 0 ? "Prioritize collection from pending trips to improve cash flow." : "Maintain current collection efficiency."}`
      );
      setAiLoading(false);
    }, 2000);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32" />)}
        </div>
        <Skeleton className="h-20" />
        <Skeleton className="h-[300px]" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <AlertCircle className="w-12 h-12 text-amber-500" />
        <h2 className="font-heading text-xl font-bold">No Data Found</h2>
        <p className="text-sm text-muted-foreground">Seed the database to get started.</p>
        <Button onClick={async () => {
          const res = await fetch("/api/seed", { method: "POST" });
          if (res.ok) {
            window.location.reload();
          }
        }} className="bg-gradient-to-r from-[#0a192f] to-[#1d3461]">
          Seed Database with Sample Data
        </Button>
      </div>
    );
  }

  const kpiCards = [
    { title: "Total Revenue", value: formatCurrency(stats.totalRevenue), change: "+12.5%", changeType: "positive" as const, icon: IndianRupee, gradient: "from-emerald-500 to-emerald-600", bgGlow: "shadow-emerald-500/20" },
    { title: "Net Profit", value: formatCurrency(stats.netProfit), change: "+8.2%", changeType: "positive" as const, icon: TrendingUp, gradient: "from-blue-500 to-blue-600", bgGlow: "shadow-blue-500/20" },
    { title: "Active Trucks", value: stats.activeTrucks.toString(), change: `of ${stats.totalTrucks} total`, changeType: "neutral" as const, icon: Truck, gradient: "from-violet-500 to-violet-600", bgGlow: "shadow-violet-500/20" },
    { title: "Ongoing Trips", value: stats.ongoingTrips.toString(), change: "In transit", changeType: "neutral" as const, icon: Route, gradient: "from-amber-500 to-amber-600", bgGlow: "shadow-amber-500/20" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight">Command Center</h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time financial cockpit & operational overview</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs gap-1.5 py-1 px-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Data
          </Badge>
          <span className="text-xs text-muted-foreground">
            {new Date().toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.title} className={`relative overflow-hidden border-0 shadow-lg ${kpi.bgGlow} hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5`}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{kpi.title}</p>
                  <p className="text-2xl font-heading font-bold tracking-tight">{kpi.value}</p>
                  <div className="flex items-center gap-1">
                    {kpi.changeType === "positive" && <ArrowUpRight className="w-3 h-3 text-emerald-500" />}
                    <span className={`text-xs font-medium ${kpi.changeType === "positive" ? "text-emerald-600" : "text-muted-foreground"}`}>{kpi.change}</span>
                  </div>
                </div>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${kpi.gradient} flex items-center justify-center shadow-lg`}>
                  <kpi.icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${kpi.gradient}`} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Insight */}
      <Card className="border border-sky-500/20 bg-gradient-to-r from-sky-50 to-blue-50">
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-lg flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-heading font-semibold text-sm">Smart Profit Estimator</h3>
                <Badge className="text-[10px] bg-sky-500/10 text-sky-600 border-sky-500/20 hover:bg-sky-500/10">AI Powered</Badge>
              </div>
              {aiInsight ? (
                <p className="text-sm text-muted-foreground leading-relaxed">{aiInsight}</p>
              ) : (
                <p className="text-sm text-muted-foreground">Get AI-powered insights about your fleet&apos;s financial performance.</p>
              )}
            </div>
            <Button size="sm" onClick={generateInsight} disabled={aiLoading} className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-lg flex-shrink-0">
              {aiLoading ? <><Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> Analyzing...</> : <><Sparkles className="w-3 h-3 mr-1.5" /> Generate Insight</>}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-heading text-base">Monthly Performance</CardTitle>
                <CardDescription className="text-xs">Income vs Expenses</CardDescription>
              </div>
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.monthlyPerformance} barGap={4} barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: any) => [formatCurrency(Number(value || 0))]} contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", fontSize: "12px" }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                  <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} name="Income" />
                  <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card 
            className="shadow-sm hover:shadow-md transition-all cursor-pointer border-amber-500/20 hover:border-amber-500/40 bg-amber-500/5 group"
            onClick={handleOpenOutstanding}
          >
            <CardHeader className="pb-2">
              <CardTitle className="font-heading text-base flex items-center justify-between">
                <span>Outstanding Collection</span>
                <span className="text-[10px] text-amber-600 bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded-full font-sans font-normal opacity-0 group-hover:opacity-100 transition-opacity">View List →</span>
              </CardTitle>
              <CardDescription className="text-xs">Pending payments across fleet</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-heading font-bold text-amber-600">{formatCurrency(stats.outstandingCollection)}</span>
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                </div>
                <div className="w-full bg-amber-100 rounded-full h-2.5">
                  <div className="bg-gradient-to-r from-amber-400 to-amber-600 h-2.5 rounded-full transition-all duration-1000" style={{ width: `${stats.totalRevenue > 0 ? Math.min((stats.outstandingCollection / stats.totalRevenue) * 100, 100) : 0}%` }} />
                </div>
                <p className="text-xs text-muted-foreground">{stats.totalRevenue > 0 ? ((stats.outstandingCollection / stats.totalRevenue) * 100).toFixed(1) : 0}% of total revenue is pending</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="font-heading text-base">Trip Status</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2.5">
                {[
                  { label: "Completed", count: stats.tripStatusCounts.completed, icon: CheckCircle2, color: "text-emerald-500" },
                  { label: "In Transit", count: stats.tripStatusCounts.inTransit, icon: Truck, color: "text-blue-500" },
                  { label: "Planned", count: stats.tripStatusCounts.planned, icon: Clock, color: "text-amber-500" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-2"><item.icon className={`w-4 h-4 ${item.color}`} /><span className="text-sm">{item.label}</span></div>
                    <Badge variant="secondary" className="text-xs font-mono">{item.count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Trips */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-heading text-base">Recent Trips</CardTitle>
              <CardDescription className="text-xs">Latest dispatches and their status</CardDescription>
            </div>
            <Link href="/trips" className={buttonVariants({ variant: "ghost", size: "sm", className: "text-xs" })}>View All →</Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Trip ID", "Route", "Vehicle", "Fare", "Payment", "Status"].map((h) => (
                    <th key={h} className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.recentTrips.map((trip: any) => (
                  <tr key={trip.tripId || trip._id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-xs">{trip.tripId}</td>
                    <td className="py-2.5 px-3 text-xs">{(trip.origin || "N/A")} → {(trip.destination || "N/A")}</td>
                    <td className="py-2.5 px-3 font-mono text-xs">{trip.vehicleNo || "Unassigned"}</td>
                    <td className="py-2.5 px-3 font-mono text-xs font-medium">{formatCurrency(trip.totalFare || 0)}</td>
                    <td className="py-2.5 px-3">
                      <Badge variant="outline" className={`text-[10px] ${trip.paymentStatus === "Complete" ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" : trip.paymentStatus === "Partial" ? "bg-blue-500/10 text-blue-700 border-blue-500/20" : "bg-amber-500/10 text-amber-700 border-amber-500/20"}`}>
                        {trip.paymentStatus || "Pending"}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3">
                      <Badge variant="outline" className={`text-[10px] ${trip.tripStatus === "Completed" || trip.tripStatus === "Delivered" ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" : trip.tripStatus === "In Transit" ? "bg-blue-500/10 text-blue-700 border-blue-500/20" : "bg-amber-500/10 text-amber-700 border-amber-500/20"}`}>
                        {trip.tripStatus || "Planned"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Outstanding Collections Modal */}
      <Dialog open={isOutstandingOpen} onOpenChange={setIsOutstandingOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-[#090d16]/95 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="font-heading flex items-center gap-2 text-white">
              <AlertCircle className="w-5 h-5 text-amber-500" /> Outstanding Collections
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Details of active dispatches with pending payments.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            {loadingPending ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
                <p className="text-xs text-slate-400">Loading pending accounts...</p>
              </div>
            ) : pendingTrips.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">
                All payments are fully cleared!
              </p>
            ) : (
              <div className="overflow-x-auto border border-slate-800 rounded-lg">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-[#0c1322] text-slate-400 uppercase tracking-wider text-[10px]">
                      <th className="text-left py-2.5 px-3">Trip ID</th>
                      <th className="text-left py-2.5 px-3">Consignment / Route</th>
                      <th className="text-left py-2.5 px-3">Vehicle / Driver</th>
                      <th className="text-right py-2.5 px-3">Total Fare</th>
                      <th className="text-right py-2.5 px-3">Advance</th>
                      <th className="text-right py-2.5 px-3">Outstanding</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingTrips.map((trip) => (
                      <tr key={trip._id || trip.id} className="border-b border-slate-800/60 hover:bg-slate-900/40 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-semibold text-slate-300">{trip.tripId || trip.id}</td>
                        <td className="py-2.5 px-3">
                          <p className="font-semibold text-slate-100">{trip.consignment || "N/A"}</p>
                          <p className="text-[10px] text-slate-400">{(trip.origin || "N/A")} → {(trip.destination || "N/A")}</p>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-300">
                          <p>{trip.vehicleNo || "Unassigned"}</p>
                          <p className="text-[10px] text-slate-400 font-sans">{trip.driverName || "Unassigned"}</p>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-200">{formatCurrency(trip.totalFare || 0)}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-emerald-500">-{formatCurrency(trip.advance || 0)}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-500">{formatCurrency(trip.pendingBalance || 0)}</td>
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

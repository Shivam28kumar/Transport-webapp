"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Truck,
  Users,
  Search,
  Plus,
  FileText,
  MapPin,
  Phone,
  CreditCard,
  Building,
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Edit,
  User,
  Route,
} from "lucide-react";
import { cn, formatDate, getStatusColor } from "@/lib/utils";

export default function FleetPage() {
  const [trucksList, setTrucksList] = useState<any[]>([]);
  const [driversList, setDriversList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [truckSearch, setTruckSearch] = useState("");
  const [driverSearch, setDriverSearch] = useState("");
  const [selectedTruck, setSelectedTruck] = useState<any | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<any | null>(null);

  // Dialog open states
  const [isTruckDialogOpen, setIsTruckDialogOpen] = useState(false);
  const [isDriverDialogOpen, setIsDriverDialogOpen] = useState(false);

  // New Truck form states
  const [newTruckNo, setNewTruckNo] = useState("");
  const [newTruckType, setNewTruckType] = useState("");
  const [newTruckCapacity, setNewTruckCapacity] = useState("");
  const [newTruckGps, setNewTruckGps] = useState("");
  const [isSavingTruck, setIsSavingTruck] = useState(false);

  // New Driver form states
  const [newDriverName, setNewDriverName] = useState("");
  const [newDriverPhone, setNewDriverPhone] = useState("");
  const [newDriverDl, setNewDriverDl] = useState("");
  const [newDriverDlExpiry, setNewDriverDlExpiry] = useState("");
  const [newDriverAadhaar, setNewDriverAadhaar] = useState("");
  const [newDriverPan, setNewDriverPan] = useState("");
  const [newDriverBankName, setNewDriverBankName] = useState("");
  const [newDriverAccountNo, setNewDriverAccountNo] = useState("");
  const [newDriverIfsc, setNewDriverIfsc] = useState("");
  const [isSavingDriver, setIsSavingDriver] = useState(false);

  const [editingTruck, setEditingTruck] = useState<any | null>(null);
  const [newTruckStatus, setNewTruckStatus] = useState("Active");

  const [editingDriver, setEditingDriver] = useState<any | null>(null);
  const [newDriverStatus, setNewDriverStatus] = useState("Available");

  const handleStartEditTruck = (truck: any) => {
    setNewTruckNo(truck.vehicleNo);
    setNewTruckType(truck.type);
    setNewTruckCapacity(truck.capacity);
    setNewTruckGps(truck.gpsLink || "");
    setNewTruckStatus(truck.status || "Active");
    setEditingTruck(truck);
    setSelectedTruck(null);
    setIsTruckDialogOpen(true);
  };

  const handleStartEditDriver = (driver: any) => {
    setNewDriverName(driver.name);
    setNewDriverPhone(driver.phone);
    setNewDriverDl(driver.dl);
    setNewDriverDlExpiry(driver.dlExpiry ? driver.dlExpiry.split('T')[0] : "");
    setNewDriverAadhaar(driver.aadhaar || "");
    setNewDriverPan(driver.pan || "");
    setNewDriverBankName(driver.bankName || "");
    setNewDriverAccountNo(driver.accountNo || "");
    setNewDriverIfsc(driver.ifsc || "");
    setNewDriverStatus(driver.status || "Available");
    setEditingDriver(driver);
    setSelectedDriver(null);
    setIsDriverDialogOpen(true);
  };

  const fetchFleet = async () => {
    try {
      setLoading(true);
      const [trucksRes, driversRes] = await Promise.all([
        fetch("/api/trucks"),
        fetch("/api/drivers"),
      ]);
      if (trucksRes.ok) {
        const trucksData = await trucksRes.json();
        setTrucksList(trucksData);
      }
      if (driversRes.ok) {
        const driversData = await driversRes.json();
        setDriversList(driversData);
      }
    } catch (error) {
      console.error("Failed to fetch fleet:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFleet();
  }, []);

  const handleSaveTruck = async () => {
    if (!newTruckNo || !newTruckType) return;
    try {
      setIsSavingTruck(true);
      
      const isEdit = !!editingTruck;
      // Setup default valid documents in Digital Vault
      const defaultDocs = [
        { type: "RC", number: "Not Provided", expiryDate: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0], status: "Valid" },
        { type: "Insurance", number: "Not Provided", expiryDate: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0], status: "Valid" },
        { type: "Fitness", number: "Not Provided", expiryDate: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0], status: "Valid" },
        { type: "Permit", number: "Not Provided", expiryDate: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0], status: "Valid" },
        { type: "PUC", number: "Not Provided", expiryDate: new Date(Date.now() + 180*24*60*60*1000).toISOString().split('T')[0], status: "Valid" },
      ];

      const res = await fetch(isEdit ? `/api/trucks/${editingTruck._id}` : "/api/trucks", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleNo: newTruckNo.toUpperCase(),
          type: newTruckType,
          capacity: newTruckCapacity || "Not Specified",
          gpsLink: newTruckGps || undefined,
          status: isEdit ? newTruckStatus : "Active",
          documents: isEdit ? editingTruck.documents : defaultDocs,
        }),
      });

      if (res.ok) {
        const saved = await res.json();
        if (isEdit) {
          setTrucksList((prev) => prev.map((t) => (t._id === saved._id ? saved : t)));
        } else {
          setTrucksList((prev) => [saved, ...prev]);
        }
        // Reset form
        setNewTruckNo("");
        setNewTruckType("");
        setNewTruckCapacity("");
        setNewTruckGps("");
        setNewTruckStatus("Active");
        setEditingTruck(null);
        setIsTruckDialogOpen(false);
      }
    } catch (error) {
      console.error("Failed to save truck:", error);
    } finally {
      setIsSavingTruck(false);
    }
  };

  const handleSaveDriver = async () => {
    if (!newDriverName || !newDriverPhone || !newDriverDl) return;
    try {
      setIsSavingDriver(true);

      const isEdit = !!editingDriver;
      const res = await fetch(isEdit ? `/api/drivers/${editingDriver._id}` : "/api/drivers", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newDriverName,
          phone: newDriverPhone,
          dl: newDriverDl,
          dlExpiry: newDriverDlExpiry || new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
          aadhaar: newDriverAadhaar || "Not Provided",
          pan: newDriverPan || "Not Provided",
          bankName: newDriverBankName || "Not Provided",
          accountNo: newDriverAccountNo || "Not Provided",
          ifsc: newDriverIfsc || "Not Provided",
          status: isEdit ? newDriverStatus : "Available",
        }),
      });

      if (res.ok) {
        const saved = await res.json();
        if (isEdit) {
          setDriversList((prev) => prev.map((d) => (d._id === saved._id ? saved : d)));
        } else {
          setDriversList((prev) => [saved, ...prev]);
        }
        // Reset form
        setNewDriverName("");
        setNewDriverPhone("");
        setNewDriverDl("");
        setNewDriverDlExpiry("");
        setNewDriverAadhaar("");
        setNewDriverPan("");
        setNewDriverBankName("");
        setNewDriverAccountNo("");
        setNewDriverIfsc("");
        setNewDriverStatus("Available");
        setEditingDriver(null);
        setIsDriverDialogOpen(false);
      }
    } catch (error) {
      console.error("Failed to save driver:", error);
    } finally {
      setIsSavingDriver(false);
    }
  };

  const filteredTrucks = trucksList.filter(
    (t) =>
      t.vehicleNo.toLowerCase().includes(truckSearch.toLowerCase()) ||
      t.type.toLowerCase().includes(truckSearch.toLowerCase())
  );

  const filteredDrivers = driversList.filter(
    (d) =>
      d.name.toLowerCase().includes(driverSearch.toLowerCase()) ||
      d.phone.includes(driverSearch)
  );

  const getDocStatusIcon = (status: string) => {
    switch (status) {
      case "Valid":
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
      case "Expired":
        return <XCircle className="w-3.5 h-3.5 text-red-500" />;
      case "Expiring Soon":
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-gray-400" />;
    }
  };

  const getDocExpiryInfo = (truck: any, type: string) => {
    const doc = truck.documents?.find((d: any) => d.type === type);
    if (!doc) return { label: "Not Provided", status: "Expired" };
    return {
      label: formatDate(doc.expiryDate),
      status: doc.status || "Valid",
    };
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
        <span className="w-6 h-6 rounded-full border-2 border-[#0B1F4D] border-t-transparent animate-spin" />
        <p className="text-sm text-slate-500 font-heading">Loading fleet assets...</p>
      </div>
    );
  }

  // Top KPI cards: Total Trucks, Running, Maintenance, Idle
  const kpis = [
    {
      label: "Total Trucks",
      value: trucksList.length,
      icon: Truck,
      color: "text-[#0B1F4D]",
      bg: "bg-[#0B1F4D]/10",
    },
    {
      label: "Running",
      value: trucksList.filter((t) => t.status === "In Transit").length,
      icon: CheckCircle2,
      color: "text-[#2E9E44]",
      bg: "bg-[#2E9E44]/10",
    },
    {
      label: "Maintenance",
      value: trucksList.filter((t) => t.status === "Maintenance").length,
      icon: AlertTriangle,
      color: "text-[#EF4444]",
      bg: "bg-[#EF4444]/10",
    },
    {
      label: "Idle",
      value: trucksList.filter((t) => t.status === "Idle" || t.status === "Active").length,
      icon: Clock,
      color: "text-[#F59E0B]",
      bg: "bg-[#F59E0B]/10",
    },
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* Page Header */}
      <div>
        <h2 className="font-heading text-2xl md:text-3xl font-black text-[#0B1F4D]">
          Fleet Registry
        </h2>
        <p className="text-xs text-slate-400 font-medium mt-1">
          Asset profiles, GPS telemetry, compliance documents & active operators
        </p>
      </div>

      {/* Top KPI Cards (Horizontal with icons in circular background) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="border border-[#E5E7EB] rounded-[20px] bg-white shadow-sm ring-0">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={cn("w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0", kpi.bg)}>
                <kpi.icon className={cn("w-6 h-6", kpi.color)} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {kpi.label}
                </span>
                <span className={cn("text-2xl font-heading font-black tracking-tight mt-0.5 block", kpi.color)}>
                  {kpi.value}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs for Trucks & Drivers */}
      <Tabs defaultValue="trucks" className="space-y-6">
        <TabsList className="bg-slate-100 p-1 rounded-xl w-fit border border-slate-200">
          <TabsTrigger value="trucks" className="gap-2 px-5 py-2 text-xs font-bold rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#0B1F4D]">
            <Truck className="w-4 h-4" /> Trucks Registry
          </TabsTrigger>
          <TabsTrigger value="drivers" className="gap-2 px-5 py-2 text-xs font-bold rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#0B1F4D]">
            <Users className="w-4 h-4" /> Drivers Profile
          </TabsTrigger>
        </TabsList>

        {/* === TRUCKS TAB === */}
        <TabsContent value="trucks" className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by registration number or container type..."
                value={truckSearch}
                onChange={(e) => setTruckSearch(e.target.value)}
                className="pl-10 h-11 text-sm bg-white border-[#E5E7EB] rounded-xl shadow-sm text-[#0B1F4D] placeholder-slate-400"
              />
            </div>
            <Dialog 
              open={isTruckDialogOpen} 
              onOpenChange={(open) => { 
                setIsTruckDialogOpen(open); 
                if (!open) { 
                  setEditingTruck(null); 
                  setNewTruckNo(""); 
                  setNewTruckType(""); 
                  setNewTruckCapacity(""); 
                  setNewTruckGps(""); 
                  setNewTruckStatus("Active");
                } 
              }}
            >
              <DialogTrigger
                render={
                  <Button
                    className="w-full sm:w-auto h-[52px] px-6 rounded-[14px] bg-[#0B1F4D] text-white hover:bg-[#0B1F4D]/90 font-bold gap-2 flex-shrink-0 shadow-lg shadow-[#0B1F4D]/15"
                    onClick={() => {
                      setEditingTruck(null);
                      setNewTruckNo("");
                      setNewTruckType("");
                      setNewTruckCapacity("");
                      setNewTruckGps("");
                      setNewTruckStatus("Active");
                    }}
                  >
                    <Plus className="w-5 h-5 text-white" /> Register Truck
                  </Button>
                }
              />
              <DialogContent className="max-w-md rounded-[20px] bg-white border border-[#E5E7EB] text-[#0B1F4D]">
                <DialogHeader>
                  <DialogTitle className="font-heading text-lg font-black text-[#0B1F4D]">
                    {editingTruck ? "Edit Truck Asset" : "Register New Truck"}
                  </DialogTitle>
                  <DialogDescription className="text-slate-400 font-medium">
                    {editingTruck ? "Modify vehicle registration parameters in Veltrix directory." : "Add a new transport asset to the fleet directory."}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-bold text-[#0B1F4D]">Registration No.</Label>
                      <Input
                        placeholder="e.g. JH 05 AB 1234"
                        className="mt-1 h-11 text-sm bg-white border-[#E5E7EB] rounded-lg text-[#0B1F4D] uppercase"
                        value={newTruckNo}
                        onChange={(e) => setNewTruckNo(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-bold text-[#0B1F4D]">Truck Type</Label>
                      <Select value={newTruckType} onValueChange={(val) => setNewTruckType(val || "")}>
                        <SelectTrigger className="mt-1 h-11 text-sm bg-white border-[#E5E7EB] rounded-lg">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Trailer">Trailer</SelectItem>
                          <SelectItem value="Tanker">Tanker</SelectItem>
                          <SelectItem value="Tipper">Tipper</SelectItem>
                          <SelectItem value="Container">Container</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs font-bold text-[#0B1F4D]">Cargo Capacity</Label>
                    <Input
                      placeholder="e.g. 30 Tons"
                      className="mt-1 h-11 text-sm bg-white border-[#E5E7EB] rounded-lg text-[#0B1F4D]"
                      value={newTruckCapacity}
                      onChange={(e) => setNewTruckCapacity(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-bold text-[#0B1F4D]">
                      GPS Tracking Endpoint (Optional)
                    </Label>
                    <Input
                      placeholder="https://maps.gps..."
                      className="mt-1 h-11 text-sm bg-white border-[#E5E7EB] rounded-lg text-[#0B1F4D]"
                      value={newTruckGps}
                      onChange={(e) => setNewTruckGps(e.target.value)}
                    />
                  </div>
                  {editingTruck && (
                    <div>
                      <Label className="text-xs font-bold text-[#0B1F4D]">Asset Status</Label>
                      <Select value={newTruckStatus} onValueChange={(val) => setNewTruckStatus(val || "")}>
                        <SelectTrigger className="mt-1 h-11 text-sm bg-white border-[#E5E7EB] rounded-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Active">Active / Idle</SelectItem>
                          <SelectItem value="In Transit">In Transit</SelectItem>
                          <SelectItem value="Maintenance">Maintenance</SelectItem>
                          <SelectItem value="Idle">Idle</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                <DialogFooter className="gap-2">
                  <DialogClose render={<Button variant="outline" className="h-11 px-6 text-sm font-bold border-[#E5E7EB] text-[#0B1F4D]" />}>
                    Cancel
                  </DialogClose>
                  <Button
                    className="h-11 px-6 text-sm font-bold bg-[#0B1F4D] text-white hover:bg-[#0B1F4D]/90"
                    onClick={handleSaveTruck}
                    disabled={isSavingTruck || !newTruckNo || !newTruckType}
                  >
                    {isSavingTruck ? "Saving..." : (editingTruck ? "Update Details" : "Register")}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Vehicle cards separated by 24px spacing (gap-6) */}
          {filteredTrucks.length === 0 ? (
            <Card className="border border-[#E5E7EB] rounded-[20px] bg-white py-12 text-center shadow-sm">
              <CardContent className="space-y-3">
                <AlertTriangle className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-semibold text-slate-500">No trucks registered in the directory</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredTrucks.map((truck) => {
                const fitness = getDocExpiryInfo(truck, "Fitness");
                const insurance = getDocExpiryInfo(truck, "Insurance");
                const rc = getDocExpiryInfo(truck, "RC");
                
                return (
                  <Card
                    key={truck._id || truck.id}
                    className="border border-[#E5E7EB] rounded-[20px] shadow-sm hover:shadow-md transition-all duration-300 bg-white overflow-hidden group cursor-pointer ring-0 flex flex-col"
                    onClick={() => setSelectedTruck(truck)}
                  >
                    {/* Truck image container (stylized illustration wrapper) */}
                    <div className="h-36 w-full bg-gradient-to-br from-[#0B1F4D] to-[#1d3461] relative overflow-hidden flex items-center justify-center flex-shrink-0">
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent pointer-events-none" />
                      <div className="absolute top-4 right-4">
                        <Badge
                          className={cn(
                            "text-[9px] font-bold rounded-full py-1 px-3 border-0 shadow-md",
                            truck.status === "In Transit" ? "bg-[#2E9E44] text-white" :
                            truck.status === "Maintenance" ? "bg-[#EF4444] text-white" :
                            truck.status === "Idle" ? "bg-[#F59E0B] text-white" : "bg-[#0B1F4D] text-white"
                          )}
                        >
                          {truck.status === "In Transit" ? "Running" : truck.status}
                        </Badge>
                      </div>
                      <Truck className="w-16 h-16 text-white/80 drop-shadow-xl transform group-hover:scale-105 transition-transform duration-300" />
                    </div>

                    {/* Content body */}
                    <CardContent className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-1">
                        <h3 className="font-heading font-black text-xl text-[#0B1F4D] tracking-tight">
                          {truck.vehicleNo}
                        </h3>
                        <p className="text-xs text-slate-400 font-semibold uppercase">
                          Model: {truck.type} · {truck.capacity}
                        </p>
                      </div>

                      <Separator className="bg-slate-100" />

                      {/* Driver & Trip info */}
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assigned Driver</span>
                          <span className="font-bold text-[#0B1F4D] flex items-center gap-1.5 mt-0.5">
                            <User className="w-3.5 h-3.5 text-slate-400" /> {truck.driver || "Unassigned"}
                          </span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Current Trip</span>
                          <span className={cn("font-bold flex items-center gap-1.5 mt-0.5", truck.status === "In Transit" ? "text-[#2E9E44]" : "text-slate-400")}>
                            <Route className="w-3.5 h-3.5" /> {truck.status === "In Transit" ? "Running Route" : "Idle Asset"}
                          </span>
                        </div>
                      </div>

                      <Separator className="bg-slate-100" />

                      {/* Expiry Details */}
                      <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs font-semibold">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Fitness Expiry</span>
                          <span className={cn(
                            fitness.status === "Valid" ? "text-emerald-600" :
                            fitness.status === "Expiring Soon" ? "text-[#F59E0B]" : "text-rose-600"
                          )}>{fitness.label}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Insurance Expiry</span>
                          <span className={cn(
                            insurance.status === "Valid" ? "text-emerald-600" :
                            insurance.status === "Expiring Soon" ? "text-[#F59E0B]" : "text-rose-600"
                          )}>{insurance.label}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">RC Expiry</span>
                          <span className={cn(
                            rc.status === "Valid" ? "text-emerald-600" :
                            rc.status === "Expiring Soon" ? "text-[#F59E0B]" : "text-rose-600"
                          )}>{rc.label}</span>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex items-center gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 h-10 border-[#E5E7EB] text-[#0B1F4D] font-bold rounded-xl text-xs gap-1.5 hover:bg-slate-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartEditTruck(truck);
                          }}
                        >
                          <Edit className="w-3.5 h-3.5" /> Edit Asset
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 h-10 border-[#E5E7EB] text-[#0B1F4D] font-bold rounded-xl text-xs gap-1.5 hover:bg-slate-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTruck(truck);
                          }}
                        >
                          <FileText className="w-3.5 h-3.5" /> Digital Vault
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* === DRIVERS TAB === */}
        <TabsContent value="drivers" className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by driver's name or contact number..."
                value={driverSearch}
                onChange={(e) => setDriverSearch(e.target.value)}
                className="pl-10 h-11 text-sm bg-white border-[#E5E7EB] rounded-xl shadow-sm text-[#0B1F4D] placeholder-slate-400"
              />
            </div>
            <Dialog 
              open={isDriverDialogOpen} 
              onOpenChange={(open) => { 
                setIsDriverDialogOpen(open); 
                if (!open) { 
                  setEditingDriver(null); 
                  setNewDriverName(""); 
                  setNewDriverPhone(""); 
                  setNewDriverDl(""); 
                  setNewDriverDlExpiry(""); 
                  setNewDriverAadhaar(""); 
                  setNewDriverPan(""); 
                  setNewDriverBankName(""); 
                  setNewDriverAccountNo(""); 
                  setNewDriverIfsc(""); 
                  setNewDriverStatus("Available");
                } 
              }}
            >
              <DialogTrigger
                render={
                  <Button
                    className="w-full sm:w-auto h-[52px] px-6 rounded-[14px] bg-[#0B1F4D] text-white hover:bg-[#0B1F4D]/90 font-bold gap-2 flex-shrink-0 shadow-lg shadow-[#0B1F4D]/15"
                    onClick={() => {
                      setEditingDriver(null);
                      setNewDriverName("");
                      setNewDriverPhone("");
                      setNewDriverDl("");
                      setNewDriverDlExpiry("");
                      setNewDriverAadhaar("");
                      setNewDriverPan("");
                      setNewDriverBankName("");
                      setNewDriverAccountNo("");
                      setNewDriverIfsc("");
                      setNewDriverStatus("Available");
                    }}
                  >
                    <Plus className="w-5 h-5 text-white" /> Register Driver
                  </Button>
                }
              />
              <DialogContent className="max-w-md rounded-[20px] bg-white border border-[#E5E7EB] text-[#0B1F4D] max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="font-heading text-lg font-black text-[#0B1F4D]">
                    {editingDriver ? "Edit Driver Profile" : "Register New Operator"}
                  </DialogTitle>
                  <DialogDescription className="text-slate-400 font-medium">
                    Configure operator contact numbers, licensing data, and bank settlement details.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-bold text-[#0B1F4D]">Full Name</Label>
                      <Input
                        placeholder="Rajesh Kumar"
                        className="mt-1 h-11 text-sm bg-white border-[#E5E7EB] rounded-lg text-[#0B1F4D]"
                        value={newDriverName}
                        onChange={(e) => setNewDriverName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-bold text-[#0B1F4D]">Phone Number</Label>
                      <Input
                        placeholder="+91 98765..."
                        className="mt-1 h-11 text-sm bg-white border-[#E5E7EB] rounded-lg text-[#0B1F4D]"
                        value={newDriverPhone}
                        onChange={(e) => setNewDriverPhone(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-bold text-[#0B1F4D]">Driving License No.</Label>
                      <Input
                        placeholder="JH-1234567890"
                        className="mt-1 h-11 text-sm bg-white border-[#E5E7EB] rounded-lg text-[#0B1F4D]"
                        value={newDriverDl}
                        onChange={(e) => setNewDriverDl(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-bold text-[#0B1F4D]">DL Expiry Date</Label>
                      <Input
                        type="date"
                        className="mt-1 h-11 text-sm bg-white border-[#E5E7EB] rounded-lg text-[#0B1F4D]"
                        value={newDriverDlExpiry}
                        onChange={(e) => setNewDriverDlExpiry(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-bold text-[#0B1F4D]">Aadhaar Card No.</Label>
                      <Input
                        placeholder="1234 5678 9012"
                        className="mt-1 h-11 text-sm bg-white border-[#E5E7EB] rounded-lg text-[#0B1F4D]"
                        value={newDriverAadhaar}
                        onChange={(e) => setNewDriverAadhaar(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-bold text-[#0B1F4D]">PAN Card No.</Label>
                      <Input
                        placeholder="ABCDE1234F"
                        className="mt-1 h-11 text-sm bg-white border-[#E5E7EB] rounded-lg text-[#0B1F4D] uppercase"
                        value={newDriverPan}
                        onChange={(e) => setNewDriverPan(e.target.value)}
                      />
                    </div>
                  </div>
                  <Separator />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Settlement Bank Details
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-bold text-[#0B1F4D]">Bank Name</Label>
                      <Input
                        placeholder="e.g. State Bank of India"
                        className="mt-1 h-11 text-sm bg-white border-[#E5E7EB] rounded-lg text-[#0B1F4D]"
                        value={newDriverBankName}
                        onChange={(e) => setNewDriverBankName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-bold text-[#0B1F4D]">Account Number</Label>
                      <Input
                        placeholder="e.g. 12345678901"
                        className="mt-1 h-11 text-sm bg-white border-[#E5E7EB] rounded-lg text-[#0B1F4D]"
                        value={newDriverAccountNo}
                        onChange={(e) => setNewDriverAccountNo(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-bold text-[#0B1F4D]">IFSC Code</Label>
                      <Input
                        placeholder="e.g. SBIN0001234"
                        className="mt-1 h-11 text-sm bg-white border-[#E5E7EB] rounded-lg text-[#0B1F4D] uppercase"
                        value={newDriverIfsc}
                        onChange={(e) => setNewDriverIfsc(e.target.value)}
                      />
                    </div>
                    {editingDriver && (
                      <div>
                        <Label className="text-xs font-bold text-[#0B1F4D]">Status</Label>
                        <Select value={newDriverStatus} onValueChange={(val) => setNewDriverStatus(val || "")}>
                          <SelectTrigger className="mt-1 h-11 text-sm bg-white border-[#E5E7EB] rounded-lg">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Available">Available</SelectItem>
                            <SelectItem value="On Trip">On Trip</SelectItem>
                            <SelectItem value="On Leave">On Leave</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>
                <DialogFooter className="gap-2">
                  <DialogClose render={<Button variant="outline" className="h-11 px-6 text-sm font-bold border-[#E5E7EB] text-[#0B1F4D]" />}>
                    Cancel
                  </DialogClose>
                  <Button
                    className="h-11 px-6 text-sm font-bold bg-[#0B1F4D] text-white hover:bg-[#0B1F4D]/90"
                    onClick={handleSaveDriver}
                    disabled={isSavingDriver || !newDriverName || !newDriverPhone || !newDriverDl}
                  >
                    {isSavingDriver ? "Saving..." : (editingDriver ? "Update Profile" : "Register Profile")}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Driver cards */}
          {filteredDrivers.length === 0 ? (
            <Card className="border border-[#E5E7EB] rounded-[20px] bg-white py-12 text-center shadow-sm">
              <CardContent className="space-y-3">
                <AlertTriangle className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-semibold text-slate-500">No driver profiles found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredDrivers.map((driver) => (
                <Card
                  key={driver._id || driver.id}
                  className="border border-[#E5E7EB] rounded-[20px] shadow-sm hover:shadow-md transition-all duration-300 bg-white overflow-hidden group cursor-pointer ring-0 flex flex-col"
                  onClick={() => setSelectedDriver(driver)}
                >
                  <CardContent className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#3fae57] to-[#0B1F4D] flex items-center justify-center text-white font-heading font-black text-base shadow-md">
                          {driver.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-heading font-bold text-[#0B1F4D] text-base">
                            {driver.name}
                          </h3>
                          <p className="text-xs text-slate-400 font-semibold flex items-center gap-1 mt-0.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            {driver.phone}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[9px] font-bold py-1 px-3 rounded-full border-0 shadow-sm",
                          getStatusColor(driver.status)
                        )}
                      >
                        {driver.status}
                      </Badge>
                    </div>

                    <Separator className="bg-slate-100" />

                    <div className="grid grid-cols-3 gap-2.5 text-center">
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-[9px] font-bold text-slate-400 uppercase">License</p>
                        <p className="text-[10px] font-mono font-bold text-[#0B1F4D] mt-1 truncate">
                          {driver.dl.slice(-6)}
                        </p>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-[9px] font-bold text-slate-400 uppercase">Aadhaar</p>
                        <p className="text-[10px] font-mono font-bold text-[#0B1F4D] mt-1">
                          ****{driver.aadhaar.slice(-4)}
                        </p>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-[9px] font-bold text-slate-400 uppercase">PAN Card</p>
                        <p className="text-[10px] font-mono font-bold text-[#0B1F4D] mt-1">
                          {driver.pan}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold pt-1">
                      <CreditCard className="w-4 h-4 text-slate-400" />
                      <span>
                        {driver.bankName} · ****{driver.accountNo.slice(-4)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 h-10 border-[#E5E7EB] text-[#0B1F4D] font-bold rounded-xl text-xs gap-1.5 hover:bg-slate-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEditDriver(driver);
                        }}
                      >
                        <Edit className="w-3.5 h-3.5" /> Edit Profile
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 h-10 border-[#E5E7EB] text-[#0B1F4D] font-bold rounded-xl text-xs gap-1.5 hover:bg-slate-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDriver(driver);
                        }}
                      >
                        <FileText className="w-3.5 h-3.5" /> View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Truck Detail Dialog */}
      <Dialog open={!!selectedTruck} onOpenChange={() => setSelectedTruck(null)}>
        <DialogContent className="max-w-lg rounded-[20px] bg-white border border-[#E5E7EB] text-[#0B1F4D]">
          {selectedTruck && (
            <>
              <DialogHeader>
                <DialogTitle className="font-heading text-lg font-black text-[#0B1F4D] flex items-center gap-2">
                  <Truck className="w-5 h-5" /> {selectedTruck.vehicleNo}
                </DialogTitle>
                <DialogDescription className="text-slate-400 font-medium">
                  {selectedTruck.type} · {selectedTruck.capacity}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs font-bold rounded-full py-1 px-3 border-0 shadow-sm",
                      getStatusColor(selectedTruck.status)
                    )}
                  >
                    {selectedTruck.status}
                  </Badge>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-1.5 h-9 px-4 text-xs font-bold border-[#E5E7EB] text-[#0B1F4D] rounded-lg"
                    onClick={() => handleStartEditTruck(selectedTruck)}
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit Asset
                  </Button>
                </div>
                <Separator className="bg-slate-100" />
                <h4 className="font-heading font-black text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-500" /> Compliance Digital Vault
                </h4>
                <div className="space-y-2">
                  {selectedTruck.documents.map((doc: any) => (
                    <div
                      key={doc.type}
                      className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100/70 border border-slate-100 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        {getDocStatusIcon(doc.status)}
                        <div>
                          <p className="text-xs font-bold text-[#0B1F4D]">{doc.type}</p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {doc.number}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[8px] font-bold rounded-full border-0 py-0.5 px-2",
                            getStatusColor(doc.status)
                          )}
                        >
                          {doc.status}
                        </Badge>
                        <p className="text-[9px] font-bold text-slate-400 mt-1">
                          Exp: {formatDate(doc.expiryDate)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                {selectedTruck.gpsLink && (
                  <a
                    href={selectedTruck.gpsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs font-bold text-emerald-700 hover:text-emerald-800 p-3 bg-emerald-50 rounded-xl border border-emerald-100"
                  >
                    <MapPin className="w-4 h-4 text-emerald-600 animate-bounce" /> Live GPS Telemetry Pipeline{" "}
                    <ExternalLink className="w-3.5 h-3.5 ml-auto text-emerald-400" />
                  </a>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Driver Detail Dialog */}
      <Dialog open={!!selectedDriver} onOpenChange={() => setSelectedDriver(null)}>
        <DialogContent className="max-w-lg rounded-[20px] bg-white border border-[#E5E7EB] text-[#0B1F4D]">
          {selectedDriver && (
            <>
              <DialogHeader>
                <DialogTitle className="font-heading text-lg font-black text-[#0B1F4D] flex items-center gap-2">
                  <Users className="w-5 h-5" /> {selectedDriver.name}
                </DialogTitle>
                <DialogDescription className="text-slate-400 font-medium">
                  Contact Line: {selectedDriver.phone}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs font-bold rounded-full py-1 px-3 border-0 shadow-sm",
                      getStatusColor(selectedDriver.status)
                    )}
                  >
                    {selectedDriver.status}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 h-9 px-4 text-xs font-bold border-[#E5E7EB] text-[#0B1F4D] rounded-lg"
                    onClick={() => handleStartEditDriver(selectedDriver)}
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit Profile
                  </Button>
                </div>
                <Separator className="bg-slate-100" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                      Driving License
                    </p>
                    <p className="text-xs font-mono font-bold mt-1 text-[#0B1F4D]">
                      {selectedDriver.dl}
                    </p>
                    <p className="text-[9px] font-bold text-slate-400 mt-0.5">
                      Exp: {formatDate(selectedDriver.dlExpiry)}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                      Aadhaar Number
                    </p>
                    <p className="text-xs font-mono font-bold mt-1 text-[#0B1F4D]">
                      {selectedDriver.aadhaar}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                      PAN Card
                    </p>
                    <p className="text-xs font-mono font-bold mt-1 text-[#0B1F4D]">
                      {selectedDriver.pan}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                      Duty Status
                    </p>
                    <p className="text-xs font-bold mt-1 text-[#0B1F4D]">
                      {selectedDriver.status}
                    </p>
                  </div>
                </div>
                <Separator className="bg-slate-100" />
                <h4 className="font-heading font-black text-sm flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-slate-500" /> Bank Settlement Gateway
                </h4>
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2 text-xs font-semibold">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Receiving Bank</span>
                    <span className="text-[#0B1F4D]">
                      {selectedDriver.bankName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Account No.</span>
                    <span className="font-mono text-[#0B1F4D]">
                      {selectedDriver.accountNo}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">IFSC Code</span>
                    <span className="font-mono text-[#0B1F4D]">
                      {selectedDriver.ifsc}
                    </span>
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

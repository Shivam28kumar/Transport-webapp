"use client";

import { useState } from "react";
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
} from "lucide-react";
import { cn, formatDate, getStatusColor } from "@/lib/utils";
import { useEffect } from "react";

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
      
      // Setup default valid documents in Digital Vault
      const defaultDocs = [
        { type: "RC", number: "Not Provided", expiryDate: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0], status: "Valid" },
        { type: "Insurance", number: "Not Provided", expiryDate: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0], status: "Valid" },
        { type: "Fitness", number: "Not Provided", expiryDate: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0], status: "Valid" },
        { type: "Permit", number: "Not Provided", expiryDate: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0], status: "Valid" },
        { type: "PUC", number: "Not Provided", expiryDate: new Date(Date.now() + 180*24*60*60*1000).toISOString().split('T')[0], status: "Valid" },
      ];

      const res = await fetch("/api/trucks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleNo: newTruckNo.toUpperCase(),
          type: newTruckType,
          capacity: newTruckCapacity || "Not Specified",
          gpsLink: newTruckGps || undefined,
          status: "Active",
          documents: defaultDocs,
        }),
      });

      if (res.ok) {
        const saved = await res.json();
        setTrucksList((prev) => [saved, ...prev]);
        // Reset form
        setNewTruckNo("");
        setNewTruckType("");
        setNewTruckCapacity("");
        setNewTruckGps("");
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

      const res = await fetch("/api/drivers", {
        method: "POST",
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
          status: "Available",
        }),
      });

      if (res.ok) {
        const saved = await res.json();
        setDriversList((prev) => [saved, ...prev]);
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
        <span className="w-6 h-6 rounded-full border-2 border-[#0a192f] border-t-transparent animate-spin" />
        <p className="text-sm text-muted-foreground font-heading">Loading fleet assets...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight">
          Fleet Management
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Asset registry for trucks, drivers & documents
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Trucks", value: trucksList.length, icon: Truck, color: "text-blue-500" },
          { label: "Active", value: trucksList.filter((t) => t.status === "Active" || t.status === "In Transit").length, icon: CheckCircle2, color: "text-emerald-500" },
          { label: "Total Drivers", value: driversList.length, icon: Users, color: "text-violet-500" },
          { label: "Available", value: driversList.filter((d) => d.status === "Available").length, icon: Shield, color: "text-amber-500" },
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

      {/* Tabs for Trucks & Drivers */}
      <Tabs defaultValue="trucks" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="trucks" className="gap-1.5">
            <Truck className="w-3.5 h-3.5" /> Trucks
          </TabsTrigger>
          <TabsTrigger value="drivers" className="gap-1.5">
            <Users className="w-3.5 h-3.5" /> Drivers
          </TabsTrigger>
        </TabsList>

        {/* === TRUCKS TAB === */}
        <TabsContent value="trucks" className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by vehicle no. or type..."
                value={truckSearch}
                onChange={(e) => setTruckSearch(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
            <Dialog open={isTruckDialogOpen} onOpenChange={setIsTruckDialogOpen}>
              <DialogTrigger
                render={
                  <Button
                    size="sm"
                    className="gap-1.5 bg-gradient-to-r from-[#0a192f] to-[#1d3461] hover:from-[#112240] hover:to-[#0a192f]"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Truck
                  </Button>
                }
              />
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-heading">
                    Add New Truck
                  </DialogTitle>
                  <DialogDescription>
                    Register a new vehicle in the fleet registry.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Vehicle Number</Label>
                      <Input
                        placeholder="JH 05 AB 1234"
                        className="mt-1 h-9 text-sm"
                        value={newTruckNo}
                        onChange={(e) => setNewTruckNo(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Vehicle Type</Label>
                      <Select value={newTruckType} onValueChange={setNewTruckType}>
                        <SelectTrigger className="mt-1 h-9 text-sm">
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
                    <Label className="text-xs">Capacity</Label>
                    <Input
                      placeholder="30 Tons"
                      className="mt-1 h-9 text-sm"
                      value={newTruckCapacity}
                      onChange={(e) => setNewTruckCapacity(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">
                      GPS Tracking Link (Optional)
                    </Label>
                    <Input
                      placeholder="https://..."
                      className="mt-1 h-9 text-sm"
                      value={newTruckGps}
                      onChange={(e) => setNewTruckGps(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline" size="sm">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-[#0a192f] to-[#1d3461]"
                    onClick={handleSaveTruck}
                    disabled={isSavingTruck || !newTruckNo || !newTruckType}
                  >
                    {isSavingTruck ? "Saving..." : "Save Truck"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Truck Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredTrucks.map((truck) => (
              <Card
                key={truck._id || truck.id}
                className="shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
                onClick={() => setSelectedTruck(truck)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-heading font-bold text-base">
                        {truck.vehicleNo}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {truck.type} · {truck.capacity}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn("text-[10px]", getStatusColor(truck.status))}
                    >
                      {truck.status}
                    </Badge>
                  </div>
                  {truck.driver && (
                    <p className="text-xs text-muted-foreground mb-3">
                      <Users className="w-3 h-3 inline mr-1" />
                      {truck.driver}
                    </p>
                  )}
                  <Separator className="my-2" />
                  <div className="flex items-center gap-2 flex-wrap">
                    {truck.documents.map((doc) => (
                      <div
                        key={doc.type}
                        className={cn(
                          "flex items-center gap-1 text-[10px] px-2 py-1 rounded-full border",
                          getStatusColor(doc.status)
                        )}
                      >
                        {getDocStatusIcon(doc.status)}
                        {doc.type}
                      </div>
                    ))}
                  </div>
                  {truck.gpsLink && (
                    <div className="mt-3">
                      <a
                        href={truck.gpsLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-sky-500 hover:text-sky-600 flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MapPin className="w-3 h-3" /> Live GPS Tracking{" "}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* === DRIVERS TAB === */}
        <TabsContent value="drivers" className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or phone..."
                value={driverSearch}
                onChange={(e) => setDriverSearch(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
            <Dialog open={isDriverDialogOpen} onOpenChange={setIsDriverDialogOpen}>
              <DialogTrigger
                render={
                  <Button
                    size="sm"
                    className="gap-1.5 bg-gradient-to-r from-[#0a192f] to-[#1d3461] hover:from-[#112240] hover:to-[#0a192f]"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Driver
                  </Button>
                }
              />
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-heading">
                    Add New Driver
                  </DialogTitle>
                  <DialogDescription>
                    Register a new driver profile.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Full Name</Label>
                      <Input
                        placeholder="Rajesh Kumar"
                        className="mt-1 h-9 text-sm"
                        value={newDriverName}
                        onChange={(e) => setNewDriverName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Phone</Label>
                      <Input
                        placeholder="+91 98765..."
                        className="mt-1 h-9 text-sm"
                        value={newDriverPhone}
                        onChange={(e) => setNewDriverPhone(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Driving License No.</Label>
                      <Input
                        placeholder="JH-1234567890"
                        className="mt-1 h-9 text-sm"
                        value={newDriverDl}
                        onChange={(e) => setNewDriverDl(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">DL Expiry</Label>
                      <Input
                        type="date"
                        className="mt-1 h-9 text-sm"
                        value={newDriverDlExpiry}
                        onChange={(e) => setNewDriverDlExpiry(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Aadhaar</Label>
                      <Input
                        placeholder="1234 5678 9012"
                        className="mt-1 h-9 text-sm"
                        value={newDriverAadhaar}
                        onChange={(e) => setNewDriverAadhaar(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">PAN</Label>
                      <Input
                        placeholder="ABCDE1234F"
                        className="mt-1 h-9 text-sm"
                        value={newDriverPan}
                        onChange={(e) => setNewDriverPan(e.target.value)}
                      />
                    </div>
                  </div>
                  <Separator />
                  <p className="text-xs font-medium text-muted-foreground">
                    Bank Settlement Details
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Bank Name</Label>
                      <Input
                        placeholder="SBI"
                        className="mt-1 h-9 text-sm"
                        value={newDriverBankName}
                        onChange={(e) => setNewDriverBankName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Account No.</Label>
                      <Input
                        placeholder="12345678901"
                        className="mt-1 h-9 text-sm"
                        value={newDriverAccountNo}
                        onChange={(e) => setNewDriverAccountNo(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">IFSC Code</Label>
                    <Input
                      placeholder="SBIN0001234"
                      className="mt-1 h-9 text-sm"
                      value={newDriverIfsc}
                      onChange={(e) => setNewDriverIfsc(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline" size="sm">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-[#0a192f] to-[#1d3461]"
                    onClick={handleSaveDriver}
                    disabled={isSavingDriver || !newDriverName || !newDriverPhone || !newDriverDl}
                  >
                    {isSavingDriver ? "Saving..." : "Save Driver"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Driver Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredDrivers.map((driver) => (
              <Card
                key={driver._id || driver.id}
                className="shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
                onClick={() => setSelectedDriver(driver)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {driver.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-heading font-semibold text-sm">
                          {driver.name}
                        </h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {driver.phone}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px]",
                        getStatusColor(driver.status)
                      )}
                    >
                      {driver.status}
                    </Badge>
                  </div>
                  <Separator className="my-2" />
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-muted/50 rounded-lg">
                      <p className="text-[10px] text-muted-foreground">DL</p>
                      <p className="text-[10px] font-mono font-medium truncate">
                        {driver.dl.slice(-6)}
                      </p>
                    </div>
                    <div className="p-2 bg-muted/50 rounded-lg">
                      <p className="text-[10px] text-muted-foreground">
                        Aadhaar
                      </p>
                      <p className="text-[10px] font-mono font-medium">
                        ****{driver.aadhaar.slice(-4)}
                      </p>
                    </div>
                    <div className="p-2 bg-muted/50 rounded-lg">
                      <p className="text-[10px] text-muted-foreground">PAN</p>
                      <p className="text-[10px] font-mono font-medium">
                        {driver.pan}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Building className="w-3 h-3" />
                    <span>
                      {driver.bankName} · ****{driver.accountNo.slice(-4)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Truck Detail Dialog */}
      <Dialog open={!!selectedTruck} onOpenChange={() => setSelectedTruck(null)}>
        <DialogContent className="max-w-lg">
          {selectedTruck && (
            <>
              <DialogHeader>
                <DialogTitle className="font-heading flex items-center gap-2">
                  <Truck className="w-5 h-5" /> {selectedTruck.vehicleNo}
                </DialogTitle>
                <DialogDescription>
                  {selectedTruck.type} · {selectedTruck.capacity}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      getStatusColor(selectedTruck.status)
                    )}
                  >
                    {selectedTruck.status}
                  </Badge>
                  <Button variant="outline" size="sm" className="gap-1 text-xs">
                    <Edit className="w-3 h-3" /> Edit
                  </Button>
                </div>
                <Separator />
                <h4 className="font-heading font-semibold text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Digital Vault
                </h4>
                <div className="space-y-2">
                  {selectedTruck.documents.map((doc) => (
                    <div
                      key={doc.type}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {getDocStatusIcon(doc.status)}
                        <div>
                          <p className="text-sm font-medium">{doc.type}</p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {doc.number}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px]",
                            getStatusColor(doc.status)
                          )}
                        >
                          {doc.status}
                        </Badge>
                        <p className="text-[10px] text-muted-foreground mt-1">
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
                    className="flex items-center gap-2 text-sm text-sky-500 hover:text-sky-600 p-3 bg-sky-50 rounded-lg"
                  >
                    <MapPin className="w-4 h-4" /> Live GPS Telemetry{" "}
                    <ExternalLink className="w-3 h-3 ml-auto" />
                  </a>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Driver Detail Dialog */}
      <Dialog
        open={!!selectedDriver}
        onOpenChange={() => setSelectedDriver(null)}
      >
        <DialogContent className="max-w-lg">
          {selectedDriver && (
            <>
              <DialogHeader>
                <DialogTitle className="font-heading flex items-center gap-2">
                  <Users className="w-5 h-5" /> {selectedDriver.name}
                </DialogTitle>
                <DialogDescription>
                  {selectedDriver.phone}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs",
                    getStatusColor(selectedDriver.status)
                  )}
                >
                  {selectedDriver.status}
                </Badge>
                <Separator />
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Driving License
                    </p>
                    <p className="text-sm font-mono font-medium mt-1">
                      {selectedDriver.dl}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Exp: {formatDate(selectedDriver.dlExpiry)}
                    </p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Aadhaar Number
                    </p>
                    <p className="text-sm font-mono font-medium mt-1">
                      {selectedDriver.aadhaar}
                    </p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      PAN Card
                    </p>
                    <p className="text-sm font-mono font-medium mt-1">
                      {selectedDriver.pan}
                    </p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Status
                    </p>
                    <p className="text-sm font-medium mt-1">
                      {selectedDriver.status}
                    </p>
                  </div>
                </div>
                <Separator />
                <h4 className="font-heading font-semibold text-sm flex items-center gap-2">
                  <CreditCard className="w-4 h-4" /> Bank Settlement Details
                </h4>
                <div className="p-3 bg-muted/50 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Bank</span>
                    <span className="font-medium">
                      {selectedDriver.bankName}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Account No.</span>
                    <span className="font-mono font-medium">
                      {selectedDriver.accountNo}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">IFSC</span>
                    <span className="font-mono font-medium">
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

// ========================================
// Veltrix Group — Mock Data & Types
// ========================================

// --- Type Definitions ---

export interface TruckDocument {
  type: "RC" | "Insurance" | "Fitness" | "Permit" | "PUC";
  number: string;
  expiryDate: string;
  status: "Valid" | "Expired" | "Expiring Soon";
  fileUrl?: string;
}

export interface TruckData {
  id: string;
  vehicleNo: string;
  type: "Trailer" | "Tanker" | "Tipper" | "Container";
  capacity: string;
  status: "Active" | "In Transit" | "Maintenance" | "Idle";
  driver?: string;
  documents: TruckDocument[];
  gpsLink?: string;
}

export interface DriverData {
  id: string;
  name: string;
  phone: string;
  dl: string;
  dlExpiry: string;
  aadhaar: string;
  pan: string;
  bankName: string;
  accountNo: string;
  ifsc: string;
  status: "Available" | "On Trip" | "On Leave";
}

export interface TripExpense {
  id: string;
  category:
    | "Fuel"
    | "Toll"
    | "Driver Advance"
    | "Loading"
    | "Unloading"
    | "Repair"
    | "RTO"
    | "Other";
  amount: number;
  description: string;
  date: string;
}

export interface TripData {
  id: string;
  vehicleNo: string;
  truckId: string;
  driverId: string;
  driverName: string;
  origin: string;
  destination: string;
  consignment: string;
  material: string;
  freightRate: number;
  quantity: number;
  totalFare: number;
  advance: number;
  pendingBalance: number;
  paymentStatus: "Pending" | "Partial" | "Complete";
  tripStatus: "Planned" | "In Transit" | "Delivered" | "Completed";
  startDate: string;
  endDate?: string;
  expenses: TripExpense[];
  totalExpenses: number;
  netProfit: number;
  documents: {
    lrCopy?: string;
    invoice?: string;
    pod?: string;
    paymentReceipt?: string;
  };
}

export interface LedgerEntry {
  id: string;
  date: string;
  type: "Income" | "Expense";
  category: string;
  description: string;
  amount: number;
  vehicleNo?: string;
  tripId?: string;
  consignment?: string;
  paymentMode: "UPI" | "Bank Transfer" | "Cash" | "Cheque";
  reference?: string;
}

// --- Mock Trucks ---

export const trucks: TruckData[] = [
  {
    id: "TRK-001",
    vehicleNo: "JH 05 AB 1234",
    type: "Trailer",
    capacity: "35 Tons",
    status: "In Transit",
    driver: "Rajesh Kumar",
    gpsLink: "https://maps.google.com",
    documents: [
      { type: "RC", number: "JH05-RC-2024-1234", expiryDate: "2027-03-15", status: "Valid" },
      { type: "Insurance", number: "INS-TT-00456", expiryDate: "2025-08-20", status: "Expiring Soon" },
      { type: "Fitness", number: "FIT-JH-2024-789", expiryDate: "2026-12-01", status: "Valid" },
      { type: "Permit", number: "NP-JH-2024-5678", expiryDate: "2027-06-30", status: "Valid" },
      { type: "PUC", number: "PUC-JH-05-1234", expiryDate: "2025-06-15", status: "Expired" },
    ],
  },
  {
    id: "TRK-002",
    vehicleNo: "JH 10 CD 5678",
    type: "Tanker",
    capacity: "24 KL",
    status: "Active",
    driver: "Sunil Sharma",
    gpsLink: "https://maps.google.com",
    documents: [
      { type: "RC", number: "JH10-RC-2023-5678", expiryDate: "2026-09-10", status: "Valid" },
      { type: "Insurance", number: "INS-TN-00789", expiryDate: "2026-11-05", status: "Valid" },
      { type: "Fitness", number: "FIT-JH-2023-456", expiryDate: "2025-07-20", status: "Expiring Soon" },
      { type: "Permit", number: "NP-JH-2023-9012", expiryDate: "2026-08-15", status: "Valid" },
      { type: "PUC", number: "PUC-JH-10-5678", expiryDate: "2026-12-01", status: "Valid" },
    ],
  },
  {
    id: "TRK-003",
    vehicleNo: "WB 23 EF 9012",
    type: "Tipper",
    capacity: "20 Tons",
    status: "Active",
    driver: "Amit Yadav",
    documents: [
      { type: "RC", number: "WB23-RC-2024-9012", expiryDate: "2027-01-20", status: "Valid" },
      { type: "Insurance", number: "INS-TP-01234", expiryDate: "2026-10-12", status: "Valid" },
      { type: "Fitness", number: "FIT-WB-2024-123", expiryDate: "2027-02-28", status: "Valid" },
      { type: "Permit", number: "NP-WB-2024-3456", expiryDate: "2026-07-31", status: "Valid" },
      { type: "PUC", number: "PUC-WB-23-9012", expiryDate: "2025-05-10", status: "Expired" },
    ],
  },
  {
    id: "TRK-004",
    vehicleNo: "OR 12 GH 3456",
    type: "Container",
    capacity: "40 ft",
    status: "Maintenance",
    documents: [
      { type: "RC", number: "OR12-RC-2022-3456", expiryDate: "2025-11-30", status: "Valid" },
      { type: "Insurance", number: "INS-CN-05678", expiryDate: "2025-06-01", status: "Expired" },
      { type: "Fitness", number: "FIT-OR-2022-789", expiryDate: "2025-04-15", status: "Expired" },
      { type: "Permit", number: "NP-OR-2022-7890", expiryDate: "2025-12-31", status: "Valid" },
      { type: "PUC", number: "PUC-OR-12-3456", expiryDate: "2026-01-20", status: "Valid" },
    ],
  },
  {
    id: "TRK-005",
    vehicleNo: "JH 01 IJ 7890",
    type: "Trailer",
    capacity: "30 Tons",
    status: "In Transit",
    driver: "Manoj Singh",
    gpsLink: "https://maps.google.com",
    documents: [
      { type: "RC", number: "JH01-RC-2024-7890", expiryDate: "2027-05-20", status: "Valid" },
      { type: "Insurance", number: "INS-TT-09012", expiryDate: "2026-09-30", status: "Valid" },
      { type: "Fitness", number: "FIT-JH-2024-012", expiryDate: "2027-01-15", status: "Valid" },
      { type: "Permit", number: "NP-JH-2024-1234", expiryDate: "2027-03-31", status: "Valid" },
      { type: "PUC", number: "PUC-JH-01-7890", expiryDate: "2026-07-10", status: "Valid" },
    ],
  },
  {
    id: "TRK-006",
    vehicleNo: "BR 15 KL 2345",
    type: "Tanker",
    capacity: "20 KL",
    status: "Active",
    driver: "Vikram Patel",
    documents: [
      { type: "RC", number: "BR15-RC-2023-2345", expiryDate: "2026-06-25", status: "Valid" },
      { type: "Insurance", number: "INS-TN-03456", expiryDate: "2026-08-18", status: "Valid" },
      { type: "Fitness", number: "FIT-BR-2023-345", expiryDate: "2025-09-05", status: "Expiring Soon" },
      { type: "Permit", number: "NP-BR-2023-5678", expiryDate: "2026-12-20", status: "Valid" },
      { type: "PUC", number: "PUC-BR-15-2345", expiryDate: "2026-03-01", status: "Valid" },
    ],
  },
  {
    id: "TRK-007",
    vehicleNo: "CG 04 MN 6789",
    type: "Trailer",
    capacity: "32 Tons",
    status: "Idle",
    documents: [
      { type: "RC", number: "CG04-RC-2023-6789", expiryDate: "2026-04-10", status: "Valid" },
      { type: "Insurance", number: "INS-TT-07890", expiryDate: "2025-07-22", status: "Expiring Soon" },
      { type: "Fitness", number: "FIT-CG-2023-678", expiryDate: "2026-08-30", status: "Valid" },
      { type: "Permit", number: "NP-CG-2023-9012", expiryDate: "2026-05-15", status: "Valid" },
      { type: "PUC", number: "PUC-CG-04-6789", expiryDate: "2026-11-01", status: "Valid" },
    ],
  },
  {
    id: "TRK-008",
    vehicleNo: "MH 04 OP 1122",
    type: "Container",
    capacity: "20 ft",
    status: "Active",
    driver: "Deepak Verma",
    gpsLink: "https://maps.google.com",
    documents: [
      { type: "RC", number: "MH04-RC-2024-1122", expiryDate: "2027-02-14", status: "Valid" },
      { type: "Insurance", number: "INS-CN-01122", expiryDate: "2026-10-28", status: "Valid" },
      { type: "Fitness", number: "FIT-MH-2024-112", expiryDate: "2027-04-01", status: "Valid" },
      { type: "Permit", number: "NP-MH-2024-3344", expiryDate: "2027-01-30", status: "Valid" },
      { type: "PUC", number: "PUC-MH-04-1122", expiryDate: "2026-06-15", status: "Valid" },
    ],
  },
];

// --- Mock Drivers ---

export const drivers: DriverData[] = [
  {
    id: "DRV-001",
    name: "Rajesh Kumar",
    phone: "+91 98765 43210",
    dl: "JH-0520190012345",
    dlExpiry: "2028-03-15",
    aadhaar: "4567 8901 2345",
    pan: "BXYPK1234F",
    bankName: "State Bank of India",
    accountNo: "20345678901",
    ifsc: "SBIN0001234",
    status: "On Trip",
  },
  {
    id: "DRV-002",
    name: "Sunil Sharma",
    phone: "+91 87654 32109",
    dl: "JH-1020180067890",
    dlExpiry: "2027-09-20",
    aadhaar: "1234 5678 9012",
    pan: "ADQPS5678G",
    bankName: "Punjab National Bank",
    accountNo: "30456789012",
    ifsc: "PUNB0005678",
    status: "On Trip",
  },
  {
    id: "DRV-003",
    name: "Amit Yadav",
    phone: "+91 76543 21098",
    dl: "WB-2320200034567",
    dlExpiry: "2029-01-10",
    aadhaar: "7890 1234 5678",
    pan: "CFYPA9012H",
    bankName: "Bank of Baroda",
    accountNo: "40567890123",
    ifsc: "BARB0009012",
    status: "Available",
  },
  {
    id: "DRV-004",
    name: "Manoj Singh",
    phone: "+91 65432 10987",
    dl: "JH-0120170089012",
    dlExpiry: "2026-11-25",
    aadhaar: "3456 7890 1234",
    pan: "DGHMS3456J",
    bankName: "ICICI Bank",
    accountNo: "50678901234",
    ifsc: "ICIC0003456",
    status: "On Trip",
  },
  {
    id: "DRV-005",
    name: "Vikram Patel",
    phone: "+91 54321 09876",
    dl: "BR-1520210056789",
    dlExpiry: "2030-05-18",
    aadhaar: "9012 3456 7890",
    pan: "EKWVP7890K",
    bankName: "Union Bank of India",
    accountNo: "60789012345",
    ifsc: "UBIN0007890",
    status: "Available",
  },
  {
    id: "DRV-006",
    name: "Deepak Verma",
    phone: "+91 43210 98765",
    dl: "MH-0420200012345",
    dlExpiry: "2029-08-30",
    aadhaar: "5678 9012 3456",
    pan: "FLXDV1234L",
    bankName: "Axis Bank",
    accountNo: "70890123456",
    ifsc: "UTIB0001234",
    status: "On Trip",
  },
];

// --- Mock Trips ---

export const trips: TripData[] = [
  {
    id: "TRP-2025-001",
    vehicleNo: "JH 05 AB 1234",
    truckId: "TRK-001",
    driverId: "DRV-001",
    driverName: "Rajesh Kumar",
    origin: "Jamshedpur",
    destination: "Kolkata",
    consignment: "Tata Steel Ltd.",
    material: "HR Coils",
    freightRate: 3200,
    quantity: 32,
    totalFare: 102400,
    advance: 50000,
    pendingBalance: 52400,
    paymentStatus: "Partial",
    tripStatus: "In Transit",
    startDate: "2025-06-15",
    expenses: [
      { id: "EXP-001", category: "Fuel", amount: 18000, description: "Diesel - Jamshedpur to Kolkata", date: "2025-06-15" },
      { id: "EXP-002", category: "Toll", amount: 3200, description: "NH toll charges", date: "2025-06-15" },
      { id: "EXP-003", category: "Driver Advance", amount: 5000, description: "Driver advance for trip", date: "2025-06-15" },
    ],
    totalExpenses: 26200,
    netProfit: 76200,
    documents: { lrCopy: "uploaded", invoice: "uploaded" },
  },
  {
    id: "TRP-2025-002",
    vehicleNo: "JH 10 CD 5678",
    truckId: "TRK-002",
    driverId: "DRV-002",
    driverName: "Sunil Sharma",
    origin: "Haldia",
    destination: "Jamshedpur",
    consignment: "Indian Oil Corporation",
    material: "Furnace Oil",
    freightRate: 2800,
    quantity: 24,
    totalFare: 67200,
    advance: 67200,
    pendingBalance: 0,
    paymentStatus: "Complete",
    tripStatus: "Completed",
    startDate: "2025-06-10",
    endDate: "2025-06-12",
    expenses: [
      { id: "EXP-004", category: "Fuel", amount: 14000, description: "Diesel - Haldia to Jamshedpur", date: "2025-06-10" },
      { id: "EXP-005", category: "Toll", amount: 2400, description: "NH toll charges", date: "2025-06-10" },
      { id: "EXP-006", category: "Loading", amount: 1500, description: "Loading charges at Haldia terminal", date: "2025-06-10" },
      { id: "EXP-007", category: "Driver Advance", amount: 3000, description: "Driver advance", date: "2025-06-10" },
    ],
    totalExpenses: 20900,
    netProfit: 46300,
    documents: { lrCopy: "uploaded", invoice: "uploaded", pod: "uploaded", paymentReceipt: "uploaded" },
  },
  {
    id: "TRP-2025-003",
    vehicleNo: "WB 23 EF 9012",
    truckId: "TRK-003",
    driverId: "DRV-003",
    driverName: "Amit Yadav",
    origin: "Durgapur",
    destination: "Rourkela",
    consignment: "SAIL",
    material: "Iron Ore",
    freightRate: 2500,
    quantity: 20,
    totalFare: 50000,
    advance: 0,
    pendingBalance: 50000,
    paymentStatus: "Pending",
    tripStatus: "Planned",
    startDate: "2025-06-22",
    expenses: [],
    totalExpenses: 0,
    netProfit: 50000,
    documents: {},
  },
  {
    id: "TRP-2025-004",
    vehicleNo: "JH 01 IJ 7890",
    truckId: "TRK-005",
    driverId: "DRV-004",
    driverName: "Manoj Singh",
    origin: "Jamshedpur",
    destination: "Chennai",
    consignment: "Tata Motors",
    material: "Auto Parts",
    freightRate: 3800,
    quantity: 28,
    totalFare: 106400,
    advance: 60000,
    pendingBalance: 46400,
    paymentStatus: "Partial",
    tripStatus: "In Transit",
    startDate: "2025-06-14",
    expenses: [
      { id: "EXP-008", category: "Fuel", amount: 32000, description: "Diesel - Jamshedpur to Chennai", date: "2025-06-14" },
      { id: "EXP-009", category: "Toll", amount: 5800, description: "NH toll - multiple states", date: "2025-06-14" },
      { id: "EXP-010", category: "Driver Advance", amount: 8000, description: "Driver advance for long haul", date: "2025-06-14" },
      { id: "EXP-011", category: "Repair", amount: 2500, description: "Tyre puncture repair en route", date: "2025-06-15" },
    ],
    totalExpenses: 48300,
    netProfit: 58100,
    documents: { lrCopy: "uploaded" },
  },
  {
    id: "TRP-2025-005",
    vehicleNo: "BR 15 KL 2345",
    truckId: "TRK-006",
    driverId: "DRV-005",
    driverName: "Vikram Patel",
    origin: "Patna",
    destination: "Jamshedpur",
    consignment: "Adani Wilmar",
    material: "Edible Oil",
    freightRate: 3000,
    quantity: 20,
    totalFare: 60000,
    advance: 60000,
    pendingBalance: 0,
    paymentStatus: "Complete",
    tripStatus: "Delivered",
    startDate: "2025-06-08",
    endDate: "2025-06-10",
    expenses: [
      { id: "EXP-012", category: "Fuel", amount: 12000, description: "Diesel - Patna to Jamshedpur", date: "2025-06-08" },
      { id: "EXP-013", category: "Toll", amount: 1800, description: "NH toll charges", date: "2025-06-08" },
      { id: "EXP-014", category: "Driver Advance", amount: 4000, description: "Driver advance", date: "2025-06-08" },
    ],
    totalExpenses: 17800,
    netProfit: 42200,
    documents: { lrCopy: "uploaded", invoice: "uploaded", pod: "uploaded" },
  },
  {
    id: "TRP-2025-006",
    vehicleNo: "MH 04 OP 1122",
    truckId: "TRK-008",
    driverId: "DRV-006",
    driverName: "Deepak Verma",
    origin: "Mumbai",
    destination: "Pune",
    consignment: "JSW Steel",
    material: "TMT Bars",
    freightRate: 2200,
    quantity: 18,
    totalFare: 39600,
    advance: 20000,
    pendingBalance: 19600,
    paymentStatus: "Partial",
    tripStatus: "Completed",
    startDate: "2025-06-05",
    endDate: "2025-06-06",
    expenses: [
      { id: "EXP-015", category: "Fuel", amount: 6000, description: "Diesel - Mumbai to Pune", date: "2025-06-05" },
      { id: "EXP-016", category: "Toll", amount: 800, description: "Expressway toll", date: "2025-06-05" },
      { id: "EXP-017", category: "Loading", amount: 1200, description: "Loading at JSW warehouse", date: "2025-06-05" },
      { id: "EXP-018", category: "Unloading", amount: 1000, description: "Unloading at Pune site", date: "2025-06-06" },
    ],
    totalExpenses: 9000,
    netProfit: 30600,
    documents: { lrCopy: "uploaded", invoice: "uploaded", pod: "uploaded", paymentReceipt: "uploaded" },
  },
  {
    id: "TRP-2025-007",
    vehicleNo: "JH 05 AB 1234",
    truckId: "TRK-001",
    driverId: "DRV-001",
    driverName: "Rajesh Kumar",
    origin: "Kolkata",
    destination: "Jamshedpur",
    consignment: "Vedanta Ltd.",
    material: "Zinc Ingots",
    freightRate: 3500,
    quantity: 30,
    totalFare: 105000,
    advance: 105000,
    pendingBalance: 0,
    paymentStatus: "Complete",
    tripStatus: "Completed",
    startDate: "2025-05-28",
    endDate: "2025-05-30",
    expenses: [
      { id: "EXP-019", category: "Fuel", amount: 16000, description: "Diesel - Kolkata to Jamshedpur", date: "2025-05-28" },
      { id: "EXP-020", category: "Toll", amount: 2800, description: "NH toll charges", date: "2025-05-28" },
      { id: "EXP-021", category: "Driver Advance", amount: 5000, description: "Driver advance", date: "2025-05-28" },
    ],
    totalExpenses: 23800,
    netProfit: 81200,
    documents: { lrCopy: "uploaded", invoice: "uploaded", pod: "uploaded", paymentReceipt: "uploaded" },
  },
  {
    id: "TRP-2025-008",
    vehicleNo: "WB 23 EF 9012",
    truckId: "TRK-003",
    driverId: "DRV-003",
    driverName: "Amit Yadav",
    origin: "Rourkela",
    destination: "Visakhapatnam",
    consignment: "RINL Steel",
    material: "Billets",
    freightRate: 3600,
    quantity: 20,
    totalFare: 72000,
    advance: 35000,
    pendingBalance: 37000,
    paymentStatus: "Partial",
    tripStatus: "Completed",
    startDate: "2025-06-01",
    endDate: "2025-06-04",
    expenses: [
      { id: "EXP-022", category: "Fuel", amount: 22000, description: "Diesel - Rourkela to Vizag", date: "2025-06-01" },
      { id: "EXP-023", category: "Toll", amount: 4200, description: "NH toll multiple states", date: "2025-06-01" },
      { id: "EXP-024", category: "Driver Advance", amount: 6000, description: "Driver advance", date: "2025-06-01" },
      { id: "EXP-025", category: "RTO", amount: 500, description: "RTO checkpoint", date: "2025-06-02" },
    ],
    totalExpenses: 32700,
    netProfit: 39300,
    documents: { lrCopy: "uploaded", invoice: "uploaded" },
  },
  {
    id: "TRP-2025-009",
    vehicleNo: "JH 10 CD 5678",
    truckId: "TRK-002",
    driverId: "DRV-002",
    driverName: "Sunil Sharma",
    origin: "Jamshedpur",
    destination: "Haldia",
    consignment: "Tata Chemicals",
    material: "Soda Ash",
    freightRate: 2600,
    quantity: 24,
    totalFare: 62400,
    advance: 30000,
    pendingBalance: 32400,
    paymentStatus: "Partial",
    tripStatus: "In Transit",
    startDate: "2025-06-18",
    expenses: [
      { id: "EXP-026", category: "Fuel", amount: 13000, description: "Diesel - Jamshedpur to Haldia", date: "2025-06-18" },
      { id: "EXP-027", category: "Toll", amount: 2200, description: "NH toll charges", date: "2025-06-18" },
    ],
    totalExpenses: 15200,
    netProfit: 47200,
    documents: { lrCopy: "uploaded" },
  },
  {
    id: "TRP-2025-010",
    vehicleNo: "MH 04 OP 1122",
    truckId: "TRK-008",
    driverId: "DRV-006",
    driverName: "Deepak Verma",
    origin: "Pune",
    destination: "Nagpur",
    consignment: "Ultratech Cement",
    material: "Cement Bags",
    freightRate: 2000,
    quantity: 18,
    totalFare: 36000,
    advance: 0,
    pendingBalance: 36000,
    paymentStatus: "Pending",
    tripStatus: "Planned",
    startDate: "2025-06-25",
    expenses: [],
    totalExpenses: 0,
    netProfit: 36000,
    documents: {},
  },
];

// --- Mock Ledger ---

export const ledgerEntries: LedgerEntry[] = [
  { id: "LED-001", date: "2025-06-15", type: "Income", category: "Freight Payment", description: "Advance received - Tata Steel (TRP-2025-001)", amount: 50000, vehicleNo: "JH 05 AB 1234", tripId: "TRP-2025-001", consignment: "Tata Steel Ltd.", paymentMode: "Bank Transfer", reference: "NEFT-TSL-2025-0615" },
  { id: "LED-002", date: "2025-06-12", type: "Income", category: "Freight Payment", description: "Full payment - Indian Oil (TRP-2025-002)", amount: 67200, vehicleNo: "JH 10 CD 5678", tripId: "TRP-2025-002", consignment: "Indian Oil Corporation", paymentMode: "Bank Transfer", reference: "NEFT-IOC-2025-0612" },
  { id: "LED-003", date: "2025-06-14", type: "Income", category: "Freight Payment", description: "Advance received - Tata Motors (TRP-2025-004)", amount: 60000, vehicleNo: "JH 01 IJ 7890", tripId: "TRP-2025-004", consignment: "Tata Motors", paymentMode: "UPI", reference: "UPI-TM-0614" },
  { id: "LED-004", date: "2025-06-10", type: "Income", category: "Freight Payment", description: "Full payment - Adani Wilmar (TRP-2025-005)", amount: 60000, vehicleNo: "BR 15 KL 2345", tripId: "TRP-2025-005", consignment: "Adani Wilmar", paymentMode: "Cheque", reference: "CHQ-AW-456789" },
  { id: "LED-005", date: "2025-06-06", type: "Income", category: "Freight Payment", description: "Partial payment - JSW Steel (TRP-2025-006)", amount: 20000, vehicleNo: "MH 04 OP 1122", tripId: "TRP-2025-006", consignment: "JSW Steel", paymentMode: "Cash" },
  { id: "LED-006", date: "2025-05-30", type: "Income", category: "Freight Payment", description: "Full payment - Vedanta (TRP-2025-007)", amount: 105000, vehicleNo: "JH 05 AB 1234", tripId: "TRP-2025-007", consignment: "Vedanta Ltd.", paymentMode: "Bank Transfer", reference: "NEFT-VDT-2025-0530" },
  { id: "LED-007", date: "2025-06-04", type: "Income", category: "Freight Payment", description: "Partial - RINL Steel (TRP-2025-008)", amount: 35000, vehicleNo: "WB 23 EF 9012", tripId: "TRP-2025-008", consignment: "RINL Steel", paymentMode: "Bank Transfer", reference: "NEFT-RINL-0604" },
  { id: "LED-008", date: "2025-06-18", type: "Income", category: "Freight Payment", description: "Advance - Tata Chemicals (TRP-2025-009)", amount: 30000, vehicleNo: "JH 10 CD 5678", tripId: "TRP-2025-009", consignment: "Tata Chemicals", paymentMode: "UPI", reference: "UPI-TC-0618" },
  { id: "LED-009", date: "2025-06-15", type: "Expense", category: "Fuel", description: "Diesel for JH 05 AB 1234 - Jamshedpur to Kolkata", amount: 18000, vehicleNo: "JH 05 AB 1234", tripId: "TRP-2025-001", paymentMode: "Cash" },
  { id: "LED-010", date: "2025-06-10", type: "Expense", category: "Fuel", description: "Diesel for JH 10 CD 5678 - Haldia to Jamshedpur", amount: 14000, vehicleNo: "JH 10 CD 5678", tripId: "TRP-2025-002", paymentMode: "UPI", reference: "UPI-FUEL-0610" },
  { id: "LED-011", date: "2025-06-14", type: "Expense", category: "Fuel", description: "Diesel for JH 01 IJ 7890 - Jamshedpur to Chennai", amount: 32000, vehicleNo: "JH 01 IJ 7890", tripId: "TRP-2025-004", paymentMode: "Cash" },
  { id: "LED-012", date: "2025-06-15", type: "Expense", category: "Toll", description: "Toll charges - Multiple NH routes", amount: 3200, vehicleNo: "JH 05 AB 1234", tripId: "TRP-2025-001", paymentMode: "Cash" },
  { id: "LED-013", date: "2025-06-16", type: "Expense", category: "Office Rent", description: "Monthly office rent - Jamshedpur HQ", amount: 25000, paymentMode: "Bank Transfer", reference: "NEFT-RENT-0616" },
  { id: "LED-014", date: "2025-06-17", type: "Expense", category: "Salary", description: "Staff salary - June first half", amount: 45000, paymentMode: "Bank Transfer", reference: "NEFT-SAL-0617" },
  { id: "LED-015", date: "2025-06-15", type: "Expense", category: "Repair", description: "Engine maintenance - OR 12 GH 3456", amount: 15000, vehicleNo: "OR 12 GH 3456", paymentMode: "Cash" },
];

// --- Dashboard Helper Functions ---

export function getDashboardStats() {
  const totalRevenue = ledgerEntries
    .filter((e) => e.type === "Income")
    .reduce((sum, e) => sum + e.amount, 0);

  const totalExpenses = ledgerEntries
    .filter((e) => e.type === "Expense")
    .reduce((sum, e) => sum + e.amount, 0);

  const netProfit = totalRevenue - totalExpenses;

  const activeTrucks = trucks.filter(
    (t) => t.status === "Active" || t.status === "In Transit"
  ).length;

  const ongoingTrips = trips.filter(
    (t) => t.tripStatus === "In Transit" || t.tripStatus === "Planned"
  ).length;

  const outstandingCollection = trips.reduce(
    (sum, t) => sum + t.pendingBalance,
    0
  );

  return {
    totalRevenue,
    totalExpenses,
    netProfit,
    activeTrucks,
    ongoingTrips,
    outstandingCollection,
  };
}

export function getMonthlyPerformance() {
  return [
    { month: "Jan", income: 380000, expenses: 195000 },
    { month: "Feb", income: 420000, expenses: 210000 },
    { month: "Mar", income: 510000, expenses: 245000 },
    { month: "Apr", income: 475000, expenses: 230000 },
    { month: "May", income: 560000, expenses: 280000 },
    { month: "Jun", income: 490000, expenses: 252000 },
  ];
}

export function getTripById(id: string) {
  return trips.find((t) => t.id === id);
}

export function getTruckById(id: string) {
  return trucks.find((t) => t.id === id);
}

export function getDriverById(id: string) {
  return drivers.find((d) => d.id === id);
}

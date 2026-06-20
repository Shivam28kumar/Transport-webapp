import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "Complete":
    case "Valid":
    case "Active":
    case "Available":
    case "Delivered":
    case "Completed":
      return "bg-emerald-500/15 text-emerald-700 border-emerald-500/20";
    case "Pending":
    case "Planned":
    case "Expiring Soon":
    case "Maintenance":
    case "On Leave":
      return "bg-amber-500/15 text-amber-700 border-amber-500/20";
    case "Partial":
    case "In Transit":
    case "On Trip":
      return "bg-blue-500/15 text-blue-700 border-blue-500/20";
    case "Expired":
    case "Idle":
      return "bg-red-500/15 text-red-700 border-red-500/20";
    default:
      return "bg-gray-500/15 text-gray-700 border-gray-500/20";
  }
}

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date))
}

export function formatCurrency(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount)
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function isOverdue(dueDate: string) {
  return new Date(dueDate) < new Date()
}

export function daysBetween(date1: string | Date, date2: string | Date) {
  const oneDay = 24 * 60 * 60 * 1000
  const firstDate = new Date(date1)
  const secondDate = new Date(date2)
  
  return Math.round(Math.abs((firstDate.getTime() - secondDate.getTime()) / oneDay))
}

export function getStatusColor(status: string) {
  const colors = {
    // Project Status
    ACTIVE: "bg-green-100 text-green-800",
    HOLD: "bg-yellow-100 text-yellow-800",
    COMPLETED: "bg-blue-100 text-blue-800",
    CANCELLED: "bg-red-100 text-red-800",
    
    // Task Status
    TODO: "bg-gray-100 text-gray-800",
    IN_PROGRESS: "bg-blue-100 text-blue-800",
    IN_REVIEW: "bg-yellow-100 text-yellow-800",
    DONE: "bg-green-100 text-green-800",
    
    // Priority
    LOW: "bg-green-100 text-green-800",
    MEDIUM: "bg-yellow-100 text-yellow-800",
    HIGH: "bg-orange-100 text-orange-800",
    URGENT: "bg-red-100 text-red-800",
  };
  
  return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
}

export function getPriorityIcon(priority: string) {
  const icons = {
    LOW: "🔵",
    MEDIUM: "🟡",
    HIGH: "🟠",
    URGENT: "🔴",
  };
  
  return icons[priority as keyof typeof icons] || "⚪";
}
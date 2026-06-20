// Shared client types — mirror the AZIMUTH API contract.

export type Role = "USER" | "ADMIN";

export type VehicleCategory =
  | "SPORT"
  | "GRAND_TOURER"
  | "ROADSTER"
  | "SALOON"
  | "ELECTRIC"
  | "TERRAIN";

export type Transmission =
  | "AUTOMATIC"
  | "MANUAL"
  | "DUAL_CLUTCH"
  | "SINGLE_SPEED";

export type Drivetrain = "AWD" | "RWD" | "FWD";
export type FuelType = "PETROL" | "ELECTRIC" | "HYBRID" | "DIESEL";
export type BookingStatus = "CONFIRMED" | "CANCELLED" | "COMPLETED";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  phone: string | null;
  city: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

export interface Vehicle {
  id: string;
  slug: string;
  make: string;
  model: string;
  year: number;
  category: VehicleCategory;
  tagline: string;
  description: string;
  dailyRate: number;
  seats: number;
  doors: number;
  transmission: Transmission;
  drivetrain: Drivetrain;
  fuelType: FuelType;
  powerHp: number;
  zeroToSixty: number;
  topSpeed: number;
  rangeOrTank: string;
  engine: string;
  color: string;
  features: string[];
  images: string[];
  location: string;
  lat: number;
  lng: number;
  available: boolean;
  featured: boolean;
  isFavorite?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Booking {
  id: string;
  ref: string;
  userId: string;
  vehicleId: string;
  startDate: string;
  endDate: string;
  pickupLocation: string;
  nights: number;
  delivery: boolean;
  concierge: boolean;
  notes: string | null;
  dailyRate: number;
  subtotal: number;
  careFee: number;
  addOnsFee: number;
  total: number;
  status: BookingStatus;
  createdAt: string;
  vehicle?: Vehicle;
  memberName?: string;
  memberEmail?: string;
}

export interface VehicleListResponse {
  vehicles: Vehicle[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  facets: { categories: { category: VehicleCategory; count: number }[] };
}

export interface Analytics {
  totals: {
    vehicles: number;
    activeVehicles: number;
    members: number;
    charters: number;
    revenue: number;
    nights: number;
  };
  byStatus: { status: BookingStatus; count: number }[];
  series: { week: number; count: number }[];
  topVehicles: {
    id: string;
    slug: string;
    name: string;
    image: string | null;
    dailyRate: number;
    bookings: number;
  }[];
  recent: {
    id: string;
    ref: string;
    status: BookingStatus;
    total: number;
    startDate: string;
    endDate: string;
    member: string;
    vehicle: string;
  }[];
}

export interface AdminUser extends User {
  bookings: number;
  favorites: number;
}

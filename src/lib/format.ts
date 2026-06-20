import type {
  BookingStatus,
  Drivetrain,
  FuelType,
  Transmission,
  VehicleCategory,
} from "./types";

export const usd = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);

export const dateLong = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export const dateShort = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

export const toInputDate = (d: Date) => d.toISOString().slice(0, 10);

export const nightsBetween = (start: string, end: string) => {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(0, Math.round(ms / (24 * 60 * 60 * 1000)));
};

// Editorial labels — the collection's own vocabulary
export const CATEGORY_LABELS: Record<VehicleCategory, string> = {
  SPORT: "Sports",
  GRAND_TOURER: "Grand Tourers",
  ROADSTER: "Open Air",
  SALOON: "Saloons",
  ELECTRIC: "The Electric Line",
  TERRAIN: "Terrain",
};

export const CATEGORY_SHORT: Record<VehicleCategory, string> = {
  SPORT: "Sport",
  GRAND_TOURER: "Grand Tourer",
  ROADSTER: "Roadster",
  SALOON: "Saloon",
  ELECTRIC: "Electric",
  TERRAIN: "Terrain",
};

export const TRANSMISSION_LABELS: Record<Transmission, string> = {
  AUTOMATIC: "Automatic",
  MANUAL: "Manual",
  DUAL_CLUTCH: "Dual-clutch",
  SINGLE_SPEED: "Single-speed",
};

export const DRIVETRAIN_LABELS: Record<Drivetrain, string> = {
  AWD: "All-wheel drive",
  RWD: "Rear-wheel drive",
  FWD: "Front-wheel drive",
};

export const FUEL_LABELS: Record<FuelType, string> = {
  PETROL: "Petrol",
  ELECTRIC: "Electric",
  HYBRID: "Hybrid",
  DIESEL: "Diesel",
};

export const STATUS_LABELS: Record<BookingStatus, string> = {
  CONFIRMED: "Confirmed",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
};

// pickup coordinate as a compass bearing string — content, not decoration
export const coordTag = (lat: number, lng: number) => {
  const ns = lat >= 0 ? "N" : "S";
  const ew = lng >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(2)}°${ns} ${Math.abs(lng).toFixed(2)}°${ew}`;
};

// Local mock station data. Replace `loadStations` with a real EV charging API later.
export type Connector = "CCS" | "CHAdeMO" | "Type 2" | "NACS";

export interface Station {
  id: string;
  name: string;
  shortName: string;
  operator: string;
  address: string;
  distanceKm: number;
  driveMin: number;
  available: number;
  total: number;
  powerKw: number;
  waitMin: number;
  pricePerKwh: number;
  rating: number;
  reliability: number; // 0..1 uptime
  connectors: Connector[];
  hours: string;
  recentStatus: string;
  /** Position on the mock map, 0..100 */
  x: number;
  y: number;
}

export const MOCK_STATIONS: Station[] = [
  {
    id: "chargepoint-hub",
    name: "ChargePoint Hub",
    shortName: "ChargePoint",
    operator: "ChargePoint",
    address: "Road No. 36, Jubilee Hills, Hyderabad",
    distanceKm: 4.2,
    driveMin: 8,
    available: 3,
    total: 6,
    powerKw: 150,
    waitMin: 5,
    pricePerKwh: 18,
    rating: 4.7,
    reliability: 0.97,
    connectors: ["CCS", "Type 2", "NACS"],
    hours: "Open 24 hours",
    recentStatus: "All chargers online",
    x: 44,
    y: 42,
  },
  {
    id: "tata-power",
    name: "Tata Power EV Station",
    shortName: "Tata Power",
    operator: "Tata Power EZ Charge",
    address: "Madhapur Main Rd, Hitech City, Hyderabad",
    distanceKm: 6.8,
    driveMin: 14,
    available: 1,
    total: 4,
    powerKw: 60,
    waitMin: 12,
    pricePerKwh: 16,
    rating: 4.4,
    reliability: 0.9,
    connectors: ["CCS", "CHAdeMO", "Type 2"],
    hours: "6:00 – 23:00",
    recentStatus: "1 charger under maintenance",
    x: 58,
    y: 30,
  },
  {
    id: "ather-grid",
    name: "Ather Grid Fast Charge",
    shortName: "Ather Grid",
    operator: "Ather Energy",
    address: "Banjara Hills Rd No. 12, Hyderabad",
    distanceKm: 3.5,
    driveMin: 7,
    available: 0,
    total: 2,
    powerKw: 50,
    waitMin: 25,
    pricePerKwh: 15,
    rating: 4.5,
    reliability: 0.88,
    connectors: ["CCS", "Type 2"],
    hours: "Open 24 hours",
    recentStatus: "Both bays occupied",
    x: 30,
    y: 58,
  },
  {
    id: "shell-recharge",
    name: "Shell Recharge Station",
    shortName: "Shell Recharge",
    operator: "Shell",
    address: "Old Mumbai Hwy, Gachibowli, Hyderabad",
    distanceKm: 9.1,
    driveMin: 18,
    available: 4,
    total: 8,
    powerKw: 180,
    waitMin: 3,
    pricePerKwh: 22,
    rating: 4.6,
    reliability: 0.95,
    connectors: ["CCS", "CHAdeMO", "NACS"],
    hours: "Open 24 hours",
    recentStatus: "All chargers online",
    x: 74,
    y: 22,
  },
  {
    id: "public-ev",
    name: "Public EV Charger",
    shortName: "Public EV",
    operator: "GHMC",
    address: "Kondapur Municipal Parking, Hyderabad",
    distanceKm: 12.4,
    driveMin: 25,
    available: 2,
    total: 3,
    powerKw: 22,
    waitMin: 0,
    pricePerKwh: 9,
    rating: 3.8,
    reliability: 0.78,
    connectors: ["Type 2"],
    hours: "7:00 – 22:00",
    recentStatus: "Slow AC charging only",
    x: 86,
    y: 48,
  },
];

export const VEHICLE_POS = { x: 18, y: 76 };
export const DESTINATION_POS = { x: 82, y: 14 };

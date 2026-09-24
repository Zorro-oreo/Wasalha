export const getPrice = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export type RideType = {
  id: "regular" | "comfort" | "luxury" | "scooter";
  name: string;
  description: string;
  baseFare: number;
  perKmRate: number;
  perMinuteRate: number;
};
export const rideTypes: RideType[] = [
  {
    id: "regular",
    name: "Regular",
    description: "Standard comfort",
    baseFare: 90,
    perKmRate: 2,
    perMinuteRate: 2,
  },
  {
    id: "comfort",
    name: "Comfort",
    description: "Enhanced comfort",
    baseFare: 100,
    perKmRate: 3.5,
    perMinuteRate: 3,
  },
  {
    id: "luxury",
    name: "Luxury",
    description: "Premium experience",
    baseFare: 120,
    perKmRate: 6,
    perMinuteRate: 5,
  },
  {
    id: "scooter",
    name: "Scooter",
    description: "Smaller, Faster",
    baseFare: 55,
    perKmRate: 3,
    perMinuteRate: 2.5,
  },
];

export const estimateDurationMinutes = (distanceKm: number): number => {
  const AVG_CITY_SPEED_KMH = 28;
  return (distanceKm / AVG_CITY_SPEED_KMH) * 60;
};

export const calculateFare = (
  distanceKm: number,
  durationMinutes: number,
  rideType: RideType,
): number => {
  return Math.round(
    rideType.baseFare +
      distanceKm * rideType.perKmRate +
      durationMinutes * rideType.perMinuteRate,
  );
};

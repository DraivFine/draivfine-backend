const RAYON_TERRE_KM = 6371;

interface PointGps {
  latitude: number;
  longitude: number;
}

function versRadians(degres: number): number {
  return (degres * Math.PI) / 180;
}

function distanceHaversineKm(a: PointGps, b: PointGps): number {
  const dLat = versRadians(b.latitude - a.latitude);
  const dLon = versRadians(b.longitude - a.longitude);
  const lat1 = versRadians(a.latitude);
  const lat2 = versRadians(b.latitude);

  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * RAYON_TERRE_KM * Math.asin(Math.sqrt(h));
}

// Distance totale d'un trajet, en sommant la distance haversine entre points
// GPS consécutifs (ordonnés par horodatage).
export function calculerDistanceTrajetKm(points: PointGps[]): number {
  let distanceKm = 0;
  for (let i = 1; i < points.length; i++) {
    distanceKm += distanceHaversineKm(points[i - 1], points[i]);
  }
  return Math.round(distanceKm * 100) / 100;
}

// Snap lat/lng to ~1km grid cells (0.009 degrees ≈ 1km)
const GRID_SIZE = 0.009;

export function getGridCell(lat: number, lng: number): string {
  const cellLat = Math.floor(lat / GRID_SIZE);
  const cellLng = Math.floor(lng / GRID_SIZE);
  return `${cellLat}_${cellLng}`;
}

export function getIntersectingCells(lat: number, lng: number, radiusMeters: number): string[] {
  // Convert radius to degrees (approximate)
  const radiusDeg = radiusMeters / 111000;
  const cellsNeeded = Math.ceil(radiusDeg / GRID_SIZE) + 1;

  const centerCellLat = Math.floor(lat / GRID_SIZE);
  const centerCellLng = Math.floor(lng / GRID_SIZE);

  const cells: string[] = [];
  for (let dLat = -cellsNeeded; dLat <= cellsNeeded; dLat++) {
    for (let dLng = -cellsNeeded; dLng <= cellsNeeded; dLng++) {
      cells.push(`${centerCellLat + dLat}_${centerCellLng + dLng}`);
    }
  }
  return [...new Set(cells)];
}

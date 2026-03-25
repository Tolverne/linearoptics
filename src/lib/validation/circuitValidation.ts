import type { CircuitComponent } from "@/types/simulation";

export function getPhotonCount(occupation: number[]): number {
  return occupation.reduce((sum, n) => sum + n, 0);
}

export function getMaxColumn(components: CircuitComponent[]): number {
  if (components.length === 0) return 0;
  return Math.max(...components.map((c) => c.column));
}

export function sortComponentsForRendering(
  components: CircuitComponent[]
): CircuitComponent[] {
  return [...components].sort((a, b) => {
    if (a.column !== b.column) return a.column - b.column;
    const aRail = "rail" in a ? a.rail : a.rails[0];
    const bRail = "rail" in b ? b.rail : b.rails[0];
    return aRail - bRail;
  });
}

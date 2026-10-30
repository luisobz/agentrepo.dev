export type ReadingSummary = { summary: string; points: string[] };

export function readingSummaryFromJson(value: unknown): ReadingSummary | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value))
    return null;
  if (
    !('summary' in value) ||
    typeof value.summary !== 'string' ||
    !value.summary.trim() ||
    value.summary.length > 1200
  )
    return null;
  if (
    !('points' in value) ||
    !Array.isArray(value.points) ||
    value.points.length > 3
  )
    return null;
  const points: string[] = [];
  for (const point of value.points) {
    if (typeof point !== 'string' || !point.trim() || point.length > 120)
      return null;
    points.push(point);
  }
  return { summary: value.summary, points };
}

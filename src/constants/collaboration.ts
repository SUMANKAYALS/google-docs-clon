export const COLLABORATOR_COLORS = [
  "#1565C0", // Royal Blue
  "#C62828", // Crimson
  "#2E7D32", // Forest Green
  "#6A1B9A", // Deep Purple
  "#EF6C00", // Dark Orange
  "#00838F", // Teal
  "#AD1457", // Rose
  "#4E342E", // Brown
] as const;

export function getRandomColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COLLABORATOR_COLORS.length;
  return COLLABORATOR_COLORS[index];
}

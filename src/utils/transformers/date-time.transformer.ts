function formatSecondToTimeString(second: number): string {
  if (second <= 0) return '00:00'; // If TTL is zero or negative, return "00:00"

  const hours = Math.floor(second / 3600);
  const minutes = Math.floor((second % 3600) / 60);

  // Format as HH:mm
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export const DateTimeTransformer = { formatSecondToTimeString };

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('ja-JP', { style: 'decimal' }).format(value);
}

export function getColorClass(value: number, max: number, min: number): string {
  if (value === max) return 'bg-red-100';
  if (value === min) return 'bg-blue-100';
  
  const range = max - min;
  const normalizedValue = (value - min) / range;
  
  if (normalizedValue < 0.33) return 'bg-blue-50';
  if (normalizedValue > 0.66) return 'bg-red-50';
  return 'bg-yellow-50';
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}


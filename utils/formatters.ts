export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return "-";
  }
  return new Intl.NumberFormat("ja-JP", { style: "decimal" }).format(value);
}

export function getColorClass(value: number | null | undefined, max: number, min: number): string {
  if (value === null || value === undefined || isNaN(value)) {
    return "bg-gray-50 text-gray-500";
  }

  const high = Math.max(max, min);
  const low = Math.min(max, min);

  if (value === high) return "bg-red-100 text-black";
  if (value === low) return "bg-blue-100 text-black";

  const range = high - low;
  if (range === 0) return "bg-gray-50 text-black";

  const normalizedValue = (value - low) / range;

  if (normalizedValue < 0.33) return "bg-blue-50 text-black";
  if (normalizedValue > 0.66) return "bg-red-50 text-black";
  return "bg-yellow-50 text-black";
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "-";

  try {
    return new Date(dateString).toLocaleString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    console.error("日付のフォーマットに失敗しました:", error);
    return dateString;
  }
}

export function formatShortDate(dateString: string | null | undefined): string {
  if (!dateString) return "-";

  try {
    return new Date(dateString).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch (error) {
    console.error("日付のフォーマットに失敗しました:", error);
    return dateString;
  }
}

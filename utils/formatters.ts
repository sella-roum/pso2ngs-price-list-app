export function formatCurrency(value: number): string {
  if (value === null || value === undefined || isNaN(value)) {
    return "-";
  }
  return new Intl.NumberFormat("ja-JP", { style: "decimal" }).format(value);
}

export function getColorClass(value: number, max: number, min: number): string {
  if (value === null || value === undefined || isNaN(value)) {
    return "bg-gray-50 text-gray-500";
  }

  if (value === max) return "bg-red-100 text-black";
  if (value === min) return "bg-blue-100 text-black";

  const range = max - min;
  if (range === 0) return "bg-gray-50 text-black";

  const normalizedValue = (value - min) / range;

  if (normalizedValue < 0.33) return "bg-blue-50 text-black";
  if (normalizedValue > 0.66) return "bg-red-50 text-black";
  return "bg-yellow-50 text-black";
}

export function formatDate(dateString: string): string {
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

export function formatShortDate(dateString: string): string {
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

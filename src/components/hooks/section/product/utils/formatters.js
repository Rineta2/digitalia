import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

export function formatTimeAgo(date) {
  const now = new Date();
  const diffInDays = (now - date) / (1000 * 60 * 60 * 24);

  if (diffInDays < 1) {
    return formatDistanceToNow(date, { addSuffix: true, locale: id }).replace(
      "sekitar ",
      ""
    );
  }
  if (diffInDays < 7) return `${Math.floor(diffInDays)} hari yang lalu`;
  if (diffInDays < 28) return `${Math.floor(diffInDays / 7)} minggu yang lalu`;

  return date
    .toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
    .replace(/ /g, " - ");
}

export function formatNumber(num) {
  if (!num) return "";
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

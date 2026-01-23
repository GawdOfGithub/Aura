import { RelayState } from "../types";

type DateInput = Date | string | number;

const getOrdinalSuffix = (d: number): string => {
  if (d > 3 && d < 21) return "th";
  switch (d % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
};

export const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export function formatTime12hWithDay(inputTime: DateInput): string {
  // Formats a timestamp
  // • Today → "12:45 PM"
  // • Yesterday → "Yesterday, 12:45 PM"
  // • Older → "31st Dec, 12:45 PM"

  const date = new Date(inputTime);

  // Invalid date guard
  if (isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isToday = isSameDay(date, now);
  const isYesterday = isSameDay(date, yesterday);
  // Time formatter
  const hours24 = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");

  const ampm = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;

  const time = `${hours12}:${minutes} ${ampm}`;

  if (isToday) {
    return time;
  }

  if (isYesterday) {
    return `Yesterday, ${time}`;
  }

  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "short" });

  const dayWithSuffix = `${day}${getOrdinalSuffix(day)}`;

  return `${dayWithSuffix} ${month}, ${time}`;
}

export function getElapsedTime(
  inputDate: DateInput,
  relayState: RelayState,
): string {
  if (relayState == "live") {
    return "LIVE";
  }
  const now = Date.now();
  const date = new Date(inputDate).getTime();

  // Invalid date
  if (isNaN(date)) {
    return "";
  }

  let diffInSeconds = Math.floor((now - date) / 1000);

  // Future date
  if (diffInSeconds < 0) {
    return "just now";
  }

  const timeUnits: { label: string; seconds: number }[] = [
    { label: "d", seconds: 86400 },
    { label: "h", seconds: 3600 },
    { label: "m", seconds: 60 },
    { label: "s", seconds: 1 },
  ];

  for (const unit of timeUnits) {
    const value = Math.floor(diffInSeconds / unit.seconds);
    if (value >= 1) {
      return `${value}${unit.label} ago`;
    }
  }

  return "just now";
}

import { differenceInCalendarDays, format, isAfter } from "date-fns";

export type BlockedRange = {
  id: string;
  label: string;
  subSections: string[];
  from: Date;
  to: Date;
};

export function normalizeRange(from: Date, to: Date) {
  return isAfter(from, to) ? { from: to, to: from } : { from, to };
}

export function formatCompactRange(range: BlockedRange) {
  const sameYear = range.from.getFullYear() === range.to.getFullYear();
  const fromFormat = sameYear ? "d MMM" : "d MMM yyyy";
  return `${format(range.from, fromFormat)} - ${format(range.to, "d MMM yyyy")}`;
}

export function countInclusiveDays(from: Date, to: Date) {
  return differenceInCalendarDays(to, from) + 1;
}

export function formatWhatsAppText(ranges: BlockedRange[], messageTitle = "SCHEDULES") {
  if (ranges.length === 0) {
    return "No blocked dates selected yet.";
  }

  const trimmedTitle = messageTitle.trim() || "SCHEDULES";
  const sortedRanges = [...ranges].sort((a, b) => a.from.getTime() - b.from.getTime());
  const lines = [
    trimmedTitle,
    "=".repeat(trimmedTitle.length),
    "Please avoid scheduling on these dates:",
    "",
  ];

  sortedRanges.forEach((range, index) => {
    const days = countInclusiveDays(range.from, range.to);
    lines.push(`${index + 1}. ${range.label}`);
    range.subSections.forEach((subSection) => {
      lines.push(`   - ${subSection}`);
    });
    lines.push(`   From : ${format(range.from, "EEE, d MMM yyyy")}`);
    lines.push(`   To   : ${format(range.to, "EEE, d MMM yyyy")}`);
    lines.push(`   Total: ${days} ${days === 1 ? "day" : "days"}`);
    if (index < sortedRanges.length - 1) {
      lines.push("   ------------------------------");
    }
  });

  lines.push("", "Thank you.");
  return lines.join("\n");
}

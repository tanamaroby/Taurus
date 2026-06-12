import {
  differenceInCalendarDays,
  format,
  isAfter,
  isValid,
  parse,
} from "date-fns";

export type BlockedRange = {
  id: string;
  label: string;
  subSections: string[];
  from: Date;
  to: Date;
};

export type ImportedSchedule = {
  messageTitle: string;
  ranges: BlockedRange[];
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

export function formatWhatsAppText(
  ranges: BlockedRange[],
  messageTitle = "SCHEDULES",
) {
  if (ranges.length === 0) {
    return "No blocked dates selected yet.";
  }

  const trimmedTitle = messageTitle.trim() || "SCHEDULES";
  const sortedRanges = [...ranges].sort(
    (a, b) => a.from.getTime() - b.from.getTime(),
  );
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

function parseScheduleDate(value: string) {
  const parsed = parse(value.trim(), "EEE, d MMM yyyy", new Date());
  if (!isValid(parsed)) {
    throw new Error(`Invalid date: ${value}`);
  }

  return parsed;
}

export function parseWhatsAppText(input: string): ImportedSchedule {
  const normalizedInput = input.replace(/\r\n/g, "\n").trim();

  if (!normalizedInput) {
    throw new Error("Paste the copied Taurus text to import it.");
  }

  const lines = normalizedInput.split("\n");
  if (lines.length < 5) {
    throw new Error("The pasted text is incomplete.");
  }

  const messageTitle = lines[0]?.trim();
  if (!messageTitle) {
    throw new Error("Missing schedule title.");
  }

  if (lines[1]?.trim() !== "=".repeat(messageTitle.length)) {
    throw new Error("This text does not match the Taurus export format.");
  }

  if (lines[2]?.trim() !== "Please avoid scheduling on these dates:") {
    throw new Error("The pasted text is not a supported Taurus export.");
  }

  const bodyLines = lines.slice(4);
  const ranges: BlockedRange[] = [];
  let currentRange: BlockedRange | null = null;

  for (const rawLine of bodyLines) {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    if (
      !trimmed ||
      trimmed === "Thank you." ||
      trimmed === "------------------------------"
    ) {
      continue;
    }

    const labelMatch = trimmed.match(/^\d+\.\s+(.+)$/);
    if (labelMatch) {
      currentRange = {
        id: crypto.randomUUID(),
        label: labelMatch[1].trim(),
        subSections: [],
        from: new Date(),
        to: new Date(),
      };
      ranges.push(currentRange);
      continue;
    }

    if (!currentRange) {
      throw new Error("The pasted text contains range details before a label.");
    }

    const subSectionMatch = trimmed.match(/^-\s+(.+)$/);
    if (subSectionMatch) {
      currentRange.subSections.push(subSectionMatch[1].trim());
      continue;
    }

    const fromMatch = trimmed.match(/^From\s*:\s+(.+)$/);
    if (fromMatch) {
      currentRange.from = parseScheduleDate(fromMatch[1]);
      continue;
    }

    const toMatch = trimmed.match(/^To\s*:\s+(.+)$/);
    if (toMatch) {
      currentRange.to = parseScheduleDate(toMatch[1]);
      continue;
    }

    if (/^Total\s*:\s+\d+\s+days?$/.test(trimmed)) {
      continue;
    }

    throw new Error(`Unsupported line in pasted text: ${trimmed}`);
  }

  if (ranges.length === 0) {
    throw new Error("No blocked ranges were found in the pasted text.");
  }

  ranges.forEach((range) => {
    if (
      Number.isNaN(range.from.getTime()) ||
      Number.isNaN(range.to.getTime())
    ) {
      throw new Error(`Range \"${range.label}\" is missing dates.`);
    }

    const normalized = normalizeRange(range.from, range.to);
    range.from = normalized.from;
    range.to = normalized.to;
  });

  return {
    messageTitle,
    ranges,
  };
}

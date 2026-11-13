/**
 * Name formatting utilities for GAMAT FX Academy.
 *
 * Rules:
 * 1. Always begin names with a capital letter (proper title case).
 * 2. Only use first name and surname (last name) throughout the website,
 *    even when a student provides a middle name in their profile.
 * 3. On the official Affiliate Card, names must always be in capital letters (ALL CAPS / UPPERCASE).
 */

/**
 * Capitalizes a single name word/token, handling hyphenated or apostrophe names.
 * e.g. "james" -> "James", "SMITH" -> "Smith", "mary-jane" -> "Mary-Jane", "o'connor" -> "O'Connor".
 */
export function capitalizeWord(word: string): string {
  if (!word) return "";
  return word
    .split("-")
    .map((hyphenPart) => {
      if (!hyphenPart) return "";
      return hyphenPart
        .split("'")
        .map((part) => {
          if (!part) return "";
          return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
        })
        .join("'");
    })
    .join("-");
}

/**
 * Formats a raw student name string so that:
 * - Only first name and surname (the last word) are kept (strips any middle name).
 * - Both first name and surname always begin with a capital letter.
 *
 * Examples:
 * - "james smith" -> "James Smith"
 * - "james michael smith" -> "James Smith"
 * - "tonye s. taylor" -> "Tonye Taylor"
 * - "david oluwaseun alabi" -> "David Alabi"
 * - "kelechi" -> "Kelechi"
 * - "MARY-JANE WATSON" -> "Mary-Jane Watson"
 */
export function formatStudentName(rawName?: string | null): string {
  if (!rawName) return "";
  const parts = rawName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return capitalizeWord(parts[0]);

  const firstName = capitalizeWord(parts[0]);
  const surname = capitalizeWord(parts[parts.length - 1]);
  return `${firstName} ${surname}`;
}

/**
 * Formats a student's name from an account object.
 * Explicitly ignores middleName even if provided in the profile.
 * Returns only first name and surname, capitalized.
 */
export function formatAccountName(acc?: {
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
  nickname?: string | null;
} | null): string {
  if (!acc) return "";
  if (acc.nickname?.trim()) {
    return formatStudentName(acc.nickname);
  }
  const first = capitalizeWord(acc.firstName?.trim() || "");
  const last = capitalizeWord(acc.lastName?.trim() || "");
  if (first && last) return `${first} ${last}`;
  return first || last || "";
}

/**
 * Formats a student's name specifically for the official Affiliate Card.
 * Enforces first name and surname only, rendered in ALL CAPITAL LETTERS.
 * e.g. "james michael smith" -> "JAMES SMITH".
 */
export function formatAffiliateCardName(rawName?: string | null): string {
  if (!rawName) return "STUDENT TRADER";
  const formatted = formatStudentName(rawName);
  return (formatted || "STUDENT TRADER").toUpperCase();
}

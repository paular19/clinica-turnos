import { customAlphabet } from "nanoid";
import { parseISO as _parseISO, format as _format } from "date-fns";

export function sanitizeString(s: string): string {
  if (!s) return s;
  // Remove control characters except newline, trim spaces
  return s.replace(/[\x00-\x09\x0B-\x1F\x7F]/g, "").trim();
}

const nano = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ", 8);
export function genCodigo(): string {
  return nano();
}

export function parseISO(dateStr: string): Date {
  return _parseISO(dateStr);
}

export function formatDate(date: Date, pattern = "yyyy-MM-dd HH:mm") {
  return _format(date, pattern);
}

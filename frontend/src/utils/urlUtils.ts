/**
 * Utility functions for URL validation and short URL resolution
 */

const RESERVED_SHORT_DOMAIN = (
  process.env.NEXT_PUBLIC_SHORT_DOMAIN || ""
).replace(/\/$/, "");

/**
 * Resolves a short code to its full URL
 */
export const resolveShortUrl = (code: string): string => {
  if (typeof window === "undefined") {
    return `${RESERVED_SHORT_DOMAIN}/${code}`.replace(/^\/+/, "");
  }
  const base = RESERVED_SHORT_DOMAIN || window.location.origin;
  return `${base.replace(/\/$/, "")}/${code}`;
};

/**
 * Validates a URL string
 * @returns Error message if invalid, null if valid
 */
export const validateUrl = (value: string): string | null => {
  const trimmed = value.trim();
  if (!trimmed) {
    return "Please enter a URL.";
  }
  try {
    const parsed = new URL(trimmed);
    if (!parsed.protocol.startsWith("http")) {
      return "URL must start with http or https.";
    }
    return null;
  } catch {
    return "Enter a valid URL (including http/https).";
  }
};


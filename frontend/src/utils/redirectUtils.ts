const FALLBACK_TARGET = "http://localhost:8080";

export const getRedirectBase = () => {
  if (typeof window === "undefined") {
    return (
      process.env.NEXT_PUBLIC_SHORT_DOMAIN ||
      process.env.NEXT_PUBLIC_API_URL ||
      FALLBACK_TARGET
    );
  }

  return (
    process.env.NEXT_PUBLIC_SHORT_DOMAIN ||
    process.env.NEXT_PUBLIC_API_URL ||
    FALLBACK_TARGET
  );
};


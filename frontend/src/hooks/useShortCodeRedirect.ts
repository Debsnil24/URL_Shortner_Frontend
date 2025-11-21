import { getRedirectBase } from "@/utils/redirectUtils";
import { useEffect, useMemo, useRef, useState } from "react";

export type LinkStatus = "checking" | "active" | "expired" | "paused" | "notfound" | "error";

interface UseShortCodeRedirectOptions {
  code: string;
  onRedirect?: (target: string) => void;
}

export function useShortCodeRedirect({ code, onRedirect }: UseShortCodeRedirectOptions) {
  const baseUrl = useMemo(() => getRedirectBase().replace(/\/$/, ""), []);
  const [linkStatus, setLinkStatus] = useState<LinkStatus>("checking");
  const hasCheckedRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isRedirectingRef = useRef(false);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!code || hasCheckedRef.current) return;
    hasCheckedRef.current = true;

    const checkAndRedirect = async () => {
      setLinkStatus("checking");

      // Create abort controller for cleanup
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      // Clear any existing timeout before setting a new one
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }

      // Set up timeout
      timeoutIdRef.current = setTimeout(() => {
        if (!abortController.signal.aborted) {
          abortController.abort();
        }
      }, 5000); // 5 second timeout

      try {
        // Use HEAD request to check link status with timeout
        const checkResponse = await fetch(`${baseUrl}/${encodeURIComponent(code)}`, {
          method: "HEAD",
          credentials: "include",
          signal: abortController.signal,
        });

        if (timeoutIdRef.current) {
          clearTimeout(timeoutIdRef.current);
          timeoutIdRef.current = null;
        }

        // Check if we're already redirecting (component might unmount)
        if (isRedirectingRef.current) {
          return;
        }

        if (checkResponse.status === 410) {
          // Link is expired or paused - make GET request to get error message
          try {
            const errorResponse = await fetch(`${baseUrl}/${encodeURIComponent(code)}`, {
              method: "GET",
              credentials: "include",
              signal: abortController.signal,
            });
            if (errorResponse.status === 410) {
              const errorData = await errorResponse.json();
              if (errorData.error === "Link is paused") {
                setLinkStatus("paused");
              } else {
                setLinkStatus("expired");
              }
            } else {
              setLinkStatus("expired");
            }
          } catch {
            setLinkStatus("expired");
          }
          return;
        } else if (checkResponse.status === 404) {
          // Link not found
          if (isRedirectingRef.current) return;
          setLinkStatus("notfound");
          return;
        } else if (checkResponse.status >= 200 && checkResponse.status < 400) {
          // Link is active, proceed with redirect
          isRedirectingRef.current = true;
          setLinkStatus("active");
          // Small delay to allow any pending state updates to complete
          await new Promise((resolve) => setTimeout(resolve, 100));
          const target = `${baseUrl}/${code}`;
          if (onRedirect) {
            onRedirect(target);
          } else {
            window.location.replace(target);
          }
          return;
        } else {
          // Unknown status, try to redirect anyway (fallback)
          if (isRedirectingRef.current) return;
          isRedirectingRef.current = true;
          setLinkStatus("active");
          await new Promise((resolve) => setTimeout(resolve, 100));
          const target = `${baseUrl}/${code}`;
          if (onRedirect) {
            onRedirect(target);
          } else {
            window.location.replace(target);
          }
        }
      } catch (error) {
        // Clear timeout on error
        if (timeoutIdRef.current) {
          clearTimeout(timeoutIdRef.current);
          timeoutIdRef.current = null;
        }

        // If check fails, try to redirect anyway (fallback)
        if (error instanceof Error && error.name === "AbortError") {
          // Request was aborted, don't redirect
          setLinkStatus("error");
          return;
        }
        console.error("Failed to check link status:", error);
        if (isRedirectingRef.current) return;
        isRedirectingRef.current = true;
        setLinkStatus("active");
        await new Promise((resolve) => setTimeout(resolve, 100));
        const target = `${baseUrl}/${code}`;
        if (onRedirect) {
          onRedirect(target);
        } else {
          window.location.replace(target);
        }
      }
    };

    void checkAndRedirect();

    return () => {
      // Cleanup: abort any pending request if component unmounts
      if (abortControllerRef.current && !abortControllerRef.current.signal.aborted) {
        abortControllerRef.current.abort();
      }
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
    };
  }, [baseUrl, code, onRedirect]);

  return {
    linkStatus,
    baseUrl,
  };
}


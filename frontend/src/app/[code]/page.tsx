"use client";

import { use, useEffect, useMemo, useState, useRef } from "react";
import { Spinner } from "@heroui/react";

const FALLBACK_TARGET = "http://localhost:8080";

const getRedirectBase = () => {
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

type ParamsPromise = Promise<{ code: string }>;

type LinkStatus = "checking" | "active" | "expired" | "notfound" | "error";

export default function ShortCodeRedirect({
  params,
}: {
  params: ParamsPromise;
}) {
  const baseUrl = useMemo(() => getRedirectBase().replace(/\/$/, ""), []);
  const { code } = use(params);
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
          // Link is expired or paused
          setLinkStatus("expired");
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
          window.location.replace(target);
          return;
        } else {
          // Unknown status, try to redirect anyway (fallback)
          if (isRedirectingRef.current) return;
          isRedirectingRef.current = true;
          setLinkStatus("active");
          await new Promise((resolve) => setTimeout(resolve, 100));
          const target = `${baseUrl}/${code}`;
          window.location.replace(target);
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
        window.location.replace(target);
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
  }, [baseUrl, code]);

  // Show loading state
  if (linkStatus === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="max-w-md text-center space-y-4 p-6">
          <Spinner size="lg" color="primary" />
          <h1 className="text-2xl font-semibold">Checking link…</h1>
          <p className="text-sm text-gray-300">
            Verifying status for <span className="font-mono">{code}</span>.
          </p>
        </div>
      </div>
    );
  }

  // Show expired page
  if (linkStatus === "expired") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="max-w-md text-center space-y-4 p-6">
          <div className="text-6xl mb-4">⏰</div>
          <h1 className="text-2xl font-semibold">Link Expired</h1>
          <p className="text-sm text-gray-300">
            This short link has expired and is no longer available.
          </p>
          <p className="text-xs text-gray-500">
            Short code: <span className="font-mono">{code}</span>
          </p>
        </div>
      </div>
    );
  }

  // Show not found page
  if (linkStatus === "notfound") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="max-w-md text-center space-y-4 p-6">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-semibold">Link Not Found</h1>
          <p className="text-sm text-gray-300">
            The short link you're looking for doesn't exist.
          </p>
          <p className="text-xs text-gray-500">
            Short code: <span className="font-mono">{code}</span>
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (linkStatus === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="max-w-md text-center space-y-4 p-6">
          <h1 className="text-2xl font-semibold">Error</h1>
          <p className="text-sm text-gray-300">
            Unable to check link status. Please try again.
          </p>
        </div>
      </div>
    );
  }

  // Fallback: show redirecting message (shouldn't reach here if active)
  const targetUrl = `${baseUrl}/${code}`;
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="max-w-md text-center space-y-4 p-6">
        <h1 className="text-2xl font-semibold">Redirecting…</h1>
        <p className="text-sm text-gray-300">
          Sending you to the destination for <span className="font-mono">{code}</span>.
        </p>
        <p className="text-xs text-gray-500">
          If you are not redirected automatically,{" "}
          <a className="underline" href={targetUrl}>
            click here
          </a>
          .
        </p>
      </div>
    </div>
  );
}

"use client";

import { use } from "react";
import { Spinner } from "@heroui/react";
import { useShortCodeRedirect } from "@/hooks/useShortCodeRedirect";

type ParamsPromise = Promise<{ code: string }>;

export default function ShortCodeRedirect({
  params,
}: {
  params: ParamsPromise;
}) {
  const { code } = use(params);
  const { linkStatus, baseUrl } = useShortCodeRedirect({ code });

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

  // Show paused page
  if (linkStatus === "paused") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="max-w-md text-center space-y-4 p-6">
          <div className="text-6xl mb-4">⏸️</div>
          <h1 className="text-2xl font-semibold">Link Paused</h1>
          <p className="text-sm text-gray-300">
            This short link is currently paused and unavailable.
          </p>
          <p className="text-xs text-gray-500">
            Short code: <span className="font-mono">{code}</span>
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

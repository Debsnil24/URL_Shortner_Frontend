"use client";

import { use, useEffect, useMemo } from "react";

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

export default function ShortCodeRedirect({
  params,
}: {
  params: ParamsPromise;
}) {
  const baseUrl = useMemo(() => getRedirectBase().replace(/\/$/, ""), []);
  const { code } = use(params);

  useEffect(() => {
    if (!code) return;

    const target = `${baseUrl}/${code}`;
    const timeoutId = window.setTimeout(() => {
      window.location.replace(target);
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [baseUrl, code]);

  const targetUrl = `${baseUrl}/${code}`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="max-w-md text-center space-y-4 p-6">
        <h1 className="text-2xl font-semibold">Redirecting…</h1>
        <p className="text-sm text-gray-300">
          Sending you to the destination for <span className="font-mono">{code}</span>.
        </p>
        <p className="text-xs text-gray-500">
          If you are not redirected automatically, <a className="underline" href={targetUrl}>click here</a>.
        </p>
      </div>
    </div>
  );
}

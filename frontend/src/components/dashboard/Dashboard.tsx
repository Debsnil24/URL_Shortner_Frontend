"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { useStore } from "@/store/useStore";
import { apiService, ShortUrl, UrlStats } from "@/services/api";
import { authToasts, toastBus } from "@/utils/toastUtils";
import {
  addToast,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Spinner,
  User,
} from "@heroui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";

interface StatsState {
  loading: boolean;
  error?: string;
  data?: UrlStats;
}

const RESERVED_SHORT_DOMAIN = (process.env.NEXT_PUBLIC_SHORT_DOMAIN || "").replace(/\/$/, "");

const resolveShortUrl = (code: string) => {
  if (typeof window === "undefined") {
    return `${RESERVED_SHORT_DOMAIN}/${code}`.replace(/^\/+/, "");
  }
  const base = RESERVED_SHORT_DOMAIN || window.location.origin;
  return `${base.replace(/\/$/, "")}/${code}`;
};

const mapApiErrorMessage = (message: string, code?: string) => {
  if (!code) return message;
  switch (code) {
    case "AUTH_401":
      return "Authentication required. Please sign in again.";
    case "HTTP_403":
      return message || "You do not have permission to perform this action.";
    case "HTTP_404":
      return message || "Short link not found.";
    case "HTTP_410":
      return message || "This short link has expired.";
    case "NETWORK_ERROR":
      return message || "Network error. Please try again.";
    default:
      return message;
  }
};

export default function Dashboard() {
  const { user, isAuthenticated } = useStore();
  const { logout } = useAuth();
  const [links, setLinks] = useState<ShortUrl[]>([]);
  const [linksLoading, setLinksLoading] = useState(true);
  const [linksError, setLinksError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newUrlError, setNewUrlError] = useState<string | null>(null);
  const [deletingCode, setDeletingCode] = useState<string | null>(null);
  const [expandedCode, setExpandedCode] = useState<string | null>(null);
  const [statsState, setStatsState] = useState<Record<string, StatsState>>({});

  useEffect(() => {
    const handleAuthSuccess = (
      type: "login" | "signup" | "oauth",
      firstName?: string
    ) => {
      if (type === "login") authToasts.loginSuccess();
      if (type === "signup") authToasts.signupSuccess(firstName ?? "");
      if (type === "oauth") authToasts.googleAuthSuccess();
    };

    const payload = toastBus.popAuthSuccess();
    if (payload) {
      handleAuthSuccess(payload.type, payload.firstName);
    }

    const unsubscribe = toastBus.subscribe((event) => {
      if (event.type !== "authSuccess") return;
      handleAuthSuccess(event.payload.variant, event.payload.firstName);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const fetchLinks = useCallback(async () => {
    if (!isAuthenticated) {
      setLinks([]);
      setLinksLoading(false);
      return;
    }
    setLinksLoading(true);
    setLinksError(null);

    const response = await apiService.listShortUrls();
    if (response.success && response.data) {
      setLinks(response.data);
    } else {
      const message = mapApiErrorMessage(
        response.message,
        response.error?.code
      );
      setLinksError(message);
      addToast({
        title: "Unable to load links",
        description: message,
        color: "danger",
      });
    }
    setLinksLoading(false);
  }, [isAuthenticated]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const totalLinks = useMemo(() => links.length, [links]);
  const totalClicks = useMemo(
    () => links.reduce((acc, link) => acc + (link.click_count || 0), 0),
    [links]
  );
  const activeLinks = totalLinks; // Placeholder: backend does not expose "inactive" state yet

  const validateUrl = (value: string) => {
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

  const handleCreateLink = async () => {
    const error = validateUrl(newUrl);
    setNewUrlError(error);
    if (error) return;

    setCreating(true);
    const response = await apiService.createShortUrl({
      url: newUrl.trim(),
    });

    if (response.success && response.data) {
      const createdLink = response.data;
      addToast({
        title: "Short link created",
        description: `${createdLink.shortened_url ?? resolveShortUrl(createdLink.short_code)}`,
        color: "success",
      });
      setNewUrl("");
      setStatsState((prev) => ({
        ...prev,
        [createdLink.short_code]: { loading: false },
      }));
      fetchLinks();
    } else {
      const message = mapApiErrorMessage(
        response.message,
        response.error?.code
      );
      addToast({
        title: "Unable to create link",
        description: message,
        color: "danger",
      });
    }

    setCreating(false);
  };

  const handleDeleteLink = async (code: string) => {
    setDeletingCode(code);
    const response = await apiService.deleteShortUrl(code);
    if (response.success) {
      addToast({
        title: "Short link deleted",
        description: `${code} has been removed`,
        color: "success",
      });
      setLinks((prev) => prev.filter((link) => link.short_code !== code));
      setStatsState((prev) => {
        const next = { ...prev };
        delete next[code];
        return next;
      });
      if (expandedCode === code) {
        setExpandedCode(null);
      }
    } else {
      const message = mapApiErrorMessage(
        response.message,
        response.error?.code
      );
      addToast({
        title: "Unable to delete link",
        description: message,
        color: "danger",
      });
    }
    setDeletingCode(null);
  };

  const loadStats = async (code: string) => {
    setStatsState((prev) => ({
      ...prev,
      [code]: {
        loading: true,
        error: undefined,
        data: prev[code]?.data,
      },
    }));

    const response = await apiService.getShortUrlStats(code);
    if (response.success && response.data) {
      setStatsState((prev) => ({
        ...prev,
        [code]: {
          loading: false,
          data: response.data,
          error: undefined,
        },
      }));
    } else {
      const message = mapApiErrorMessage(
        response.message,
        response.error?.code
      );
      setStatsState((prev) => ({
        ...prev,
        [code]: {
          loading: false,
          data: undefined,
          error: message,
        },
      }));
      addToast({
        title: "Unable to fetch stats",
        description: message,
        color: "warning",
      });
    }
  };

  const toggleStats = (code: string) => {
    setExpandedCode((current) => {
      const nextCode = current === code ? null : code;
      if (nextCode && !statsState[nextCode]?.data && !statsState[nextCode]?.error) {
        void loadStats(nextCode);
      }
      return nextCode;
    });
  };

  const handleCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(resolveShortUrl(code));
      addToast({
        title: "Copied to clipboard",
        description: `Short link for ${code}`,
        color: "success",
      });
    } catch (error) {
      console.error("Clipboard copy failed", error);
      addToast({
        title: "Copy failed",
        description: "Unable to copy the link. Please try again.",
        color: "danger",
      });
    }
  };

  const getInitials = () => {
    const name = user?.name || user?.email?.split("@")[0] || "User";
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      className="font-sans flex flex-col min-h-screen md:min-h-[calc(100vh-85px)]"
      style={{ background: "var(--background)", color: "var(--foreground)" }}
    >
      <div className="flex justify-between items-center p-6 border-b border-gray-800">
        <div className="flex items-center gap-4">
          <Image
            src="/SNIPLY.svg"
            alt="Sniply Logo"
            width={40}
            height={40}
            className="invert-100"
          />
          <h1 className="text-xl font-semibold text-white">Dashboard</h1>
        </div>

        <div className="flex items-center gap-4">
          <Dropdown className="backdrop-blur-md border border-white/10 shadow-xl bg-gray-500/20">
            <DropdownTrigger>
              <User
                name={user?.name}
                description={user?.email}
                avatarProps={{
                  src: user?.avatar_url,
                  name: getInitials(),
                  showFallback: true,
                }}
              />
            </DropdownTrigger>
            <DropdownMenu>
              <DropdownItem
                color="danger"
                className="text-danger"
                key="logout"
                onClick={logout}
                startContent={<Icon icon="mdi:logout" className="w-4 h-4" />}
              >
                Log Out
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>

      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto flex flex-col gap-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[{
              label: "Total Links",
              value: totalLinks,
              icon: "mdi:link",
              color: "text-blue-500",
            }, {
              label: "Total Clicks",
              value: totalClicks,
              icon: "mdi:cursor-click",
              color: "text-green-500",
            }, {
              label: "Active Links",
              value: activeLinks,
              icon: "mdi:check-circle",
              color: "text-purple-500",
            }].map((card) => (
              <div
                key={card.label}
                className="bg-gray-800/50 rounded-lg p-6 border border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">{card.label}</p>
                    <p className="text-2xl font-bold text-white">{card.value}</p>
                  </div>
                  <Icon icon={card.icon} className={`w-8 h-8 ${card.color}`} />
                </div>
              </div>
            ))}
          </div>

          {isAuthenticated && (
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-4">
                Create a Short Link
              </h2>
              <div className="flex flex-col md:flex-row gap-4">
                <Input
                  type="url"
                  placeholder="https://example.com/very/long/url"
                  value={newUrl}
                  onValueChange={(value) => {
                    setNewUrl(value);
                    if (newUrlError) {
                      setNewUrlError(null);
                    }
                  }}
                  isInvalid={!!newUrlError}
                  errorMessage={newUrlError || undefined}
                  startContent={
                    <Icon icon="mdi:link" className="w-5 h-5 text-gray-700" />
                  }
                  labelPlacement="outside"
                  classNames={{
                    input: ["placeholder:text-xs", "text-black"],
                  }}
                  className="flex-1"
                />
                <Button
                  color="primary"
                  radius="full"
                  isLoading={creating}
                  isDisabled={creating}
                  onPress={handleCreateLink}
                  className="text-md font-semibold"
                  startContent={<Icon icon="mdi:plus" className="w-4 h-4" />}
                >
                  Shorten URL
                </Button>
              </div>
              <p className="text-gray-500 text-xs md:text-sm mt-3">
                Links are tied to your account and can be managed from this dashboard.
              </p>
            </div>
          )}

          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <h2 className="text-xl font-semibold text-white">Your Links</h2>
              <Button
                variant="bordered"
                color="primary"
                startContent={<Icon icon="mdi:refresh" className="w-4 h-4" />}
                onPress={fetchLinks}
                isDisabled={linksLoading}
              >
                Refresh
              </Button>
            </div>

            {linksLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Spinner size="md" color="primary" />
                <p className="text-gray-400 text-sm">Loading your short links...</p>
              </div>
            ) : linksError ? (
              <div className="border border-red-500/40 bg-red-500/10 rounded-lg p-6 text-center">
                <p className="text-red-400 text-sm">{linksError}</p>
              </div>
            ) : links.length === 0 ? (
              <div className="text-center py-12">
                <Icon
                  icon="mdi:link-off"
                  className="w-16 h-16 text-gray-500 mx-auto mb-4"
                />
                <p className="text-gray-400 mb-4">
                  No links created yet. Shorten your first URL to get started.
                </p>
                <Button
                  color="primary"
                  startContent={<Icon icon="mdi:plus" className="w-4 h-4" />}
                  onPress={() => {
                    if (isAuthenticated) {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    } else {
                      addToast({
                        title: "Sign in required",
                        description:
                          "Please sign in to create and manage short links.",
                        color: "warning",
                      });
                    }
                  }}
                >
                  Create Your First Link
                </Button>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-gray-700">
                {links.map((link) => {
                  const stats = statsState[link.short_code];
                  const isExpanded = expandedCode === link.short_code;
                  return (
                    <div key={link.id || link.short_code} className="py-4">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 text-sm text-primary">
                            <a
                              href={resolveShortUrl(link.short_code)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-lg font-semibold text-primary underline break-all"
                            >
                              {resolveShortUrl(link.short_code)}
                            </a>
                            <span className="bg-gray-700/60 px-2 py-0.5 rounded-full text-xs text-gray-300">
                              {link.short_code}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400 truncate mt-1">
                            {link.original_url}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 mt-2">
                            <span className="flex items-center gap-1">
                              <Icon icon="mdi:cursor-default-click" className="w-3.5 h-3.5" />
                              {link.click_count} clicks
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="bordered"
                            className="bg-white/5 text-gray-200 border-gray-600 hover:bg-white/10"
                            startContent={<Icon icon="mdi:content-copy" className="w-4 h-4" />}
                            onPress={() => handleCopy(link.short_code)}
                          >
                            Copy
                          </Button>
                          <Button
                            size="sm"
                            variant="bordered"
                            color="primary"
                            startContent={<Icon icon="mdi:chart-line" className="w-4 h-4" />}
                            onPress={() => toggleStats(link.short_code)}
                          >
                            {isExpanded ? "Hide stats" : "View stats"}
                          </Button>
                          <Button
                            size="sm"
                            color="danger"
                            variant="flat"
                            isLoading={deletingCode === link.short_code}
                            onPress={() => handleDeleteLink(link.short_code)}
                            startContent={<Icon icon="mdi:trash-can" className="w-4 h-4" />}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="mt-4 rounded-lg border border-gray-700 bg-gray-900/50 p-4">
                          {stats?.loading ? (
                            <div className="flex items-center gap-2 text-gray-400 text-sm">
                              <Spinner size="sm" color="primary" />
                              <span>Loading analytics...</span>
                            </div>
                          ) : stats?.error ? (
                            <p className="text-sm text-red-400">{stats.error}</p>
                          ) : stats?.data ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
                              <div>
                                <p className="text-gray-500">Short code</p>
                                <p className="font-semibold text-white">
                                  {stats.data.short_code}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500">Original URL</p>
                                <a
                                  href={stats.data.original_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary underline break-all"
                                >
                                  {stats.data.original_url}
                                </a>
                              </div>
                              <div>
                                <p className="text-gray-500">Total clicks</p>
                                <p className="font-semibold text-white">
                                  {stats.data.click_count}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500">Unique visits</p>
                                <p className="font-semibold text-white">
                                  {stats.data.total_visits}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500">Last visit at</p>
                                <p className="font-semibold text-white">
                                  {stats.data.last_visit_at
                                    ? new Date(stats.data.last_visit_at).toLocaleString()
                                    : "No visits recorded"}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500">Last visitor agent</p>
                                <p className="font-semibold text-white break-words">
                                  {stats.data.last_visit_user_agent || "Unknown"}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <p className="text-gray-400 text-sm">
                              No analytics available yet.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

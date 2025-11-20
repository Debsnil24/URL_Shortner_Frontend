"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { apiService, ShortUrl, UrlStats } from "@/services/api";
import { useStore } from "@/store/useStore";
import { mapApiErrorMessage } from "@/utils/apiUtils";
import { authToasts, toastBus } from "@/utils/toastUtils";
import { resolveShortUrl, validateUrl } from "@/utils/urlUtils";
import {
  addToast,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Spinner,
  User,
} from "@heroui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CreateLinkModal, { ExpirationData } from "./CreateLinkModal";
import LinkListItem from "./LinkListItem";
import StatsCards from "./StatsCards";

interface StatsState {
  loading: boolean;
  error?: string;
  data?: UrlStats;
}

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
  const [isCreateLinkModalOpen, setIsCreateLinkModalOpen] = useState(false);
  const expandedCodeRef = useRef<string | null>(null);

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

  const loadStats = useCallback(async (code: string) => {
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
      // Refresh stats for any currently expanded panels
      if (expandedCodeRef.current) {
        void loadStats(expandedCodeRef.current);
      }
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
  }, [isAuthenticated, loadStats]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const totalLinks = useMemo(() => links.length, [links]);
  const totalClicks = useMemo(
    () => links.reduce((acc, link) => acc + (link.click_count || 0), 0),
    [links]
  );
  const activeLinks = totalLinks;

  const handleCreateLink = useCallback(
    async (expirationData: ExpirationData) => {
      const error = validateUrl(newUrl);
      setNewUrlError(error);
      if (error) return;

      setCreating(true);
      const response = await apiService.createShortUrl({
        url: newUrl.trim(),
        ...expirationData,
      });

      if (response.success && response.data) {
        const createdLink = response.data;
        addToast({
          title: "Short link created",
          description: `${
            createdLink.shortened_url ?? resolveShortUrl(createdLink.short_code)
          }`,
          color: "success",
        });
        setNewUrl("");
        setNewUrlError(null);
        setStatsState((prev) => ({
          ...prev,
          [createdLink.short_code]: { loading: false },
        }));
        fetchLinks();
        setIsCreateLinkModalOpen(false);
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
    },
    [newUrl, fetchLinks]
  );

  const handleDeleteLink = useCallback(
    async (code: string) => {
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
          expandedCodeRef.current = null;
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
    },
    [expandedCode]
  );

  const toggleStats = useCallback(
    (code: string) => {
      setExpandedCode((current) => {
        const nextCode = current === code ? null : code;
        expandedCodeRef.current = nextCode;
        if (nextCode) {
          // Always reload stats when expanding to get fresh data
          void loadStats(nextCode);
        }
        return nextCode;
      });
    },
    [loadStats]
  );

  const handleCopy = useCallback(async (code: string) => {
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
  }, []);

  const userInitials = useMemo(() => {
    const name = user?.name || user?.email?.split("@")[0] || "User";
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, [user?.name, user?.email]);

  const handleUrlChange = useCallback((value: string) => {
    setNewUrl(value);
    // Real-time validation as user types
    const error = validateUrl(value);
    setNewUrlError(error);
  }, []);

  const handleModalClose = useCallback((open: boolean) => {
    setIsCreateLinkModalOpen(open);
    if (!open) {
      setNewUrl("");
      setNewUrlError(null);
    }
  }, []);

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
                  name: userInitials,
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
          <StatsCards
            totalLinks={totalLinks}
            totalClicks={totalClicks}
            activeLinks={activeLinks}
          />

          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <h2 className="text-xl font-semibold text-white">Your Links</h2>
              <div className="flex gap-2">
                {isAuthenticated && (
                  <Button
                    color="primary"
                    startContent={<Icon icon="mdi:plus" className="w-4 h-4" />}
                    onPress={() => setIsCreateLinkModalOpen(true)}
                  >
                    Create Link
                  </Button>
                )}
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
            </div>

            {linksLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Spinner size="md" color="primary" />
                <p className="text-gray-400 text-sm">
                  Loading your short links...
                </p>
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
                <p className="text-gray-400">
                  No links created yet. Shorten your first URL to get started.
                </p>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-gray-700">
                {links.map((link) => (
                  <LinkListItem
                    key={link.id || link.short_code}
                    link={link}
                    stats={statsState[link.short_code]}
                    isExpanded={expandedCode === link.short_code}
                    isDeleting={deletingCode === link.short_code}
                    onCopy={handleCopy}
                    onToggleStats={toggleStats}
                    onDelete={handleDeleteLink}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {isAuthenticated && (
        <CreateLinkModal
          isOpen={isCreateLinkModalOpen}
          onOpenChange={handleModalClose}
          url={newUrl}
          error={newUrlError}
          isLoading={creating}
          onUrlChange={handleUrlChange}
          onSubmit={handleCreateLink}
        />
      )}
    </div>
  );
}

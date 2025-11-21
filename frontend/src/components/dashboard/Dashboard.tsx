"use client";

import { useLinkActions } from "@/hooks/useLinkActions";
import { useLinks } from "@/hooks/useLinks";
import { useLinkStats } from "@/hooks/useLinkStats";
import { ShortUrl } from "@/services/api";
import { useStore } from "@/store/useStore";
import { authToasts, toastBus } from "@/utils/toastUtils";
import { validateUrl } from "@/utils/urlUtils";
import { useCallback, useEffect, useRef, useState } from "react";
import CreateLinkModal, { ExpirationData } from "./CreateLinkModal";
import DashboardHeader from "./DashboardHeader";
import EditLinkModal, { EditLinkData } from "./EditLinkModal";
import LinkListSection from "./LinkListSection";
import StatsCards from "./StatsCards";

export default function Dashboard() {
  const { user, isAuthenticated } = useStore();
  const [expandedCode, setExpandedCode] = useState<string | null>(null);
  const expandedCodeRef = useRef<string | null>(null);

  // Modal states
  const [isCreateLinkModalOpen, setIsCreateLinkModalOpen] = useState(false);
  const [isEditLinkModalOpen, setIsEditLinkModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<ShortUrl | null>(null);

  // Form states
  const [newUrl, setNewUrl] = useState("");
  const [newUrlError, setNewUrlError] = useState<string | null>(null);
  const [editUrl, setEditUrl] = useState("");
  const [editUrlError, setEditUrlError] = useState<string | null>(null);

  // Custom hooks
  const {
    links,
    linksLoading,
    linksError,
    activeLinks,
    expiredLinks,
    totalLinks,
    totalClicks,
    activeLinksCount,
    fetchLinks,
    setLinks,
  } = useLinks(isAuthenticated);

  const {
    statsState,
    loadStats,
    createToggleStats,
    clearStats,
    initializeStats,
  } = useLinkStats();

  const toggleStats = createToggleStats(setExpandedCode, expandedCodeRef);

  const {
    creating,
    deletingCode,
    updatingStatusCode,
    updating,
    handleCreateLink: createLinkAction,
    handleDeleteLink,
    handlePauseResume,
    handleUpdateLink: updateLinkAction,
    handleCopy,
  } = useLinkActions({
    onLinksUpdate: setLinks,
    onStatsRefresh: loadStats,
    onStatsClear: clearStats,
    onStatsInitialize: initializeStats,
    expandedCode,
    setExpandedCode,
    expandedCodeRef,
  });

  // Handle auth success toasts
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

  // Refresh stats for expanded panel when links are fetched
  useEffect(() => {
    if (expandedCodeRef.current) {
      void loadStats(expandedCodeRef.current);
    }
  }, [links, loadStats]);

  // Link creation handler
  const handleCreateLink = useCallback(
    async (expirationData: ExpirationData) => {
      const result = await createLinkAction(newUrl, expirationData);
      if (result.success) {
        setNewUrl("");
        setNewUrlError(null);
        setIsCreateLinkModalOpen(false);
        await fetchLinks(); // Refresh links list
      } else if (result.error) {
        setNewUrlError(result.error);
      }
    },
    [newUrl, createLinkAction, fetchLinks]
  );

  // Link update handler
  const handleUpdateLink = useCallback(
    async (updateData: EditLinkData) => {
      if (!editingLink) return;
      const result = await updateLinkAction(editingLink, updateData);
      if (result.success) {
        setIsEditLinkModalOpen(false);
        setEditingLink(null);
        setEditUrl("");
        setEditUrlError(null);
        await fetchLinks(); // Refresh links list
      } else if (result.error) {
        setEditUrlError(result.error);
      }
    },
    [editingLink, updateLinkAction, fetchLinks]
  );

  // Delete handler with fetchLinks
  const handleDelete = useCallback(
    async (code: string) => {
      await handleDeleteLink(code);
      await fetchLinks(); // Refresh links list
    },
    [handleDeleteLink, fetchLinks]
  );

  // URL change handlers
  const handleUrlChange = useCallback((value: string) => {
    setNewUrl(value);
    const error = validateUrl(value);
    setNewUrlError(error);
  }, []);

  const handleEditUrlChange = useCallback((value: string) => {
    setEditUrl(value);
    const error = validateUrl(value);
    setEditUrlError(error);
  }, []);

  // Modal handlers
  const handleModalClose = useCallback((open: boolean) => {
    setIsCreateLinkModalOpen(open);
    if (!open) {
      setNewUrl("");
      setNewUrlError(null);
    }
  }, []);

  const handleEditLink = useCallback((link: ShortUrl) => {
    setEditingLink(link);
    setEditUrl(link.original_url);
    setEditUrlError(null);
    setIsEditLinkModalOpen(true);
  }, []);

  const handleEditModalClose = useCallback((open: boolean) => {
    setIsEditLinkModalOpen(open);
    if (!open) {
      setEditingLink(null);
      setEditUrl("");
      setEditUrlError(null);
    }
  }, []);

  return (
    <div
      className="font-sans flex flex-col min-h-screen md:min-h-[calc(100vh-85px)]"
      style={{ background: "var(--background)", color: "var(--foreground)" }}
    >
      <DashboardHeader user={user} />

      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto flex flex-col gap-8">
          <StatsCards
            totalLinks={totalLinks}
            totalClicks={totalClicks}
            activeLinks={activeLinksCount}
          />

          <LinkListSection
            links={links}
            activeLinks={activeLinks}
            expiredLinks={expiredLinks}
            linksLoading={linksLoading}
            linksError={linksError}
            statsState={statsState}
            expandedCode={expandedCode}
            deletingCode={deletingCode}
            updatingStatusCode={updatingStatusCode}
            onCopy={handleCopy}
            onToggleStats={toggleStats}
            onEdit={handleEditLink}
            onPauseResume={handlePauseResume}
            onDelete={handleDelete}
            onCreateLink={() => setIsCreateLinkModalOpen(true)}
            onRefresh={fetchLinks}
            isAuthenticated={isAuthenticated}
          />
        </div>
      </div>

      {isAuthenticated && (
        <>
          <CreateLinkModal
            isOpen={isCreateLinkModalOpen}
            onOpenChange={handleModalClose}
            url={newUrl}
            error={newUrlError}
            isLoading={creating}
            onUrlChange={handleUrlChange}
            onSubmit={handleCreateLink}
          />
          {editingLink && (
            <EditLinkModal
              isOpen={isEditLinkModalOpen}
              onOpenChange={handleEditModalClose}
              originalUrl={editUrl}
              expiresAt={editingLink.expires_at}
              error={editUrlError}
              isLoading={updating}
              onUrlChange={handleEditUrlChange}
              onSubmit={handleUpdateLink}
            />
          )}
        </>
      )}
    </div>
  );
}

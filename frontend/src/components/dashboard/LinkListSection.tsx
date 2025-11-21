import { StatsState } from "@/hooks/useLinkStats";
import { ShortUrl } from "@/services/api";
import { Accordion, AccordionItem, Button, Spinner } from "@heroui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import LinkListItem from "./LinkListItem";

interface LinkListSectionProps {
  links: ShortUrl[];
  activeLinks: ShortUrl[];
  expiredLinks: ShortUrl[];
  linksLoading: boolean;
  linksError: string | null;
  statsState: Record<string, StatsState>;
  expandedCode: string | null;
  deletingCode: string | null;
  updatingStatusCode: string | null;
  onCopy: (code: string) => void;
  onToggleStats: (code: string) => void;
  onEdit: (link: ShortUrl) => void;
  onPauseResume: (code: string, status: "active" | "paused") => void;
  onDelete: (code: string) => void;
  onCreateLink: () => void;
  onRefresh: () => void;
  isAuthenticated: boolean;
}

export default function LinkListSection({
  links,
  activeLinks,
  expiredLinks,
  linksLoading,
  linksError,
  statsState,
  expandedCode,
  deletingCode,
  updatingStatusCode,
  onCopy,
  onToggleStats,
  onEdit,
  onPauseResume,
  onDelete,
  onCreateLink,
  onRefresh,
  isAuthenticated,
}: LinkListSectionProps) {
  return (
    <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
      <div className="flex flex-row items-center justify-between gap-4 mb-4">
        <h2 className="text-xl font-semibold text-white">Your Links</h2>
        <div className="flex gap-2">
          {isAuthenticated && (
            <>
              <Button
                className="hidden md:flex"
                color="primary"
                startContent={<Icon icon="mdi:plus" className="w-4 h-4" />}
                onPress={onCreateLink}
              >
                Create Link
              </Button>
              <Button
                className="md:hidden"
                color="primary"
                isIconOnly
                onPress={onCreateLink}
              >
                <Icon icon="mdi:plus" className="w-4 h-4" />
              </Button>
            </>
          )}
          <Button
            className="hidden md:flex"
            variant="bordered"
            color="primary"
            startContent={<Icon icon="mdi:refresh" className="w-4 h-4" />}
            onPress={onRefresh}
            isDisabled={linksLoading}
          >
            Refresh
          </Button>
          <Button
            className="md:hidden"
            variant="bordered"
            color="primary"
            isIconOnly
            onPress={onRefresh}
            isDisabled={linksLoading}
          >
            <Icon icon="mdi:refresh" className="w-4 h-4" />
          </Button>
        </div>
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
          <p className="text-gray-400">
            No links created yet. Shorten your first URL to get started.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Active Links Section */}
          {activeLinks.length > 0 && (
            <div className="flex flex-col divide-y divide-gray-700">
              {activeLinks.map((link) => (
                <LinkListItem
                  key={link.id || link.short_code}
                  link={link}
                  stats={statsState[link.short_code]}
                  isExpanded={expandedCode === link.short_code}
                  isDeleting={deletingCode === link.short_code}
                  isUpdatingStatus={updatingStatusCode === link.short_code}
                  onCopy={onCopy}
                  onToggleStats={onToggleStats}
                  onEdit={onEdit}
                  onPauseResume={onPauseResume}
                  onDelete={onDelete}
                />
              ))}
            </div>
          )}

          {/* Expired Links Section - Accordion (closed by default) */}
          {expiredLinks.length > 0 && (
            <Accordion
              defaultExpandedKeys={[]}
              selectionMode="single"
              className="border border-gray-700 rounded-lg"
            >
              <AccordionItem
                key="expired"
                aria-label="Expired Links"
                title={
                  <div className="flex items-center gap-2">
                    <Icon
                      icon="mdi:clock-alert-outline"
                      className="w-5 h-5 text-red-400"
                    />
                    <span className="text-white font-medium">
                      Expired Links ({expiredLinks.length})
                    </span>
                  </div>
                }
                classNames={{
                  trigger: "px-4 py-3",
                  content: "px-0 py-0",
                }}
              >
                <div className="flex flex-col divide-y divide-gray-700">
                  {expiredLinks.map((link) => (
                    <LinkListItem
                      key={link.id || link.short_code}
                      link={link}
                      stats={statsState[link.short_code]}
                      isExpanded={expandedCode === link.short_code}
                      isDeleting={deletingCode === link.short_code}
                      isUpdatingStatus={updatingStatusCode === link.short_code}
                      onCopy={onCopy}
                      onToggleStats={onToggleStats}
                      onEdit={onEdit}
                      onPauseResume={onPauseResume}
                      onDelete={onDelete}
                    />
                  ))}
                </div>
              </AccordionItem>
            </Accordion>
          )}
        </div>
      )}
    </div>
  );
}

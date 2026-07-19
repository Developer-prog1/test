type PortalMainProps = {
  children: React.ReactNode;
};

/** Gap below floating site header before portal chrome begins. */
const PORTAL_TOP = 'calc(var(--header-height) + 0.85rem)';

/**
 * Portal content shell: on lg+, scrolls inside a pane whose top edge
 * matches the sidebar, so list items fade under a top mask before the
 * floating header — never sit under the header’s dark glass.
 */
export function PortalMain({ children }: PortalMainProps) {
  return (
    <div className="lg:pl-[calc(var(--admin-sidebar-width)+0.75rem)]">
      <div
        className="
          relative min-w-0 px-4 py-8 sm:px-6
          lg:fixed lg:bottom-0 lg:right-0
          lg:left-[calc(var(--admin-sidebar-width)+0.75rem)]
          lg:overflow-hidden lg:px-0 lg:py-0
        "
        style={{ top: undefined }}
      >
        <div
          className="relative min-w-0 px-4 py-8 sm:px-6 lg:fixed lg:bottom-0 lg:right-0 lg:left-[calc(var(--admin-sidebar-width)+0.75rem)] lg:top-[calc(var(--header-height)+0.85rem)] lg:overflow-hidden lg:px-0 lg:py-0"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 z-20 hidden h-16 bg-gradient-to-b from-[var(--bg)] from-55% via-[color-mix(in_srgb,var(--bg)_70%,transparent)] to-transparent lg:block"
          />
          <div
            data-portal-scroll
            className="min-w-0 scroll-pt-4 pb-10 lg:h-full lg:overflow-y-auto lg:overscroll-contain lg:px-8 lg:pb-12 lg:pt-14 xl:px-12"
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export function scrollPortalToTop() {
  const pane = document.querySelector('[data-portal-scroll]');
  if (pane instanceof HTMLElement) {
    pane.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

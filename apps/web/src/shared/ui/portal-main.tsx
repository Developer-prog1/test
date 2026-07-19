type PortalMainProps = {
  children: React.ReactNode;
};

/**
 * Portal content shell: on lg+, scrolls inside a pane whose top edge
 * matches the sidebar (`header-height + 0.35rem`), so list items never
 * reach the floating header — they fade under a top mask instead.
 */
export function PortalMain({ children }: PortalMainProps) {
  return (
    <div className="lg:pl-[calc(var(--admin-sidebar-width)+0.75rem)]">
      <div
        className="
          relative min-w-0 px-4 py-8 sm:px-6
          lg:fixed lg:bottom-0 lg:right-0
          lg:left-[calc(var(--admin-sidebar-width)+0.75rem)]
          lg:top-[calc(var(--header-height)+0.35rem)]
          lg:overflow-hidden lg:px-0 lg:py-0
        "
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 z-20 hidden h-12 bg-gradient-to-b from-[var(--bg)] from-40% to-transparent lg:block"
        />
        <div
          data-portal-scroll
          className="min-w-0 pb-10 lg:h-full lg:overflow-y-auto lg:overscroll-contain lg:px-8 lg:pb-12 lg:pt-8 xl:px-12"
        >
          {children}
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

import { OwnerSidebar } from '../../../shared/ui/owner-sidebar';
import { PortalMain } from '../../../shared/ui/portal-main';

type OwnerLayoutProps = {
  children: React.ReactNode;
};

export default function OwnerLayout({ children }: OwnerLayoutProps) {
  return (
    <div className="relative min-h-[calc(100vh-var(--header-height))] lg:h-[calc(100vh-var(--header-height))] lg:overflow-hidden">
      <OwnerSidebar />
      <PortalMain>{children}</PortalMain>
    </div>
  );
}

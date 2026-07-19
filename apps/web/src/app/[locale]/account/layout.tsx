import { AccountSidebar } from '../../../shared/ui/account-sidebar';
import { PortalMain } from '../../../shared/ui/portal-main';

type AccountLayoutProps = {
  children: React.ReactNode;
};

export default function AccountLayout({ children }: AccountLayoutProps) {
  return (
    <div className="relative min-h-[calc(100vh-var(--header-height))] lg:h-[calc(100vh-var(--header-height))] lg:overflow-hidden">
      <AccountSidebar />
      <PortalMain>{children}</PortalMain>
    </div>
  );
}

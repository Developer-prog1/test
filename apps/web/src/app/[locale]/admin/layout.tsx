import { AdminSidebar } from '../../../shared/ui/admin-sidebar';
import { PortalMain } from '../../../shared/ui/portal-main';

type AdminLayoutProps = {
  children: React.ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="relative min-h-[calc(100vh-var(--header-height))] lg:h-[calc(100vh-var(--header-height))] lg:overflow-hidden">
      <AdminSidebar />
      <PortalMain>{children}</PortalMain>
    </div>
  );
}

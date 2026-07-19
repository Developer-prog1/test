import { OwnerSidebar } from '../../../shared/ui/owner-sidebar';

type OwnerLayoutProps = {
  children: React.ReactNode;
};

export default function OwnerLayout({ children }: OwnerLayoutProps) {
  return (
    <div className="relative min-h-[calc(100vh-var(--header-height))]">
      <OwnerSidebar />
      <div className="lg:pl-[calc(var(--admin-sidebar-width)+0.75rem)]">
        <div className="container-shell py-8 lg:max-w-none lg:px-8 lg:py-10 xl:px-12">
          <div className="min-w-0 pb-10">{children}</div>
        </div>
      </div>
    </div>
  );
}

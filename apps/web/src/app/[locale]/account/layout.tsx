import { AccountSidebar } from '../../../shared/ui/account-sidebar';

type AccountLayoutProps = {
  children: React.ReactNode;
};

export default function AccountLayout({ children }: AccountLayoutProps) {
  return (
    <div className="relative min-h-[calc(100vh-var(--header-height))]">
      <AccountSidebar />
      <div className="lg:pl-[calc(var(--admin-sidebar-width)+0.75rem)]">
        <div className="container-shell py-8 lg:max-w-none lg:px-8 lg:py-10 xl:px-12">
          <div className="min-w-0 pb-10">{children}</div>
        </div>
      </div>
    </div>
  );
}

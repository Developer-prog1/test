'use client';

import { usePathname } from '../../i18n/navigation';

const ROLE_AREA_PREFIXES = ['/admin', '/owner', '/account'] as const;

function isRoleAreaPath(pathname: string): boolean {
  return ROLE_AREA_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

type RoleAreaFooterGateProps = {
  children: React.ReactNode;
};

export function RoleAreaFooterGate({ children }: RoleAreaFooterGateProps) {
  const pathname = usePathname();
  if (isRoleAreaPath(pathname)) return null;
  return children;
}

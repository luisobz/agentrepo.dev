import { redirect } from 'next/navigation';
import { AdminNav } from '../../components/admin/admin-nav';
import { LocaleSwitcher } from '../../components/admin/locale-switcher';
import { LogoutButton } from '../../components/admin/logout-button';
import { hasValidAdminSession } from '../../lib/auth/session';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await hasValidAdminSession())) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="flex w-full shrink-0 flex-col justify-between gap-5 border-b md:w-56 md:border-b-0 md:border-r border-[var(--color-border-soft)] bg-[var(--color-bg-warm-white)] p-4">
        <div className="flex flex-col gap-6">
          <div className="px-3">
            <p className="font-mono text-sm font-semibold text-[var(--color-brand-garnet)]">
              agentrepo.dev
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">
              Admin panel
            </p>
          </div>
          <AdminNav />
        </div>
        <div className="flex flex-col gap-2">
          <LocaleSwitcher />
          <LogoutButton />
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-4 sm:p-8">{children}</main>
    </div>
  );
}

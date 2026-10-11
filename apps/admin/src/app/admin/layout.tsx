import { redirect } from 'next/navigation';
import { AdminNavigation } from '../../components/admin/admin-navigation';
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
      <AdminNavigation />
      <main className="min-w-0 flex-1 p-4 sm:p-8">{children}</main>
    </div>
  );
}

import { redirect } from 'next/navigation';
import { requireSuperAdmin } from '@/lib/permissions.server';
import { UsersManager } from './users-manager';

export default async function AdminUsersPage() {
  try {
    await requireSuperAdmin();
  } catch {
    redirect('/dashboard');
  }

  return <UsersManager />;
}

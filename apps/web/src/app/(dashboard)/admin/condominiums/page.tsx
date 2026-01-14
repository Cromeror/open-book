import { redirect } from 'next/navigation';
import { requireSuperAdmin } from '@/lib/permissions.server';
import { CondominiumsManager } from './condominiums-manager';

export default async function AdminCondominiumsPage() {
  try {
    await requireSuperAdmin();
  } catch {
    redirect('/dashboard');
  }

  return <CondominiumsManager />;
}

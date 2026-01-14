import { redirect } from 'next/navigation';
import { requireSuperAdmin } from '@/lib/permissions.server';
import { PropertiesPage } from './properties-page';

export default async function AdminPropertiesPage() {
  try {
    await requireSuperAdmin();
  } catch {
    redirect('/dashboard');
  }

  return <PropertiesPage />;
}

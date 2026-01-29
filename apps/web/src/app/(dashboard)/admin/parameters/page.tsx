import { redirect } from 'next/navigation';
import { requireSuperAdmin } from '@/lib/permissions.server';

/**
 * Parameters root page - redirects to general category
 */
export default async function AdminParametersPage() {
  try {
    await requireSuperAdmin();
  } catch {
    redirect('/dashboard');
  }

  // Redirect to first category (general)
  redirect('/admin/parameters/general');
}

import { redirect } from 'next/navigation';
import { requireSuperAdmin } from '@/lib/permissions.server';
import { ContentLayout } from '@/components/layout';
import { NewIntegrationClient } from './pageOnlyClient';

export default async function NewIntegrationPage() {
  try {
    await requireSuperAdmin();
  } catch {
    redirect('/dashboard');
  }

  return (
    <ContentLayout>
      <NewIntegrationClient />
    </ContentLayout>
  );
}

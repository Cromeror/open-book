import { redirect, notFound } from 'next/navigation';

import { getServerPermissions } from '@/lib/permissions.server';
import { GenericModule } from '@/components/modules';

interface Props {
  params: Promise<{ moduleCode: string }>;
}

/**
 * Dynamic module page
 *
 * Renders CRUD modules using GenericModule component.
 * Specialized modules can be handled here or maintain separate routes.
 */
export default async function DynamicModulePage({ params }: Props) {
  const { moduleCode } = await params;

  // Get permissions and verify access
  const permissions = await getServerPermissions();

  if (!permissions.isAuthenticated) {
    redirect('/login');
  }

  // Check if user has access to this module
  if (!permissions.hasModule(moduleCode)) {
    redirect('/dashboard');
  }

  // Get module metadata
  const metadata = permissions.modules.find((m) => m.code === moduleCode);

  if (!metadata) {
    notFound();
  }

  // Render CRUD module with GenericModule
  return (
    <GenericModule
      moduleCode={moduleCode}
      metadata={metadata}
    />
  );
}

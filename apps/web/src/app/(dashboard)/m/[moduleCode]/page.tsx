import { redirect, notFound } from 'next/navigation';

import { getServerPermissions } from '@/lib/permissions.server';
import { GenericCRUDModule } from '@/components/modules';

interface Props {
  params: Promise<{ moduleCode: string }>;
}

/**
 * Dynamic module page
 *
 * Renders CRUD modules using GenericCRUDModule component.
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

  // For specialized modules, redirect to their static routes
  // or handle them here with registered components
  if (metadata.type === 'specialized') {
    // Specialized modules have static routes defined in nav.path
    // Redirect to the static route if navigated via /m/
    redirect(metadata.nav.path);
  }

  // Render CRUD module with GenericCRUDModule
  return (
    <GenericCRUDModule
      moduleCode={moduleCode}
      metadata={metadata}
    />
  );
}

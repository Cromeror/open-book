import { redirect, notFound } from 'next/navigation';

import { getServerPermissions } from '@/lib/permissions.server';

interface Props {
  params: Promise<{ moduleCode: string; slug: string[] }>;
}

/**
 * Catch-all sub-route for module pages.
 *
 * Handles paths like:
 *   /m/goals/abc123        → detail view (slug = ['abc123'])
 *   /m/goals/abc123/edit   → edit view   (slug = ['abc123', 'edit'])
 *
 * For now renders a placeholder — full component rendering will be
 * wired up once detail/form views are implemented.
 */
export default async function ModuleSubPage({ params }: Props) {
  const { moduleCode, slug } = await params;

  const permissions = await getServerPermissions();

  if (!permissions.isAuthenticated) {
    redirect('/login');
  }

  if (!permissions.hasModule(moduleCode)) {
    redirect('/dashboard');
  }

  const metadata = permissions.modules.find((m) => m.code === moduleCode);

  if (!metadata) {
    notFound();
  }

  const [id, action] = slug;
  const view = action ?? 'detail';

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-white p-6">
        <p className="text-sm text-gray-500">
          Modulo: <span className="font-medium text-gray-900">{metadata.label}</span>
        </p>
        <p className="text-sm text-gray-500 mt-1">
          ID: <span className="font-mono text-gray-900">{id}</span>
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Vista: <span className="font-medium text-gray-900">{view}</span>
        </p>
      </div>
    </div>
  );
}

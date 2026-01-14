import { redirect } from 'next/navigation';
import { requireSuperAdmin } from '@/lib/permissions.server';
import { GenericCRUDModule } from '@/components/modules';

export default async function AdminCondominiumsPage() {
  let permissions;

  try {
    permissions = await requireSuperAdmin();
  } catch {
    redirect('/dashboard');
  }

  // Get the condominiums module metadata
  const condominiumsModule = permissions.getModule('admincondominiums');

  if (!condominiumsModule) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Condominios</h1>
          <p className="text-gray-600">Administracion de condominios del sistema</p>
        </div>
        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center">
          <p className="text-gray-500">El modulo de condominios no esta configurado.</p>
        </div>
      </div>
    );
  }

  return <GenericCRUDModule moduleCode="admincondominiums" metadata={condominiumsModule} />;
}

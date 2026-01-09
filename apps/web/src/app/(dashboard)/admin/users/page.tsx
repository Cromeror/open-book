import { redirect } from 'next/navigation';
import { requireSuperAdmin } from '@/lib/permissions.server';
import { GenericCRUDModule } from '@/components/modules';

export default async function AdminUsersPage() {
  let permissions;

  try {
    permissions = await requireSuperAdmin();
  } catch {
    redirect('/dashboard');
  }

  // Get the users module metadata
  const usersModule = permissions.getModule('users');  

  if (!usersModule) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
          <p className="text-gray-600">
            Administracion de usuarios del sistema
          </p>
        </div>
        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center">
          <p className="text-gray-500">El modulo de usuarios no esta configurado.</p>
        </div>
      </div>
    );
  }

  return (
    <GenericCRUDModule
      moduleCode="users"
      metadata={usersModule}
    />
  );
}

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { KeyRound } from 'lucide-react';
import type { Integration } from '@/types/business/integration.types';

const organizationFormSchema = z.object({
  code: z
    .string()
    .min(1, 'El codigo es requerido')
    .max(50)
    .regex(/^[a-z][a-z0-9_-]*$/, 'Solo minusculas, numeros, guiones y guion bajo'),
  name: z.string().min(1, 'El nombre es requerido').max(150),
  description: z.string().max(500).optional().nullable(),
  externalId: z.string().max(255).optional().nullable(),
  integrationId: z.string().uuid().optional().nullable().or(z.literal('')),
});

export type OrganizationFormValues = z.infer<typeof organizationFormSchema> & {
  credentialEmail?: string;
  credentialPassword?: string;
};

interface OrganizationFormProps {
  defaultValues?: Partial<OrganizationFormValues>;
  integrations?: Integration[];
  hasExistingCredentials?: boolean;
  onSubmit: (data: OrganizationFormValues) => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
  loading?: boolean;
}

export function OrganizationForm({
  defaultValues,
  integrations = [],
  hasExistingCredentials = false,
  onSubmit,
  onCancel,
  isEditing = false,
  loading = false,
}: OrganizationFormProps) {
  const [credentialEmail, setCredentialEmail] = useState('');
  const [credentialPassword, setCredentialPassword] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationFormSchema),
    defaultValues: {
      code: '',
      name: '',
      description: '',
      externalId: '',
      integrationId: '',
      ...defaultValues,
    },
  });

  const onFormSubmit = (data: OrganizationFormValues) => {
    return onSubmit({
      ...data,
      integrationId: data.integrationId || null,
      externalId: data.externalId || null,
      description: data.description || null,
      credentialEmail: credentialEmail || undefined,
      credentialPassword: credentialPassword || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-gray-900 uppercase tracking-wider">
          Informacion General
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
              Codigo
            </label>
            <input
              id="code"
              type="text"
              disabled={isEditing}
              {...register('code')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100 disabled:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="bid"
            />
            {errors.code && (
              <p className="mt-1 text-xs text-red-600">{errors.code.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre
            </label>
            <input
              id="name"
              type="text"
              {...register('name')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Banco Interamericano de Desarrollo"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>
        </div>

        <div className="mt-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Descripcion
          </label>
          <textarea
            id="description"
            rows={2}
            {...register('description')}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Descripcion de la organizacion..."
          />
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-gray-900 uppercase tracking-wider">
          Vinculacion Externa
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="externalId" className="block text-sm font-medium text-gray-700 mb-1">
              Identificador Externo
            </label>
            <input
              id="externalId"
              type="text"
              {...register('externalId')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="123"
            />
            <p className="mt-1 text-xs text-gray-500">
              ID de la organizacion en el sistema externo
            </p>
          </div>

          <div>
            <label htmlFor="integrationId" className="block text-sm font-medium text-gray-700 mb-1">
              Integracion
            </label>
            <select
              id="integrationId"
              {...register('integrationId')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Sin integracion</option>
              {integrations.map((integration) => (
                <option key={integration.id} value={integration.id}>
                  {integration.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Sistema externo al que pertenece esta organizacion
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <KeyRound className="h-4 w-4 text-amber-600" />
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
            Credenciales del Sistema Externo
          </h3>
        </div>

        {isEditing && hasExistingCredentials && (
          <p className="mb-3 rounded-md bg-amber-50 p-3 text-xs text-amber-700">
            Esta organizacion ya tiene credenciales configuradas. Deje los campos vacios para mantener las credenciales actuales, o ingrese nuevas para reemplazarlas.
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="credentialEmail" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="credentialEmail"
              type="email"
              value={credentialEmail}
              onChange={(e) => setCredentialEmail(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="admin@example.com"
              autoComplete="off"
            />
          </div>

          <div>
            <label htmlFor="credentialPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="credentialPassword"
              type="password"
              value={credentialPassword}
              onChange={(e) => setCredentialPassword(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Las credenciales se almacenan encriptadas (AES-256-GCM) en la base de datos.
        </p>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear Organizacion'}
        </button>
      </div>
    </form>
  );
}

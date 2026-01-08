'use client';

import { GenericCRUDModule } from '@/components/modules';
import type { ModuleWithActions } from '@/lib/types/modules';

// Test condominium ID (seeded in database)
const TEST_CONDOMINIUM_ID = '11111111-1111-1111-1111-111111111111';

const goalsMetadata: ModuleWithActions = {
  code: 'goals',
  label: 'Objetivos de Recaudo',
  description: 'Gestiona los objetivos de recaudo del condominio',
  icon: 'Target',
  type: 'crud',
  nav: {
    path: '/goals',
    order: 10,
  },
  entity: 'Objetivo',
  endpoint: `/api/condominiums/${TEST_CONDOMINIUM_ID}/goals`,
  actions: [
    {
      code: 'read',
      label: 'Ver',
      settings: {
        type: 'read',
        listColumns: [
          { field: 'name', label: 'Nombre', sortable: true },
          { field: 'targetAmount', label: 'Meta', format: 'money', sortable: true },
          { field: 'startDate', label: 'Inicio', format: 'date', sortable: true },
          { field: 'endDate', label: 'Fin', format: 'date', sortable: true },
          { field: 'status', label: 'Estado' },
        ],
        sortable: ['name', 'targetAmount', 'startDate', 'endDate'],
        defaultSort: { field: 'startDate', order: 'desc' },
      },
    },
    {
      code: 'create',
      label: 'Crear',
      settings: {
        type: 'create',
        fields: [
          { name: 'name', label: 'Nombre', type: 'text', required: true, placeholder: 'Ej: Fondo para ascensores' },
          { name: 'description', label: 'Descripcion', type: 'textarea', placeholder: 'Descripcion detallada del objetivo' },
          { name: 'targetAmount', label: 'Meta de recaudo', type: 'money', required: true, min: 0 },
          { name: 'startDate', label: 'Fecha inicio', type: 'date', required: true },
          { name: 'endDate', label: 'Fecha fin', type: 'date' },
        ],
      },
    },
    {
      code: 'update',
      label: 'Editar',
      settings: {
        type: 'update',
        fields: [
          { name: 'name', label: 'Nombre', type: 'text', required: true },
          { name: 'description', label: 'Descripcion', type: 'textarea' },
          { name: 'targetAmount', label: 'Meta de recaudo', type: 'money', required: true, min: 0 },
          { name: 'startDate', label: 'Fecha inicio', type: 'date', required: true },
          { name: 'endDate', label: 'Fecha fin', type: 'date' },
        ],
      },
    },
    {
      code: 'delete',
      label: 'Eliminar',
      settings: {
        type: 'delete',
        confirmation: 'Esta seguro de eliminar este objetivo? Esta accion no se puede deshacer.',
        soft: true,
      },
    },
  ],
};

export default function TestCrudPage() {
  return (
    <GenericCRUDModule
      moduleCode="goals"
      metadata={goalsMetadata}
    />
  );
}

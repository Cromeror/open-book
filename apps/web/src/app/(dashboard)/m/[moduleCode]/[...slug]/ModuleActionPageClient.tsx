'use client';

import type { PayloadMetadata, ResponseMetadata, HttpMethod } from '@/types/business';
import { HTTP_METHODS } from '@/types/business';
import { GenericForm } from '@/components/modules/GenericForm';
import { GenericDetail } from '@/components/modules/GenericDetail';

interface ModuleActionPageClientProps {
  href: string;
  method: HttpMethod;
  payloadMetadata?: PayloadMetadata;
  responseMetadata?: ResponseMetadata;
}

export function ModuleActionPageClient({
  href,
  method,
  payloadMetadata,
  responseMetadata,
}: ModuleActionPageClientProps) {
  switch (method) {
    case HTTP_METHODS.GET:
      if (!responseMetadata) {
        return (
          <div className="rounded-md bg-yellow-50 border border-yellow-200 p-6">
            <p className="text-sm text-yellow-800">
              Esta vista aun no esta disponible. Contacte al administrador.
            </p>
          </div>
        );
      }
      return (
        <div className="space-y-6">
          {responseMetadata.description && (
            <h2 className="text-xl font-semibold text-gray-900">
              {responseMetadata.description}
            </h2>
          )}
          <GenericDetail
            responseMetadata={responseMetadata}
            endpoint={href}
            method={method}
          />
        </div>
      );

    case HTTP_METHODS.POST:
    case HTTP_METHODS.PUT:
    case HTTP_METHODS.PATCH:
      if (!payloadMetadata) {
        return (
          <div className="rounded-md bg-yellow-50 border border-yellow-200 p-6">
            <p className="text-sm text-yellow-800">
              Esta accion aun no esta disponible. Contacte al administrador.
            </p>
          </div>
        );
      }
      return (
        <div className="space-y-6">
          {payloadMetadata.summary && (
            <h2 className="text-xl font-semibold text-gray-900">
              {payloadMetadata.summary}
            </h2>
          )}
          <GenericForm
            payloadMetadata={payloadMetadata}
            endpoint={href}
            method={method}
          />
        </div>
      );

    case HTTP_METHODS.DELETE:
      return (
        <div className="rounded-md bg-red-50 border border-red-200 p-6">
          <p className="text-sm text-red-800">
            Confirmar eliminacion pendiente de implementar.
          </p>
        </div>
      );

    default:
      return (
        <div className="rounded-md bg-yellow-50 border border-yellow-200 p-6">
          <p className="text-sm text-yellow-800">
            Metodo no soportado: {method}
          </p>
        </div>
      );
  }
}

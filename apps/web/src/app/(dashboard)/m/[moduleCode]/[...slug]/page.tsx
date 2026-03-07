import { redirect, notFound } from 'next/navigation';
import { getServerPermissions } from '@/lib/permissions.server';
import { decodeLinkToken } from '@/lib/link-token';
import { fetchResourceById } from '@/lib/http-api/resources-server-api';
import { ModuleActionPageClient } from './ModuleActionPageClient';

interface Props {
  params: Promise<{ moduleCode: string; slug: string[] }>;
}

export default async function ModuleActionPage({ params }: Props) {
  const { moduleCode, slug } = await params;
  const permissions = await getServerPermissions();

  if (!permissions.hasModule(moduleCode)) {
    redirect('/dashboard');
  }

  const metadata = permissions.modules.find((m) => m.code === moduleCode);
  const [token] = slug;

  if (!metadata || !token) {
    notFound();
  }

  const link = decodeLinkToken(token);

  if (!link) {
    notFound();
  }

  const resource = await fetchResourceById(link.resourceId);

  if (!resource) {
    notFound();
  }

  const httpMethod = resource.httpMethods.find(
    (rhm) => rhm.httpMethod.method === link.method,
  );

  return (
    <ModuleActionPageClient
      href={link.href}
      method={link.method}
      payloadMetadata={httpMethod?.payloadMetadata ?? undefined}
      responseMetadata={httpMethod?.responseMetadata ?? undefined}
    />
  );
}

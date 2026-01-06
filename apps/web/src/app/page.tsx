import Link from 'next/link';
import { Building2, Shield, Users, BarChart3 } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Building2 className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">OpenBook</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/registro"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
            >
              Registrarse
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            Gestión transparente de{' '}
            <span className="text-blue-600">copropiedades</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
            OpenBook facilita la administración financiera de tu conjunto residencial
            con total transparencia. Controla recaudos, aportes y gastos de manera
            clara y accesible para todos los residentes.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/registro"
              className="rounded-md bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Comenzar ahora
            </Link>
            <Link
              href="#caracteristicas"
              className="rounded-md border border-gray-300 bg-white px-6 py-3 text-base font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
            >
              Conocer más
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="caracteristicas" className="bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Todo lo que necesitas para una gestión transparente
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-600">
              Herramientas diseñadas para facilitar la comunicación entre
              administración y residentes.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                Objetivos de Recaudo
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Define metas financieras claras con fechas límite y seguimiento
                en tiempo real del progreso.
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                Control de Aportes
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Registra compromisos y aportes reales de cada apartamento con
                trazabilidad completa.
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                Transparencia Total
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Los registros financieros son inmutables y auditables.
                Cada cambio queda documentado.
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                <Building2 className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                Cumplimiento Legal
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Diseñado conforme a la Ley 1581/2012 de protección de datos
                personales en Colombia.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Comienza a gestionar tu copropiedad hoy
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-blue-100">
              Únete a los conjuntos residenciales que ya confían en OpenBook
              para su gestión financiera transparente.
            </p>
            <div className="mt-8">
              <Link
                href="/registro"
                className="inline-block rounded-md bg-white px-6 py-3 text-base font-semibold text-blue-600 shadow-sm hover:bg-blue-50"
              >
                Crear cuenta gratis
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-gray-400" />
              <span className="text-sm text-gray-500">
                OpenBook - Gestión transparente de copropiedades
              </span>
            </div>
            <div className="flex gap-6">
              <Link href="/terminos" className="text-sm text-gray-500 hover:text-gray-700">
                Términos
              </Link>
              <Link href="/privacidad" className="text-sm text-gray-500 hover:text-gray-700">
                Privacidad
              </Link>
              <Link href="/contacto" className="text-sm text-gray-500 hover:text-gray-700">
                Contacto
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

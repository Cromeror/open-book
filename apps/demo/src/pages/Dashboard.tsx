import { useNavigate } from 'react-router'

const EMBED_URL = import.meta.env.VITE_EMBED_URL

export default function Dashboard() {
  const navigate = useNavigate()
  const authHeaders = localStorage.getItem('auth_headers')
  const authUser = localStorage.getItem('auth_user')

  // Build iframe URL with auth headers as query params
  let iframeSrc: string | null = null
  if (authHeaders) {
    const headers = JSON.parse(authHeaders)
    const params = new URLSearchParams({
      'access-token': headers['access-token'] || '',
      client: headers['client'] || '',
      uid: headers['uid'] || '',
      expiry: headers['expiry'] || '',
    })
    iframeSrc = `${EMBED_URL}/embed/project-detail?${params.toString()}`
  }

  function handleLogout() {
    localStorage.removeItem('auth_headers')
    localStorage.removeItem('auth_user')
    navigate('/login')
  }

  const user = authUser ? JSON.parse(authUser) : null

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="flex items-center justify-between border-b bg-white px-6 py-3">
        <h1 className="text-lg font-semibold text-gray-800">
          Demo App — Dashboard
        </h1>
        <div className="flex items-center gap-4">
          {user && (
            <span className="text-sm text-gray-500">{user.name} ({user.email})</span>
          )}
          <button
            onClick={handleLogout}
            className="rounded-md bg-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-300"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      <main className="flex flex-1 flex-col p-6">
        <div className="mb-4 rounded-md bg-blue-50 p-4 text-sm text-blue-800">
          Esta es la aplicación padre. El contenido de Captudata se muestra en el
          iframe de abajo. Las cabeceras de autenticación se pasan como parámetros en la URL.
        </div>

        <div className="flex-1 overflow-hidden rounded-lg border bg-white shadow-sm">
          {iframeSrc ? (
            <iframe
              src={iframeSrc}
              className="h-full min-h-[600px] w-full border-0"
              title="Captudata Embed"
              allow="clipboard-read; clipboard-write"
            />
          ) : (
            <div className="flex h-96 items-center justify-center text-gray-400">
              No se pudo obtener las cabeceras de autenticación
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

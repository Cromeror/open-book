import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'

const EMBED_URL = import.meta.env.VITE_EMBED_URL
const API_URL = import.meta.env.VITE_API_URL

export default function Dashboard() {
  const navigate = useNavigate()
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const authHeaders = localStorage.getItem('auth_headers')
  const authUser = localStorage.getItem('auth_user')
  const user = authUser ? JSON.parse(authUser) : null

  const [projectId, setProjectId] = useState('94620')
  const [iframeReady, setIframeReady] = useState(false)

  const iframeSrc = `${EMBED_URL}/embed/project-detail`

  const sendToIframe = useCallback((data: unknown) => {
    iframeRef.current?.contentWindow?.postMessage(data, EMBED_URL)
  }, [])

  // Listen for "ready" message from iframe
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== EMBED_URL) return

      if (event.data?.type === 'embed:ready') {
        setIframeReady(true)
        sendToIframe({
          type: 'embed:init',
          payload: {
            authHeaders: authHeaders ? JSON.parse(authHeaders) : null,
            user,
            projectId,
            apiUrl: API_URL,
          },
        })
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [authHeaders, user, projectId, sendToIframe])

  function handleApply() {
    if (!authHeaders || !projectId) return

    sendToIframe({
      type: 'embed:apply',
      payload: {
        authHeaders: JSON.parse(authHeaders),
        user,
        projectId,
        apiUrl: API_URL,
      },
    })
  }

  function handleLogout() {
    localStorage.removeItem('auth_headers')
    localStorage.removeItem('auth_user')
    navigate('/login')
  }

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
          <div className="flex items-center gap-2">
            <label htmlFor="projectId" className="text-sm text-gray-600">Project ID:</label>
            <input
              id="projectId"
              type="text"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-20 rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <button
            onClick={handleApply}
            disabled={!iframeReady || !projectId}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Aplicar Cambio
          </button>
          {!iframeReady && (
            <span className="text-xs text-yellow-600">iframe no conectado</span>
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
          Comunicación via <strong>postMessage</strong>. La demo envía auth headers y projectId
          al iframe sin exponerlos en la URL.
        </div>

        <div className="flex-1 overflow-hidden rounded-lg border bg-white shadow-sm">
          <iframe
            ref={iframeRef}
            src={iframeSrc}
            className="h-full min-h-[600px] w-full border-0"
            title="Captudata Embed"
            allow="clipboard-read; clipboard-write"
          />
        </div>
      </main>
    </div>
  )
}

import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from 'react'
import './App.css'
import {
  BrowserRouter,
  Route,
  Routes,
  useNavigate,
  useParams,
} from 'react-router'

function App() {
  // TODO this should be stored in a cookie
  // TODO this should be Context not State
  const [clientId, setClientId] = useState<string>()
  return (
    <section id="center">
      <p>Current client ID is {clientId}</p>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<CreateButton />} />
          <Route
            path="/:instanceId"
            element={<Instance clientId={clientId} setClientId={setClientId} />}
          />
        </Routes>
      </BrowserRouter>
    </section>
  )
}

function Instance({
  clientId,
  setClientId,
}: {
  clientId: string | undefined
  setClientId: Dispatch<SetStateAction<string | undefined>>
}) {
  // TODO this should be Context not State
  const { instanceId } = useParams<{ instanceId: string }>()

  if (!instanceId) {
    return <div>Error: Missing instance ID.</div>
  }

  const wsConnection = useRef<null | WebSocket>(null)

  useEffect(() => {
    const socket = new WebSocket(`ws://localhost:8081/${instanceId}`)
    socket.addEventListener('open', () => {
      console.log(
        `Connection opened to instance ${instanceId}! Sending clientId: ${clientId}`,
      )
      wsConnection.current?.send(JSON.stringify({ clientId }))
    })
    socket.addEventListener('message', (message) => {
      console.log('Received ' + message.data + ' from server.')
      setClientId(JSON.parse(message.data).clientId)
    })

    wsConnection.current = socket
    return () => {
      console.log(`Closing connection to ${instanceId}`)
      socket.close()
    }
  }, [])

  return (
    <>
      <p>Current instance ID is {instanceId}</p>
      <WebSocketButton
        wsConnection={wsConnection}
        clientId={clientId}
        instanceId={instanceId}
      />
      <ClearButton wsConnection={wsConnection} />
    </>
  )
}

function CreateButton() {
  async function getId() {
    const response = await fetch('/create', { method: 'POST' })
    if (response.ok) {
      const id = await response.text()
      console.log(`getId() -> ${id}`)
      return id
    }
  }
  // TODO should this automatically navigate to the instance?
  const [id, setId] = useState<string | null>(null)
  const navigate = useNavigate()
  return (
    <>
      {id ? (
        <button
          type="button"
          className="counter"
          onClick={() => {
            navigate(`/${id}`)
          }}
        >
          Go to instance {id}
        </button>
      ) : (
        <button
          type="button"
          className="counter"
          onClick={async () => {
            setId((await getId()) || null)
          }}
        >
          Get new instance ID
        </button>
      )}
    </>
  )
}

function WebSocketButton({
  wsConnection,
  clientId,
  instanceId,
}: {
  wsConnection: RefObject<WebSocket | null>
  clientId: string | undefined
  instanceId: string | undefined
}) {
  return (
    <button
      type="button"
      className="counter"
      onClick={() => {
        const wsMessage = JSON.stringify({ clientId, message: 'test' })
        wsConnection.current?.send(wsMessage)
        console.log(`Sending ${wsMessage} to instance ${instanceId}`)
      }}
    >
      WebSocket test
    </button>
  )
}

function ClearButton({
  wsConnection,
}: {
  wsConnection: RefObject<WebSocket | null>
}) {
  const navigate = useNavigate()
  return (
    <button
      type="button"
      className="counter"
      onClick={async () => {
        wsConnection.current?.close()
        navigate('/')
      }}
    >
      Clear ID
    </button>
  )
}

export default App

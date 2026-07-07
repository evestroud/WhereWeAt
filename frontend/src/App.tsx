import {
  useEffect,
  useRef,
  useState,
  type RefObject,
} from 'react'
import './App.css'
import { BrowserRouter, Route, Routes, useNavigate, useParams } from 'react-router'

async function getId() {
  const response = await fetch('/create', { method: 'POST' })
  if (response.ok) {
    const id = await response.text()
    console.log(`getId() -> ${id}`)
    return id
  }
}

function App() {
  return (
    <section id="center">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<CreateButton />} />
          <Route path="/:id" element={<Instance />} />
        </Routes>
      </BrowserRouter>
    </section>
  )
}

function Instance() {
  const { id } = useParams<{ id: string }>()

  if (!id) {
    return <div>Error: Missing user ID.</div>;
  }

  const wsConnection = useRef<null | WebSocket>(null)

  useEffect(() => {
    const socket = new WebSocket(`ws://localhost:8081/${id}`)
    socket.addEventListener('open', () => {
      console.log(`Connection opened to instance ${id}!`)
    })
    socket.addEventListener('message', (message) => {
      console.log(message.data)
    })

    wsConnection.current = socket
    return () => {
      socket.close()
    }
  }, [])

  return <>
    Current ID is {id}
    <WebSocketButton wsConnection={wsConnection} id={id} />
    <ClearButton />
  </>
}

function WebSocketButton({
  wsConnection,
  id,
}: {
  wsConnection: RefObject<WebSocket | null>
  id: String | null
}) {
  return (
    <button
      type="button"
      className="counter"
      onClick={() => wsConnection.current?.send(`ID: ${id}\n`)}
    >
      WebSocket test
    </button>
  )
}

function CreateButton() {
  const [id, setId] = useState<string | null>(null)
  const navigate = useNavigate()

  return (
    <>
      {id ?
        <button
          type="button"
          className='counter'
          onClick={() => {
            navigate(`/${id}`)
          }}>Go to {id}</button>
        :
        <button
          type="button"
          className="counter"
          onClick={async () => {
            setId((await getId()) || null)
          }}
        >
          Get new ID
        </button>
      }
    </>
  )
}

function ClearButton() {
  const navigate = useNavigate()
  return (
    <button
      type="button"
      className="counter"
      onClick={async () => { navigate("/") }}
    >
      Clear ID
    </button>
  )
}

export default App

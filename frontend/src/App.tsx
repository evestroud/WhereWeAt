import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

async function getId() {
  const response = await fetch('/create', { method: 'POST' })
  if (response.ok) {
    return await response.text()
  }
}

function App() {
  const [id, setId] = useState<String | null>(null)
  const wsConnection = useRef<null | WebSocket>(null)

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:8081')
    socket.addEventListener('open', () => {
      console.log('Connection opened!')
    })
    socket.addEventListener('message', (message) => {
      console.log(message.data)
    })

    wsConnection.current = socket
    return () => {
      socket.close()
    }
  }, [])

  return (
    <>
      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        <div>
          <h1>Get started</h1>
          <p>
            Edit <code>src/App.tsx</code> and save to test <code>HMR</code>
          </p>
        </div>
        {id ? (
          <>
            Current ID is {id}
            <ClearButton setId={setId} />
            <WebSocketButton wsConnection={wsConnection} id={id} />
          </>
        ) : (
          <>
            <CreateButton setId={setId} />
          </>
        )}
      </section>

      <div className="ticks"></div>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
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

function CreateButton({
  setId,
}: {
  setId: Dispatch<SetStateAction<String | null>>
}) {
  return (
    <button
      type="button"
      className="counter"
      onClick={async () => {
        setId((await getId()) || null)
      }}
    >
      Get new ID
    </button>
  )
}

function ClearButton({
  setId,
}: {
  setId: Dispatch<SetStateAction<String | null>>
}) {
  return (
    <button
      type="button"
      className="counter"
      onClick={async () => {
        setId(null)
      }}
    >
      Clear ID
    </button>
  )
}

export default App

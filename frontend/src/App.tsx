import { useEffect, useRef, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

async function getId() {
  let response = await fetch('/create')
  if (response.ok) {
    return await response.text()
  }
}

function App() {
  const [count, setCount] = useState(0)
  const [id, setId] = useState<String | null>(null)
  const wsConnection = useRef<null | WebSocket>(null)

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:8081')
    socket.addEventListener('open', () => {
      console.log('Connection opened!')
    })
    socket.addEventListener('message', (message) => {
      console.log(`Received: ${message.data}`)
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
        <button
          type="button"
          className="counter"
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>
        <button
          type="button"
          className="counter"
          onClick={async () => {
            setId((await getId()) || null)
          }}
        >
          ID is {id}
        </button>
        <button
          type="button"
          className="counter"
          onClick={() => wsConnection.current?.send(count.toString())}
        >
          WebSocket test
        </button>
      </section>

      <div className="ticks"></div>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

export default App

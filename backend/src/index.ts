import { WebSocketServer } from 'ws'

const server = new WebSocketServer({ port: 8080 })
let nextId = 0

server.on('connection', (ws) => {
  const clientId = nextId
  nextId += 1

  console.log(`Client ${clientId} connected!`)

  ws.on('message', (message) => {
    console.log(`Received ${message}`)

    ws.send(`Received ${message}`)
  })

  ws.on('close)', () => {
    console.log(`Client ${clientId} disconnected.`)
  })
})

console.log('WebSocket server running on ws://localhost:8080')

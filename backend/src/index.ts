import { WebSocketServer } from 'ws'
import express from 'express'
import { nanoid } from 'nanoid'


/* Types */
interface Instance {
  id: string,
  lastUsed: number // ms since Unix epoch: Date.now()
}


/* Instance management */
const instanceMap = new Map<string, Instance>()

function touchInstance(id: string) {
  const instance = instanceMap.get(id)
  if (instance) {
    instance.lastUsed = Date.now()
    console.log(`Instance ${id} updated`)
  }
}

const MAX_AGE_MS = process.env.ENV == "dev" ? 30000 : 300000
const RECLAIM_TIMER_MS = process.env.ENV == "dev" ? 6000 : 60000
setInterval(() => {
  for (const [id, instance] of instanceMap) {
    console.log(`Checking instance ${id} for reclaim: ${Date.now() - instance.lastUsed}ms`)
    if (Date.now() - instance.lastUsed > MAX_AGE_MS) {
      console.log(`> Deleting instance.`)
      instanceMap.delete(id)
    }
  }
}, RECLAIM_TIMER_MS)


/* HTTP server */
const httpServer = express()
httpServer.post('/create', (_req, res) => {
  const id = nanoid(6)
  const instance: Instance = { id, lastUsed: Date.now() }
  instanceMap.set(id, instance)
  console.log(`Instance ${id} generated`)
  res.send(id)
})


/* Websocket server */
httpServer.listen(8080, () => {
  console.log('HTTP server listening on 8080')
})

const wsServer = new WebSocketServer({ port: 8081 })
let nextId = 0

wsServer.on('connection', (ws, req) => {
  // TODO generate client id and store in frontend
  const clientId = nextId++
  const instanceId = req.url?.slice(1)
  console.log(`Client ${clientId} connected to instance ${instanceId}!`)

  if (instanceId) touchInstance(instanceId)

  // TODO: ping-pong (connection alive check)

  ws.on('message', (message) => {
    console.log(`Received ${message}`)

    const id = req.url?.slice(1)
    if (id) touchInstance(id)

    ws.send(`Server: Received message ${message} for ${id}`)
  })

  ws.on('close', () => {
    console.log(`Client ${clientId} disconnected.`)
  })
})

console.log('WebSocket server running on ws://localhost:8081')

import { WebSocketServer } from 'ws'
import express from 'express'
import { nanoid } from 'nanoid'


/* Types */
interface Instance {
  id: string,
  lastUsed: number // ms since Unix epoch: Date.now()
  connections: Set<number>
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
  const instance: Instance = { id, lastUsed: Date.now(), connections: new Set() }
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
  const instanceId = req.url?.slice(1)
  let clientId: number | undefined

  console.log(`Handshake initiated for instance ${instanceId}`)

  // TODO: ping-pong (connection alive check)

  if (instanceId) {
    // TODO 404 if instance not in instanceMap
    const instance = instanceMap.get(instanceId)
    touchInstance(instanceId)

    ws.on('message', (message) => {
      console.log(`Received ${message}`)
      const messageJson = JSON.parse(message.toString())
      clientId = messageJson.clientId
      // TODO message types, switch

      // TODO only run on INIT message type
      if (clientId) {
        // TODO what happens if two clients connect with the same ID?
        console.log(`Instance ${instanceId}: Recognized client ${clientId}`)
        instance?.connections.add(clientId)
        ws.send(JSON.stringify({ clientId, message: "Client ID accepted" }))
      } else {
        clientId = nextId++
        console.log(`Instance ${instanceId}: New client ${clientId}`)
        instance?.connections.add(clientId)
        ws.send(JSON.stringify({ clientId, message: "Client ID generated" }))
      }

      touchInstance(instanceId)
      console.log(instance)
    })

    ws.on('close', () => {
      console.log(`Client ${clientId} disconnected.`)
      if (clientId) instance?.connections.delete(clientId)
    })

  } else {
    // TODO error if no instance ID
  }
})

console.log('WebSocket server running on ws://localhost:8081')

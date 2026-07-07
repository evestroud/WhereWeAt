import { WebSocketServer } from 'ws'
import express from 'express'
import { nanoid } from 'nanoid'

interface Instance {
  id: string
}

const httpServer = express()
const instanceMap = new Map<string, Instance>()

httpServer.post('/create', (_req, res) => {
  const id = nanoid(6)
  const instance: Instance = { id }
  instanceMap.set(id, instance)
  console.log(`instance ${id} generated`)
  res.send(id)
})

httpServer.listen(8080, () => {
  console.log('HTTP server listening on 8080')
})

const wsServer = new WebSocketServer({ port: 8081 })
let nextId = 0

wsServer.on('connection', (ws) => {
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

console.log('WebSocket server running on ws://localhost:8081')

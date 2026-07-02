import { WebSocketServer } from 'ws'
import express from 'express'
import { nanoid } from 'nanoid'

const httpServer = express()

httpServer.get('/create', (req, res) => {
  let id = nanoid(6)
  console.log(`id generated: ${id}`)
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

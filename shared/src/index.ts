export const MessageType = {
  Handshake: 'HANDSHAKE',
  Other: 'OTHER',
}
type MessageType = (typeof MessageType)[keyof typeof MessageType]

export interface ClientHandshakeMessage {
  type: typeof MessageType.Handshake
  clientId: string | undefined
}

export interface ServerHandshakeMessage {
  type: typeof MessageType.Handshake
  clientId: string
}

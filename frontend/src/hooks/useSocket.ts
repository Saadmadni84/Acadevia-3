'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface UseSocketOptions {
  url?: string
  protocols?: string | string[]
  reconnectAttempts?: number
  reconnectInterval?: number
  onOpen?: (event: Event) => void
  onClose?: (event: CloseEvent) => void
  onError?: (event: Event) => void
  onMessage?: (event: MessageEvent) => void
}

interface UseSocketReturn {
  socket: WebSocket | null
  isConnected: boolean
  sendMessage: (message: string | object) => void
  sendJsonMessage: (message: object) => void
  lastMessage: MessageEvent | null
  connectionStatus: string
  reconnect: () => void
  disconnect: () => void
}

export function useSocket(
  initialUrl: string = 'ws://localhost:8080',
  options: UseSocketOptions = {}
): UseSocketReturn {
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<MessageEvent | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<string>('Disconnected')
  const [reconnectCount, setReconnectCount] = useState(0)

  const reconnectAttemptsRef = useRef(options.reconnectAttempts ?? 5)
  const reconnectIntervalRef = useRef(options.reconnectInterval ?? 3000)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()
  const shouldReconnect = useRef(true)

  // Connection function
  const connect = useCallback(() => {
    if (socket && (socket.readyState === WebSocket.CONNECTING || socket.readyState === WebSocket.OPEN)) {
      return
    }

    try {
      setConnectionStatus('Connecting...')
      const ws = new WebSocket(initialUrl, options.protocols)

      ws.onopen = (event) => {
        console.log('WebSocket connected')
        setIsConnected(true)
        setConnectionStatus('Connected')
        setReconnectCount(0)
        setSocket(ws)
        options.onOpen?.(event)
      }

      ws.onclose = (event) => {
        console.log('WebSocket disconnected')
        setIsConnected(false)
        setSocket(null)
        
        if (event.wasClean) {
          setConnectionStatus('Disconnected')
        } else {
          setConnectionStatus('Connection Lost')
        }

        options.onClose?.(event)

        // Auto reconnect logic
        if (shouldReconnect.current && reconnectCount < reconnectAttemptsRef.current) {
          setConnectionStatus(`Reconnecting... (${reconnectCount + 1}/${reconnectAttemptsRef.current})`)
          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectCount(prev => prev + 1)
            connect()
          }, reconnectIntervalRef.current)
        }
      }

      ws.onerror = (event) => {
        console.error('WebSocket error:', event)
        setConnectionStatus('Connection Error')
        options.onError?.(event)
      }

      ws.onmessage = (event) => {
        setLastMessage(event)
        options.onMessage?.(event)
      }

    } catch (error) {
      console.error('Failed to create WebSocket:', error)
      setConnectionStatus('Failed to Connect')
    }
  }, [initialUrl, options.protocols, reconnectCount])

  // Initialize connection
  useEffect(() => {
    connect()

    return () => {
      shouldReconnect.current = false
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (socket) {
        socket.close()
      }
    }
  }, [connect])

  // Send message function
  const sendMessage = useCallback((message: string | object) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      const messageToSend = typeof message === 'string' ? message : JSON.stringify(message)
      socket.send(messageToSend)
    } else {
      console.warn('WebSocket is not connected')
    }
  }, [socket])

  // Send JSON message function
  const sendJsonMessage = useCallback((message: object) => {
    sendMessage(JSON.stringify(message))
  }, [sendMessage])

  // Manual reconnect function
  const reconnect = useCallback(() => {
    setReconnectCount(0)
    shouldReconnect.current = true
    if (socket) {
      socket.close()
    }
    connect()
  }, [connect, socket])

  // Manual disconnect function
  const disconnect = useCallback(() => {
    shouldReconnect.current = false
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    if (socket) {
      socket.close()
    }
  }, [socket])

  return {
    socket,
    isConnected,
    sendMessage,
    sendJsonMessage,
    lastMessage,
    connectionStatus,
    reconnect,
    disconnect
  }
}

export default useSocket

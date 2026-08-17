import { useEffect, useRef, useState } from 'react'
import client from '../api/client'

/**
 * Polls conversations periodically and fires a browser notification when a
 * new escalated conversation appears — since owners can't watch a phone app
 * for this number, this is the substitute "ping" that something needs them.
 */
export function useNotifications() {
  const knownEscalatedIds = useRef(new Set())
  const isFirstRun = useRef(true)
  const [permission, setPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  )

  const requestPermission = async () => {
    if (typeof Notification === 'undefined') return
    const result = await Notification.requestPermission()
    setPermission(result)
  }

  useEffect(() => {
    if (typeof Notification === 'undefined') return

    const poll = async () => {
      try {
        const res = await client.get('/api/conversations?status=escalated')
        const currentIds = new Set(res.data.map((c) => c.id))

        if (!isFirstRun.current && Notification.permission === 'granted') {
          for (const convo of res.data) {
            if (!knownEscalatedIds.current.has(convo.id)) {
              new Notification('Twinly — needs your attention', {
                body: `${convo.customer_name || convo.customer_id} on ${convo.platform} needs a reply`,
                icon: '/favicon.ico',
              })
            }
          }
        }

        knownEscalatedIds.current = currentIds
        isFirstRun.current = false
      } catch {
        // silent — polling failures shouldn't interrupt the UI
      }
    }

    poll()
    const interval = setInterval(poll, 30000) // every 30s
    return () => clearInterval(interval)
  }, [])

  return { permission, requestPermission }
}
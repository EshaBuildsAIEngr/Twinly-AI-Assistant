import { useEffect, useState, useCallback } from 'react'
import client from '../api/client'

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)))
}

export function usePushNotifications() {
  const [permission, setPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  )
  const [subscribed, setSubscribed] = useState(false)

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  }, [])

  const enable = useCallback(async () => {
    if (typeof Notification === 'undefined' || !('serviceWorker' in navigator)) return

    const result = await Notification.requestPermission()
    setPermission(result)
    if (result !== 'granted') return

    try {
      const registration = await navigator.serviceWorker.ready
      const { data } = await client.get('/api/push/vapid-public-key')

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(data.publicKey),
      })

      const json = subscription.toJSON()
      await client.post('/api/push/subscribe', {
        endpoint: json.endpoint,
        keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
      })
      setSubscribed(true)
    } catch (err) {
      console.error('Push subscription failed:', err)
    }
  }, [])

  return { permission, subscribed, enable }
}
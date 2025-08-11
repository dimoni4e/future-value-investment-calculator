/**
 * Task 6.2: Service Worker for Offline Caching
 * Provides caching strategies for performance optimization
 */

const CACHE_NAME = 'future-value-calculator-v1'
const STATIC_CACHE_NAME = 'static-v1'
const API_CACHE_NAME = 'api-v1'

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/en',
  '/es',
  '/pl',
  '/manifest.webmanifest',
  '/favicon.ico',
  // Add critical CSS and JS files
  '/_next/static/css/',
  '/_next/static/chunks/',
]

// API routes to cache
const API_ROUTES = ['/api/scenarios', '/api/share', '/api/og']

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
}

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        return cache.addAll(STATIC_ASSETS)
      }),
      // Skip waiting to activate immediately
      self.skipWaiting(),
    ])
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return (
                cacheName !== CACHE_NAME &&
                cacheName !== STATIC_CACHE_NAME &&
                cacheName !== API_CACHE_NAME
              )
            })
            .map((cacheName) => caches.delete(cacheName))
        )
      }),
      // Take control of all clients
      self.clients.claim(),
    ])
  )
})

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-HTTP requests
  if (!request.url.startsWith('http')) {
    return
  }

  // Skip Chrome extension requests
  if (url.protocol === 'chrome-extension:') {
    return
  }

  // Handle different types of requests
  if (request.destination === 'document') {
    // HTML documents - network first with cache fallback
    event.respondWith(handleDocumentRequest(request))
  } else if (isStaticAsset(request)) {
    // Static assets - cache first
    event.respondWith(handleStaticAssetRequest(request))
  } else if (isAPIRequest(request)) {
    // API requests - stale while revalidate
    event.respondWith(handleAPIRequest(request))
  } else {
    // Other requests - network first
    event.respondWith(handleOtherRequests(request))
  }
})

// Handle document requests (HTML pages)
async function handleDocumentRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request)

    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    // Return offline page if available
    const offlinePage = await caches.match('/offline')
    if (offlinePage) {
      return offlinePage
    }

    // Return generic offline response
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Offline - Future Value Calculator</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex; 
              align-items: center; 
              justify-content: center; 
              min-height: 100vh; 
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              text-align: center;
              padding: 20px;
            }
            .container {
              max-width: 400px;
            }
            h1 { margin-bottom: 20px; }
            p { line-height: 1.6; opacity: 0.9; }
            .retry-btn {
              background: rgba(255,255,255,0.2);
              border: 1px solid rgba(255,255,255,0.3);
              color: white;
              padding: 12px 24px;
              border-radius: 6px;
              margin-top: 20px;
              cursor: pointer;
              transition: background 0.2s;
            }
            .retry-btn:hover {
              background: rgba(255,255,255,0.3);
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>You're Offline</h1>
            <p>It looks like you've lost your internet connection. Please check your connection and try again.</p>
            <button class="retry-btn" onclick="window.location.reload()">
              Try Again
            </button>
          </div>
        </body>
      </html>
      `,
      {
        status: 200,
        headers: { 'Content-Type': 'text/html' },
      }
    )
  }
}

// Handle static asset requests
async function handleStaticAssetRequest(request) {
  // Cache first strategy
  const cachedResponse = await caches.match(request)
  if (cachedResponse) {
    return cachedResponse
  }

  try {
    const networkResponse = await fetch(request)

    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch (error) {
    // Return cached version or empty response
    return cachedResponse || new Response('', { status: 404 })
  }
}

// Handle API requests
async function handleAPIRequest(request) {
  // Stale while revalidate strategy
  const cachedResponse = await caches.match(request)

  const networkPromise = fetch(request).then((networkResponse) => {
    // Update cache in background
    if (networkResponse.ok) {
      const cache = caches.open(API_CACHE_NAME)
      cache.then((c) => c.put(request, networkResponse.clone()))
    }
    return networkResponse
  })

  // Return cached response immediately if available, otherwise wait for network
  if (cachedResponse) {
    // Update cache in background
    networkPromise.catch(() => {
      // Ignore network errors when serving from cache
    })
    return cachedResponse
  }

  try {
    return await networkPromise
  } catch (error) {
    // Network failed and no cache available
    return new Response(
      JSON.stringify({ error: 'Network unavailable', offline: true }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

// Handle other requests
async function handleOtherRequests(request) {
  try {
    return await fetch(request)
  } catch (error) {
    const cachedResponse = await caches.match(request)
    return cachedResponse || new Response('', { status: 404 })
  }
}

// Helper functions
function isStaticAsset(request) {
  const url = new URL(request.url)
  return (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.ico') ||
    url.pathname.endsWith('.woff') ||
    url.pathname.endsWith('.woff2')
  )
}

function isAPIRequest(request) {
  const url = new URL(request.url)
  return (
    url.pathname.startsWith('/api/') ||
    API_ROUTES.some((route) => url.pathname.startsWith(route))
  )
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(handleBackgroundSync())
  }
})

// Handle background sync
async function handleBackgroundSync() {
  // Implement offline actions sync here
  // For example, sync saved scenarios when back online
  console.log('Background sync triggered')
}

// Push notification handling (for future use)
self.addEventListener('push', (event) => {
  if (!event.data) return

  const data = event.data.json()
  const options = {
    body: data.body,
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: data.data,
    actions: data.actions,
  }

  event.waitUntil(self.registration.showNotification(data.title, options))
})

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action) {
    // Handle action clicks
    event.waitUntil(clients.openWindow(`/?action=${event.action}`))
  } else {
    // Handle notification click
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        for (let client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus()
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/')
        }
      })
    )
  }
})

// Message handling for cache control
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }

  if (event.data && event.data.type === 'CACHE_UPDATE') {
    // Force cache update for specific resources
    event.waitUntil(updateCache(event.data.urls))
  }
})

// Update cache for specific URLs
async function updateCache(urls) {
  const cache = await caches.open(CACHE_NAME)
  return Promise.all(
    urls.map(async (url) => {
      try {
        const response = await fetch(url)
        if (response.ok) {
          return cache.put(url, response)
        }
      } catch (error) {
        console.warn(`Failed to update cache for ${url}:`, error)
      }
    })
  )
}

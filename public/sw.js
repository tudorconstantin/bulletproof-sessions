let keyPair;
let publicKeyPem;

// Generate key pair using Web Crypto API
async function generateKeys() {
  keyPair = await crypto.subtle.generateKey(
    {
      name: 'RSASSA-PKCS1-v1_5',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256'
    },
    true,
    ['sign', 'verify']
  );
  publicKeyPem = await exportPublicKey(keyPair.publicKey);
  console.log('Key pair generated successfully');
  return keyPair;
}

// Export public key as PEM (simplified)
async function exportPublicKey(key) {
  const exported = await crypto.subtle.exportKey('spki', key);
  // Use base64 encoding directly without PEM formatting
  const base64Key = btoa(String.fromCharCode(...new Uint8Array(exported)));
  return base64Key;
}

self.addEventListener('install', (event) => {
  console.log('Service worker installed');
  // Generate keys during installation
  event.waitUntil(
    generateKeys().then(() => {
      console.log('Keys generated during installation');
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service worker activated');
  // Ensure the keys are available even after activation
  event.waitUntil(
    Promise.resolve()
      .then(async () => {
        if (!keyPair) {
          await generateKeys();
        }
        return self.clients.claim();
      })
  );
});

// Sign data
async function signData(data) {
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(data);
  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', keyPair.privateKey, encodedData);
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Modify fetch event handler to use the pre-generated keys
self.addEventListener('fetch', event => {
  // Skip non-API requests immediately
  if (!event.request.url.includes('/api')) return;

  // Call respondWith synchronously with a promise that resolves later
  event.respondWith(
    (async () => {
      try {
        // Initialize keys if they're not already (as a fallback)
        if (!keyPair) {
          await generateKeys();
        }

        const now = Date.now().toString();
        const request = event.request;
        const body = await request.clone().text();
        const signature = await signData(now + (body || ''));

        const newHeaders = new Headers();

        // Copy existing headers safely
        for (const [key, value] of request.headers.entries()) {
          newHeaders.append(key, value);
        }

        newHeaders.append('X-BPS-Signature', signature);
        newHeaders.append('X-BPS-Public-Key', publicKeyPem);
        newHeaders.append('X-BPS-timestamp', now);

        const newRequest = new Request(request.url, {
          method: request.method,
          headers: newHeaders,
          body: request.method !== 'GET' && request.method !== 'HEAD' ? body : null,
          mode: request.mode,
          credentials: request.credentials,
          cache: request.cache,
          redirect: request.redirect,
          referrer: request.referrer
        });

        return fetch(newRequest);
      } catch (error) {
        console.error('Error in fetch handler:', error);
        // Fall back to original request if something goes wrong
        return fetch(event.request);
      }
    })()
  );
});
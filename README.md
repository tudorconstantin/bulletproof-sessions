# Bulletproof Sessions

A proof of concept for secure, cookieless session management.


## Overview

Bulletproof Sessions demonstrates a novel approach to web authentication and session management by using browser-generated key pairs and cryptographic signatures to secure API requests. Instead of relying on traditional session cookies or tokens, each request is cryptographically signed using a private key that never leaves the client and is not accessible to the main javascript.

## Features

- **Client-side Key Pair Generation**: Uses the Web Crypto API to generate RSA key pairs in the browser
- **Request Signing**: All API requests are automatically signed by a service worker
- **Signature Verification**: Server validates signatures against stored public keys
- **Stateful Sessions**: Public keys stored on server to maintain user sessions
- **Transparent Authentication**: Service worker intercepts and modifies requests without changing application code

## Security Benefits

- Each request is cryptographically signed on the client, giving us some kind of dynamic sessions (we can for example have replay attacks protection by adding a timestamp to the signed data)
- Since there are no session cookies, this is immune to session hijacking attacks
- No need for CSRF tokens (signatures prove request authenticity)


## Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a sessions directory:
   ```
   mkdir -p tmp/sessions
   ```
4. Start the server:
   ```
   npm start
   ```
5. Access the application at `http://localhost:3000`

## How It Works

1. **Service Worker Registration**: On login page load, a service worker is registered
2. **Key Generation**: Service worker generates an RSA key pair during installation
3. **Login Process**: 
   - User submits credentials
   - Service worker intercepts the request, signs the data, and adds the signature and public key
   - Server verifies credentials and signature, then stores the public key as session identifier
4. **Subsequent Requests**:
   - Service worker automatically signs all API requests
   - Server verifies each request signature against the stored public key

![image](https://github.com/user-attachments/assets/67d9dd55-b4d7-4ebe-a9c7-b22cebf842e1)


## Project Structure

- `/public` - Client-side assets
  - `login.html` - Login page
  - `dashboard.html` - Protected dashboard
  - `app.js` - Client-side application logic
  - `sw.js` - Service worker for request signing
- `/routes` - Express routes
  - `api.js` - API endpoints for login and dashboard
- `/middleware` - Express middleware
  - `auth.js` - Authentication middleware for request verification
- `/common` - Shared utilities
  - `util.js` - Cryptographic utility functions

## Security Considerations

- This implementation uses hardcoded credentials for demonstration purposes only
- In a production environment, use proper secure credential storage and HTTPS
- The 2048-bit RSA keys provide strong security but may be computationally intensive on some devices

## License

MIT

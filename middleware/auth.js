const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { getSessionFileName, verifySignature } = require('../common/util');

async function authMiddleware(req, res, next) {
  const signature = req.headers['x-bps-signature'];
  if (!signature) {
    return res.status(401).json({ error: 'No signature provided' });
  }

  try {
    const base64Key = req.headers['x-bps-public-key'];
    const timestamp = req.headers['x-bps-timestamp'];

    if (!base64Key) {
      return res.status(401).json({ error: 'No public key provided' });
    }

    // Fixed payload construction
    const signedPayload = timestamp + ((req.method === 'GET' || req.method === 'HEAD') ? '' : JSON.stringify(req.body));
    const isValid = verifySignature(signedPayload, signature, base64Key);
        
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const sessionFileName = getSessionFileName(base64Key);
    const sessionFile = path.join(__dirname, '..', 'tmp', 'sessions', `${sessionFileName}.pk`);

    if (!fs.existsSync(sessionFile)) {
      return res.status(401).json({ error: 'Unauthorized - No session found' });
    }

    const username = fs.readFileSync(sessionFile, 'utf8');
    req.user = { username };
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Authentication error' });
  }
}

module.exports = {
  authMiddleware
};
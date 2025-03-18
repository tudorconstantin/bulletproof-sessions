const express = require('express');
const fs = require('fs');
const path = require('path');
const { authMiddleware } = require('../middleware/auth');
const { getSessionFileName, verifySignature } = require('../common/util');

const router = express.Router();

// Hardcoded credentials for simplicity
const VALID_USERNAME = 'admin';
const VALID_PASSWORD = 'password123';

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  const publicKey = req.headers['x-public-key'];
  const signature = req.headers['x-signature'];

  
  console.log(`-----\nReceived login request for ${username} with public key: ${publicKey}`);
  
  if (username !== VALID_USERNAME || password !== VALID_PASSWORD || !publicKey) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const signedPayload = JSON.stringify(req.body);
  const isValid = verifySignature(signedPayload, signature, publicKey);

  if (!isValid) {
    console.log(`Invalid signature for ${username}`, signature);
    return res.status(401).json({ error: 'Invalid signature' });
  } 
  const sessionFileName = getSessionFileName(publicKey);

  // Store public key and username in a session file
  const sessionFile = path.join(__dirname, '..', 'tmp', 'sessions', `${sessionFileName}.pk`);
  fs.writeFileSync(sessionFile, username);

  res.json({
    success: true,
    message: 'Login successful',
    extraInfo: { timestamp: new Date().toISOString() }
  });
});

router.get('/dashboard', authMiddleware, (req, res) => {
  res.json({
    message: `Welcome to the dashboard, ${req.user.username}!`,
    data: { lastLogin: new Date().toISOString() }
  });
});

module.exports = router;
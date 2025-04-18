const crypto = require('crypto');

// Replace the Web Crypto API implementation with Node.js crypto
function importPublicKey(base64Key) {
  // Convert base64 to a Buffer directly
  const derBuffer = Buffer.from(base64Key, 'base64');
  
  // Convert DER format to PEM format
  const pemKey = 
    '-----BEGIN PUBLIC KEY-----\n' +
    derBuffer.toString('base64').match(/.{1,64}/g).join('\n') +
    '\n-----END PUBLIC KEY-----';
    
  return pemKey;
}

function getSessionFileName(publicKey) {
  return crypto.createHash('sha256').update(publicKey).digest('hex').substr(0, 32);
}

/**
 * Verifies a signature against the provided data using the given public key
 * @param {string} data - The data that was signed
 * @param {string} signature - The hex-encoded signature generated by signData in sw.js
 * @param {string} base64Key - The base64-encoded public key
 * @returns {boolean} - Whether the signature is valid
 */
function verifySignature(data, signature, base64Key) {
  try {
    // Create verifier
    const verifier = crypto.createVerify('SHA256');
    
    // Update with the data
    verifier.update(data);
    
    // Import the public key to PEM format
    const pemKey = importPublicKey(base64Key);
    
    // Verify the signature (converting hex signature to the format expected by verify)
    return verifier.verify(pemKey, signature, 'hex');
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

module.exports = {
  importPublicKey,
  getSessionFileName,
  verifySignature
};

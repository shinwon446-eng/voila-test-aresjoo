import crypto from 'node:crypto';

export function calculateRoll(serverSeed, clientSeed, nonce) {
  const message = `${clientSeed}:${nonce}`;
  const hmac = crypto.createHmac('sha256', serverSeed).update(message).digest('hex');
  const raw = parseInt(hmac.slice(0, 8), 16);
  const roll = raw % 1_000_000;
  return { hmac, raw, roll };
}

// Test with golden seed
const serverSeed = "parity-audit-server-seed-0001";
const clientSeed = "parity-audit-client-seed";
console.log('nonce 0:', calculateRoll(serverSeed, clientSeed, 0));
console.log('nonce 1:', calculateRoll(serverSeed, clientSeed, 1));

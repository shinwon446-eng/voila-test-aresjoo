import { getBoxBySlug, dropTable, sellValueOf } from '../../../web/lib/products';
import { calculateRollResult, determineItem } from '../../../web/lib/fairness';
import { toneOf } from '../../../web/lib/openingFlow';

const box = getBoxBySlug('gaming-playstation')!;
const items = dropTable(box);

let cum = 0;
for (const item of items) {
  const start = cum;
  const count = Math.round(item.dropRate * 10000);
  const end = start + count - 1;
  cum += count;
  const sell = sellValueOf(item);
  const tone = toneOf(item, box.price);
  if (tone === 'top' || tone === 'high' || tone === 'above' || tone === 'below') {
    // print some examples
    if (tone === 'top' && start < 100) {
      console.log(`Tone ${tone}: item ${item.id}, range [${start}, ${end}], dropRate ${item.dropRate}`);
    }
  }
}
console.log('Total cum:', cum);

// Now let's search for a clientSeed that produces a roll in [0, 21] (top item: LG OLED 97-inch TV) with nonce 0
import crypto from 'node:crypto';
const serverSeed = "parity-audit-server-seed-0001";
for (let i = 0; i < 50000; i++) {
  const cs = `seed-top-${i}`;
  const hmac = crypto.createHmac('sha256', serverSeed).update(`${cs}:0`).digest('hex');
  const roll = parseInt(hmac.slice(0, 8), 16) % 1_000_000;
  if (roll <= 21) {
    console.log(`Found top roll for nonce 0! clientSeed: ${cs}, roll: ${roll}`);
    break;
  }
}

// Also search for above roll (e.g. roll corresponding to above)
for (let i = 0; i < 5000; i++) {
  const cs = `seed-above-${i}`;
  const hmac = crypto.createHmac('sha256', serverSeed).update(`${cs}:0`).digest('hex');
  const roll = parseInt(hmac.slice(0, 8), 16) % 1_000_000;
  const item = determineItem(roll, items);
  const tone = toneOf(item, box.price);
  if (tone === 'above') {
    console.log(`Found above roll for nonce 0! clientSeed: ${cs}, roll: ${roll}, item: ${item.id}, val: ${item.value}`);
    break;
  }
}

// Below roll
for (let i = 0; i < 5000; i++) {
  const cs = `seed-below-${i}`;
  const hmac = crypto.createHmac('sha256', serverSeed).update(`${cs}:0`).digest('hex');
  const roll = parseInt(hmac.slice(0, 8), 16) % 1_000_000;
  const item = determineItem(roll, items);
  const tone = toneOf(item, box.price);
  if (tone === 'below') {
    console.log(`Found below roll for nonce 0! clientSeed: ${cs}, roll: ${roll}, item: ${item.id}, val: ${item.value}`);
    break;
  }
}

import { getBoxBySlug, dropTable, sellValueOf } from '../../../web/lib/products';
import { determineItem } from '../../../web/lib/fairness';
import { toneOf } from '../../../web/lib/openingFlow';
import crypto from 'node:crypto';

const box = getBoxBySlug('gaming-playstation')!;
const items = dropTable(box);
const serverSeed = "parity-audit-server-seed-0001";

for (let i = 0; i < 50000; i++) {
  const cs = `seed-high-${i}`;
  const hmac = crypto.createHmac('sha256', serverSeed).update(`${cs}:0`).digest('hex');
  const roll = parseInt(hmac.slice(0, 8), 16) % 1_000_000;
  const item = determineItem(roll, items);
  const tone = toneOf(item, box.price);
  if (tone === 'high') {
    console.log(`Found high roll for nonce 0! clientSeed: ${cs}, roll: ${roll}, item: ${item.id}, val: ${item.value}, mult: ${(sellValueOf(item)/box.price).toFixed(2)}`);
    break;
  }
}

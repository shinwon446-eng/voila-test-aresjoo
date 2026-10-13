import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

// Read draws.json
const drawsPath = 'migration-audit/harness/golden/draws.json';
const draws = JSON.parse(fs.readFileSync(drawsPath, 'utf8'));

// We need box prices. Let's inspect products in catalog.json or compute.ts
const catalogPath = 'migration-audit/harness/golden/catalog.json';
let catalog = null;
if (fs.existsSync(catalogPath)) {
  catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
}

console.log('ServerSeed:', draws.serverSeed);
console.log('ClientSeed:', draws.clientSeed);

// For each box in draws.json, check rolls and item values
for (const [boxSlug, items] of Object.entries(draws.boxes)) {
  console.log(`\nBox: ${boxSlug}`);
  // Find price from catalog or estimate
  const catBox = catalog?.boxes?.find(b => b.slug === boxSlug);
  const price = catBox ? catBox.price : (boxSlug === 'gaming-playstation' ? 19.99 : boxSlug === 'watch-rolex' ? 149.99 : 9.99);
  console.log(`Assumed Price: ${price}`);
  
  for (const item of items) {
    const sellValue = item.value * 0.95; // sellValueOf physical
    const mult = sellValue / price;
    let tone = 'below';
    if (mult >= 20) tone = 'top';
    else if (mult >= 6) tone = 'high';
    else if (mult >= 1.05) tone = 'above';
    else if (mult > 0.95) tone = 'even';
    
    if (tone === 'top' || tone === 'high' || tone === 'above' || (tone === 'below' && item.nonce === 0)) {
      console.log(`  nonce: ${item.nonce}, itemId: ${item.itemId}, val: ${item.value}, sellVal: ${sellValue.toFixed(2)}, mult: ${mult.toFixed(2)}, tone: ${tone}`);
    }
  }
}

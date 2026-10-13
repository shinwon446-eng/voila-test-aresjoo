import fs from 'node:fs';
import crypto from 'node:crypto';

const catalog = JSON.parse(fs.readFileSync('migration-audit/harness/golden/catalog.json', 'utf8'));

// Look at gaming-playstation items
const box = catalog.boxes.find(b => b.slug === 'gaming-playstation');
console.log('Box:', box.slug, 'Price:', box.price);

for (const item of box.items) {
  const sellVal = item.value * 0.95;
  const mult = sellVal / box.price;
  let tone = 'below';
  if (mult >= 20) tone = 'top';
  else if (mult >= 6) tone = 'high';
  else if (mult >= 1.05) tone = 'above';
  console.log(`item: ${item.id}, val: ${item.value}, range: [${item.range[0]}, ${item.range[1]}], mult: ${mult.toFixed(2)}, tone: ${tone}`);
}

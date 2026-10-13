import fs from 'node:fs';

const a = JSON.parse(fs.readFileSync('migration-audit/harness/agy-r2/audit_a_results.json'));
const b = JSON.parse(fs.readFileSync('migration-audit/harness/agy-r2/audit_b_results.json'));
const c = JSON.parse(fs.readFileSync('migration-audit/harness/agy-r2/audit_c_results.json'));
const d = JSON.parse(fs.readFileSync('migration-audit/harness/agy-r2/audit_d_results.json'));
const e = JSON.parse(fs.readFileSync('migration-audit/harness/agy-r2/audit_e_results.json'));

console.log('=== PART A ===');
console.log('Total configs:', a.totalConfigurations);
console.log('Completed:', a.completed);
console.log('Total mismatches recorded:', a.totalMismatches);

// Break down mismatches in A by route:
const mismatchesByRoute = {};
for (const res of a.results) {
  if (res.mismatches && res.mismatches.length > 0) {
    mismatchesByRoute[res.route] = (mismatchesByRoute[res.route] || 0) + res.mismatches.length;
  }
}
console.log('Mismatches by route:', mismatchesByRoute);

console.log('\n=== PART B ===');
console.log('Total comparisons:', b.length);
let totalFrames = 0;
for (const item of b) {
  totalFrames += item.orig.frames.length + item.res.frames.length;
}
console.log('Total frames recorded:', totalFrames);

console.log('\n=== PART C ===');
console.log('Total scenarios run:', c.length);

console.log('\n=== PART D ===');
console.log('Total typography runs:', d.length);
const overflowX = d.filter(item => item.evalData.overflowX);
console.log('Horizontal overflow instances:', overflowX.length);
const clipped = d.filter(item => item.evalData.clippedCount > 0);
console.log('Clipped instances:', clipped.length);
const overlaps = d.filter(item => item.evalData.overlaps.length > 0);
console.log('Overlaps instances:', overlaps.length);

console.log('\n=== PART E ===');
console.log('Total intended runs:', e.length);

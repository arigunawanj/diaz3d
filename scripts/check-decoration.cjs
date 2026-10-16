// Run: node scripts/check-decoration.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const vm = require('node:vm');
const THREE = require('three');
const source = fs.readFileSync('src/lib/decorGeometry.ts', 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const exportsObject = {};
vm.runInNewContext(compiled, { exports: exportsObject, require });
const { createBackdropShape, buildBalloonLayout } = exportsObject;
const signatures = new Set();
for (const kind of ['double-arch', 'single-arch', 'wavy', 'round', 'half-arch']) {
  const shape = createBackdropShape(kind);
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.08 });
  geometry.computeBoundingBox();
  const size = geometry.boundingBox.getSize(new THREE.Vector3());
  assert(size.y > 3 && size.x > 2 && size.z < 1, `${kind}: upright panel with thickness`);
  const points = shape.getPoints(80);
  assert(points[0].distanceTo(points.at(-1)) < 1e-6, `${kind}: closed LED path`);
  if (kind !== 'double-arch') signatures.add(JSON.stringify(points));
  geometry.dispose();
}
assert.equal(signatures.size, 4, 'Single, wavy, round and half arch must differ');
const balloons = buildBalloonLayout();
assert.equal(balloons.length, 102);
assert.deepEqual(balloons, buildBalloonLayout(), 'Color changes must not reshuffle layout');
for (const balloon of balloons) {
  assert(balloon.pos.every(Number.isFinite));
  assert(balloon.pos[1] >= balloon.radius * balloon.scaleY, 'Balloon must not sink below floor');
  assert(balloon.radius > 0.08 && balloon.radius < 0.33);
}
console.log('PASS: 5 backdrop outlines, closed LED paths, 102 stable balloons, floor clearance.');
